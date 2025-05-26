// config/database.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config(); // Muat environment variables dari file .env

const sequelize = new Sequelize(
  process.env.DB_NAME || "alusista_negara", // Nama database Anda
  process.env.DB_USER || "root", // User database Anda
  process.env.DB_PASSWORD || "", // Password database Anda
  {
    host: process.env.DB_HOST || "10.200.222.34", // Host database Anda
    dialect: "mysql", // MariaDB menggunakan dialek mysql
    logging: false, // Set ke console.log untuk melihat query SQL yang dijalankan
  }
);

export default sequelize;
