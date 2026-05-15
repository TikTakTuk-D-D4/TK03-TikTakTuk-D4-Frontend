import pool from '../../lib/db.js';
import { cors, checkRole } from '../../lib/auth.js';
import { getJsonBody } from '../../lib/parseBody.js';
import { getRouteParams } from '../../lib/routeParams.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const params = getRouteParams(req);
  const id = params[0];

  if (!id && req.method === 'GET') {
    const { rows } = await pool.query(`SELECT * FROM artist ORDER BY name`);
    return res.status(200).json(rows);
  }

  if (!id && req.method === 'POST') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { name, genre } = getJsonBody(req);
    try {
      const { rows } = await pool.query(
        `INSERT INTO artist (artist_id, name, genre) VALUES (gen_random_uuid(), $1, $2) RETURNING *`,
        [name, genre]
      );
      return res.status(200).json(rows[0]);
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  if (id && params.length === 1 && req.method === 'GET') {
    const { rows } = await pool.query(`SELECT * FROM artist WHERE artist_id = $1`, [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Artist tidak ditemukan.' });
    return res.status(200).json(rows[0]);
  }

  if (id && params.length === 1 && req.method === 'PUT') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { name, genre } = getJsonBody(req);
    try {
      const { rows } = await pool.query(
        `UPDATE artist SET name=$1, genre=$2 WHERE artist_id=$3 RETURNING *`,
        [name, genre, id]
      );
      return res.status(200).json(rows[0]);
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  if (id && params.length === 1 && req.method === 'DELETE') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    try {
      await pool.query(`DELETE FROM artist WHERE artist_id = $1`, [id]);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  return res.status(405).json({ message: 'Method not allowed.' });
}
