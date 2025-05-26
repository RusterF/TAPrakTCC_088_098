// backend/controllers/munisiPesawat.controller.js
import MunisiPesawat from "../models/MunisiPesawat.js"; //
import Manufaktur from "../models/Manufaktur.js";
import Pesawat from "../models/Pesawat.js";

/**
 * @desc    Create new Munisi Pesawat
 * @route   POST /api/munisipesawat
 * @access  Private
 */
export const createMunisiPesawat = async (req, res) => {
  const { id_manufaktur, nama_munisi, tipe_munisi, stok_munisi, tahun_munisi } =
    req.body;

  // Validasi dasar
  if (!nama_munisi || !tipe_munisi) {
    return res
      .status(400)
      .json({ message: "Nama dan tipe munisi harus diisi" });
  }
  if (id_manufaktur) {
    const manufakturExists = await Manufaktur.findByPk(id_manufaktur);
    if (!manufakturExists) {
      return res
        .status(404)
        .json({ message: "Manufaktur dengan ID tersebut tidak ditemukan." });
    }
  }

  try {
    const munisi = await MunisiPesawat.create({
      id_manufaktur,
      nama_munisi,
      tipe_munisi,
      stok_munisi,
      tahun_munisi,
    });
    res.status(201).json(munisi);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal membuat munisi pesawat", error: error.message });
  }
};

/**
 * @desc    Get all Munisi Pesawat
 * @route   GET /api/munisipesawat
 * @access  Private
 */
export const getAllMunisiPesawats = async (req, res) => {
  try {
    const munisiPesawats = await MunisiPesawat.findAll({
      include: [
        { model: Manufaktur, as: "manufaktur" }, //
        { model: Pesawat, as: "digunakanOlehPesawat" }, //
      ],
    });
    res.status(200).json(munisiPesawats);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Gagal mengambil data munisi pesawat",
        error: error.message,
      });
  }
};

/**
 * @desc    Get single Munisi Pesawat by ID
 * @route   GET /api/munisipesawat/:id
 * @access  Private
 */
export const getMunisiPesawatById = async (req, res) => {
  try {
    const munisi = await MunisiPesawat.findByPk(req.params.id, {
      include: [
        { model: Manufaktur, as: "manufaktur" },
        { model: Pesawat, as: "digunakanOlehPesawat" },
      ],
    });
    if (!munisi) {
      return res
        .status(404)
        .json({ message: "Munisi pesawat tidak ditemukan" });
    }
    res.status(200).json(munisi);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Gagal mengambil data munisi pesawat",
        error: error.message,
      });
  }
};

/**
 * @desc    Update Munisi Pesawat
 * @route   PUT /api/munisipesawat/:id
 * @access  Private
 */
export const updateMunisiPesawat = async (req, res) => {
  const { id_manufaktur, nama_munisi, tipe_munisi, stok_munisi, tahun_munisi } =
    req.body;

  if (id_manufaktur) {
    const manufakturExists = await Manufaktur.findByPk(id_manufaktur);
    if (!manufakturExists) {
      return res
        .status(404)
        .json({
          message:
            "Manufaktur dengan ID tersebut tidak ditemukan untuk diupdate.",
        });
    }
  }

  try {
    const munisi = await MunisiPesawat.findByPk(req.params.id);
    if (!munisi) {
      return res
        .status(404)
        .json({ message: "Munisi pesawat tidak ditemukan" });
    }

    munisi.id_manufaktur =
      id_manufaktur !== undefined ? id_manufaktur : munisi.id_manufaktur;
    munisi.nama_munisi = nama_munisi || munisi.nama_munisi;
    munisi.tipe_munisi = tipe_munisi || munisi.tipe_munisi;
    munisi.stok_munisi =
      stok_munisi !== undefined ? stok_munisi : munisi.stok_munisi;
    munisi.tahun_munisi =
      tahun_munisi !== undefined ? tahun_munisi : munisi.tahun_munisi;

    await munisi.save();
    res.status(200).json(munisi);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Gagal memperbarui munisi pesawat",
        error: error.message,
      });
  }
};

/**
 * @desc    Delete Munisi Pesawat
 * @route   DELETE /api/munisipesawat/:id
 * @access  Private
 */
export const deleteMunisiPesawat = async (req, res) => {
  try {
    const munisi = await MunisiPesawat.findByPk(req.params.id);
    if (!munisi) {
      return res
        .status(404)
        .json({ message: "Munisi pesawat tidak ditemukan" });
    }

    // Opsional: Cek apakah ada Pesawat yang terkait sebelum menghapus
    const relatedPesawatCount = await Pesawat.count({
      where: { id_munisi: req.params.id },
    });
    if (relatedPesawatCount > 0) {
      return res.status(400).json({
        message:
          "Tidak dapat menghapus munisi karena masih terkait dengan data pesawat. Hapus atau ubah relasi data pesawat tersebut terlebih dahulu.",
      });
    }

    await munisi.destroy();
    res.status(200).json({ message: "Munisi pesawat berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Gagal menghapus munisi pesawat",
        error: error.message,
      });
  }
};
