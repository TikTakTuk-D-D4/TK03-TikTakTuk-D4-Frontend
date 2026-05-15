import pool from '../_db.js';
import { cors } from '../_auth.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { username, password } = req.body;
  try {
    const { rows } = await pool.query(
      `SELECT ua.user_id, ua.username, r.role_name AS role
       FROM user_account ua
       JOIN account_role ar ON ua.user_id = ar.user_id
       JOIN role r ON ar.role_id = r.role_id
       WHERE ua.username = $1 AND ua.password = $2
       LIMIT 1`,
      [username, password]
    );
    if (rows.length === 0) return res.status(401).json({ message: 'Username atau password salah.' });
    const user = rows[0];

    if (user.role === 'organizer') {
      const { rows: org } = await pool.query(
        `SELECT organizer_id, organizer_name FROM organizer WHERE user_id = $1`, [user.user_id]
      );
      if (org.length > 0) { user.organizer_id = org[0].organizer_id; user.organizer_name = org[0].organizer_name; }
    } else if (user.role === 'customer') {
      const { rows: cust } = await pool.query(
        `SELECT customer_id, full_name FROM customer WHERE user_id = $1`, [user.user_id]
      );
      if (cust.length > 0) { user.customer_id = cust[0].customer_id; user.full_name = cust[0].full_name; }
    }

    return res.status(200).json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
