import pool from "../db";

export async function getRoleFromUserId(user_id: string): Promise<string | null> {
  if (!user_id) return null;
  try {
    const { rows } = await pool.query(
      `SELECT r.role_name
       FROM account_role ar
       JOIN role r ON ar.role_id = r.role_id
       WHERE ar.user_id = $1
       LIMIT 1`,
      [user_id]
    );
    return rows[0]?.role_name || null;
  } catch {
    return null;
  }
}

export function requireAuth() {
  return async ({ request, set }: { request: Request; set: any }) => {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      set.status = 401;
      return { message: "Unauthorized: login terlebih dahulu." };
    }
  };
}

export function requireRole(allowedRoles: string[]) {
  return async ({ request, set }: { request: Request; set: any }) => {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      set.status = 401;
      return { message: "Unauthorized: login terlebih dahulu." };
    }
    const role = await getRoleFromUserId(userId);
    if (!role || !allowedRoles.includes(role)) {
      set.status = 403;
      return { message: `Forbidden: hanya ${allowedRoles.join("/")} yang dapat melakukan aksi ini.` };
    }
  };
}
