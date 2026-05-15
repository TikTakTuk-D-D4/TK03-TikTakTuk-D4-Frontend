import pool from '../_db.js';
import { cors } from '../_auth.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { username, password, role, full_name, phone_number, organizer_name, contact_email } = req.body;
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
      `SELECT role_id FROM role WHERE role_name = $1`, [role || 'customer']
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
