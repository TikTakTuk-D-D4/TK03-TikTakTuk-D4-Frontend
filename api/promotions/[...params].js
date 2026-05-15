import pool from '../../lib/db.js';
import { cors, checkRole } from '../../lib/auth.js';
import { getJsonBody } from '../../lib/parseBody.js';
import { getRouteParams } from '../../lib/routeParams.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const params = getRouteParams(req);
  const [first, second] = params;

  if (!first && req.method === 'GET') {
    const { rows } = await pool.query(`SELECT * FROM promotion ORDER BY promo_code`);
    return res.status(200).json(rows);
  }

  if (!first && req.method === 'POST') {
    if (!await checkRole(req, res, ['administrator'])) return;
    const { promo_code, discount_type, discount_value, usage_limit, start_date, end_date } = getJsonBody(req);
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

  if (first === 'code' && second && params.length === 2 && req.method === 'GET') {
    const { rows } = await pool.query(
      `SELECT * FROM promotion WHERE UPPER(promo_code) = UPPER($1)`,
      [second]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Kode promo tidak ditemukan.' });
    return res.status(200).json(rows[0]);
  }

  if (first && params.length === 1 && req.method === 'GET') {
    const { rows } = await pool.query(`SELECT * FROM promotion WHERE promotion_id = $1`, [first]);
    if (rows.length === 0) return res.status(404).json({ message: 'Promotion tidak ditemukan.' });
    return res.status(200).json(rows[0]);
  }

  if (first && params.length === 1 && req.method === 'PUT') {
    if (!await checkRole(req, res, ['administrator'])) return;
    const { promo_code, discount_type, discount_value, usage_limit, start_date, end_date } = getJsonBody(req);
    try {
      const { rows } = await pool.query(
        `UPDATE promotion SET promo_code=$1, discount_type=$2, discount_value=$3, usage_limit=$4, start_date=$5, end_date=$6 WHERE promotion_id=$7 RETURNING *`,
        [promo_code, discount_type, discount_value, usage_limit, start_date, end_date, first]
      );
      return res.status(200).json(rows[0]);
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  if (first && params.length === 1 && req.method === 'DELETE') {
    if (!await checkRole(req, res, ['administrator'])) return;
    try {
      await pool.query(`DELETE FROM promotion WHERE promotion_id = $1`, [first]);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  return res.status(405).json({ message: 'Method not allowed.' });
}
