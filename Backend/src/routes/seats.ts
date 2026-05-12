import Elysia from "elysia";
import pool from "../db";
import { requireRole } from "../middleware/auth";

const MANAGE_ROLES = ["administrator", "organizer"];

export const seatRoutes = new Elysia({ prefix: "/seats" })
  .get("/", async ({ query }) => {
    let sql = `
      SELECT s.*, v.venue_name,
        CASE WHEN hr.seat_id IS NOT NULL THEN true ELSE false END AS is_taken
      FROM seat s
      LEFT JOIN venue v ON s.venue_id = v.venue_id
      LEFT JOIN has_relationship hr ON s.seat_id = hr.seat_id
    `;
    const params: any[] = [];

    if (query.venue_id) {
      sql += ` WHERE s.venue_id = $1`;
      params.push(query.venue_id);
    }

    sql += ` ORDER BY s.section, s.row_number, s.seat_number`;
    const { rows } = await pool.query(sql, params);
    return rows;
  })
  .get("/:id", async ({ params, set }) => {
    const { rows } = await pool.query(
      `SELECT s.*, v.venue_name FROM seat s
       LEFT JOIN venue v ON s.venue_id = v.venue_id
       WHERE s.seat_id = $1`,
      [params.id]
    );
    if (rows.length === 0) {
      set.status = 404;
      return { message: "Kursi tidak ditemukan." };
    }
    return rows[0];
  })
  .post("/", async ({ request, body, set }) => {
    const denied = await requireRole(MANAGE_ROLES)({ request, set });
    if (denied) return denied;
    const { venue_id, section, row_number, seat_number } = body as any;
    try {
      const { rows } = await pool.query(
        `INSERT INTO seat (seat_id, venue_id, section, row_number, seat_number)
         VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING *`,
        [venue_id, section, row_number, seat_number]
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
    const { venue_id, section, row_number, seat_number } = body as any;
    try {
      const { rows } = await pool.query(
        `UPDATE seat SET venue_id=$1, section=$2, row_number=$3, seat_number=$4
         WHERE seat_id=$5 RETURNING *`,
        [venue_id, section, row_number, seat_number, params.id]
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
      await pool.query(`DELETE FROM seat WHERE seat_id = $1`, [params.id]);
      return { success: true };
    } catch (err: any) {
      set.status = 400;
      return { message: `ERROR: ${err.message}` };
    }
  });
