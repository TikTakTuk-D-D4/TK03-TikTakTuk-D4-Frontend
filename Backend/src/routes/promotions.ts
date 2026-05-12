import Elysia from "elysia";
import pool from "../db";
import { requireRole } from "../middleware/auth";

export const promotionRoutes = new Elysia({ prefix: "/promotions" })
  .get("/", async () => {
    const { rows } = await pool.query(
      `SELECT * FROM promotion ORDER BY promo_code`
    );
    return rows;
  })
  .get("/:id", async ({ params, set }) => {
    const { rows } = await pool.query(
      `SELECT * FROM promotion WHERE promotion_id = $1`,
      [params.id]
    );
    if (rows.length === 0) {
      set.status = 404;
      return { message: "Promotion tidak ditemukan." };
    }
    return rows[0];
  })
  .get("/code/:code", async ({ params, set }) => {
    const { rows } = await pool.query(
      `SELECT * FROM promotion WHERE UPPER(promo_code) = UPPER($1)`,
      [params.code]
    );
    if (rows.length === 0) {
      set.status = 404;
      return { message: `Kode promo tidak ditemukan.` };
    }
    return rows[0];
  })
  .post("/", async ({ request, body, set }) => {
    const denied = await requireRole(["administrator"])({ request, set });
    if (denied) return denied;
    const { promo_code, discount_type, discount_value, usage_limit, start_date, end_date } = body as any;
    try {
      const { rows } = await pool.query(
        `INSERT INTO promotion (promotion_id, promo_code, discount_type, discount_value, usage_limit, start_date, end_date)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6) RETURNING *`,
        [promo_code, discount_type, discount_value, usage_limit, start_date, end_date]
      );
      return rows[0];
    } catch (err: any) {
      set.status = 400;
      return { message: `ERROR: ${err.message}` };
    }
  })
  .put("/:id", async ({ request, params, body, set }) => {
    const denied = await requireRole(["administrator"])({ request, set });
    if (denied) return denied;
    const { promo_code, discount_type, discount_value, usage_limit, start_date, end_date } = body as any;
    try {
      const { rows } = await pool.query(
        `UPDATE promotion SET promo_code=$1, discount_type=$2, discount_value=$3,
         usage_limit=$4, start_date=$5, end_date=$6 WHERE promotion_id=$7 RETURNING *`,
        [promo_code, discount_type, discount_value, usage_limit, start_date, end_date, params.id]
      );
      return rows[0];
    } catch (err: any) {
      set.status = 400;
      return { message: `ERROR: ${err.message}` };
    }
  })
  .delete("/:id", async ({ request, params, set }) => {
    const denied = await requireRole(["administrator"])({ request, set });
    if (denied) return denied;
    try {
      await pool.query(`DELETE FROM promotion WHERE promotion_id = $1`, [params.id]);
      return { success: true };
    } catch (err: any) {
      set.status = 400;
      return { message: `ERROR: ${err.message}` };
    }
  });
