import mongoose from 'mongoose';

const ProductSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    description: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
    },
    category: {
        type: String,
    },
    countInStock: {
        type: Number,
        required: true,
        default: 0,
    },
    image: {
        type: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'user',
    },
}, {
    timestamps: true,
});

const ProductModel = mongoose.model('product', ProductSchema);

export default ProductModel;
