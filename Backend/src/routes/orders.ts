import Elysia from "elysia";
import pool from "../db";
import { requireAuth, requireRole } from "../middleware/auth";

const MANAGE_ROLES = ["administrator", "organizer"];

export const orderRoutes = new Elysia({ prefix: "/orders" })
  .get("/", async ({ query }) => {
    let sql = `
      SELECT o.*,
             c.full_name AS customer_name,
             COALESCE(
               json_agg(DISTINCT jsonb_build_object('promotion_id', p.promotion_id, 'promo_code', p.promo_code))
               FILTER (WHERE p.promotion_id IS NOT NULL), '[]'
             ) AS promotions
      FROM orders o
      LEFT JOIN customer c ON o.customer_id = c.customer_id
      LEFT JOIN order_promotion op ON o.order_id = op.order_id
      LEFT JOIN promotion p ON op.promotion_id = p.promotion_id
    `;
    const params: any[] = [];

    if (query.customer_id) {
      sql += ` WHERE o.customer_id = $1`;
      params.push(query.customer_id);
    }

    sql += ` GROUP BY o.order_id, c.full_name ORDER BY o.order_date DESC`;
    const { rows } = await pool.query(sql, params);
    return rows;
  })
  .get("/:id", async ({ params, set }) => {
    const { rows } = await pool.query(
      `SELECT o.*,
              c.full_name AS customer_name,
              COALESCE(
                json_agg(DISTINCT jsonb_build_object('promotion_id', p.promotion_id, 'promo_code', p.promo_code))
                FILTER (WHERE p.promotion_id IS NOT NULL), '[]'
              ) AS promotions
       FROM orders o
       LEFT JOIN customer c ON o.customer_id = c.customer_id
       LEFT JOIN order_promotion op ON o.order_id = op.order_id
       LEFT JOIN promotion p ON op.promotion_id = p.promotion_id
       WHERE o.order_id = $1
       GROUP BY o.order_id, c.full_name`,
      [params.id]
    );
    if (rows.length === 0) {
      set.status = 404;
      return { message: "Order tidak ditemukan." };
    }
    return rows[0];
  })
  .post("/", async ({ request, body, set }) => {
    const denied = await requireAuth()({ request, set });
    if (denied) return denied;
    const { customer_id, total_amount, payment_status, promotion_id } = body as any;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const { rows } = await client.query(
        `INSERT INTO orders (order_id, customer_id, order_date, total_amount, payment_status)
         VALUES (gen_random_uuid(), $1, NOW(), $2, $3) RETURNING *`,
        [customer_id, total_amount, payment_status || "Pending"]
      );
      const order = rows[0];

      if (promotion_id) {
        await client.query(
          `INSERT INTO order_promotion (order_promotion_id, promotion_id, order_id)
           VALUES (gen_random_uuid(), $1, $2)`,
          [promotion_id, order.order_id]
        );
      }

      await client.query("COMMIT");
      return order;
    } catch (err: any) {
      await client.query("ROLLBACK");
      set.status = 400;
      return { message: `ERROR: ${err.message}` };
    } finally {
      client.release();
    }
  })
  .put("/:id", async ({ request, params, body, set }) => {
    const denied = await requireRole(MANAGE_ROLES)({ request, set });
    if (denied) return denied;
    const { total_amount, payment_status } = body as any;
    try {
      const { rows } = await pool.query(
        `UPDATE orders SET total_amount=$1, payment_status=$2
         WHERE order_id=$3 RETURNING *`,
        [total_amount, payment_status, params.id]
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
      await pool.query(`DELETE FROM orders WHERE order_id = $1`, [params.id]);
      return { success: true };
    } catch (err: any) {
      set.status = 400;
      return { message: `ERROR: ${err.message}` };
    }
  });
