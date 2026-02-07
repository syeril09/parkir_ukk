const pool = require('../config/database');

/**
 * TARIF PARKIR MODEL
 * Menangani semua query terkait tarif parkir
 */
class TarifParkirModel {
  // Cari tarif berdasarkan ID
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT tp.id, tp.jenis_kendaraan_id, tp.tarif_per_jam,
              jk.nama_jenis
       FROM tarif_parkir tp
       JOIN jenis_kendaraan jk ON tp.jenis_kendaraan_id = jk.id
       WHERE tp.id = ?`,
      [id]
    );
    return rows[0];
  }

  // Ambil semua tarif parkir
  static async findAll() {
    const [rows] = await pool.execute(
      `SELECT tp.id, tp.jenis_kendaraan_id, tp.tarif_per_jam,
              jk.nama_jenis
       FROM tarif_parkir tp
       JOIN jenis_kendaraan jk ON tp.jenis_kendaraan_id = jk.id
       ORDER BY jk.nama_jenis ASC`
    );
    return rows;
  }

  // Cari tarif berdasarkan jenis kendaraan dan area
  static async findByVehicleAndArea(jenisKendaraanId, areaParkId) {
    const [rows] = await pool.execute(
      `SELECT tp.id, tp.jenis_kendaraan_id, tp.tarif_per_jam,
              jk.nama_jenis
       FROM tarif_parkir tp
       JOIN jenis_kendaraan jk ON tp.jenis_kendaraan_id = jk.id
       WHERE tp.jenis_kendaraan_id = ?`,
      [jenisKendaraanId]
    );
    return rows[0];
  }

  // Ambil semua tarif untuk jenis kendaraan tertentu
  static async findByVehicleType(jenisKendaraanId) {
    const [rows] = await pool.execute(
      `SELECT tp.id, tp.jenis_kendaraan_id, tp.tarif_per_jam,
              jk.nama_jenis
       FROM tarif_parkir tp
       JOIN jenis_kendaraan jk ON tp.jenis_kendaraan_id = jk.id
       WHERE tp.jenis_kendaraan_id = ?`,
      [jenisKendaraanId]
    );
    return rows;
  }

  // Ambil semua tarif untuk area tertentu (untuk backward compatibility)
  static async findByArea(areaParkId) {
    const [rows] = await pool.execute(
      `SELECT tp.id, tp.jenis_kendaraan_id, tp.tarif_per_jam,
              jk.nama_jenis
       FROM tarif_parkir tp
       JOIN jenis_kendaraan jk ON tp.jenis_kendaraan_id = jk.id
       ORDER BY jk.nama_jenis ASC`
    );
    return rows;
  }

  // Cek apakah tarif sudah ada
  static async exists(jenisKendaraanId, areaParkId = null) {
    if (areaParkId) {
      const [rows] = await pool.execute(
        `SELECT id FROM tarif_parkir 
         WHERE jenis_kendaraan_id = ? AND area_parkir_id = ?`,
        [jenisKendaraanId, areaParkId]
      );
      return rows.length > 0;
    } else {
      const [rows] = await pool.execute(
        `SELECT id FROM tarif_parkir 
         WHERE jenis_kendaraan_id = ?`,
        [jenisKendaraanId]
      );
      return rows.length > 0;
    }
  }

  // Tambah tarif parkir baru
  static async create(data) {
    const { jenisKendaraanId, tarifPerJam } = data;
    const [result] = await pool.execute(
      'INSERT INTO tarif_parkir (jenis_kendaraan_id, area_parkir_id, tarif_per_jam) VALUES (?, NULL, ?)',
      [jenisKendaraanId, tarifPerJam]
    );
    return result.insertId;
  }

  // Update tarif parkir
  static async update(id, data) {
    const { jenisKendaraanId, tarifPerJam } = data;
    const updates = [];
    const values = [];
    
    if (jenisKendaraanId !== undefined) {
      updates.push('jenis_kendaraan_id = ?');
      values.push(jenisKendaraanId);
    }
    
    if (tarifPerJam !== undefined) {
      updates.push('tarif_per_jam = ?');
      values.push(tarifPerJam);
    }
    
    if (updates.length === 0) return;
    
    values.push(id);
    const query = `UPDATE tarif_parkir SET ${updates.join(', ')} WHERE id = ?`;
    await pool.execute(query, values);
  }

  // Hapus tarif parkir
  static async delete(id) {
    await pool.execute('DELETE FROM tarif_parkir WHERE id = ?', [id]);
  }
}

module.exports = TarifParkirModel;
