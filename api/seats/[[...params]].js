import pool from '../../lib/db.js';
import { cors, checkRole } from '../../lib/auth.js';
import { getJsonBody } from '../../lib/parseBody.js';
import { getRouteParams } from '../../lib/routeParams.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const params = getRouteParams(req, '/api/seats');
  const id = params[0];

  if (!id && req.method === 'GET') {
    const { venue_id } = req.query;
    let sql = `
      SELECT s.*, v.venue_name,
        CASE WHEN hr.seat_id IS NOT NULL THEN true ELSE false END AS is_taken
      FROM seat s
      LEFT JOIN venue v ON s.venue_id = v.venue_id
      LEFT JOIN has_relationship hr ON s.seat_id = hr.seat_id
    `;
    const queryParams = [];
    if (venue_id) {
      sql += ` WHERE s.venue_id = $1`;
      queryParams.push(venue_id);
    }
    sql += ` ORDER BY s.section, s.row_number, s.seat_number`;
    const { rows } = await pool.query(sql, queryParams);
    return res.status(200).json(rows);
  }

  if (!id && req.method === 'POST') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { venue_id, section, row_number, seat_number } = getJsonBody(req);
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

  if (id && params.length === 1 && req.method === 'GET') {
    const { rows } = await pool.query(
      `SELECT s.*, v.venue_name FROM seat s LEFT JOIN venue v ON s.venue_id = v.venue_id WHERE s.seat_id = $1`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Kursi tidak ditemukan.' });
    return res.status(200).json(rows[0]);
  }

  if (id && params.length === 1 && req.method === 'PUT') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { venue_id, section, row_number, seat_number } = getJsonBody(req);
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

  if (id && params.length === 1 && req.method === 'DELETE') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    try {
      await pool.query(`DELETE FROM seat WHERE seat_id = $1`, [id]);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  return res.status(405).json({
    message: 'Method not allowed.',
    method: req.method,
    params,
    query: req.query,
    url: req.url,
  });
}
