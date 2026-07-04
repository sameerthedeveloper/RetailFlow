import ProductModel from "../models/ProductModel.js";
import jwt from "jsonwebtoken";


// Add a new product to the database
export const AddProduct = async (req, res) => {
    const { name, price, description, brand, category, countInStock, image } = req.body;

    if (!name || !price || !description || !brand || !category || !countInStock || !image) {
        return res.status(400).json({ message: "Enter All The Details" });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Authorization token is missing!" });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);

        const item = new ProductModel({ name, price, description, brand, category, countInStock, image, user: decoded.id });
        await item.save();
        return res.status(201).json(item);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};


// Edit an existing product (only the owner seller can edit)
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
        return res.status(200).json(product);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};


// Update stock count after a checkout operation
export const UpdateCount = async (req, res) => {
    const { id, quantity } = req.body;
    if (!id || quantity === undefined) {
        return res.status(400).json({ message: "Product ID and quantity are required" });
    }

    try {
        const product = await ProductModel.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        product.countInStock = Math.max(0, product.countInStock - quantity);
        await product.save();
        return res.status(200).json(product);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


// Delete a product from the database (only the owner seller can delete)
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
        return res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};


// Search products by name query
export const getProductWithName = async (req, res) => {
    const { query } = req.query;
    try {
        const products = await ProductModel.find({
            name: { $regex: query || '', $options: 'i' }
        }).populate('user', 'name');
        return res.status(200).json(products);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


// Get all products (optionally scoped to the authenticated seller)
export const getAllProducts = async (req, res) => {
    try {
        const { sellerOnly } = req.query;
        let query = {};

        if (sellerOnly === 'true') {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ message: "Authorization token is required" });
            }

            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_KEY);
                query.user = decoded.id;
            } catch (err) {
                return res.status(401).json({ message: "Invalid authorization token" });
            }
        }

        const products = await ProductModel.find(query).populate('user', 'name');
        return res.status(200).json(products);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
