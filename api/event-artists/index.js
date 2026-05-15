import pool from '../_db.js';
import { cors, checkRole } from '../_auth.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { event_id, artist_id, role } = req.body;
    try {
      const { rows } = await pool.query(
        `INSERT INTO event_artist (event_id, artist_id, role) VALUES ($1, $2, $3) RETURNING *`,
        [event_id, artist_id, role]
      );
      return res.status(200).json(rows[0]);
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  return res.status(405).end();
}
