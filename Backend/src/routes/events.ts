import Elysia from "elysia";
import pool from "../db";
import { requireRole } from "../middleware/auth";

const MANAGE_ROLES = ["administrator", "organizer"];

export const eventRoutes = new Elysia({ prefix: "/events" })
  .get("/", async () => {
    const { rows } = await pool.query(
      `SELECT e.*, v.venue_name, v.city
       FROM event e
       LEFT JOIN venue v ON e.venue_id = v.venue_id
       ORDER BY e.event_datetime`
    );
    return rows;
  })
  .get("/:id", async ({ params, set }) => {
    const { rows } = await pool.query(
      `SELECT e.*, v.venue_name, v.city
       FROM event e
       LEFT JOIN venue v ON e.venue_id = v.venue_id
       WHERE e.event_id = $1`,
      [params.id]
    );
    if (rows.length === 0) {
      set.status = 404;
      return { message: "Event tidak ditemukan." };
    }
    return rows[0];
  })
  .post("/", async ({ request, body, set }) => {
    const denied = await requireRole(MANAGE_ROLES)({ request, set });
    if (denied) return denied;
    const { venue_id, organizer_id, event_title, event_datetime } = body as any;
    try {
      const { rows } = await pool.query(
        `INSERT INTO event (event_id, venue_id, organizer_id, event_title, event_datetime)
         VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING *`,
        [venue_id, organizer_id, event_title, event_datetime]
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
    const { venue_id, event_title, event_datetime } = body as any;
    try {
      const { rows } = await pool.query(
        `UPDATE event SET venue_id=$1, event_title=$2, event_datetime=$3
         WHERE event_id=$4 RETURNING *`,
        [venue_id, event_title, event_datetime, params.id]
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
      await pool.query(`DELETE FROM event WHERE event_id = $1`, [params.id]);
      return { success: true };
    } catch (err: any) {
      set.status = 400;
      return { message: `ERROR: ${err.message}` };
    }
  });
