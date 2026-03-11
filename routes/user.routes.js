import express from "express";
import { signup, login, loginById } from "../controllers/user.controllers.js";

const router = express.Router();

// Default route - redirect to login page
router
    .route("/")
    .get((req, res) => {
      res.redirect('/login/login.html');
    });

router
    .route("/api")
    .get((req,res)=>{res.send("Hello from the server sidee")});

router
    .route("/api/login")
    .post(login);

router
    .route("/api/login-id")
    .post(loginById);

router
    .route("/api/signup")
    .post(signup);

export default router;

