import pool from '../_db.js';
import { cors, checkRole } from '../_auth.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  if (req.method === 'GET') {
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

  if (req.method === 'PUT') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { category_name, price, quota } = req.body;
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

  if (req.method === 'DELETE') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    try {
      await pool.query(`DELETE FROM ticket_category WHERE category_id = $1`, [id]);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  return res.status(405).end();
}
