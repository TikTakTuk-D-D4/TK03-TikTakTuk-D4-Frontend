import pool from '../../lib/db.js';
import { cors, checkAuth, checkRole } from '../../lib/auth.js';
import { getJsonBody } from '../../lib/parseBody.js';
import { getRouteParams } from '../../lib/routeParams.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const params = getRouteParams(req, '/api/orders');
  const id = params[0];

  if (!id && req.method === 'GET') {
    const { customer_id } = req.query;
    let sql = `
      SELECT o.*, c.full_name AS customer_name,
             COALESCE(json_agg(DISTINCT jsonb_build_object('promotion_id', p.promotion_id, 'promo_code', p.promo_code)) FILTER (WHERE p.promotion_id IS NOT NULL), '[]') AS promotions
      FROM orders o
      LEFT JOIN customer c ON o.customer_id = c.customer_id
      LEFT JOIN order_promotion op ON o.order_id = op.order_id
      LEFT JOIN promotion p ON op.promotion_id = p.promotion_id
    `;
    const queryParams = [];
    if (customer_id) {
      sql += ` WHERE o.customer_id = $1`;
      queryParams.push(customer_id);
    }
    sql += ` GROUP BY o.order_id, c.full_name ORDER BY o.order_date DESC`;
    const { rows } = await pool.query(sql, queryParams);
    return res.status(200).json(rows);
  }

  if (!id && req.method === 'POST') {
    if (!await checkAuth(req, res)) return;
    const { customer_id, total_amount, payment_status, promotion_id } = getJsonBody(req);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        `INSERT INTO orders (order_id, customer_id, order_date, total_amount, payment_status)
         VALUES (gen_random_uuid(), $1, NOW(), $2, $3) RETURNING *`,
        [customer_id, total_amount, payment_status || 'Pending']
      );
      const order = rows[0];
      if (promotion_id) {
        await client.query(
          `INSERT INTO order_promotion (order_promotion_id, promotion_id, order_id) VALUES (gen_random_uuid(), $1, $2)`,
          [promotion_id, order.order_id]
        );
      }
      await client.query('COMMIT');
      return res.status(200).json(order);
    } catch (err) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    } finally {
      client.release();
    }
  }

  if (id && params.length === 1 && req.method === 'GET') {
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

  if (id && params.length === 1 && req.method === 'PUT') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { total_amount, payment_status } = getJsonBody(req);
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

  if (id && params.length === 1 && req.method === 'DELETE') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    try {
      await pool.query(`DELETE FROM orders WHERE order_id = $1`, [id]);
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
