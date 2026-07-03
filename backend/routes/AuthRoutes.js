import express from 'express';
import { Login, SignUp, GetCurrentUser } from "../controller/AuthController.js"


const AuthRouter = express.Router();


AuthRouter.post("/signup", SignUp);
AuthRouter.post("/login", Login);
AuthRouter.get("/currentuser", GetCurrentUser);

export default AuthRouter;