// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Sesuaikan path jika perlu
import dotenv from "dotenv";

dotenv.config();

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Ambil user dari database berdasarkan id di token, tanpa password
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ["password"] },
      });

      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Tidak terotorisasi, pengguna tidak ditemukan" });
      }
      next();
    } catch (error) {
      console.error("Kesalahan token:", error.message);
      res.status(401).json({ message: "Tidak terotorisasi, token gagal" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Tidak terotorisasi, tidak ada token" });
  }
};
