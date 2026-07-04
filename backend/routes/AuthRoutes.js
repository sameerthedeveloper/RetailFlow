import express from 'express';
import { Login, SignUp, GetCurrentUser, GetAllUsers } from "../controller/AuthController.js"
import { AdminSignUp, AdminLogin, GetCurrentAdmin } from "../controller/AdminController.js"

const AuthRouter = express.Router();

AuthRouter.post("/signup", SignUp);
AuthRouter.post("/login", Login);
AuthRouter.get("/currentuser", GetCurrentUser);
AuthRouter.get("/users", GetAllUsers);

AuthRouter.post("/admin/signup", AdminSignUp);
AuthRouter.post("/admin/login", AdminLogin);
AuthRouter.get("/admin/currentuser", GetCurrentAdmin);

export default AuthRouter;