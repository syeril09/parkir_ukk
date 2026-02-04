const AreaParkirModel = require('../models/AreaParkirModel');

/**
 * AREA PARKIR CONTROLLER
 * Menangani CRUD area parkir (hanya untuk Admin)
 */
class AreaParkirController {
  /**
   * GET /api/area-parkir
   * Ambil semua area parkir dengan status kapasitas
   */
  static async getAll(req, res, next) {
    try {
      const areas = await AreaParkirModel.findAll();

      // Hitung kendaraan aktif untuk setiap area
      const areasWithStatus = await Promise.all(
        areas.map(async (area) => {
          const kendaraanAktif = await AreaParkirModel.hitungKendaraanAktif(area.id);
          return {
            ...area,
            kendaraanAktif,
            kapasitasTersedia: area.kapasitas - kendaraanAktif,
            persentasiPenuh: Math.round((kendaraanAktif / area.kapasitas) * 100)
          };
        })
      );

      res.status(200).json({
        success: true,
        data: areasWithStatus,
        total: areasWithStatus.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/area-parkir/:id
   * Ambil area parkir berdasarkan ID
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const area = await AreaParkirModel.findById(id);

      if (!area) {
        return res.status(404).json({
          success: false,
          message: 'Area parkir tidak ditemukan'
        });
      }

      const kendaraanAktif = await AreaParkirModel.hitungKendaraanAktif(id);
      const areaWithStatus = {
        ...area,
        kendaraanAktif,
        kapasitasTersedia: area.kapasitas - kendaraanAktif,
        persentasiPenuh: Math.round((kendaraanAktif / area.kapasitas) * 100)
      };

      res.status(200).json({
        success: true,
        data: areaWithStatus
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/area-parkir
   * Tambah area parkir baru
   */
  static async create(req, res, next) {
    try {
      const { namaArea, lokasi, kapasitas, hargaPerJam, deskripsi } = req.body;

      // Validasi input
      if (!namaArea || !kapasitas || !hargaPerJam) {
        return res.status(400).json({
          success: false,
          message: 'Nama area, kapasitas, dan harga per jam harus diisi'
        });
      }

      // Validasi kapasitas dan harga
      if (kapasitas <= 0 || hargaPerJam <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Kapasitas dan harga harus lebih besar dari 0'
        });
      }

      // Tambah area
      const areaId = await AreaParkirModel.create({
        namaArea,
        lokasi: lokasi || null,
        kapasitas,
        hargaPerJam,
        deskripsi: deskripsi || null
      });

      res.status(201).json({
        success: true,
        message: 'Area parkir berhasil ditambahkan',
        areaId: areaId
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/area-parkir/:id
   * Update area parkir
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { namaArea, lokasi, kapasitas, hargaPerJam, deskripsi } = req.body;

      // Cek area ada atau tidak
      const area = await AreaParkirModel.findById(id);
      if (!area) {
        return res.status(404).json({
          success: false,
          message: 'Area parkir tidak ditemukan'
        });
      }

      // Validasi kapasitas dan harga jika ada input
      if ((kapasitas && kapasitas <= 0) || (hargaPerJam && hargaPerJam <= 0)) {
        return res.status(400).json({
          success: false,
          message: 'Kapasitas dan harga harus lebih besar dari 0'
        });
      }

      // Update area
      await AreaParkirModel.update(id, {
        namaArea: namaArea || area.nama_area,
        lokasi: lokasi !== undefined ? lokasi : area.lokasi,
        kapasitas: kapasitas || area.kapasitas,
        hargaPerJam: hargaPerJam || area.harga_per_jam,
        deskripsi: deskripsi !== undefined ? deskripsi : area.deskripsi
      });

      res.status(200).json({
        success: true,
        message: 'Area parkir berhasil diupdate'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/area-parkir/:id
   * Hapus area parkir
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      // Cek area
      const area = await AreaParkirModel.findById(id);
      if (!area) {
        return res.status(404).json({
          success: false,
          message: 'Area parkir tidak ditemukan'
        });
      }

      // Hapus area
      await AreaParkirModel.delete(id);

      res.status(200).json({
        success: true,
        message: 'Area parkir berhasil dihapus'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AreaParkirController;
