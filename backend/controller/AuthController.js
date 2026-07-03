import UserModel from "../models/UserModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const cyan = "\x1b[36m";
const green = "\x1b[32m";
const yellow = "\x1b[33m";
const red = "\x1b[31m";
const reset = "\x1b[0m";

export const SignUp = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await UserModel.findOne({ email });
        if (userExists) {
            console.log(`${yellow}⚠ Sign Up Attempt:${reset} User already exists - ${email}`);
            return res.status(400).json({ message: "The User Already Exists!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserModel({ name, email, password: hashedPassword });

        await newUser.save();
        console.log(`${green}✓ New User Created:${reset} ${email}`);

        const jwtToken = jwt.sign({ id: newUser._id }, process.env.JWT_KEY, { expiresIn: '1h' });
        return res.status(201).json({ token: jwtToken, message: "Sign up successful!" });
    } catch (error) {
        console.error(`${red}✗ Sign Up Error:${reset}`, error.message);
        res.status(500).json({ message: 'Error in Signing Up', error: error.message });
    }
};

export const Login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            console.log(`${yellow}⚠ Login Attempt:${reset} User not found - ${email}`);
            return res.status(404).json({ message: "User Not Found!" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            console.log(`${yellow}⚠ Login Attempt:${reset} Incorrect password - ${email}`);
            return res.status(401).json({ message: "The Password You Entered is Incorrect!" });
        }

        const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_KEY, { expiresIn: '1h' });
        console.log(`${green}✓ User Logged In:${reset} ${email}`);
        return res.status(200).json({ token: jwtToken, message: "Login successful!" });
    } catch (error) {
        console.error(`${red}✗ Login Error:${reset}`, error.message);
        res.status(500).json({ message: 'Error in Logging to your Account', error: error.message });
    }
};

export const GetCurrentUser = async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log(`${yellow}⚠ Auth Attempt:${reset} No token provided`);
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const user = await UserModel.findById(decoded.id).select('name email');

        if (!user) {
            console.log(`${yellow}⚠ Auth Attempt:${reset} User not found`);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`${green}✓ Current User Retrieved:${reset} ${user.email}`);
        return res.status(200).json({ username: user.name, email: user.email });
    } catch (error) {
        console.error(`${red}✗ Auth Error:${reset}`, error.message);
        return res.status(401).json({ message: 'Invalid token', error: error.message });
    }
};