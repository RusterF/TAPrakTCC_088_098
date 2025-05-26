// backend/routes/munisiPesawat.routes.js
import express from "express";
import {
  createMunisiPesawat,
  getAllMunisiPesawats,
  getMunisiPesawatById,
  updateMunisiPesawat,
  deleteMunisiPesawat,
} from "../controllers/munisiPesawat.controller.js";
import { protect } from "../middleware/auth.middleware.js"; //

const munisiPesawatRouter = express.Router();

munisiPesawatRouter
  .route("/")
  .post(protect, createMunisiPesawat)
  .get(protect, getAllMunisiPesawats);

munisiPesawatRouter
  .route("/:id")
  .get(protect, getMunisiPesawatById)
  .put(protect, updateMunisiPesawat)
  .delete(protect, deleteMunisiPesawat);

export default munisiPesawatRouter;
