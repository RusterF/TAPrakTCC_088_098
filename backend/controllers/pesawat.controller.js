// backend/controllers/pesawat.controller.js
import Pesawat from "../models/Pesawat.js";
import Manufaktur from "../models/Manufaktur.js";
import MunisiPesawat from "../models/MunisiPesawat.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get base path for uploads, assuming app.js is in 'backend' directory
const __filename = fileURLToPath(import.meta.url); // path to current file (pesawat.controller.js)
const __dirname = path.dirname(__filename); // backend/controllers
const UPLOADS_BASE_DIR = path.join(__dirname, '..', 'uploads'); // backend/uploads

// ... (createPesawat remains largely the same, ensure it uses gambar_url_final logic)
// Create Pesawat
export const createPesawat = async (req, res) => {
  const {
    id_munisi,
    id_manufaktur,
    nama_pesawat,
    tipe_pesawat,
    variant_pesawat,
    jumlah_pesawat,
    tahun_pesawat,
    gambar_url_text, // from form
  } = req.body;

  let gambar_url_final = gambar_url_text || null;

  if (req.file) {
    gambar_url_final = `/uploads/pesawat/${req.file.filename}`; // Path relative to server root
  }

  if (!nama_pesawat || !tipe_pesawat) {
    if (req.file) { // Clean up uploaded file if validation fails early
        const tempFilePath = path.join(UPLOADS_BASE_DIR, 'pesawat', req.file.filename);
        fs.unlink(tempFilePath, (err) => {
            if (err) console.error("Error deleting temp uploaded file on validation failure:", err);
        });
    }
    return res
      .status(400)
      .json({ message: "Nama dan tipe pesawat harus diisi" });
  }

  try {
    // ... (validations for manufaktur and munisi)
    if (id_manufaktur) {
        const manufakturExists = await Manufaktur.findByPk(id_manufaktur);
        if (!manufakturExists) {
            if (req.file) { fs.unlink(path.join(UPLOADS_BASE_DIR, 'pesawat', req.file.filename), e => console.error(e));}
            return res.status(404).json({ message: "Manufaktur tidak ditemukan" });
        }
    }
    if (id_munisi) {
        const munisiExists = await MunisiPesawat.findByPk(id_munisi);
        if (!munisiExists) {
            if (req.file) { fs.unlink(path.join(UPLOADS_BASE_DIR, 'pesawat', req.file.filename), e => console.error(e));}
            return res.status(404).json({ message: "Munisi tidak ditemukan" });
        }
    }


    const pesawat = await Pesawat.create({
      id_munisi: id_munisi || null,
      id_manufaktur: id_manufaktur || null,
      nama_pesawat,
      tipe_pesawat,
      variant_pesawat,
      jumlah_pesawat: jumlah_pesawat === 'null' || jumlah_pesawat === '' ? null : Number(jumlah_pesawat),
      tahun_pesawat: tahun_pesawat === 'null' || tahun_pesawat === '' ? null : Number(tahun_pesawat),
      gambar_url: gambar_url_final,
    });
    res.status(201).json(pesawat);
  } catch (error) {
    console.error(error);
    if (req.file) {
        const errorFilePath = path.join(UPLOADS_BASE_DIR, 'pesawat', req.file.filename);
        fs.unlink(errorFilePath, (err) => {
            if (err) console.error("Error deleting uploaded file on general failure:", err);
        });
    }
    res
      .status(500)
      .json({ message: "Gagal membuat pesawat", error: error.message });
  }
};

// ... (getAllPesawats and getPesawatById can remain as they are) ...
export const getAllPesawats = async (req, res) => {
  try {
    const pesawats = await Pesawat.findAll({
      include: [
        { model: Manufaktur, as: "manufakturPesawat" }, 
        { model: MunisiPesawat, as: "menggunakanMunisi" }, 
      ],
    });
    res.status(200).json(pesawats);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal mengambil data pesawat", error: error.message });
  }
};

export const getPesawatById = async (req, res) => {
  try {
    const pesawat = await Pesawat.findByPk(req.params.id, {
      include: [
        { model: Manufaktur, as: "manufakturPesawat" },
        { model: MunisiPesawat, as: "menggunakanMunisi" },
      ],
    });
    if (!pesawat) {
      return res.status(404).json({ message: "Pesawat tidak ditemukan" });
    }
    res.status(200).json(pesawat);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal mengambil data pesawat", error: error.message });
  }
};

// Update Pesawat
export const updatePesawat = async (req, res) => {
  const {
    id_munisi,
    id_manufaktur,
    nama_pesawat,
    tipe_pesawat,
    variant_pesawat,
    jumlah_pesawat,
    tahun_pesawat,
    gambar_url_text,
    hapus_gambar_sebelumnya,
  } = req.body;

  try {
    const pesawat = await Pesawat.findByPk(req.params.id);
    if (!pesawat) {
       if (req.file) { // If pesawat not found, and a file was uploaded for it, delete temp file
            const tempFilePath = path.join(UPLOADS_BASE_DIR, 'pesawat', req.file.filename);
            fs.unlink(tempFilePath, (err) => {
                if (err) console.error("Error deleting temp uploaded file for non-existent pesawat:", err);
            });
        }
      return res.status(404).json({ message: "Pesawat tidak ditemukan" });
    }

    let gambar_url_final = pesawat.gambar_url;
    const oldImageServerPath = pesawat.gambar_url && pesawat.gambar_url.startsWith('/uploads/pesawat/')
      ? path.join(UPLOADS_BASE_DIR, 'pesawat', path.basename(pesawat.gambar_url))
      : null;

    if (req.file) { // New file uploaded
      if (oldImageServerPath && fs.existsSync(oldImageServerPath)) {
        fs.unlink(oldImageServerPath, err => {
          if (err) console.error("Gagal menghapus gambar lama saat update:", err);
        });
      }
      gambar_url_final = `/uploads/pesawat/${req.file.filename}`;
    } else if (hapus_gambar_sebelumnya === 'true') {
      if (oldImageServerPath && fs.existsSync(oldImageServerPath)) {
        fs.unlink(oldImageServerPath, err => {
          if (err) console.error("Gagal menghapus gambar (checkbox):", err);
        });
      }
      gambar_url_final = null;
    } else if (gambar_url_text !== undefined && gambar_url_text !== pesawat.gambar_url) {
      // URL text provided and it's different (or now empty)
      if (oldImageServerPath && fs.existsSync(oldImageServerPath)) { // If previous was a file upload, delete it
         fs.unlink(oldImageServerPath, err => {
          if (err) console.error("Gagal menghapus gambar lama saat ganti ke URL teks:", err);
        });
      }
      gambar_url_final = gambar_url_text === '' ? null : gambar_url_text;
    }

    // ... (validations for manufaktur and munisi as in create)
    if (id_manufaktur) {
        const manufakturExists = await Manufaktur.findByPk(id_manufaktur);
        if (!manufakturExists) {
            if (req.file) { fs.unlink(path.join(UPLOADS_BASE_DIR, 'pesawat', req.file.filename), e => console.error(e));}
            return res.status(404).json({ message: "Manufaktur update target tidak ditemukan" });
        }
    }
    if (id_munisi) {
        const munisiExists = await MunisiPesawat.findByPk(id_munisi);
        if (!munisiExists) {
             if (req.file) { fs.unlink(path.join(UPLOADS_BASE_DIR, 'pesawat', req.file.filename), e => console.error(e));}
            return res.status(404).json({ message: "Munisi update target tidak ditemukan" });
        }
    }

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
    console.error(error);
     if (req.file) { // If error during save, and a new file was uploaded, delete it
        const errorFilePath = path.join(UPLOADS_BASE_DIR, 'pesawat', req.file.filename);
        fs.unlink(errorFilePath, (err) => {
            if (err) console.error("Error deleting newly uploaded file on update failure (catch):", err);
        });
    }
    res
      .status(500)
      .json({ message: "Gagal memperbarui pesawat", error: error.message });
  }
};

// Delete Pesawat
export const deletePesawat = async (req, res) => {
  try {
    const pesawat = await Pesawat.findByPk(req.params.id);
    if (!pesawat) {
      return res.status(404).json({ message: "Pesawat tidak ditemukan" });
    }

    if (pesawat.gambar_url && pesawat.gambar_url.startsWith('/uploads/pesawat/')) {
      const imageFilePath = path.join(UPLOADS_BASE_DIR, 'pesawat', path.basename(pesawat.gambar_url));
      if (fs.existsSync(imageFilePath)) {
        fs.unlink(imageFilePath, err => {
          if (err) console.error("Gagal menghapus gambar saat delete pesawat:", err);
        });
      }
    }

    await pesawat.destroy();
    res.status(200).json({ message: "Pesawat berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal menghapus pesawat", error: error.message });
  }
};