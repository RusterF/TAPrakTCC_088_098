// controllers/auth.controller.js
import User from "../models/User.js"; // Sesuaikan path jika perlu
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token berlaku selama 30 hari
  });
};

/**
 * @desc    Registrasi pengguna baru
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  const { nama_user, email, password, jabatan } = req.body;

  try {
    // Cek apakah semua field yang dibutuhkan ada
    if (!nama_user || !email || !password) {
      return res
        .status(400)
        .json({
          message:
            "Mohon isi semua field yang dibutuhkan (nama_user, email, password)",
        });
    }

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "Pengguna dengan email ini sudah terdaftar" });
    }

    const user = await User.create({
      nama_user,
      email,
      password, // Password akan di-hash oleh hook di model
      jabatan,
    });

    if (user) {
      res.status(201).json({
        message: "Pengguna berhasil didaftarkan",
        id_user: user.id_user,
        nama_user: user.nama_user,
        email: user.email,
        jabatan: user.jabatan,
        token: generateToken(user.id_user),
      });
    } else {
      res.status(400).json({ message: "Data pengguna tidak valid" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

/**
 * @desc    Login pengguna
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email dan password dibutuhkan" });
    }

    const user = await User.findOne({ where: { email } });

    if (user && (await user.comparePassword(password))) {
      res.json({
        message: "Login berhasil",
        id_user: user.id_user,
        nama_user: user.nama_user,
        email: user.email,
        jabatan: user.jabatan,
        token: generateToken(user.id_user),
      });
    } else {
      res.status(401).json({ message: "Email atau password salah" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

/**
 * @desc    Logout pengguna
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = (req, res) => {
  // Dengan JWT, logout biasanya ditangani di sisi client (menghapus token).
  // Jika Anda ingin implementasi server-side (misalnya token blacklisting),
  // logikanya akan ada di sini.
  res
    .status(200)
    .json({ message: "Logout berhasil. Mohon hapus token di sisi klien." });
};

/**
 * @desc    Mendapatkan profil pengguna yang sedang login
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getProfile = async (req, res) => {
  // req.user diisi oleh middleware 'protect'
  if (req.user) {
    res.json({
      message: "Profil pengguna berhasil diambil",
      id_user: req.user.id_user,
      nama_user: req.user.nama_user,
      email: req.user.email,
      jabatan: req.user.jabatan,
    });
  } else {
    // Seharusnya tidak sampai sini jika middleware 'protect' bekerja
    res.status(404).json({ message: "Pengguna tidak ditemukan" });
  }
};
