import ProductModel from "../models/ProductModel.js";
import jwt from "jsonwebtoken";


//Adding A product to the DB
export const AddProduct = async (req, res) => {
    const { name, price, description, brand, category, countInStock, image } = req.body

    if (!name || !price || !description || !brand || !category || !countInStock || !image) {
        return res.status(400).json({ message: "Enter All The Details" });
    }

    try {
        let userId = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_KEY);
                userId = decoded.id;
            } catch (err) {
                console.error('JWT verification failed inside AddProduct:', err.message);
            }
        }

        const item = new ProductModel({ 
            name, 
            price, 
            description, 
            brand, 
            category, 
            countInStock, 
            image,
            user: userId
        });
        await item.save();
        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}


// Editing and Updating the product on the DB
export const EditProduct = async (req, res) => {
    const { id, name, price, description, brand, category, countInStock, image } = req.body;
    if (!id) {
        return res.status(400).json({ message: "Product ID is required for editing" });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Authorization token is missing!" });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const product = await ProductModel.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.user && product.user.toString() !== decoded.id) {
            return res.status(403).json({ message: "You are not authorized to edit this product!" });
        }

        product.name = name;
        product.price = price;
        product.description = description;
        product.brand = brand;
        product.category = category;
        product.countInStock = countInStock;
        product.image = image;

        await product.save();
        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}


//Update the count after Checkout
export const UpdateCount = async (req, res) => {

}


//Delete The product from the DB
export const DeleteProduct = async (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ message: "Product ID is required" });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Authorization token is missing!" });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const product = await ProductModel.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.user && product.user.toString() !== decoded.id) {
            return res.status(403).json({ message: "You are not authorized to delete this product!" });
        }

        await ProductModel.findByIdAndDelete(id);
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}


//Get the data for the search bar
export const getProductWithName = async (req, res) => {

}

export const getAllProducts = async (req, res) => {
    try {
        const { sellerOnly } = req.query;
        let query = {};

        if (sellerOnly === 'true') {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.split(' ')[1];
                try {
                    const decoded = jwt.verify(token, process.env.JWT_KEY);
                    query.user = decoded.id;
                } catch (err) {
                    return res.status(401).json({ message: "Invalid authorization token" });
                }
            } else {
                return res.status(401).json({ message: "Authorization token is required" });
            }
        }

        const products = await ProductModel.find(query).populate('user', 'name');
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
