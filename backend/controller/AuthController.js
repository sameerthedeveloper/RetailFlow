import UserModel from "../models/UserModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


// Register a new user account
export const SignUp = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await UserModel.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "The User Already Exists!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserModel({ name, email, password: hashedPassword });
        await newUser.save();

        const jwtToken = jwt.sign({ id: newUser._id }, process.env.JWT_KEY, { expiresIn: '1h' });
        return res.status(201).json({ token: jwtToken, message: "Sign up successful!" });
    } catch (error) {
        res.status(500).json({ message: 'Error in Signing Up', error: error.message });
    }
};


// Login to an existing user account
export const Login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User Not Found!" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "The Password You Entered is Incorrect!" });
        }

        const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_KEY, { expiresIn: '1h' });
        return res.status(200).json({ token: jwtToken, message: "Login successful!" });
    } catch (error) {
        res.status(500).json({ message: 'Error in Logging to your Account', error: error.message });
    }
};


// Get the currently authenticated user's profile
export const GetCurrentUser = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const user = await UserModel.findById(decoded.id).select('name email');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ username: user.name, email: user.email });
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token', error: error.message });
    }
};


// Get all unique customers who ordered the seller's products
export const GetAllUsers = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "No token provided!" });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const sellerId = decoded.id;

        const ProductModel = (await import("../models/ProductModel.js")).default;
        const OrderModel = (await import("../models/OrderModel.js")).default;

        const sellerProducts = await ProductModel.find({ user: sellerId }).select('_id');
        const sellerProductIds = sellerProducts.map(p => p._id.toString());

        const orders = await OrderModel.find({
            "orderItems.product": { $in: sellerProductIds }
        }).populate('user', 'name email createdAt');

        const uniqueCustomers = [];
        const seenUserIds = new Set();

        orders.forEach(order => {
            if (order.user && !seenUserIds.has(order.user._id.toString())) {
                seenUserIds.add(order.user._id.toString());
                uniqueCustomers.push({
                    _id: order.user._id,
                    name: order.user.name,
                    email: order.user.email,
                    createdAt: order.user.createdAt
                });
            }
        });

        return res.status(200).json(uniqueCustomers);
    } catch (error) {
        return res.status(401).json({ message: "Invalid token!", error: error.message });
    }
};