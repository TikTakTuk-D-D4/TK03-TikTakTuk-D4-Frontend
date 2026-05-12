import Elysia from "elysia";
import pool from "../db";
import { requireRole } from "../middleware/auth";

const MANAGE_ROLES = ["administrator", "organizer"];

export const venueRoutes = new Elysia({ prefix: "/venues" })
  .get("/", async () => {
    const { rows } = await pool.query(
      `SELECT * FROM venue ORDER BY venue_name`
    );
    return rows;
  })
  .get("/:id", async ({ params, set }) => {
    const { rows } = await pool.query(
      `SELECT * FROM venue WHERE venue_id = $1`,
      [params.id]
    );
    if (rows.length === 0) { set.status = 404; return { message: "Venue tidak ditemukan." }; }
    return rows[0];
  })
  .post("/", async ({ request, body, set }) => {
    const denied = await requireRole(MANAGE_ROLES)({ request, set });
    if (denied) return denied;
    const { venue_name, capacity, address, city } = body as any;
    try {
      const { rows } = await pool.query(
        `INSERT INTO venue (venue_id, venue_name, capacity, address, city)
         VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING *`,
        [venue_name, capacity, address, city]
      );
      return rows[0];
    } catch (err: any) {
      set.status = 400;
      return { message: `ERROR: ${err.message}` };
    }
  })
  .put("/:id", async ({ request, params, body, set }) => {
    const denied = await requireRole(MANAGE_ROLES)({ request, set });
    if (denied) return denied;
    const { venue_name, capacity, address, city } = body as any;
    try {
      const { rows } = await pool.query(
        `UPDATE venue SET venue_name=$1, capacity=$2, address=$3, city=$4
         WHERE venue_id=$5 RETURNING *`,
        [venue_name, capacity, address, city, params.id]
      );
      return rows[0];
    } catch (err: any) {
      set.status = 400;
      return { message: `ERROR: ${err.message}` };
    }
  })
  .delete("/:id", async ({ request, params, set }) => {
    const denied = await requireRole(MANAGE_ROLES)({ request, set });
    if (denied) return denied;
    try {
      await pool.query(`DELETE FROM venue WHERE venue_id = $1`, [params.id]);
      return { success: true };
    } catch (err: any) {
      set.status = 400;
      return { message: `ERROR: ${err.message}` };
    }
  });
