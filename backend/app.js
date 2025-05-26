// backend/app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/database.js";
import db from "./models/index.js";
import path from 'path'; // Impor path
import { fileURLToPath } from 'url'; // Impor fileURLToPath

// Impor router Anda
import authRouter from "./routes/auth.routes.js";
import manufakturRouter from "./routes/manufaktur.routes.js";
import munisiPesawatRouter from "./routes/munisiPesawat.routes.js";
import pesawatRouter from "./routes/pesawat.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Dapatkan __dirname di ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware untuk menyajikan file statis dari folder uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Default routes
app.get("/", (req, res) => {
  res.send("Selamat datang di API alutsista");
});

// Other routes
app.use("/api/auth", authRouter);
app.use("/api/manufaktur", manufakturRouter);
app.use("/api/munisipesawat", munisiPesawatRouter);
app.use("/api/pesawat", pesawatRouter);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Koneksi ke database berhasil.");

    app.listen(PORT, () => {
      console.log(`API berjalan di http://localhost:${PORT}`);
      console.log(`Folder uploads disajikan dari: ${path.join(__dirname, 'uploads')}`);
    });
  } catch (error) {
    console.error("Tidak dapat terhubung ke database:", error);
  }
};

startServer();

export default app;