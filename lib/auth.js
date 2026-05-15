import pool from './db.js';

export function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id');
}

export async function getRoleFromUserId(userId) {
  if (!userId) return null;
  try {
    const { rows } = await pool.query(
      `SELECT r.role_name FROM account_role ar JOIN role r ON ar.role_id = r.role_id WHERE ar.user_id = $1 LIMIT 1`,
      [userId]
    );
    return rows[0]?.role_name || null;
  } catch {
    return null;
  }
}

export async function checkRole(req, res, allowedRoles) {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized: login terlebih dahulu.' });
    return false;
  }
  const role = await getRoleFromUserId(userId);
  if (!role || !allowedRoles.includes(role)) {
    res.status(403).json({ message: `Forbidden: hanya ${allowedRoles.join('/')} yang dapat melakukan aksi ini.` });
    return false;
  }
  return true;
}

export async function checkAuth(req, res) {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized: login terlebih dahulu.' });
    return false;
  }
  return true;
}
