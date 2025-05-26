// backend/routes/pesawat.routes.js
import express from "express";
import {
  createPesawat,
  getAllPesawats,
  getPesawatById,
  updatePesawat,
  deletePesawat,
} from "../controllers/pesawat.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { uploadPesawatImage } from "../middleware/upload.middleware.js"; // Impor middleware upload

const pesawatRouter = express.Router();

pesawatRouter
  .route("/")
  .post(protect, uploadPesawatImage.single('gambar_pesawat_file'), createPesawat) // Terapkan multer
  .get(protect, getAllPesawats);

pesawatRouter
  .route("/:id")
  .get(protect, getPesawatById)
  .put(protect, uploadPesawatImage.single('gambar_pesawat_file'), updatePesawat) // Terapkan multer
  .delete(protect, deletePesawat);

export default pesawatRouter;