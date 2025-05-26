// routes/auth.routes.js
import express from "express";
import {
  register,
  login,
  logout,
  getProfile,
} from "../controllers/auth.controller.js"; // Impor fungsi controller yang sudah diupdate
import { protect } from "../middleware/auth.middleware.js"; // Impor middleware proteksi

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);

// Rute logout dan profile sekarang diproteksi, memerlukan token
authRouter.post("/logout", protect, logout);
authRouter.get("/profile", protect, getProfile);

// Ganti module.exports dengan export default jika konsisten menggunakan ES Modules
// module.exports = authRouter;
export default authRouter;
