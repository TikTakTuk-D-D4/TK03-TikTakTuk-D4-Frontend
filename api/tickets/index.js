import pool from '../_db.js';
import { cors, checkRole } from '../_auth.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { event_id, customer_id } = req.query;
    let sql = `
      SELECT t.*, tc.category_name, tc.price, e.event_title, e.event_datetime,
             v.venue_name, s.section, s.row_number, s.seat_number,
             o.customer_id, o.payment_status AS order_status, o.order_id, c.full_name AS customer_name
      FROM ticket t
      LEFT JOIN ticket_category tc ON t.tcategory_id = tc.category_id
      LEFT JOIN event e ON tc.tevent_id = e.event_id
      LEFT JOIN venue v ON e.venue_id = v.venue_id
      LEFT JOIN has_relationship hr ON t.ticket_id = hr.ticket_id
      LEFT JOIN seat s ON hr.seat_id = s.seat_id
      LEFT JOIN orders o ON t.torder_id = o.order_id
      LEFT JOIN customer c ON o.customer_id = c.customer_id
    `;
    const params = [];
    if (event_id) { sql += ` WHERE tc.tevent_id = $1`; params.push(event_id); }
    else if (customer_id) { sql += ` WHERE o.customer_id = $1`; params.push(customer_id); }
    sql += ` ORDER BY e.event_datetime DESC`;
    const { rows } = await pool.query(sql, params);
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { tcategory_id, torder_id, seat_id } = req.body;
    try {
      const ticket_code = `TKT-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      const { rows } = await pool.query(
        `INSERT INTO ticket (ticket_id, ticket_code, tcategory_id, torder_id)
         VALUES (gen_random_uuid(), $1, $2, $3) RETURNING *`,
        [ticket_code, tcategory_id, torder_id]
      );
      const ticket = rows[0];
      if (seat_id) {
        await pool.query(`INSERT INTO has_relationship (seat_id, ticket_id) VALUES ($1, $2)`, [seat_id, ticket.ticket_id]);
      }
      return res.status(200).json(ticket);
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  return res.status(405).end();
}
