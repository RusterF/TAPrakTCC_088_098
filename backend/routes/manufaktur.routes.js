// backend/routes/manufaktur.routes.js
import express from "express";
import {
  createManufaktur,
  getAllManufakturs,
  getManufakturById,
  updateManufaktur,
  deleteManufaktur,
} from "../controllers/manufaktur.controller.js";
import { protect } from "../middleware/auth.middleware.js"; //

const manufakturRouter = express.Router();

manufakturRouter
  .route("/")
  .post(protect, createManufaktur)
  .get(protect, getAllManufakturs);

manufakturRouter
  .route("/:id")
  .get(protect, getManufakturById)
  .put(protect, updateManufaktur)
  .delete(protect, deleteManufaktur);

export default manufakturRouter;
