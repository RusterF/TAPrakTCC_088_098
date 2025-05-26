// tugas_akhir_tcc_alusista_negara/backend/middleware/upload.middleware.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Pastikan direktori uploads ada
const pesawatUploadDir = 'uploads/pesawat/';
if (!fs.existsSync(pesawatUploadDir)) {
    fs.mkdirSync(pesawatUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, pesawatUploadDir); // Simpan file di folder 'uploads/pesawat/'
    },
    filename: function (req, file, cb) {
        // Ganti spasi dengan underscore dan tambahkan timestamp untuk keunikan
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});

const fileFilter = (req, file, cb) => {
    // Hanya terima file gambar
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
        cb(null, true);
    } else {
        cb(new Error('Hanya file gambar (JPEG, PNG, GIF) yang diizinkan!'), false);
    }
};

export const uploadPesawatImage = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // Batas ukuran file 5MB
    },
    fileFilter: fileFilter
});