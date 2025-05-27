// tugas_akhir_tcc_alusista_negara/backend/config/database.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { Connector } from "@google-cloud/cloud-sql-connector";

dotenv.config();

let sequelize;

if (process.env.NODE_ENV === "production" && process.env.INSTANCE_CONNECTION_NAME) {
  const connector = new Connector();
  const clientOpts = await connector.getOptions({
    instanceConnectionName: process.env.INSTANCE_CONNECTION_NAME,
    ipType: "PUBLIC", // Or 'PRIVATE' if using Private IP
  });

  sequelize = new Sequelize(
    process.env.DB_NAME || "alusista_negara",
    process.env.DB_USER || "root",
    process.env.DB_PASSWORD || "",
    {
      dialect: "mysql",
      dialectModule: (await import('mysql2')).default, // For ESM
      dialectOptions: {
        ...clientOpts,
        // ssl: {
        //   require: true,
        //   rejectUnauthorized: false // Adjust as needed, GCSQL provides CA
        // }
      },
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
} else {
  // Local development or other environments
  sequelize = new Sequelize(
    process.env.DB_NAME || "alusista_negara",
    process.env.DB_USER || "root",
    process.env.DB_PASSWORD || "",
    {
      host: process.env.DB_HOST || "127.0.0.1", // Default to localhost for local dev
      port: process.env.DB_PORT || 3306,      // Default MySQL port
      dialect: "mysql",
      logging: console.log, // See SQL queries in local dev
    }
  );
}

export default sequelize;