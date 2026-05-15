import pool from '../lib/db.js';
import { cors, checkRole, checkAuth, getRoleFromUserId } from '../lib/auth.js';
import { getJsonBody } from '../lib/parseBody.js';

function getApiSegments(req) {
  const raw = req.query?.path;

  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw.flatMap((part) => String(part).split('/')).filter(Boolean);
  }

  return String(raw).split('/').filter(Boolean);
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const segments = getApiSegments(req);
  const [resource, ...rest] = segments;

  if (resource === 'health') {
    return res.status(200).json({
      ok: true,
      segments,
      query: req.query,
      method: req.method,
    });
  }

  if (resource === 'venues') return handleVenues(req, res, rest);
  if (resource === 'events') return handleEvents(req, res, rest);
  if (resource === 'artists') return handleArtists(req, res, rest);
  if (resource === 'auth') return handleAuth(req, res, rest);
  if (resource === 'event-artists') return handleEventArtists(req, res, rest);
  if (resource === 'ticket-categories') return handleTicketCategories(req, res, rest);
  if (resource === 'orders') return handleOrders(req, res, rest);
  if (resource === 'promotions') return handlePromotions(req, res, rest);
  if (resource === 'seats') return handleSeats(req, res, rest);
  if (resource === 'tickets') return handleTickets(req, res, rest);

  return res.status(404).json({ message: 'Resource not found.', segments });
}

// ─── VENUES ──────────────────────────────────────────────────────────────────

async function handleVenues(req, res, params) {
  const id = params[0];

  if (!id && req.method === 'GET') {
    const { rows } = await pool.query(`SELECT * FROM venue ORDER BY venue_name`);
    return res.status(200).json(rows);
  }

  if (!id && req.method === 'POST') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { venue_name, capacity, address, city } = getJsonBody(req);
    try {
      const { rows } = await pool.query(
        `INSERT INTO venue (venue_id, venue_name, capacity, address, city)
         VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING *`,
        [venue_name, capacity, address, city]
      );
      return res.status(200).json(rows[0]);
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  if (id && params.length === 1 && req.method === 'GET') {
    const { rows } = await pool.query(`SELECT * FROM venue WHERE venue_id = $1`, [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Venue tidak ditemukan.' });
    return res.status(200).json(rows[0]);
  }

  if (id && params.length === 1 && req.method === 'PUT') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { venue_name, capacity, address, city } = getJsonBody(req);
    try {
      const { rows } = await pool.query(
        `UPDATE venue SET venue_name=$1, capacity=$2, address=$3, city=$4 WHERE venue_id=$5 RETURNING *`,
        [venue_name, capacity, address, city, id]
      );
      return res.status(200).json(rows[0]);
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  if (id && params.length === 1 && req.method === 'DELETE') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    try {
      await pool.query(`DELETE FROM venue WHERE venue_id = $1`, [id]);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  return res.status(405).json({ message: 'Method not allowed.', method: req.method, params });
}

// ─── EVENTS ──────────────────────────────────────────────────────────────────

async function handleEvents(req, res, params) {
  const id = params[0];

  if (!id && req.method === 'GET') {
    const { rows } = await pool.query(
      `SELECT e.*, v.venue_name, v.city FROM event e LEFT JOIN venue v ON e.venue_id = v.venue_id ORDER BY e.event_datetime`
    );
    return res.status(200).json(rows);
  }

  if (!id && req.method === 'POST') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { venue_id, organizer_id, event_title, event_datetime } = getJsonBody(req);
    try {
      const { rows } = await pool.query(
        `INSERT INTO event (event_id, venue_id, organizer_id, event_title, event_datetime)
         VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING *`,
        [venue_id, organizer_id, event_title, event_datetime]
      );
      return res.status(200).json(rows[0]);
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  if (id && params.length === 1 && req.method === 'GET') {
    const { rows } = await pool.query(
      `SELECT e.*, v.venue_name, v.city FROM event e LEFT JOIN venue v ON e.venue_id = v.venue_id WHERE e.event_id = $1`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Event tidak ditemukan.' });
    return res.status(200).json(rows[0]);
  }

  if (id && params.length === 1 && req.method === 'PUT') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { venue_id, event_title, event_datetime } = getJsonBody(req);
    try {
      const { rows } = await pool.query(
        `UPDATE event SET venue_id=$1, event_title=$2, event_datetime=$3 WHERE event_id=$4 RETURNING *`,
        [venue_id, event_title, event_datetime, id]
      );
      return res.status(200).json(rows[0]);
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  if (id && params.length === 1 && req.method === 'DELETE') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    try {
      await pool.query(`DELETE FROM event WHERE event_id = $1`, [id]);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  return res.status(405).json({ message: 'Method not allowed.', method: req.method, params });
}

// ─── ARTISTS ─────────────────────────────────────────────────────────────────

async function handleArtists(req, res, params) {
  const id = params[0];

  if (!id && req.method === 'GET') {
    const { rows } = await pool.query(`SELECT * FROM artist ORDER BY name`);
    return res.status(200).json(rows);
  }

  if (!id && req.method === 'POST') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { name, genre } = getJsonBody(req);
    try {
      const { rows } = await pool.query(
        `INSERT INTO artist (artist_id, name, genre) VALUES (gen_random_uuid(), $1, $2) RETURNING *`,
        [name, genre]
      );
      return res.status(200).json(rows[0]);
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  if (id && params.length === 1 && req.method === 'GET') {
    const { rows } = await pool.query(`SELECT * FROM artist WHERE artist_id = $1`, [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Artist tidak ditemukan.' });
    return res.status(200).json(rows[0]);
  }

  if (id && params.length === 1 && req.method === 'PUT') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { name, genre } = getJsonBody(req);
    try {
      const { rows } = await pool.query(
        `UPDATE artist SET name=$1, genre=$2 WHERE artist_id=$3 RETURNING *`,
        [name, genre, id]
      );
      return res.status(200).json(rows[0]);
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  if (id && params.length === 1 && req.method === 'DELETE') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    try {
      await pool.query(`DELETE FROM artist WHERE artist_id = $1`, [id]);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  return res.status(405).json({ message: 'Method not allowed.', method: req.method, params });
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

async function handleAuth(req, res, params) {
  const [first, second] = params;

  if (first === 'login' && req.method === 'POST') {
    const { username, password } = getJsonBody(req);
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
      if (rows.length === 0) return res.status(401).json({ message: 'Username atau password salah.' });
      const user = rows[0];

      if (user.role === 'organizer') {
        const { rows: org } = await pool.query(
          `SELECT organizer_id, organizer_name FROM organizer WHERE user_id = $1`,
          [user.user_id]
        );
        if (org.length > 0) {
          user.organizer_id = org[0].organizer_id;
          user.organizer_name = org[0].organizer_name;
        }
      } else if (user.role === 'customer') {
        const { rows: cust } = await pool.query(
          `SELECT customer_id, full_name FROM customer WHERE user_id = $1`,
          [user.user_id]
        );
        if (cust.length > 0) {
          user.customer_id = cust[0].customer_id;
          user.full_name = cust[0].full_name;
        }
      }

      return res.status(200).json({ success: true, user });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  if (first === 'register' && req.method === 'POST') {
    const { username, password, role, full_name, phone_number, organizer_name, contact_email } = getJsonBody(req);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        `INSERT INTO user_account (user_id, username, password)
         VALUES (gen_random_uuid(), $1, $2) RETURNING user_id, username`,
        [username, password]
      );
      const user = rows[0];
      const { rows: roleRows } = await client.query(
        `SELECT role_id FROM role WHERE role_name = $1`,
        [role || 'customer']
      );
      if (roleRows.length === 0) throw new Error('Role tidak valid.');
      await client.query(
        `INSERT INTO account_role (role_id, user_id) VALUES ($1, $2)`,
        [roleRows[0].role_id, user.user_id]
      );
      if (role === 'organizer') {
        await client.query(
          `INSERT INTO organizer (organizer_id, organizer_name, contact_email, user_id)
           VALUES (gen_random_uuid(), $1, $2, $3)`,
          [organizer_name || username, contact_email || null, user.user_id]
        );
      } else if (role !== 'administrator' && role !== 'admin') {
        await client.query(
          `INSERT INTO customer (customer_id, full_name, phone_number, user_id)
           VALUES (gen_random_uuid(), $1, $2, $3)`,
          [full_name || username, phone_number || null, user.user_id]
        );
      }
      await client.query('COMMIT');
      return res.status(200).json({ success: true, user: { ...user, role: role || 'customer' } });
    } catch (err) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    } finally {
      client.release();
    }
  }

  if (first === 'customers' && req.method === 'GET') {
    const { rows } = await pool.query(
      `SELECT c.customer_id, c.full_name, c.phone_number, ua.username
       FROM customer c
       LEFT JOIN user_account ua ON c.user_id = ua.user_id
       ORDER BY c.full_name`
    );
    return res.status(200).json(rows);
  }

  if (first === 'profile' && second && params.length === 2 && req.method === 'PUT') {
    const user_id = second;
    const { full_name, phone_number, organizer_name, contact_email } = getJsonBody(req);
    try {
      await pool.query(
        `UPDATE customer SET full_name = $1, phone_number = $2 WHERE user_id = $3`,
        [full_name, phone_number, user_id]
      );
      await pool.query(
        `UPDATE organizer SET organizer_name = $1, contact_email = $2 WHERE user_id = $3`,
        [organizer_name || full_name, contact_email, user_id]
      );
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed.', method: req.method, params });
}

// ─── EVENT-ARTISTS ────────────────────────────────────────────────────────────

async function handleEventArtists(req, res, params) {
  if (req.method === 'POST' && params.length === 0) {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { event_id, artist_id, role } = getJsonBody(req);
    try {
      const { rows } = await pool.query(
        `INSERT INTO event_artist (event_id, artist_id, role) VALUES ($1, $2, $3) RETURNING *`,
        [event_id, artist_id, role]
      );
      return res.status(200).json(rows[0]);
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  if (req.method === 'GET' && params[0] === 'quota' && params.length === 2) {
    const event_id = params[1];
    try {
      const { rows } = await pool.query(`SELECT * FROM get_ticket_quota($1::uuid)`, [event_id]);
      return res.status(200).json(rows);
    } catch (err) {
      return res.status(404).json({ message: `ERROR: ${err.message}` });
    }
  }

  if (req.method === 'GET' && params.length === 1) {
    const event_id = params[0];
    const { rows } = await pool.query(
      `SELECT ea.*, a.name, a.genre FROM event_artist ea JOIN artist a ON ea.artist_id = a.artist_id WHERE ea.event_id = $1`,
      [event_id]
    );
    return res.status(200).json(rows);
  }

  if (req.method === 'DELETE' && params.length === 2) {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const [event_id, artist_id] = params;
    try {
      await pool.query(`DELETE FROM event_artist WHERE event_id=$1 AND artist_id=$2`, [event_id, artist_id]);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  return res.status(405).json({ message: 'Method not allowed.', method: req.method, params });
}

// ─── TICKET-CATEGORIES ────────────────────────────────────────────────────────

async function handleTicketCategories(req, res, params) {
  const id = params[0];

  if (!id && req.method === 'GET') {
    const { event_id } = req.query;
    if (event_id) {
      const { rows } = await pool.query(
        `SELECT tc.*, tc.quota - COUNT(t.ticket_id) AS sisa_kuota
         FROM ticket_category tc
         LEFT JOIN ticket t ON tc.category_id = t.tcategory_id
         WHERE tc.tevent_id = $1
         GROUP BY tc.category_id`,
        [event_id]
      );
      return res.status(200).json(rows);
    }
    const { rows } = await pool.query(
      `SELECT tc.*, tc.quota - COUNT(t.ticket_id) AS sisa_kuota
       FROM ticket_category tc
       LEFT JOIN ticket t ON tc.category_id = t.tcategory_id
       GROUP BY tc.category_id ORDER BY tc.category_name`
    );
    return res.status(200).json(rows);
  }

  if (!id && req.method === 'POST') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { tevent_id, category_name, price, quota } = getJsonBody(req);
    try {
      const { rows } = await pool.query(
        `INSERT INTO ticket_category (category_id, tevent_id, category_name, price, quota)
         VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING *`,
        [tevent_id, category_name, price, quota]
      );
      return res.status(200).json(rows[0]);
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  if (id && params.length === 1 && req.method === 'GET') {
    const { rows } = await pool.query(
      `SELECT tc.*, tc.quota - COUNT(t.ticket_id) AS sisa_kuota
       FROM ticket_category tc
       LEFT JOIN ticket t ON tc.category_id = t.tcategory_id
       WHERE tc.category_id = $1
       GROUP BY tc.category_id`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Kategori tiket tidak ditemukan.' });
    return res.status(200).json(rows[0]);
  }

  if (id && params.length === 1 && req.method === 'PUT') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { category_name, price, quota } = getJsonBody(req);
    try {
      const { rows } = await pool.query(
        `UPDATE ticket_category SET category_name=$1, price=$2, quota=$3 WHERE category_id=$4 RETURNING *`,
        [category_name, price, quota, id]
      );
      return res.status(200).json(rows[0]);
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  if (id && params.length === 1 && req.method === 'DELETE') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    try {
      await pool.query(`DELETE FROM ticket_category WHERE category_id = $1`, [id]);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  return res.status(405).json({ message: 'Method not allowed.', method: req.method, params });
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────

async function getOrderRowById(db, id) {
  const { rows } = await db.query(
    `SELECT o.*, c.full_name AS customer_name,
            COALESCE(COUNT(DISTINCT t.ticket_id), 0) AS ticket_count,
            COALESCE(string_agg(DISTINCT e.event_title, ', ') FILTER (WHERE e.event_title IS NOT NULL), '-') AS event_title,
            COALESCE(json_agg(DISTINCT jsonb_build_object('promotion_id', p.promotion_id, 'promo_code', p.promo_code)) FILTER (WHERE p.promotion_id IS NOT NULL), '[]') AS promotions
     FROM orders o
     LEFT JOIN customer c ON o.customer_id = c.customer_id
     LEFT JOIN order_promotion op ON o.order_id = op.order_id
     LEFT JOIN promotion p ON op.promotion_id = p.promotion_id
     LEFT JOIN ticket t ON t.torder_id = o.order_id
     LEFT JOIN ticket_category tc ON t.tcategory_id = tc.category_id
     LEFT JOIN event e ON tc.tevent_id = e.event_id
     WHERE o.order_id = $1
     GROUP BY o.order_id, c.full_name`,
    [id]
  );

  return rows[0] || null;
}

async function handleOrders(req, res, params) {
  const id = params[0];

  if (!id && req.method === 'GET') {
    const role = String(req.query.role || '').toUpperCase();
    const customerId = req.query.customer_id || req.query.customerId;
    const organizerId = req.query.organizer_id || req.query.organizerId;
    let sql = `
      SELECT o.*, c.full_name AS customer_name,
             COALESCE(COUNT(DISTINCT t.ticket_id), 0) AS ticket_count,
             COALESCE(string_agg(DISTINCT e.event_title, ', ') FILTER (WHERE e.event_title IS NOT NULL), '-') AS event_title,
             COALESCE(json_agg(DISTINCT jsonb_build_object('promotion_id', p.promotion_id, 'promo_code', p.promo_code)) FILTER (WHERE p.promotion_id IS NOT NULL), '[]') AS promotions
      FROM orders o
      LEFT JOIN customer c ON o.customer_id = c.customer_id
      LEFT JOIN order_promotion op ON o.order_id = op.order_id
      LEFT JOIN promotion p ON op.promotion_id = p.promotion_id
      LEFT JOIN ticket t ON t.torder_id = o.order_id
      LEFT JOIN ticket_category tc ON t.tcategory_id = tc.category_id
      LEFT JOIN event e ON tc.tevent_id = e.event_id
    `;
    const queryParams = [];
    if (customerId || role === 'CUSTOMER') {
      sql += ` WHERE o.customer_id = $1`;
      queryParams.push(customerId);
    } else if (organizerId || role === 'ORGANIZER') {
      sql += ` WHERE e.organizer_id = $1`;
      queryParams.push(organizerId);
    }
    sql += ` GROUP BY o.order_id, c.full_name ORDER BY o.order_date DESC`;
    const { rows } = await pool.query(sql, queryParams);
    return res.status(200).json(rows);
  }

  if (!id && req.method === 'POST') {
    if (!await checkAuth(req, res)) return;
    const {
      customer_id,
      total_amount,
      payment_status,
      promotion_id,
      event_id,
      category_id,
      quantity,
      seat_ids,
      promo_code,
    } = getJsonBody(req);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let resolvedPromotionId = promotion_id || null;
      let computedTotalAmount = total_amount;
      const safeQuantity = Math.max(Number(quantity) || 1, 1);

      if (category_id) {
        const categoryQuery = event_id
          ? `SELECT category_id, tevent_id, price FROM ticket_category WHERE category_id = $1 AND tevent_id = $2`
          : `SELECT category_id, tevent_id, price FROM ticket_category WHERE category_id = $1`;
        const categoryParams = event_id ? [category_id, event_id] : [category_id];
        const { rows: categoryRows } = await client.query(categoryQuery, categoryParams);
        if (categoryRows.length === 0) {
          throw new Error('Kategori tiket tidak ditemukan untuk event ini.');
        }

        const category = categoryRows[0];
        let finalTotal = Number(category.price) * safeQuantity;

        if (promo_code) {
          const { rows: promoRows } = await client.query(
            `SELECT * FROM promotion WHERE UPPER(promo_code) = UPPER($1) LIMIT 1`,
            [promo_code]
          );

          if (promoRows.length === 0) {
            throw new Error('Kode promo tidak ditemukan.');
          }

          const promo = promoRows[0];
          const now = new Date();
          const startDate = promo.start_date ? new Date(promo.start_date) : null;
          const endDate = promo.end_date ? new Date(promo.end_date) : null;

          if (startDate && now < startDate) {
            throw new Error('Promo belum dapat digunakan.');
          }

          if (endDate && now > endDate) {
            throw new Error('Promo sudah berakhir.');
          }

          if (String(promo.discount_type).toUpperCase() === 'PERCENTAGE') {
            finalTotal -= finalTotal * (Number(promo.discount_value) / 100);
          } else {
            finalTotal -= Number(promo.discount_value);
          }

          finalTotal = Math.max(finalTotal, 0);
          resolvedPromotionId = promo.promotion_id;
        }

        computedTotalAmount = finalTotal;
      }

      const { rows } = await client.query(
        `INSERT INTO orders (order_id, customer_id, order_date, total_amount, payment_status)
         VALUES (gen_random_uuid(), $1, NOW(), $2, $3) RETURNING *`,
        [customer_id, computedTotalAmount, payment_status || 'Pending']
      );
      const order = rows[0];

      if (resolvedPromotionId) {
        await client.query(
          `INSERT INTO order_promotion (order_promotion_id, promotion_id, order_id) VALUES (gen_random_uuid(), $1, $2)`,
          [resolvedPromotionId, order.order_id]
        );
      }

      if (category_id) {
        const seatIds = Array.isArray(seat_ids) ? seat_ids : [];

        for (let index = 0; index < safeQuantity; index += 1) {
          const ticketCode = `TKT-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
          const { rows: ticketRows } = await client.query(
            `INSERT INTO ticket (ticket_id, ticket_code, tcategory_id, torder_id)
             VALUES (gen_random_uuid(), $1, $2, $3) RETURNING ticket_id`,
            [ticketCode, category_id, order.order_id]
          );

          const seatId = seatIds[index];
          if (seatId) {
            await client.query(
              `INSERT INTO has_relationship (seat_id, ticket_id) VALUES ($1, $2)`,
              [seatId, ticketRows[0].ticket_id]
            );
          }
        }
      }

      await client.query('COMMIT');
      const enrichedOrder = await getOrderRowById(client, order.order_id);
      return res.status(200).json(enrichedOrder || order);
    } catch (err) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    } finally {
      client.release();
    }
  }

  if (id && params.length === 1 && req.method === 'GET') {
    const order = await getOrderRowById(pool, id);
    if (!order) return res.status(404).json({ message: 'Order tidak ditemukan.' });
    return res.status(200).json(order);
  }

  if (id && params.length === 1 && req.method === 'PUT') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { total_amount, payment_status } = getJsonBody(req);
    try {
      const { rows } = await pool.query(
        `UPDATE orders
         SET total_amount = COALESCE($1, total_amount),
             payment_status = COALESCE($2, payment_status)
         WHERE order_id=$3
         RETURNING *`,
        [total_amount, payment_status, id]
      );
      return res.status(200).json(rows[0]);
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  if (id && params.length === 1 && req.method === 'DELETE') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    try {
      await pool.query(`DELETE FROM orders WHERE order_id = $1`, [id]);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  return res.status(405).json({ message: 'Method not allowed.', method: req.method, params });
}

// ─── PROMOTIONS ───────────────────────────────────────────────────────────────

async function handlePromotions(req, res, params) {
  const [first, second] = params;

  if (!first && req.method === 'GET') {
    const { rows } = await pool.query(`SELECT * FROM promotion ORDER BY promo_code`);
    return res.status(200).json(rows);
  }

  if (!first && req.method === 'POST') {
    if (!await checkRole(req, res, ['administrator'])) return;
    const { promo_code, discount_type, discount_value, usage_limit, start_date, end_date } = getJsonBody(req);
    try {
      const { rows } = await pool.query(
        `INSERT INTO promotion (promotion_id, promo_code, discount_type, discount_value, usage_limit, start_date, end_date)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6) RETURNING *`,
        [promo_code, discount_type, discount_value, usage_limit, start_date, end_date]
      );
      return res.status(200).json(rows[0]);
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  if (first === 'code' && second && params.length === 2 && req.method === 'GET') {
    const { rows } = await pool.query(
      `SELECT * FROM promotion WHERE UPPER(promo_code) = UPPER($1)`,
      [second]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Kode promo tidak ditemukan.' });
    return res.status(200).json(rows[0]);
  }

  if (first && params.length === 1 && req.method === 'GET') {
    const { rows } = await pool.query(`SELECT * FROM promotion WHERE promotion_id = $1`, [first]);
    if (rows.length === 0) return res.status(404).json({ message: 'Promotion tidak ditemukan.' });
    return res.status(200).json(rows[0]);
  }

  if (first && params.length === 1 && req.method === 'PUT') {
    if (!await checkRole(req, res, ['administrator'])) return;
    const { promo_code, discount_type, discount_value, usage_limit, start_date, end_date } = getJsonBody(req);
    try {
      const { rows } = await pool.query(
        `UPDATE promotion SET promo_code=$1, discount_type=$2, discount_value=$3, usage_limit=$4, start_date=$5, end_date=$6 WHERE promotion_id=$7 RETURNING *`,
        [promo_code, discount_type, discount_value, usage_limit, start_date, end_date, first]
      );
      return res.status(200).json(rows[0]);
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  if (first && params.length === 1 && req.method === 'DELETE') {
    if (!await checkRole(req, res, ['administrator'])) return;
    try {
      await pool.query(`DELETE FROM promotion WHERE promotion_id = $1`, [first]);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  return res.status(405).json({ message: 'Method not allowed.', method: req.method, params });
}

// ─── SEATS ────────────────────────────────────────────────────────────────────

async function handleSeats(req, res, params) {
  const id = params[0];

  if (!id && req.method === 'GET') {
    const { venue_id } = req.query;
    let sql = `
      SELECT s.*, v.venue_name,
        CASE WHEN hr.seat_id IS NOT NULL THEN true ELSE false END AS is_taken
      FROM seat s
      LEFT JOIN venue v ON s.venue_id = v.venue_id
      LEFT JOIN has_relationship hr ON s.seat_id = hr.seat_id
    `;
    const queryParams = [];
    if (venue_id) {
      sql += ` WHERE s.venue_id = $1`;
      queryParams.push(venue_id);
    }
    sql += ` ORDER BY s.section, s.row_number, s.seat_number`;
    const { rows } = await pool.query(sql, queryParams);
    return res.status(200).json(rows);
  }

  if (!id && req.method === 'POST') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { venue_id, section, row_number, seat_number } = getJsonBody(req);
    try {
      const { rows } = await pool.query(
        `INSERT INTO seat (seat_id, venue_id, section, row_number, seat_number)
         VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING *`,
        [venue_id, section, row_number, seat_number]
      );
      return res.status(200).json(rows[0]);
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  if (id && params.length === 1 && req.method === 'GET') {
    const { rows } = await pool.query(
      `SELECT s.*, v.venue_name FROM seat s LEFT JOIN venue v ON s.venue_id = v.venue_id WHERE s.seat_id = $1`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Kursi tidak ditemukan.' });
    return res.status(200).json(rows[0]);
  }

  if (id && params.length === 1 && req.method === 'PUT') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { venue_id, section, row_number, seat_number } = getJsonBody(req);
    try {
      const { rows } = await pool.query(
        `UPDATE seat SET venue_id=$1, section=$2, row_number=$3, seat_number=$4 WHERE seat_id=$5 RETURNING *`,
        [venue_id, section, row_number, seat_number, id]
      );
      return res.status(200).json(rows[0]);
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  if (id && params.length === 1 && req.method === 'DELETE') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    try {
      await pool.query(`DELETE FROM seat WHERE seat_id = $1`, [id]);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  return res.status(405).json({ message: 'Method not allowed.', method: req.method, params });
}

// ─── TICKETS ──────────────────────────────────────────────────────────────────

async function handleTickets(req, res, params) {
  const id = params[0];

  if (!id && req.method === 'GET') {
    const { event_id, customer_id } = req.query;
    let sql = `
      SELECT t.*, tc.category_name, tc.price, e.event_title, e.event_datetime,
             v.venue_name, s.section, s.row_number, s.seat_number,
             o.customer_id, o.payment_status AS order_status, o.order_id, c.full_name AS customer_name
      FROM ticket t
      LEFT JOIN ticket_category tc ON t.tcategory_id = tc.category_id
      LEFT JOIN event e ON tc.tevent_id = e.event_id
      LEFT JOIN venue v ON e.venue_id = v.venue_id
      LEFT JOIN has_relationship hr ON t.ticket_id = hr.ticket_id
      LEFT JOIN seat s ON hr.seat_id = s.seat_id
      LEFT JOIN orders o ON t.torder_id = o.order_id
      LEFT JOIN customer c ON o.customer_id = c.customer_id
    `;
    const queryParams = [];
    if (event_id) {
      sql += ` WHERE tc.tevent_id = $1`;
      queryParams.push(event_id);
    } else if (customer_id) {
      sql += ` WHERE o.customer_id = $1`;
      queryParams.push(customer_id);
    }
    sql += ` ORDER BY e.event_datetime DESC`;
    const { rows } = await pool.query(sql, queryParams);
    return res.status(200).json(rows);
  }

  if (!id && req.method === 'POST') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { tcategory_id, torder_id, seat_id } = getJsonBody(req);
    try {
      const ticket_code = `TKT-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      const { rows } = await pool.query(
        `INSERT INTO ticket (ticket_id, ticket_code, tcategory_id, torder_id)
         VALUES (gen_random_uuid(), $1, $2, $3) RETURNING *`,
        [ticket_code, tcategory_id, torder_id]
      );
      const ticket = rows[0];
      if (seat_id) {
        await pool.query(`INSERT INTO has_relationship (seat_id, ticket_id) VALUES ($1, $2)`, [seat_id, ticket.ticket_id]);
      }
      return res.status(200).json(ticket);
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  if (id && params.length === 1 && req.method === 'GET') {
    const { rows } = await pool.query(
      `SELECT t.*, tc.category_name, tc.price, e.event_title, s.section, s.row_number, s.seat_number
       FROM ticket t
       LEFT JOIN ticket_category tc ON t.tcategory_id = tc.category_id
       LEFT JOIN event e ON tc.tevent_id = e.event_id
       LEFT JOIN has_relationship hr ON t.ticket_id = hr.ticket_id
       LEFT JOIN seat s ON hr.seat_id = s.seat_id
       WHERE t.ticket_id = $1`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Tiket tidak ditemukan.' });
    return res.status(200).json(rows[0]);
  }

  if (id && params.length === 1 && req.method === 'PUT') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    const { seat_id } = getJsonBody(req);
    try {
      if (seat_id !== undefined) {
        await pool.query(`DELETE FROM has_relationship WHERE ticket_id = $1`, [id]);
        if (seat_id) {
          await pool.query(`INSERT INTO has_relationship (seat_id, ticket_id) VALUES ($1, $2)`, [seat_id, id]);
        }
      }
      const { rows } = await pool.query(`SELECT * FROM ticket WHERE ticket_id = $1`, [id]);
      if (rows.length === 0) return res.status(404).json({ message: 'Tiket tidak ditemukan.' });
      return res.status(200).json(rows[0]);
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  if (id && params.length === 1 && req.method === 'DELETE') {
    if (!await checkRole(req, res, ['administrator', 'organizer'])) return;
    try {
      await pool.query(`DELETE FROM has_relationship WHERE ticket_id = $1`, [id]);
      await pool.query(`DELETE FROM ticket WHERE ticket_id = $1`, [id]);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(400).json({ message: `ERROR: ${err.message}` });
    }
  }

  return res.status(405).json({ message: 'Method not allowed.', method: req.method, params });
}
