// tugas_akhir_tcc_alusista_negara/backend/middleware/upload.middleware.js
import multer from 'multer';
import MulterGoogleCloudStorage from 'multer-google-storage';
import path from 'path';

// This middleware will now upload directly to GCS
// The local 'uploads/' directory will not be used by the deployed app for pesawat images.
// However, it's good to keep the local fs-based multer for local development if you don't want to upload to GCS every time.
// For this deployment, we'll focus on GCS.

let storageHandler;

if (process.env.NODE_ENV === "production" && process.env.GCS_BUCKET) {
  storageHandler = new MulterGoogleCloudStorage({
    bucket: process.env.GCS_BUCKET,
    projectId: process.env.GCLOUD_PROJECT, // Your GCP Project ID
    keyFilename: process.env.GCS_KEYFILE, // Path to service account key (if not using ADC)
                                          // Cloud Run service account will have implicit permissions if configured
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = `pesawat/${file.fieldname}-${uniqueSuffix}-${file.originalname.replace(/\s+/g, '_')}`;
      cb(null, filename);
    },
    // acl: 'publicRead', // Deprecated if using uniform bucket-level access. Permissions set on bucket.
  });
} else {
  // Local storage for development (fallback if GCS vars aren't set)
  const fs = (await import('fs')).default; // Dynamic import for fs in ESM
  const pesawatUploadDir = 'uploads/pesawat/';
  if (!fs.existsSync(pesawatUploadDir)) {
      fs.mkdirSync(pesawatUploadDir, { recursive: true });
  }
  storageHandler = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, pesawatUploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
    }
  });
}


const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (JPEG, PNG, GIF) yang diizinkan!'), false);
  }
};

export const uploadPesawatImage = multer({
  storage: storageHandler,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB
  },
  fileFilter: fileFilter
}); 