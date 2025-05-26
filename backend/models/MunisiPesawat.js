// models/MunisiPesawat.js
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class MunisiPesawat extends Model {}

MunisiPesawat.init(
  {
    id_munisi: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // Foreign Key untuk Manufaktur
    id_manufaktur: {
      type: DataTypes.INTEGER,
      allowNull: true, // Sesuaikan dengan skema Anda, di SQL dump defaultnya NULL
      references: {
        model: "manufaktur", // Nama tabel yang dirujuk
        key: "id_manufaktur", // Nama kolom primary key di tabel manufaktur
      },
    },
    nama_munisi: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tipe_munisi: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    stok_munisi: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tahun_munisi: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "MunisiPesawat",
    tableName: "munisi_pesawat", // Nama tabel di database Anda
    timestamps: false, // Karena tidak ada kolom createdAt/updatedAt di SQL Anda
  }
);

export default MunisiPesawat;
