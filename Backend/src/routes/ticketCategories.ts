import Elysia from "elysia";
import pool from "../db";
import { requireRole } from "../middleware/auth";

const MANAGE_ROLES = ["administrator", "organizer"];

export const ticketCategoryRoutes = new Elysia({ prefix: "/ticket-categories" })
  .get("/", async ({ query }) => {
    if (query.event_id) {
      const { rows } = await pool.query(
        `SELECT tc.*,
          tc.quota - COUNT(t.ticket_id) AS sisa_kuota
         FROM ticket_category tc
         LEFT JOIN ticket t ON tc.category_id = t.tcategory_id
         WHERE tc.tevent_id = $1
         GROUP BY tc.category_id`,
        [query.event_id]
      );
      return rows;
    }
    const { rows } = await pool.query(
      `SELECT tc.*,
        tc.quota - COUNT(t.ticket_id) AS sisa_kuota
       FROM ticket_category tc
       LEFT JOIN ticket t ON tc.category_id = t.tcategory_id
       GROUP BY tc.category_id
       ORDER BY tc.category_name`
    );
    return rows;
  })
  .get("/:id", async ({ params, set }) => {
    const { rows } = await pool.query(
      `SELECT tc.*,
        tc.quota - COUNT(t.ticket_id) AS sisa_kuota
       FROM ticket_category tc
       LEFT JOIN ticket t ON tc.category_id = t.tcategory_id
       WHERE tc.category_id = $1
       GROUP BY tc.category_id`,
      [params.id]
    );
    if (rows.length === 0) {
      set.status = 404;
      return { message: "Kategori tiket tidak ditemukan." };
    }
    return rows[0];
  })
  .post("/", async ({ request, body, set }) => {
    const denied = await requireRole(MANAGE_ROLES)({ request, set });
    if (denied) return denied;
    const { tevent_id, category_name, price, quota } = body as any;
    try {
      const { rows } = await pool.query(
        `INSERT INTO ticket_category (category_id, tevent_id, category_name, price, quota)
         VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING *`,
        [tevent_id, category_name, price, quota]
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
    const { category_name, price, quota } = body as any;
    try {
      const { rows } = await pool.query(
        `UPDATE ticket_category SET category_name=$1, price=$2, quota=$3
         WHERE category_id=$4 RETURNING *`,
        [category_name, price, quota, params.id]
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
      await pool.query(
        `DELETE FROM ticket_category WHERE category_id = $1`,
        [params.id]
      );
      return { success: true };
    } catch (err: any) {
      set.status = 400;
      return { message: `ERROR: ${err.message}` };
    }
  });
