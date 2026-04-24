import express from "express";
import { signup, login } from "../controllers/user.controllers.js";

const router = express.Router();

// API routes
router
  .route("/api")
  .get((req, res) => {
    res.send("Hello from the server sidee");
  });

// Frontend + auth routes (API + UI in same endpoints)
router
  .route("/login")
  .get((req, res) => {
    res.redirect("/login.html");
  })
  .post(login);

router
  .route("/signup")
  .get((req, res) => {
    res.redirect("/register.html");
  })
  .post(signup);

router
  .route("/")
  .get((req, res) => {
    res.redirect("/dashboard.html");
  });

router
  .route("/dashboard")
  .get((req, res) => {
    res.redirect("/dashboard.html");
  });



router
  .route("/admin")
  .get((req, res) => {
    res.redirect("/admin.html");
  });

router
  .route("/logout")
  .get((req, res) => {
    res.redirect("/login");
  });



export default router;

