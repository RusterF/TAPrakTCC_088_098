// models/Manufaktur.js
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class Manufaktur extends Model {}

Manufaktur.init(
  {
    id_manufaktur: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nama_manufaktur: {
      type: DataTypes.STRING(255),
    },
    negara: {
      type: DataTypes.STRING(255),
    },
  },
  {
    sequelize,
    modelName: "Manufaktur",
    tableName: "manufaktur", //
    timestamps: false,
  }
);

export default Manufaktur;
