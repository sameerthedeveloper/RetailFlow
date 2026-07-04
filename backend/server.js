import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import ConnectDB from "./utils/ConnectDB.js";
import AuthRouter from "./routes/AuthRoutes.js";
import ProductRoutes from "./routes/ProductRoutes.js";
import OrderRouter from "./routes/OrderRoutes.js";

dotenv.config();

const cyan = "\x1b[36m";
const green = "\x1b[32m";
const yellow = "\x1b[33m";
const blue = "\x1b[34m";
const magenta = "\x1b[35m";
const red = "\x1b[31m";
const reset = "\x1b[0m";

console.log(`\n${cyan}╔════════════════════════════════════════════╗${reset}`);
console.log(`${cyan}║${reset}            ${green}NODE JS BACKEND V1.0${reset}            ${cyan}║${reset}`);
console.log(`${cyan}║${reset}        ${reset}       Retail${blue}Flow${reset}                   ${cyan}║${reset}`);
console.log(`${cyan}╚════════════════════════════════════════════╝${reset}`);
console.log(`${yellow}  ├─ ${reset}${magenta}Server:${reset}   Express`);
console.log(`${yellow}  ├─ ${reset}${magenta}Database:${reset} MongoDB`);
console.log(`${yellow}  ├─ ${reset}${magenta}Encryption:${reset} bcrypt`);
console.log(`${yellow}  └─ ${reset}${magenta}Status:${reset}    ${green}Ready${reset}\n`);

const app = express();
const port = process.env.PORT || 8001;


app.use(cors());
app.use(express.json());


app.get("/api/health", (req, res) => {
    res.json({ status: `OK`, timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", AuthRouter);
app.use("/api/product",ProductRoutes);
app.use("/api/order", OrderRouter);


app.use((err, req, res, next) => {
    console.error(`${red}✗ Error:${reset}`, err.message);
    res.status(500).json({ error: "Internal Server Error" });
});


ConnectDB()
    .then(() => {
        const server = app.listen(port, () => {
            console.log(`\n${green}✓ Server is running${reset}`);
            console.log(`${yellow}  • Port: ${reset}${magenta}${port}${reset}`);
            console.log(`${yellow}  • URL: ${reset}${blue}http://localhost:${port}${reset}`);
            console.log(`${yellow}  • Health: ${reset}${blue}http://localhost:${port}/api/health${reset}\n`);
        });

        // Graceful shutdown
        process.on("SIGTERM", () => {
            console.log(`\n${yellow}⚠ SIGTERM received, shutting down gracefully...${reset}`);
            server.close(() => {
                console.log(`${green}✓ Server closed${reset}\n`);
                process.exit(0);
            });
        });
    })
    .catch((err) => {
        console.error(`${red}✗ Failed to start server:${reset}`, err.message);
        process.exit(1);
    });


