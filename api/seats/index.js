import pool from '../_db.js';
import { cors, checkRole } from '../_auth.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { venue_id } = req.query;
    let sql = `
      SELECT s.*, v.venue_name,
        CASE WHEN hr.seat_id IS NOT NULL THEN true ELSE false END AS is_taken
      FROM seat s
      LEFT JOIN venue v ON s.venue_id = v.venue_id
      LEFT JOIN has_relationship hr ON s.seat_id = hr.seat_id
    `;
    const params = [];
    if (venue_id) { sql += ` WHERE s.venue_id = $1`; params.push(venue_id); }
    sql += ` ORDER BY s.section, s.row_number, s.seat_number`;
    const { rows } = await pool.query(sql, params);
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { venue_id, section, row_number, seat_number } = req.body;
    try {
      const { rows } = await pool.query(
        `INSERT INTO seat (seat_id, venue_id, section, row_number, seat_number)
         VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING *`,
        [venue_id, section, row_number, seat_number]
      );
      return res.status(200).json(rows[0]);
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  return res.status(405).end();
}
