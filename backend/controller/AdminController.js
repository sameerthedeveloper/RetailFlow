import AdminModel from "../models/AdminModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


// Register a new admin (seller) account
export const AdminSignUp = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const adminExists = await AdminModel.findOne({ email });
        if (adminExists) {
            return res.status(400).json({ message: "Admin account with this email already exists!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new AdminModel({ name, email, password: hashedPassword });
        await newAdmin.save();

        const jwtToken = jwt.sign({ id: newAdmin._id, role: 'admin' }, process.env.JWT_KEY, { expiresIn: '1h' });
        return res.status(201).json({ token: jwtToken, message: "Admin registration successful!" });
    } catch (error) {
        res.status(500).json({ message: 'Error in registering admin account', error: error.message });
    }
};


// Login to an existing admin account
export const AdminLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await AdminModel.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: "Admin account not found!" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, admin.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Incorrect password!" });
        }

        const jwtToken = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_KEY, { expiresIn: '1h' });
        return res.status(200).json({ token: jwtToken, message: "Admin login successful!" });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in to admin account', error: error.message });
    }
};


// Get the currently authenticated admin's profile
export const GetCurrentAdmin = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const admin = await AdminModel.findById(decoded.id).select('name email');
        if (!admin) {
            return res.status(404).json({ message: 'Admin account not found' });
        }

        return res.status(200).json({ username: admin.name, email: admin.email });
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token', error: error.message });
    }
};
