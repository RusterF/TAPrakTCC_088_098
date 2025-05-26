// models/Pesawat.js
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class Pesawat extends Model {}

Pesawat.init(
  {
    id_pesawat: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_munisi: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "munisi_pesawat",
        key: "id_munisi",
      },
    },
    id_manufaktur: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "manufaktur",
        key: "id_manufaktur",
      },
    },
    nama_pesawat: {
      type: DataTypes.STRING(255),
      allowNull: false, // Typically names are not null
    },
    tipe_pesawat: {
      type: DataTypes.STRING(255),
      allowNull: false, // Typically types are not null
    },
    variant_pesawat: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    jumlah_pesawat: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tahun_pesawat: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gambar_url: { // Added this field
      type: DataTypes.STRING(2048), // VARCHAR(2048) to accommodate long URLs or paths
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Pesawat",
    tableName: "pesawat",
    timestamps: false,
  }
);

export default Pesawat;