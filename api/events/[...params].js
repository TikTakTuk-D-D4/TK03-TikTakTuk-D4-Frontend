import pool from '../../lib/db.js';
import { cors, checkRole } from '../../lib/auth.js';
import { getJsonBody } from '../../lib/parseBody.js';
import { getRouteParams } from '../../lib/routeParams.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const params = getRouteParams(req, '/api/events');
  const id = params[0];

  if (!id && req.method === 'GET') {
    const { rows } = await pool.query(
      `SELECT e.*, v.venue_name, v.city FROM event e LEFT JOIN venue v ON e.venue_id = v.venue_id ORDER BY e.event_datetime`
    );
    return res.status(200).json(rows);
  }

  if (!id && req.method === 'POST') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { venue_id, organizer_id, event_title, event_datetime } = getJsonBody(req);
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

  if (id && params.length === 1 && req.method === 'GET') {
    const { rows } = await pool.query(
      `SELECT e.*, v.venue_name, v.city FROM event e LEFT JOIN venue v ON e.venue_id = v.venue_id WHERE e.event_id = $1`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Event tidak ditemukan.' });
    return res.status(200).json(rows[0]);
  }

  if (id && params.length === 1 && req.method === 'PUT') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { venue_id, event_title, event_datetime } = getJsonBody(req);
    try {
      const { rows } = await pool.query(
        `UPDATE event SET venue_id=$1, event_title=$2, event_datetime=$3 WHERE event_id=$4 RETURNING *`,
        [venue_id, event_title, event_datetime, id]
      );
      return res.status(200).json(rows[0]);
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  if (id && params.length === 1 && req.method === 'DELETE') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    try {
      await pool.query(`DELETE FROM event WHERE event_id = $1`, [id]);
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
