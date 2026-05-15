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
    const { event_id } = req.query;
    if (event_id) {
      const { rows } = await pool.query(
        `SELECT tc.*, tc.quota - COUNT(t.ticket_id) AS sisa_kuota
         FROM ticket_category tc
         LEFT JOIN ticket t ON tc.category_id = t.tcategory_id
         WHERE tc.tevent_id = $1
         GROUP BY tc.category_id`,
        [event_id]
      );
      return res.status(200).json(rows);
    }
    const { rows } = await pool.query(
      `SELECT tc.*, tc.quota - COUNT(t.ticket_id) AS sisa_kuota
       FROM ticket_category tc
       LEFT JOIN ticket t ON tc.category_id = t.tcategory_id
       GROUP BY tc.category_id ORDER BY tc.category_name`
    );
    return res.status(200).json(rows);
  }

  if (!id && req.method === 'POST') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { tevent_id, category_name, price, quota } = getJsonBody(req);
    try {
      const { rows } = await pool.query(
        `INSERT INTO ticket_category (category_id, tevent_id, category_name, price, quota)
         VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING *`,
        [tevent_id, category_name, price, quota]
      );
      return res.status(200).json(rows[0]);
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  if (id && params.length === 1 && req.method === 'GET') {
    const { rows } = await pool.query(
      `SELECT tc.*, tc.quota - COUNT(t.ticket_id) AS sisa_kuota
       FROM ticket_category tc
       LEFT JOIN ticket t ON tc.category_id = t.tcategory_id
       WHERE tc.category_id = $1
       GROUP BY tc.category_id`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Kategori tiket tidak ditemukan.' });
    return res.status(200).json(rows[0]);
  }

  if (id && params.length === 1 && req.method === 'PUT') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { category_name, price, quota } = getJsonBody(req);
    try {
      const { rows } = await pool.query(
        `UPDATE ticket_category SET category_name=$1, price=$2, quota=$3 WHERE category_id=$4 RETURNING *`,
        [category_name, price, quota, id]
      );
      return res.status(200).json(rows[0]);
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  if (id && params.length === 1 && req.method === 'DELETE') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    try {
      await pool.query(`DELETE FROM ticket_category WHERE category_id = $1`, [id]);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  return res.status(405).json({ message: 'Method not allowed.' });
}
