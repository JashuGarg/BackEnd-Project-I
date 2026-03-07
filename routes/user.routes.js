import express from "express";
import { signup, login } from "../controllers/user.controllers.js";

const router = express.Router();

router
    .route("/api")
    .get((req,res)=>{res.send("Hello from the server sidee")});

router
    .route("/api/login")
    .post(login);

router
    .route("/api/signup")
    .post(signup);

export default router;

