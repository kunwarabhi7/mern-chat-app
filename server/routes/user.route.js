import { Router } from "express";
import {
  getCurrentUser,
  Login,
  logout,
  SignUp,
} from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "User Route working fine" });
});

//register
router.post("/signup", SignUp);

// Login
router.post("/login", Login);

//Logout
router.post("/logout", authMiddleware, logout);

//Get Current User
router.get("/me", authMiddleware, getCurrentUser);

export { router as UserRouter };
