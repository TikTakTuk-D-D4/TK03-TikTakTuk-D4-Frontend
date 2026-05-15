import pool from '../_db.js';
import { cors, checkRole } from '../_auth.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  if (req.method === 'GET') {
    const { rows } = await pool.query(
      `SELECT s.*, v.venue_name FROM seat s LEFT JOIN venue v ON s.venue_id = v.venue_id WHERE s.seat_id = $1`, [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Kursi tidak ditemukan.' });
    return res.status(200).json(rows[0]);
  }

  if (req.method === 'PUT') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { venue_id, section, row_number, seat_number } = req.body;
    try {
      const { rows } = await pool.query(
        `UPDATE seat SET venue_id=$1, section=$2, row_number=$3, seat_number=$4 WHERE seat_id=$5 RETURNING *`,
        [venue_id, section, row_number, seat_number, id]
      );
      return res.status(200).json(rows[0]);
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  if (req.method === 'DELETE') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    try {
      await pool.query(`DELETE FROM seat WHERE seat_id = $1`, [id]);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  return res.status(405).end();
}
