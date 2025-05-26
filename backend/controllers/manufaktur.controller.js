// backend/controllers/manufaktur.controller.js
import Manufaktur from "../models/Manufaktur.js";
// import { Pesawat, MunisiPesawat } from "../models/index.js"; // Baris ini diubah
import db from "../models/index.js"; // Impor default export dari index.js
const { Pesawat, MunisiPesawat } = db; // Destructure model yang dibutuhkan dari objek db

// ... sisa kode controller ...

/**
 * @desc    Create a new Manufaktur
 * @route   POST /api/manufaktur
 * @access  Private
 */
export const createManufaktur = async (req, res) => {
  const { nama_manufaktur, negara } = req.body;

  if (!nama_manufaktur || !negara) {
    return res
      .status(400)
      .json({ message: "Nama manufaktur dan negara harus diisi" });
  }

  try {
    const manufaktur = await Manufaktur.create({
      nama_manufaktur,
      negara,
    });
    res.status(201).json(manufaktur);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal membuat manufaktur", error: error.message });
  }
};

/**
 * @desc    Get all Manufakturs
 * @route   GET /api/manufaktur
 * @access  Private
 */
export const getAllManufakturs = async (req, res) => {
  try {
    const manufakturs = await Manufaktur.findAll({
      include: [
        // Contoh menyertakan relasi jika diperlukan di list
        { model: Pesawat, as: "daftarPesawatDariManufaktur" },
        { model: MunisiPesawat, as: "daftarMunisi" },
      ],
    });
    res.status(200).json(manufakturs);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal mengambil data manufaktur",
      error: error.message,
    });
  }
};

/**
 * @desc    Get a single Manufaktur by ID
 * @route   GET /api/manufaktur/:id
 * @access  Private
 */
export const getManufakturById = async (req, res) => {
  try {
    const manufaktur = await Manufaktur.findByPk(req.params.id, {
      include: [
        // Contoh menyertakan relasi
        { model: Pesawat, as: "daftarPesawatDariManufaktur" },
        { model: MunisiPesawat, as: "daftarMunisi" },
      ],
    });
    if (!manufaktur) {
      return res.status(404).json({ message: "Manufaktur tidak ditemukan" });
    }
    res.status(200).json(manufaktur);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal mengambil data manufaktur",
      error: error.message,
    });
  }
};

/**
 * @desc    Update a Manufaktur
 * @route   PUT /api/manufaktur/:id
 * @access  Private
 */
export const updateManufaktur = async (req, res) => {
  const { nama_manufaktur, negara } = req.body;
  try {
    const manufaktur = await Manufaktur.findByPk(req.params.id);
    if (!manufaktur) {
      return res.status(404).json({ message: "Manufaktur tidak ditemukan" });
    }

    manufaktur.nama_manufaktur = nama_manufaktur || manufaktur.nama_manufaktur;
    manufaktur.negara = negara || manufaktur.negara;

    await manufaktur.save();
    res.status(200).json(manufaktur);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal memperbarui manufaktur", error: error.message });
  }
};

/**
 * @desc    Delete a Manufaktur
 * @route   DELETE /api/manufaktur/:id
 * @access  Private
 */
export const deleteManufaktur = async (req, res) => {
  try {
    const manufaktur = await Manufaktur.findByPk(req.params.id);
    if (!manufaktur) {
      return res.status(404).json({ message: "Manufaktur tidak ditemukan" });
    }

    // Opsional: Cek apakah ada Pesawat atau MunisiPesawat yang terkait sebelum menghapus
    const relatedPesawatCount = await Pesawat.count({
      where: { id_manufaktur: req.params.id },
    });
    const relatedMunisiCount = await MunisiPesawat.count({
      where: { id_manufaktur: req.params.id },
    });

    if (relatedPesawatCount > 0 || relatedMunisiCount > 0) {
      return res.status(400).json({
        message:
          "Tidak dapat menghapus manufaktur karena masih terkait dengan data pesawat atau munisi. Hapus atau ubah relasi data tersebut terlebih dahulu.",
      });
    }

    await manufaktur.destroy();
    res.status(200).json({ message: "Manufaktur berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal menghapus manufaktur", error: error.message });
  }
};
