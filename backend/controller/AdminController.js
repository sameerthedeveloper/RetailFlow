import AdminModel from "../models/AdminModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const cyan = "\x1b[36m";
const green = "\x1b[32m";
const yellow = "\x1b[33m";
const red = "\x1b[31m";
const reset = "\x1b[0m";

export const AdminSignUp = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const adminExists = await AdminModel.findOne({ email });
        if (adminExists) {
            console.log(`${yellow}⚠ Admin Sign Up Attempt:${reset} Admin already exists - ${email}`);
            return res.status(400).json({ message: "Admin account with this email already exists!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new AdminModel({ name, email, password: hashedPassword });
        await newAdmin.save();

        console.log(`${green}✓ New Admin Created:${reset} ${email}`);
        const jwtToken = jwt.sign({ id: newAdmin._id, role: 'admin' }, process.env.JWT_KEY, { expiresIn: '1h' });
        return res.status(201).json({ token: jwtToken, message: "Admin registration successful!" });
    } catch (error) {
        console.error(`${red}✗ Admin Sign Up Error:${reset}`, error.message);
        res.status(500).json({ message: 'Error in registering admin account', error: error.message });
    }
};

export const AdminLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await AdminModel.findOne({ email });
        if (!admin) {
            console.log(`${yellow}⚠ Admin Login Attempt:${reset} Admin not found - ${email}`);
            return res.status(404).json({ message: "Admin account not found!" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, admin.password);
        if (!isPasswordCorrect) {
            console.log(`${yellow}⚠ Admin Login Attempt:${reset} Incorrect password - ${email}`);
            return res.status(401).json({ message: "Incorrect password!" });
        }

        const jwtToken = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_KEY, { expiresIn: '1h' });
        console.log(`${green}✓ Admin Logged In:${reset} ${email}`);
        return res.status(200).json({ token: jwtToken, message: "Admin login successful!" });
    } catch (error) {
        console.error(`${red}✗ Admin Login Error:${reset}`, error.message);
        res.status(500).json({ message: 'Error logging in to admin account', error: error.message });
    }
};

export const GetCurrentAdmin = async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log(`${yellow}⚠ Admin Auth Attempt:${reset} No token provided`);
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const admin = await AdminModel.findById(decoded.id).select('name email');

        if (!admin) {
            console.log(`${yellow}⚠ Admin Auth Attempt:${reset} Admin not found`);
            return res.status(404).json({ message: 'Admin account not found' });
        }

        console.log(`${green}✓ Current Admin Retrieved:${reset} ${admin.email}`);
        return res.status(200).json({ username: admin.name, email: admin.email });
    } catch (error) {
        console.error(`${red}✗ Admin Auth Error:${reset}`, error.message);
        return res.status(401).json({ message: 'Invalid token', error: error.message });
    }
};
