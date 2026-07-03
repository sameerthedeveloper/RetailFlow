import mongoose from "mongoose";



const ConnectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGOOSE_URL);
        console.log("MongoDB Connected Successfully");
        return true;
    } catch (error) {
        console.error("MongoDB connection failed");
        return false;
    }
};

export default ConnectDB;