import { Router } from "express";
import {
  getAllUser,
  getCurrentUser,
  Login,
  logout,
  SignUp,
  uploadDP,
} from "../controllers/user.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { upload } from "../utils/multer.js";

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

// Upload Profile Picture
router.post("/dp", authMiddleware, upload.single("dp"), uploadDP);

//Get all User
router.get("/list", authMiddleware, getAllUser);
export { router as UserRouter };
