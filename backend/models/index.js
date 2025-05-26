// backend/models/index.js
import sequelize from "../config/database.js"; // Instance koneksi sequelize
import { Sequelize } from "sequelize"; // <--- TAMBAHKAN BARIS INI untuk mengimpor kelas Sequelize
import User from "./User.js";
import Manufaktur from "./Manufaktur.js";
import MunisiPesawat from "./MunisiPesawat.js";
import Pesawat from "./Pesawat.js";

// Definisikan Asosiasi
// Manufaktur ke MunisiPesawat (One-to-Many)
Manufaktur.hasMany(MunisiPesawat, {
  foreignKey: "id_manufaktur",
  as: "daftarMunisi", // Alias opsional untuk relasi
});
MunisiPesawat.belongsTo(Manufaktur, {
  foreignKey: "id_manufaktur",
  as: "manufaktur", // Alias opsional
});

// Manufaktur ke Pesawat (One-to-Many)
Manufaktur.hasMany(Pesawat, {
  foreignKey: "id_manufaktur",
  as: "daftarPesawatDariManufaktur", // Alias opsional
});
Pesawat.belongsTo(Manufaktur, {
  foreignKey: "id_manufaktur",
  as: "manufakturPesawat", // Alias opsional
});

// MunisiPesawat ke Pesawat (One-to-Many)
MunisiPesawat.hasMany(Pesawat, {
  foreignKey: "id_munisi",
  as: "digunakanOlehPesawat", // Alias opsional
});
Pesawat.belongsTo(MunisiPesawat, {
  foreignKey: "id_munisi",
  as: "menggunakanMunisi", // Alias opsional
});

const db = {
  sequelize, // Ini adalah instance koneksi Anda, sudah benar
  Sequelize, // Sekarang Sequelize (kelas/library) sudah terdefinisi dari impor di atas
  User,
  Manufaktur,
  MunisiPesawat,
  Pesawat,
};

export default db;
