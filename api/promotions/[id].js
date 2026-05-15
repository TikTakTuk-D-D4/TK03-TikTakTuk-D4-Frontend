import pool from '../_db.js';
import { cors, checkRole } from '../_auth.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  if (req.method === 'GET') {
    const { rows } = await pool.query(`SELECT * FROM promotion WHERE promotion_id = $1`, [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Promotion tidak ditemukan.' });
    return res.status(200).json(rows[0]);
  }

  if (req.method === 'PUT') {
    if (!await checkRole(req, res, ['administrator'])) return;
    const { promo_code, discount_type, discount_value, usage_limit, start_date, end_date } = req.body;
    try {
      const { rows } = await pool.query(
        `UPDATE promotion SET promo_code=$1, discount_type=$2, discount_value=$3, usage_limit=$4, start_date=$5, end_date=$6 WHERE promotion_id=$7 RETURNING *`,
        [promo_code, discount_type, discount_value, usage_limit, start_date, end_date, id]
      );
      return res.status(200).json(rows[0]);
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  if (req.method === 'DELETE') {
    if (!await checkRole(req, res, ['administrator'])) return;
    try {
      await pool.query(`DELETE FROM promotion WHERE promotion_id = $1`, [id]);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  return res.status(405).end();
}
