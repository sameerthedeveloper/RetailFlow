import OrderModel from "../models/OrderModel.js";
import ProductModel from "../models/ProductModel.js";
import jwt from "jsonwebtoken";


// Place a new order and decrement stock
export const CreateOrder = async (req, res) => {
    const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
        return res.status(400).json({ message: "No items in the order!" });
    }

    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
        return res.status(400).json({ message: "Please provide complete shipping address details!" });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Not authorized, token missing!" });
    }

    const token = authHeader.split(' ')[1];
    let userId;
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        userId = decoded.id;
    } catch (err) {
        return res.status(401).json({ message: "Not authorized, invalid token!" });
    }

    try {
        // Validate stock availability for all products first
        for (const item of orderItems) {
            const product = await ProductModel.findById(item.product || item._id);
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.name}` });
            }

            if (product.countInStock < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for product: "${product.name}". Only ${product.countInStock} units available.`
                });
            }
        }

        // Decrement countInStock for each product
        await Promise.all(orderItems.map(item =>
            ProductModel.findByIdAndUpdate(item.product || item._id, {
                $inc: { countInStock: -item.quantity }
            })
        ));

        // Save the order
        const newOrder = new OrderModel({
            user: userId,
            orderItems: orderItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                image: item.image,
                price: item.price,
                product: item.product || item._id
            })),
            shippingAddress,
            paymentMethod,
            totalPrice
        });

        await newOrder.save();
        return res.status(201).json({ message: "Order placed successfully!", order: newOrder });
    } catch (error) {
        return res.status(500).json({ message: "Error in placing your order", error: error.message });
    }
};


// Get all orders placed by the authenticated user
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


// Get all orders (scoped to the authenticated seller's products)
export const GetAllOrders = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "No token provided!" });
    }

    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, process.env.JWT_KEY);
        const orders = await OrderModel.find().populate('user', 'name email').sort({ createdAt: -1 });
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token!", error: error.message });
    }
};


// Update the status of an order (only the seller who owns the order's products can update)
export const UpdateOrderStatus = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "No token provided!" });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const sellerId = decoded.id;

        const { orderId, status } = req.body;
        if (!orderId || !status) {
            return res.status(400).json({ message: "Order ID and status are required!" });
        }

        const order = await OrderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found!" });
        }

        const sellerProducts = await ProductModel.find({ user: sellerId }).select('_id');
        const sellerProductIds = sellerProducts.map(p => p._id.toString());
        const hasSellerProduct = order.orderItems.some(item => sellerProductIds.includes(item.product.toString()));

        if (!hasSellerProduct) {
            return res.status(403).json({ message: "You are not authorized to update this order's status!" });
        }

        order.status = status;
        await order.save();
        return res.status(200).json({ message: "Order status updated successfully!", order });
    } catch (error) {
        return res.status(401).json({ message: "Invalid token!", error: error.message });
    }
};
