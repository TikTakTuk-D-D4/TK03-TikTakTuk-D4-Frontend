import pool from '../../lib/db.js';
import { cors, checkRole } from '../../lib/auth.js';
import { getJsonBody } from '../../lib/parseBody.js';
import { getRouteParams } from '../../lib/routeParams.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const params = getRouteParams(req, '/api/venues');
  const id = params[0];

  if (!id && req.method === 'GET') {
    const { rows } = await pool.query(`SELECT * FROM venue ORDER BY venue_name`);
    return res.status(200).json(rows);
  }

  if (!id && req.method === 'POST') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { venue_name, capacity, address, city } = getJsonBody(req);
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

  if (id && params.length === 1 && req.method === 'GET') {
    const { rows } = await pool.query(`SELECT * FROM venue WHERE venue_id = $1`, [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Venue tidak ditemukan.' });
    return res.status(200).json(rows[0]);
  }

  if (id && params.length === 1 && req.method === 'PUT') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { venue_name, capacity, address, city } = getJsonBody(req);
    try {
      const { rows } = await pool.query(
        `UPDATE venue SET venue_name=$1, capacity=$2, address=$3, city=$4 WHERE venue_id=$5 RETURNING *`,
        [venue_name, capacity, address, city, id]
      );
      return res.status(200).json(rows[0]);
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  if (id && params.length === 1 && req.method === 'DELETE') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    try {
      await pool.query(`DELETE FROM venue WHERE venue_id = $1`, [id]);
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
