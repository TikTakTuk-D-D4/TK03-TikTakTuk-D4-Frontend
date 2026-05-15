import pool from '../_db.js';
import { cors, checkRole } from '../_auth.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { rows } = await pool.query(`SELECT * FROM venue ORDER BY venue_name`);
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { venue_name, capacity, address, city } = req.body;
    try {
      const { rows } = await pool.query(
        `INSERT INTO venue (venue_id, venue_name, capacity, address, city)
         VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING *`,
        [venue_name, capacity, address, city]
      );
      return res.status(200).json(rows[0]);
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  return res.status(405).end();
}
