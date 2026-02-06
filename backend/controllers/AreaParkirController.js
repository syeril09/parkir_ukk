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

      // Normalisasi field nama dan jenis, lalu hitung kendaraan aktif untuk setiap area
      const areasWithStatus = await Promise.all(
        areas.map(async (area) => {
          // normalisasi nama field dari DB (handle snake_case atau camelCase)
          const normalized = {
            id: area.id,
            nama: area.nama_area ?? area.nama ?? area.namaArea,
            jenisArea: area.jenis_area ?? 'mobil',
            lokasi: area.lokasi,
            kapasitas: area.kapasitas,
            hargaPerJam: area.harga_per_jam ?? area.hargaPerJam ?? 0,
            deskripsi: area.deskripsi ?? ''
          };

          const kendaraanAktif = await AreaParkirModel.hitungKendaraanAktif(area.id);
          const tersedia = normalized.kapasitas - kendaraanAktif;
          return {
            ...normalized,
            kendaraanAktif,
            tersedia,
            persentasiPenuh: Math.round((kendaraanAktif / normalized.kapasitas) * 100)
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
      const normalized = {
        id: area.id,
        nama: area.nama_area ?? area.nama ?? area.namaArea,
        jenisArea: area.jenis_area ?? 'mobil',
        lokasi: area.lokasi,
        kapasitas: area.kapasitas,
        hargaPerJam: area.harga_per_jam ?? area.hargaPerJam ?? 0,
        deskripsi: area.deskripsi ?? ''
      };
      const tersedia = normalized.kapasitas - kendaraanAktif;
      const areaWithStatus = {
        ...normalized,
        kendaraanAktif,
        tersedia,
        persentasiPenuh: Math.round((kendaraanAktif / normalized.kapasitas) * 100)
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
      const { namaArea, jenisArea, lokasi, kapasitas, hargaPerJam, deskripsi } = req.body;

      // Validasi input
      if (!namaArea || !jenisArea || !kapasitas || !hargaPerJam) {
        return res.status(400).json({
          success: false,
          message: 'Nama area, jenis area, kapasitas, dan harga per jam harus diisi'
        });
      }

      // Validasi jenis area
      const validJenis = ['mobil', 'bus', 'motor'];
      if (!validJenis.includes(jenisArea)) {
        return res.status(400).json({
          success: false,
          message: 'Jenis area harus: mobil, bus, atau motor'
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
        jenisArea,
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
      const { namaArea, jenisArea, lokasi, kapasitas, hargaPerJam, deskripsi } = req.body;

      // Cek area ada atau tidak
      const area = await AreaParkirModel.findById(id);
      if (!area) {
        return res.status(404).json({
          success: false,
          message: 'Area parkir tidak ditemukan'
        });
      }

      // Validasi jenis area jika ada input
      if (jenisArea) {
        const validJenis = ['mobil', 'bus', 'motor'];
        if (!validJenis.includes(jenisArea)) {
          return res.status(400).json({
            success: false,
            message: 'Jenis area harus: mobil, bus, atau motor'
          });
        }
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
        jenisArea: jenisArea || area.jenis_area,
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
