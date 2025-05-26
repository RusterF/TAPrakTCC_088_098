// models/User.js
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import bcrypt from "bcryptjs";

class User extends Model {
  // Metode untuk membandingkan password
  async comparePassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }
}

User.init(
  {
    id_user: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nama_user: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    // Kolom tambahan untuk autentikasi - PASTIKAN ADA DI DATABASE ANDA
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    // --------------------------------------------------------------
    jabatan: {
      type: DataTypes.STRING(255),
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "user", // Sesuaikan dengan nama tabel di database
    timestamps: false, // Karena tidak ada kolom createdAt/updatedAt di SQL Anda
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password") && user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

export default User;
