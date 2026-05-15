import pool from '../_db.js';
import { cors, checkRole } from '../_auth.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  if (req.method === 'GET') {
    const { rows } = await pool.query(
      `SELECT t.*, tc.category_name, tc.price, e.event_title, s.section, s.row_number, s.seat_number
       FROM ticket t
       LEFT JOIN ticket_category tc ON t.tcategory_id = tc.category_id
       LEFT JOIN event e ON tc.tevent_id = e.event_id
       LEFT JOIN has_relationship hr ON t.ticket_id = hr.ticket_id
       LEFT JOIN seat s ON hr.seat_id = s.seat_id
       WHERE t.ticket_id = $1`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Tiket tidak ditemukan.' });
    return res.status(200).json(rows[0]);
  }

  if (req.method === 'PUT') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { seat_id } = req.body;
    try {
      if (seat_id !== undefined) {
        await pool.query(`DELETE FROM has_relationship WHERE ticket_id = $1`, [id]);
        if (seat_id) {
          await pool.query(`INSERT INTO has_relationship (seat_id, ticket_id) VALUES ($1, $2)`, [seat_id, id]);
        }
      }
      const { rows } = await pool.query(`SELECT * FROM ticket WHERE ticket_id = $1`, [id]);
      if (rows.length === 0) return res.status(404).json({ message: 'Tiket tidak ditemukan.' });
      return res.status(200).json(rows[0]);
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  if (req.method === 'DELETE') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    try {
      await pool.query(`DELETE FROM has_relationship WHERE ticket_id = $1`, [id]);
      await pool.query(`DELETE FROM ticket WHERE ticket_id = $1`, [id]);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  return res.status(405).end();
}
