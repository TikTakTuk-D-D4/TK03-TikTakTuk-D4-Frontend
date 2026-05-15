import pool from '../_db.js';
import { cors, checkRole } from '../_auth.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  if (req.method === 'GET') {
    const { rows } = await pool.query(
      `SELECT o.*, c.full_name AS customer_name,
              COALESCE(json_agg(DISTINCT jsonb_build_object('promotion_id', p.promotion_id, 'promo_code', p.promo_code)) FILTER (WHERE p.promotion_id IS NOT NULL), '[]') AS promotions
       FROM orders o
       LEFT JOIN customer c ON o.customer_id = c.customer_id
       LEFT JOIN order_promotion op ON o.order_id = op.order_id
       LEFT JOIN promotion p ON op.promotion_id = p.promotion_id
       WHERE o.order_id = $1
       GROUP BY o.order_id, c.full_name`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Order tidak ditemukan.' });
    return res.status(200).json(rows[0]);
  }

  if (req.method === 'PUT') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { total_amount, payment_status } = req.body;
    try {
      const { rows } = await pool.query(
        `UPDATE orders SET total_amount=$1, payment_status=$2 WHERE order_id=$3 RETURNING *`,
        [total_amount, payment_status, id]
      );
      return res.status(200).json(rows[0]);
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  if (req.method === 'DELETE') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    try {
      await pool.query(`DELETE FROM orders WHERE order_id = $1`, [id]);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  return res.status(405).end();
}
