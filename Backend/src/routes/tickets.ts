import Elysia from "elysia";
import pool from "../db";
import { requireRole } from "../middleware/auth";

const MANAGE_ROLES = ["administrator", "organizer"];

export const ticketRoutes = new Elysia({ prefix: "/tickets" })
  .get("/", async ({ query }) => {
    let sql = `
      SELECT t.*, tc.category_name, tc.price, e.event_title,
             e.event_datetime, v.venue_name, s.section, s.row_number, s.seat_number,
             o.customer_id, o.payment_status AS order_status, o.order_id,
             c.full_name AS customer_name
      FROM ticket t
      LEFT JOIN ticket_category tc ON t.tcategory_id = tc.category_id
      LEFT JOIN event e ON tc.tevent_id = e.event_id
      LEFT JOIN venue v ON e.venue_id = v.venue_id
      LEFT JOIN has_relationship hr ON t.ticket_id = hr.ticket_id
      LEFT JOIN seat s ON hr.seat_id = s.seat_id
      LEFT JOIN orders o ON t.torder_id = o.order_id
      LEFT JOIN customer c ON o.customer_id = c.customer_id
    `;
    const params: any[] = [];

    if (query.event_id) {
      sql += ` WHERE tc.tevent_id = $1`;
      params.push(query.event_id);
    } else if (query.customer_id) {
      sql += ` WHERE o.customer_id = $1`;
      params.push(query.customer_id);
    }

    sql += ` ORDER BY e.event_datetime DESC`;
    const { rows } = await pool.query(sql, params);
    return rows;
  })
  .get("/:id", async ({ params, set }) => {
    const { rows } = await pool.query(
      `SELECT t.*, tc.category_name, tc.price, e.event_title,
              s.section, s.row_number, s.seat_number
       FROM ticket t
       LEFT JOIN ticket_category tc ON t.tcategory_id = tc.category_id
       LEFT JOIN event e ON tc.tevent_id = e.event_id
       LEFT JOIN has_relationship hr ON t.ticket_id = hr.ticket_id
       LEFT JOIN seat s ON hr.seat_id = s.seat_id
       WHERE t.ticket_id = $1`,
      [params.id]
    );
    if (rows.length === 0) {
      set.status = 404;
      return { message: "Tiket tidak ditemukan." };
    }
    return rows[0];
  })
  .post("/", async ({ request, body, set }) => {
    const denied = await requireRole(MANAGE_ROLES)({ request, set });
    if (denied) return denied;
    const { tcategory_id, torder_id, seat_id } = body as any;
    try {
      const ticket_code = `TKT-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      const { rows } = await pool.query(
        `INSERT INTO ticket (ticket_id, ticket_code, tcategory_id, torder_id)
         VALUES (gen_random_uuid(), $1, $2, $3) RETURNING *`,
        [ticket_code, tcategory_id, torder_id]
      );
      const ticket = rows[0];

      if (seat_id) {
        await pool.query(
          `INSERT INTO has_relationship (seat_id, ticket_id) VALUES ($1, $2)`,
          [seat_id, ticket.ticket_id]
        );
      }

      return ticket;
    } catch (err: any) {
      set.status = 400;
      return { message: `ERROR: ${err.message}` };
    }
  })
  .put("/:id", async ({ request, params, body, set }) => {
    const denied = await requireRole(MANAGE_ROLES)({ request, set });
    if (denied) return denied;
    const { seat_id } = body as any;
    try {
      if (seat_id !== undefined) {
        await pool.query(`DELETE FROM has_relationship WHERE ticket_id = $1`, [params.id]);
        if (seat_id) {
          await pool.query(
            `INSERT INTO has_relationship (seat_id, ticket_id) VALUES ($1, $2)`,
            [seat_id, params.id]
          );
        }
      }
      const { rows } = await pool.query(
        `SELECT * FROM ticket WHERE ticket_id = $1`,
        [params.id]
      );
      if (rows.length === 0) {
        set.status = 404;
        return { message: "Tiket tidak ditemukan." };
      }
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
      await pool.query(`DELETE FROM has_relationship WHERE ticket_id = $1`, [params.id]);
      await pool.query(`DELETE FROM ticket WHERE ticket_id = $1`, [params.id]);
      return { success: true };
    } catch (err: any) {
      set.status = 400;
      return { message: `ERROR: ${err.message}` };
    }
  });
