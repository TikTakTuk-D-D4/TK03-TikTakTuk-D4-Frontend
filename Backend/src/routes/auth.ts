import Elysia from "elysia";
import pool from "../db";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .post("/login", async ({ body, set }) => {
    const { username, password } = body as any;
    try {
      const { rows } = await pool.query(
        `SELECT ua.user_id, ua.username, r.role_name AS role
         FROM user_account ua
         JOIN account_role ar ON ua.user_id = ar.user_id
         JOIN role r ON ar.role_id = r.role_id
         WHERE ua.username = $1 AND ua.password = $2
         LIMIT 1`,
        [username, password]
      );
      if (rows.length === 0) {
        set.status = 401;
        return { message: "Username atau password salah." };
      }
      const user = rows[0];

      if (user.role === "organizer") {
        const { rows: org } = await pool.query(
          `SELECT organizer_id, organizer_name FROM organizer WHERE user_id = $1`,
          [user.user_id]
        );
        if (org.length > 0) {
          user.organizer_id = org[0].organizer_id;
          user.organizer_name = org[0].organizer_name;
        }
      } else if (user.role === "customer") {
        const { rows: cust } = await pool.query(
          `SELECT customer_id, full_name FROM customer WHERE user_id = $1`,
          [user.user_id]
        );
        if (cust.length > 0) {
          user.customer_id = cust[0].customer_id;
          user.full_name = cust[0].full_name;
        }
      }

      return { success: true, user };
    } catch (err: any) {
      set.status = 500;
      return { message: err.message };
    }
  })
  .post("/register", async ({ body, set }) => {
    const { username, password, role, full_name, phone_number, organizer_name, contact_email } = body as any;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const { rows } = await client.query(
        `INSERT INTO user_account (user_id, username, password)
         VALUES (gen_random_uuid(), $1, $2) RETURNING user_id, username`,
        [username, password]
      );
      const user = rows[0];

      const { rows: roleRows } = await client.query(
        `SELECT role_id FROM role WHERE role_name = $1`,
        [role || "customer"]
      );
      if (roleRows.length === 0) throw new Error("Role tidak valid.");
      const role_id = roleRows[0].role_id;

      await client.query(
        `INSERT INTO account_role (role_id, user_id) VALUES ($1, $2)`,
        [role_id, user.user_id]
      );

      if (role === "organizer") {
        await client.query(
          `INSERT INTO organizer (organizer_id, organizer_name, contact_email, user_id)
           VALUES (gen_random_uuid(), $1, $2, $3)`,
          [organizer_name || username, contact_email || null, user.user_id]
        );
      } else if (role !== "administrator" && role !== "admin") {
        await client.query(
          `INSERT INTO customer (customer_id, full_name, phone_number, user_id)
           VALUES (gen_random_uuid(), $1, $2, $3)`,
          [full_name || username, phone_number || null, user.user_id]
        );
      }

      await client.query("COMMIT");
      return { success: true, user: { ...user, role: role || "customer" } };
    } catch (err: any) {
      await client.query("ROLLBACK");
      set.status = 400;
      return { message: `ERROR: ${err.message}` };
    } finally {
      client.release();
    }
  })
  .get("/customers", async () => {
    const { rows } = await pool.query(
      `SELECT c.customer_id, c.full_name, c.phone_number, ua.username
       FROM customer c
       LEFT JOIN user_account ua ON c.user_id = ua.user_id
       ORDER BY c.full_name`
    );
    return rows;
  })
  .put("/profile/:user_id", async ({ params, body, set }) => {
    const { full_name, phone_number, organizer_name, contact_email } = body as any;
    try {
      await pool.query(
        `UPDATE customer SET full_name = $1, phone_number = $2 WHERE user_id = $3`,
        [full_name, phone_number, params.user_id]
      );
      await pool.query(
        `UPDATE organizer SET organizer_name = $1, contact_email = $2 WHERE user_id = $3`,
        [organizer_name || full_name, contact_email, params.user_id]
      );
      return { success: true };
    } catch (err: any) {
      set.status = 400;
      return { message: err.message };
    }
  });
