import Elysia from "elysia";
import pool from "../db";
import { requireRole } from "../middleware/auth";

const MANAGE_ROLES = ["administrator", "organizer"];

export const artistRoutes = new Elysia({ prefix: "/artists" })
  .get("/", async () => {
    const { rows } = await pool.query(
      `SELECT * FROM artist ORDER BY name`
    );
    return rows;
  })
  .get("/:id", async ({ params, set }) => {
    const { rows } = await pool.query(
      `SELECT * FROM artist WHERE artist_id = $1`,
      [params.id]
    );
    if (rows.length === 0) {
      set.status = 404;
      return { message: "Artist tidak ditemukan." };
    }
    return rows[0];
  })
  .post("/", async ({ request, body, set }) => {
    const denied = await requireRole(MANAGE_ROLES)({ request, set });
    if (denied) return denied;
    const { name, genre } = body as any;
    try {
      const { rows } = await pool.query(
        `INSERT INTO artist (artist_id, name, genre)
         VALUES (gen_random_uuid(), $1, $2) RETURNING *`,
        [name, genre]
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
    const { name, genre } = body as any;
    try {
      const { rows } = await pool.query(
        `UPDATE artist SET name=$1, genre=$2
         WHERE artist_id=$3 RETURNING *`,
        [name, genre, params.id]
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
      await pool.query(`DELETE FROM artist WHERE artist_id = $1`, [params.id]);
      return { success: true };
    } catch (err: any) {
      set.status = 400;
      return { message: `ERROR: ${err.message}` };
    }
  });

export const eventArtistRoutes = new Elysia({ prefix: "/event-artists" })
  .get("/:event_id", async ({ params }) => {
    const { rows } = await pool.query(
      `SELECT ea.*, a.name, a.genre
       FROM event_artist ea
       JOIN artist a ON ea.artist_id = a.artist_id
       WHERE ea.event_id = $1`,
      [params.event_id]
    );
    return rows;
  })
  .post("/", async ({ request, body, set }) => {
    const denied = await requireRole(MANAGE_ROLES)({ request, set });
    if (denied) return denied;
    const { event_id, artist_id, role } = body as any;
    try {
      const { rows } = await pool.query(
        `INSERT INTO event_artist (event_id, artist_id, role)
         VALUES ($1, $2, $3) RETURNING *`,
        [event_id, artist_id, role]
      );
      return rows[0];
    } catch (err: any) {
      set.status = 400;
      return { message: `ERROR: ${err.message}` };
    }
  })
  .delete("/:event_id/:artist_id", async ({ request, params, set }) => {
    const denied = await requireRole(MANAGE_ROLES)({ request, set });
    if (denied) return denied;
    try {
      await pool.query(
        `DELETE FROM event_artist WHERE event_id=$1 AND artist_id=$2`,
        [params.event_id, params.artist_id]
      );
      return { success: true };
    } catch (err: any) {
      set.status = 400;
      return { message: `ERROR: ${err.message}` };
    }
  })
  .get("/quota/:event_id", async ({ params, set }) => {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM get_ticket_quota($1::uuid)`,
        [params.event_id]
      );
      return rows;
    } catch (err: any) {
      set.status = 404;
      return { message: `ERROR: ${err.message}` };
    }
  });
