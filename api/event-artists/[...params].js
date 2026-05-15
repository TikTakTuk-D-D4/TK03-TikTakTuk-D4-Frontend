import pool from '../../lib/db.js';
import { cors, checkRole } from '../../lib/auth.js';
import { getJsonBody } from '../../lib/parseBody.js';
import { getRouteParams } from '../../lib/routeParams.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const params = getRouteParams(req, '/api/event-artists');

  if (req.method === 'POST' && params.length === 0) {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { event_id, artist_id, role } = getJsonBody(req);
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

  // GET /api/event-artists/quota/:event_id
  if (req.method === 'GET' && params[0] === 'quota' && params.length === 2) {
    const event_id = params[1];
    try {
      const { rows } = await pool.query(`SELECT * FROM get_ticket_quota($1::uuid)`, [event_id]);
      return res.status(200).json(rows);
    } catch (err) {
      return res.status(404).json({ message: `ERROR: ${err.message}` });
    }
  }

  // GET /api/event-artists/:event_id
  if (req.method === 'GET' && params.length === 1) {
    const event_id = params[0];
    const { rows } = await pool.query(
      `SELECT ea.*, a.name, a.genre FROM event_artist ea JOIN artist a ON ea.artist_id = a.artist_id WHERE ea.event_id = $1`,
      [event_id]
    );
    return res.status(200).json(rows);
  }

  // DELETE /api/event-artists/:event_id/:artist_id
  if (req.method === 'DELETE' && params.length === 2) {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const [event_id, artist_id] = params;
    try {
      await pool.query(`DELETE FROM event_artist WHERE event_id=$1 AND artist_id=$2`, [event_id, artist_id]);
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
