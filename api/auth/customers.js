import pool from '../_db.js';
import { cors } from '../_auth.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  const { rows } = await pool.query(
    `SELECT c.customer_id, c.full_name, c.phone_number, ua.username
     FROM customer c
     LEFT JOIN user_account ua ON c.user_id = ua.user_id
     ORDER BY c.full_name`
  );
  return res.status(200).json(rows);
}
