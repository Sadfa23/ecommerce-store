import Product from "../models/product.model.js"
import redis from "../lib/redis.js"
import cloudinary from "../lib/cloudinary.js";

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        return res.json({products})
    } catch (error) {
        return res.status(500).json({message: "Internal server error"})
    }
}

export const getFeaturedProducts = async (req, res) => {
    try {
       let featuredProducts = await redis.get("featured_products")
       if (featuredProducts) {
            return res.json(JSON.parse(featuredProducts))
       }
       // if note in redis cache, fetch from Mongodb
       // .lean return a plain JS object instead of mongodb object hence performant
       featuredProducts = await Product.find({isFeatured:true}).lean()
       if (!featuredProducts) {
        return res.status(404).json({message: "No featured products found"})
       }
       // store result in redis cache
       await redis.set("featured_products", JSON.stringify(featuredProducts))
    } catch (error) {
        console.log("Erro in getFeatured products controller", error.message)
         res.status(500).json({message: "Server error", error: error.message})
    }
}

export const createProduct = async (req, res) => {
    try {
        const {name, description, price, category, image} = req.body;
        let cloudinaryResponse = null;
        if (image) {
            await cloudinary.uploader.upload(image, {folder:"products"})
        }
        const product = await Product.create({
            name, 
            description,
            price, 
            image:cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : "",
            category
        })
        res.status(201).json(product)
    } catch (error) {
        res.status(500).json({message:"Error in createProduct controller", error: error.message})
    }
}

export const deleteProduct = async (req, res) => {
    //const {id} = req.params.id
    try {
        const product = await Product.findById(req.params.id)
        if (!product) {
            return res.status(404).json({message:"Product not found"})
        }
        if (product.image) {
            try {
                const publicId = product.image.split("/").pop().split(".")[0]  
                await cloudinary.uploader.destroy(`products/${publicId}`) 
                console.log("deleted image from cloudinary")
            } catch (error) {
                console.log("Error deleting image from cloudinary", error)
            }  
        }
        await Product.findByIdAndDelete(req.params.id)
    } catch (error) {
        console.log("Error in deleteProduct controller")
        res.status(500).json({message: "Error deleting product",error: error.message})
    }
}

export const getRecommendedProducts = async (req, res) => {
    try {
        const products = await Product.aggregate([
            {
                $samaple:{size:3}
            },
            {
                $project: {
                    _id:1,
                    name:1,
                    description:1,
                    image:1,
                    price:1,
                }
            }
        ])
        res.json({products})
    } catch (error) {
        res.status(500).json({message: "Error getting recommended product",error: error.message})
    }
}

export const getProductsByCategory = async (req, res) => {
    const {category} = req.params;
    try {
        const products = await Product.find({category})
        res.json(products)
    } catch (error) {
        console.log("Error in getProductsByCategory controller", error.message)
        res.status(500).json({message: "Server error", error: error.message})
    }
}

export const toggleFeaturedProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if(product) {
            product.isFeatured = !product.isFeatured;
            const updatedProduct = await product.save();
            await updateFeaturedProductCache();
            res.json(updatedProduct)
        } else {
            res.status(404).json({message: "product not found"})
        }
    } catch (error) {
        console.log("Error in toggleFeaturedProduct controller", error.message);
        res.status(500).json({message: "Server error", error: error.message})
    }
}

async function updateFeaturedProductCache() {
    try {
        const featuredProducts = await Product.find({isFeatured: true}).lean()
        await redis.set("featured_products", JSON.stringify(featuredProducts))
    } catch (error) {
        console.log("Error in updateCache function")
    }
}