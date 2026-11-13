import mongoose from "mongoose";

// One shared connection per server instance.
// On Vercel each warm function instance reuses it, so only a cold start pays
// the connection cost instead of every request.
let connecting = null;

mongoose.connection.on('disconnected', () => {
    console.warn("MongoDB disconnected.");
    connecting = null;
});

mongoose.connection.on('error', (err) => {
    console.error("MongoDB connection error:", err.message);
});

const ConnectDB = async () => {
    if (mongoose.connection.readyState === 1) return true;

    if (!connecting) {
        connecting = mongoose
            .connect(process.env.MONGOOSE_URL, {
                maxPoolSize: 5,
                serverSelectionTimeoutMS: 8000,
            })
            .then(() => {
                console.log("MongoDB Connected Successfully");
                return true;
            })
            .catch((error) => {
                connecting = null;
                console.error("MongoDB connection failed:", error.message);
                throw error;
            });
    }

    return connecting;
};

export default ConnectDB;
