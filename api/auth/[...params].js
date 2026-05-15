import pool from '../../lib/db.js';
import { cors } from '../../lib/auth.js';
import { getJsonBody } from '../../lib/parseBody.js';
import { getRouteParams } from '../../lib/routeParams.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const params = getRouteParams(req);
  const [first, second] = params;

  if (first === 'login' && req.method === 'POST') {
    const { username, password } = getJsonBody(req);
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
          `SELECT organizer_id, organizer_name FROM organizer WHERE user_id = $1`,
          [user.user_id]
        );
        if (org.length > 0) {
          user.organizer_id = org[0].organizer_id;
          user.organizer_name = org[0].organizer_name;
        }
      } else if (user.role === 'customer') {
        const { rows: cust } = await pool.query(
          `SELECT customer_id, full_name FROM customer WHERE user_id = $1`,
          [user.user_id]
        );
        if (cust.length > 0) {
          user.customer_id = cust[0].customer_id;
          user.full_name = cust[0].full_name;
        }
      }

      return res.status(200).json({ success: true, user });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  if (first === 'register' && req.method === 'POST') {
    const { username, password, role, full_name, phone_number, organizer_name, contact_email } = getJsonBody(req);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows } = await client.query(
        `INSERT INTO user_account (user_id, username, password)
         VALUES (gen_random_uuid(), $1, $2) RETURNING user_id, username`,
        [username, password]
      );
      const user = rows[0];

      const { rows: roleRows } = await client.query(
        `SELECT role_id FROM role WHERE role_name = $1`,
        [role || 'customer']
      );
      if (roleRows.length === 0) throw new Error('Role tidak valid.');
      await client.query(
        `INSERT INTO account_role (role_id, user_id) VALUES ($1, $2)`,
        [roleRows[0].role_id, user.user_id]
      );

      if (role === 'organizer') {
        await client.query(
          `INSERT INTO organizer (organizer_id, organizer_name, contact_email, user_id)
           VALUES (gen_random_uuid(), $1, $2, $3)`,
          [organizer_name || username, contact_email || null, user.user_id]
        );
      } else if (role !== 'administrator' && role !== 'admin') {
        await client.query(
          `INSERT INTO customer (customer_id, full_name, phone_number, user_id)
           VALUES (gen_random_uuid(), $1, $2, $3)`,
          [full_name || username, phone_number || null, user.user_id]
        );
      }

      await client.query('COMMIT');
      return res.status(200).json({ success: true, user: { ...user, role: role || 'customer' } });
    } catch (err) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    } finally {
      client.release();
    }
  }

  if (first === 'customers' && req.method === 'GET') {
    const { rows } = await pool.query(
      `SELECT c.customer_id, c.full_name, c.phone_number, ua.username
       FROM customer c
       LEFT JOIN user_account ua ON c.user_id = ua.user_id
       ORDER BY c.full_name`
    );
    return res.status(200).json(rows);
  }

  if (first === 'profile' && second && params.length === 2 && req.method === 'PUT') {
    const user_id = second;
    const { full_name, phone_number, organizer_name, contact_email } = getJsonBody(req);
    try {
      await pool.query(
        `UPDATE customer SET full_name = $1, phone_number = $2 WHERE user_id = $3`,
        [full_name, phone_number, user_id]
      );
      await pool.query(
        `UPDATE organizer SET organizer_name = $1, contact_email = $2 WHERE user_id = $3`,
        [organizer_name || full_name, contact_email, user_id]
      );
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed.' });
}
