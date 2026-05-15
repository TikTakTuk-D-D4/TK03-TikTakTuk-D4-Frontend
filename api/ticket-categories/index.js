import pool from '../_db.js';
import { cors, checkRole } from '../_auth.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
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

  if (req.method === 'POST') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { tevent_id, category_name, price, quota } = req.body;
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

  return res.status(405).end();
}
