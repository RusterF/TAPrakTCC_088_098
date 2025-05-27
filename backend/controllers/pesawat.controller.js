// backend/controllers/pesawat.controller.js
import Pesawat from "../models/Pesawat.js";
import Manufaktur from "../models/Manufaktur.js";
import MunisiPesawat from "../models/MunisiPesawat.js";
import { Storage } from '@google-cloud/storage'; // For deleting objects from GCS

const GCS_BUCKET_NAME = process.env.GCS_BUCKET;
let storage;
if (process.env.NODE_ENV === "production" && GCS_BUCKET_NAME) {
  storage = new Storage({
    // projectId: process.env.GCLOUD_PROJECT, // ADC will pick this up
    // keyFilename: process.env.GCS_KEYFILE, // ADC preferred on Cloud Run
  });
}
// For local dev, fs is used if not using GCS
const fs = process.env.NODE_ENV !== "production" ? (await import('fs')).default : null;
const path = (await import('path')).default;
const UPLOADS_BASE_DIR = process.env.NODE_ENV !== "production" ? path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'uploads') : null;


async function deleteGCSObject(bucketName, fileName) {
  if (!storage || !bucketName) return;
  try {
    console.log(`Attempting to delete gs://${bucketName}/${fileName}`);
    await storage.bucket(bucketName).file(fileName).delete();
    console.log(`Successfully deleted gs://${bucketName}/${fileName}`);
  } catch (error) {
    if (error.code === 404) {
        console.warn(`File gs://${bucketName}/${fileName} not found for deletion.`);
    } else {
        console.error(`Failed to delete gs://${bucketName}/${fileName}:`, error);
    }
  }
}

function getGCSObjectName(gambar_url) {
    if (!gambar_url) return null;
    // Example: gambar_url might be https://storage.googleapis.com/BUCKET_NAME/pesawat/filename.jpg
    // Or /uploads/pesawat/filename.jpg if from local dev not yet migrated
    // We need to extract "pesawat/filename.jpg"
    try {
        if (gambar_url.startsWith(`https://storage.googleapis.com/${GCS_BUCKET_NAME}/`)) {
            return gambar_url.substring(`https://storage.googleapis.com/${GCS_BUCKET_NAME}/`.length);
        } else if (gambar_url.startsWith('/uploads/')) { // Local file path
            return null; // Not a GCS object
        }
        // If it's just the object name like "pesawat/image.jpg" (e.g. from older data before full URL storage)
        if (gambar_url.includes('/')) return gambar_url;
    } catch (e) {
        console.error("Error parsing GCS object name from URL:", gambar_url, e);
    }
    return null;
}


export const createPesawat = async (req, res) => {
  const {
    id_munisi,
    id_manufaktur,
    nama_pesawat,
    tipe_pesawat,
    variant_pesawat,
    jumlah_pesawat,
    tahun_pesawat,
    gambar_url_text,
  } = req.body;

  let gambar_url_final = gambar_url_text || null; // Fallback to text URL

  if (req.file) {
    if (process.env.NODE_ENV === "production" && GCS_BUCKET_NAME) {
      // For GCS, req.file.path or req.file.filename is the object name in the bucket.
      // req.file.linkUrl or req.file.mediaLink might provide the public URL.
      // Best practice: construct the public URL yourself or use a consistent format.
      // The filename set in multer-google-storage is `pesawat/actual_filename.ext`
      const objectName = req.file.filename; // This is the 'pesawat/filename.jpg'
      gambar_url_final = `https://storage.googleapis.com/${GCS_BUCKET_NAME}/${objectName}`;
    } else if (fs) { // Local development
      gambar_url_final = `/uploads/pesawat/${req.file.filename}`;
    }
  }

  if (!nama_pesawat || !tipe_pesawat) {
    // If validation fails and a file was uploaded to GCS, delete it.
    if (req.file && process.env.NODE_ENV === "production" && GCS_BUCKET_NAME) {
      await deleteGCSObject(GCS_BUCKET_NAME, req.file.filename);
    } else if (req.file && fs) {
       const tempFilePath = path.join(UPLOADS_BASE_DIR, 'pesawat', req.file.filename);
       fs.unlink(tempFilePath, (err) => {
            if (err) console.error("Error deleting temp local file on validation failure:", err);
       });
    }
    return res
      .status(400)
      .json({ message: "Nama dan tipe pesawat harus diisi" });
  }

  try {
    // ... (manufaktur, munisi validation) ...
    // If any validation fails after this point, and a file was uploaded, it should be deleted.
    // This can be complex to manage perfectly here. A transaction or a cleanup service might be better.
    // For simplicity, we'll try to delete if an error occurs before Pesawat.create.

    const pesawat = await Pesawat.create({
      // ... other fields
      id_munisi: (id_munisi === '' || id_munisi === 'null') ? null : (id_munisi !== undefined ? Number(id_munisi) : null),
      id_manufaktur: (id_manufaktur === '' || id_manufaktur === 'null') ? null : (id_manufaktur !== undefined ? Number(id_manufaktur) : null),
      nama_pesawat,
      tipe_pesawat,
      variant_pesawat,
      jumlah_pesawat: (jumlah_pesawat === '' || jumlah_pesawat === 'null') ? null : (jumlah_pesawat !== undefined ? Number(jumlah_pesawat) : null),
      tahun_pesawat: (tahun_pesawat === '' || tahun_pesawat === 'null') ? null : (tahun_pesawat !== undefined ? Number(tahun_pesawat) : null),
      gambar_url: gambar_url_final,
    });
    res.status(201).json(pesawat);
  } catch (error) {
    console.error("Gagal membuat pesawat:", error);
    if (req.file && process.env.NODE_ENV === "production" && GCS_BUCKET_NAME) {
      await deleteGCSObject(GCS_BUCKET_NAME, req.file.filename);
    } else if (req.file && fs) {
        const errorFilePath = path.join(UPLOADS_BASE_DIR, 'pesawat', req.file.filename);
        fs.unlink(errorFilePath, (err) => {
            if (err) console.error("Error deleting local uploaded file on general failure:", err);
        });
    }
    res
      .status(500)
      .json({ message: "Gagal membuat pesawat", error: error.message });
  }
};

export const updatePesawat = async (req, res) => {
  const {
    // ... other fields
    gambar_url_text,
    hapus_gambar_sebelumnya,
  } = req.body;
  const { id_munisi, id_manufaktur, nama_pesawat, tipe_pesawat, variant_pesawat, jumlah_pesawat, tahun_pesawat } = req.body;


  try {
    const pesawat = await Pesawat.findByPk(req.params.id);
    if (!pesawat) {
      if (req.file && process.env.NODE_ENV === "production" && GCS_BUCKET_NAME) {
        await deleteGCSObject(GCS_BUCKET_NAME, req.file.filename); // Delete newly uploaded file if pesawat not found
      } else if (req.file && fs) {
         const tempFilePath = path.join(UPLOADS_BASE_DIR, 'pesawat', req.file.filename);
         fs.unlink(tempFilePath, (err) => console.error(err));
      }
      return res.status(404).json({ message: "Pesawat tidak ditemukan" });
    }

    let gambar_url_final = pesawat.gambar_url;
    const oldGCSObjectName = process.env.NODE_ENV === "production" ? getGCSObjectName(pesawat.gambar_url) : null;
    const oldLocalImagePath = (process.env.NODE_ENV !== "production" && pesawat.gambar_url && pesawat.gambar_url.startsWith('/uploads/pesawat/'))
        ? path.join(UPLOADS_BASE_DIR, 'pesawat', path.basename(pesawat.gambar_url))
        : null;


    if (req.file) { // New file uploaded
      // Delete old GCS object or local file
      if (oldGCSObjectName && GCS_BUCKET_NAME) {
        await deleteGCSObject(GCS_BUCKET_NAME, oldGCSObjectName);
      } else if (oldLocalImagePath && fs && fs.existsSync(oldLocalImagePath)) {
          fs.unlink(oldLocalImagePath, err => {
            if (err) console.error("Gagal menghapus gambar lokal lama saat update:", err);
          });
      }

      // Set new image URL
      if (process.env.NODE_ENV === "production" && GCS_BUCKET_NAME) {
        const objectName = req.file.filename; // `pesawat/filename.jpg`
        gambar_url_final = `https://storage.googleapis.com/${GCS_BUCKET_NAME}/${objectName}`;
      } else if (fs) {
        gambar_url_final = `/uploads/pesawat/${req.file.filename}`;
      }
    } else if (hapus_gambar_sebelumnya === 'true' || (gambar_url_text !== undefined && gambar_url_text === '')) {
      // Delete if checkbox is checked OR if text URL is explicitly emptied
      if (oldGCSObjectName && GCS_BUCKET_NAME) {
        await deleteGCSObject(GCS_BUCKET_NAME, oldGCSObjectName);
      } else if (oldLocalImagePath && fs && fs.existsSync(oldLocalImagePath)) {
         fs.unlink(oldLocalImagePath, err => console.error(err));
      }
      gambar_url_final = null;
    } else if (gambar_url_text !== undefined && gambar_url_text !== pesawat.gambar_url) {
      // Text URL is provided and is different from the current one (and not empty, handled above)
      // If the old one was a GCS object or local file, delete it
       if (oldGCSObjectName && GCS_BUCKET_NAME) {
        await deleteGCSObject(GCS_BUCKET_NAME, oldGCSObjectName);
      } else if (oldLocalImagePath && fs && fs.existsSync(oldLocalImagePath)) {
         fs.unlink(oldLocalImagePath, err => console.error(err));
      }
      gambar_url_final = gambar_url_text;
    }

    // ... (update other pesawat fields, ensure proper parsing for numbers and nulls from FormData)
    pesawat.id_munisi = (id_munisi === '' || id_munisi === 'null') ? null : (id_munisi !== undefined ? Number(id_munisi) : pesawat.id_munisi);
    pesawat.id_manufaktur = (id_manufaktur === '' || id_manufaktur === 'null') ? null : (id_manufaktur !== undefined ? Number(id_manufaktur) : pesawat.id_manufaktur);
    pesawat.nama_pesawat = nama_pesawat || pesawat.nama_pesawat;
    pesawat.tipe_pesawat = tipe_pesawat || pesawat.tipe_pesawat;
    pesawat.variant_pesawat = variant_pesawat !== undefined ? variant_pesawat : pesawat.variant_pesawat;
    pesawat.jumlah_pesawat = (jumlah_pesawat === '' || jumlah_pesawat === 'null') ? null : (jumlah_pesawat !== undefined ? Number(jumlah_pesawat) : pesawat.jumlah_pesawat);
    pesawat.tahun_pesawat = (tahun_pesawat === '' || tahun_pesawat === 'null') ? null : (tahun_pesawat !== undefined ? Number(tahun_pesawat) : pesawat.tahun_pesawat);
    pesawat.gambar_url = gambar_url_final;

    await pesawat.save();
    res.status(200).json(pesawat);
  } catch (error) {
    console.error("Gagal memperbarui pesawat:", error);
    if (req.file && process.env.NODE_ENV === "production" && GCS_BUCKET_NAME) { // Cleanup newly uploaded file on error
      await deleteGCSObject(GCS_BUCKET_NAME, req.file.filename);
    } else if (req.file && fs) {
        const errorFilePath = path.join(UPLOADS_BASE_DIR, 'pesawat', req.file.filename);
        fs.unlink(errorFilePath, (err) => console.error(err));
    }
    res
      .status(500)
      .json({ message: "Gagal memperbarui pesawat", error: error.message });
  }
};

export const deletePesawat = async (req, res) => {
  try {
    const pesawat = await Pesawat.findByPk(req.params.id);
    if (!pesawat) {
      return res.status(404).json({ message: "Pesawat tidak ditemukan" });
    }

    if (process.env.NODE_ENV === "production" && GCS_BUCKET_NAME) {
        const gcsObjectName = getGCSObjectName(pesawat.gambar_url);
        if (gcsObjectName) {
            await deleteGCSObject(GCS_BUCKET_NAME, gcsObjectName);
        }
    } else if (fs && pesawat.gambar_url && pesawat.gambar_url.startsWith('/uploads/pesawat/')) { // Local
        const imageFilePath = path.join(UPLOADS_BASE_DIR, 'pesawat', path.basename(pesawat.gambar_url));
        if (fs.existsSync(imageFilePath)) {
            fs.unlink(imageFilePath, err => {
            if (err) console.error("Gagal menghapus gambar lokal saat delete pesawat:", err);
            });
        }
    }

    await pesawat.destroy();
    res.status(200).json({ message: "Pesawat berhasil dihapus" });
  } catch (error) {
    console.error("Gagal menghapus pesawat:", error);
    res
      .status(500)
      .json({ message: "Gagal menghapus pesawat", error: error.message });
  }
};

// Ensure getAllPesawats and getPesawatById are also exported
export { getAllPesawats, getPesawatById } from "./pesawat.controller.js"; // Assuming they are in the same file and correctly defined earlier