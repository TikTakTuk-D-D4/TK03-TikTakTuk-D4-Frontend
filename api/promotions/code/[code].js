import pool from '../../_db.js';
import { cors } from '../../_auth.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  const { code } = req.query;
  const { rows } = await pool.query(
    `SELECT * FROM promotion WHERE UPPER(promo_code) = UPPER($1)`, [code]
  );
  if (rows.length === 0) return res.status(404).json({ message: 'Kode promo tidak ditemukan.' });
  return res.status(200).json(rows[0]);
}
