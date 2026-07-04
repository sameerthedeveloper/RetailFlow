import OrderModel from "../models/OrderModel.js";
import ProductModel from "../models/ProductModel.js";
import jwt from "jsonwebtoken";

const cyan = "\x1b[36m";
const green = "\x1b[32m";
const yellow = "\x1b[33m";
const red = "\x1b[31m";
const reset = "\x1b[0m";

export const CreateOrder = async (req, res) => {
    const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
        return res.status(400).json({ message: "No items in the order!" });
    }

    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
        return res.status(400).json({ message: "Please provide complete shipping address details!" });
    }

    // 1. Authenticate user from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log(`${yellow}⚠ Order Placement Attempt:${reset} Unauthorized - No token provided`);
        return res.status(401).json({ message: "Not authorized, token missing!" });
    }

    const token = authHeader.split(' ')[1];
    let userId;
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        userId = decoded.id;
    } catch (err) {
        console.error(`${red}✗ Order Auth Error:${reset}`, err.message);
        return res.status(401).json({ message: "Not authorized, invalid token!" });
    }

    try {
        // 2. Validate stock availability for all products first
        for (const item of orderItems) {
            const product = await ProductModel.findById(item.product || item._id);
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.name}` });
            }

            if (product.countInStock < item.quantity) {
                console.log(`${yellow}⚠ Order Stock Check failed:${reset} Product "${product.name}" has only ${product.countInStock} units left (Requested: ${item.quantity})`);
                return res.status(400).json({ 
                    message: `Insufficient stock for product: "${product.name}". Only ${product.countInStock} units available.` 
                });
            }
        }

        // 3. Decrement countInStock for each product
        const bulkOps = [];
        for (const item of orderItems) {
            const productId = item.product || item._id;
            bulkOps.push(
                ProductModel.findByIdAndUpdate(productId, {
                    $inc: { countInStock: -item.quantity }
                })
            );
        }
        await Promise.all(bulkOps);

        // 4. Map items and save order
        const mappedItems = orderItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            image: item.image,
            price: item.price,
            product: item.product || item._id
        }));

        const newOrder = new OrderModel({
            user: userId,
            orderItems: mappedItems,
            shippingAddress,
            paymentMethod,
            totalPrice
        });

        await newOrder.save();
        console.log(`${green}✓ Order Placed Successfully:${reset} Order ID ${newOrder._id} for User ID ${userId}`);

        return res.status(201).json({
            message: "Order placed successfully!",
            order: newOrder
        });
    } catch (error) {
        console.error(`${red}✗ Order Placement Error:${reset}`, error.message);
        res.status(500).json({ message: "Error in placing your order", error: error.message });
    }
};

export const GetMyOrders = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "No token provided!" });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const orders = await OrderModel.find({ user: decoded.id }).sort({ createdAt: -1 });
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(401).json({ message: "Invalid token!" });
    }
};
