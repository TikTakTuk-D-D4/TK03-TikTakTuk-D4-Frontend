import pool from '../_db.js';
import { cors, checkRole } from '../_auth.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { rows } = await pool.query(`SELECT * FROM promotion ORDER BY promo_code`);
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    if (!await checkRole(req, res, ['administrator'])) return;
    const { promo_code, discount_type, discount_value, usage_limit, start_date, end_date } = req.body;
    try {
      const { rows } = await pool.query(
        `INSERT INTO promotion (promotion_id, promo_code, discount_type, discount_value, usage_limit, start_date, end_date)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6) RETURNING *`,
        [promo_code, discount_type, discount_value, usage_limit, start_date, end_date]
      );
      return res.status(200).json(rows[0]);
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  return res.status(405).end();
}
