import pool from '../../_db.js';
import { cors } from '../../_auth.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PUT') return res.status(405).end();

  const { user_id } = req.query;
  const { full_name, phone_number, organizer_name, contact_email } = req.body;
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
