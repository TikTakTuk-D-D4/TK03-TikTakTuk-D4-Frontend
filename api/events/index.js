import pool from '../_db.js';
import { cors, checkRole } from '../_auth.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { rows } = await pool.query(
      `SELECT e.*, v.venue_name, v.city FROM event e LEFT JOIN venue v ON e.venue_id = v.venue_id ORDER BY e.event_datetime`
    );
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { venue_id, organizer_id, event_title, event_datetime } = req.body;
    try {
      const { rows } = await pool.query(
        `INSERT INTO event (event_id, venue_id, organizer_id, event_title, event_datetime)
         VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING *`,
        [venue_id, organizer_id, event_title, event_datetime]
      );
      return res.status(200).json(rows[0]);
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  return res.status(405).end();
}
