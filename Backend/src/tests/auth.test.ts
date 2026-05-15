import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import Elysia from "elysia";
import pool from "../db";
import { authRoutes } from "../routes/auth";

type User = {
  user_id: string;
  username: string;
  password: string;
};

type RoleRow = {
  role_id: string;
  role_name: string;
};

type AccountRole = {
  role_id: string;
  user_id: string;
};

type Customer = {
  customer_id: string;
  full_name: string;
  phone_number: string | null;
  user_id: string;
};

type Organizer = {
  organizer_id: string;
  organizer_name: string;
  contact_email: string | null;
  user_id: string;
};

type DbState = {
  users: User[];
  roles: RoleRow[];
  accountRoles: AccountRole[];
  customers: Customer[];
  organizers: Organizer[];
};

function createMockDb(seed: Partial<DbState> = {}) {
  const state: DbState = {
    users: seed.users ?? [],
    roles:
      seed.roles ?? [
        { role_id: "r-admin", role_name: "administrator" },
        { role_id: "r-organizer", role_name: "organizer" },
        { role_id: "r-customer", role_name: "customer" },
      ],
    accountRoles: seed.accountRoles ?? [],
    customers: seed.customers ?? [],
    organizers: seed.organizers ?? [],
  };

  let idCounter = 1;
  const nextId = (prefix: string) => `${prefix}-${idCounter++}`;

  const exec = async (rawSql: string, params: any[] = []) => {
    const sql = rawSql.replace(/\s+/g, " ").trim().toLowerCase();

    if (sql === "begin" || sql === "commit" || sql === "rollback") {
      return { rows: [] };
    }

    if (sql.includes("insert into user_account")) {
      const [username, password] = params;
      if (state.users.some((user) => user.username === username)) {
        throw new Error("duplicate key value violates unique constraint user_account_username_key");
      }
      const user = { user_id: nextId("user"), username, password };
      state.users.push(user);
      return { rows: [{ user_id: user.user_id, username: user.username }] };
    }

    if (sql.includes("select role_id from role where role_name = $1")) {
      const [roleName] = params;
      const role = state.roles.find((item) => item.role_name === roleName);
      return { rows: role ? [{ role_id: role.role_id }] : [] };
    }

    if (sql.includes("insert into account_role")) {
      const [role_id, user_id] = params;
      state.accountRoles.push({ role_id, user_id });
      return { rows: [] };
    }

    if (sql.includes("insert into customer")) {
      const [full_name, phone_number, user_id] = params;
      state.customers.push({
        customer_id: nextId("customer"),
        full_name,
        phone_number,
        user_id,
      });
      return { rows: [] };
    }

    if (sql.includes("insert into organizer")) {
      const [organizer_name, contact_email, user_id] = params;
      state.organizers.push({
        organizer_id: nextId("organizer"),
        organizer_name,
        contact_email,
        user_id,
      });
      return { rows: [] };
    }

    if (sql.includes("where ua.username = $1 and ua.password = $2")) {
      const [username, password] = params;
      const user = state.users.find(
        (item) => item.username === username && item.password === password
      );
      if (!user) return { rows: [] };

      const accountRole = state.accountRoles.find((item) => item.user_id === user.user_id);
      const role = state.roles.find((item) => item.role_id === accountRole?.role_id);
      if (!role) return { rows: [] };

      return {
        rows: [
          {
            user_id: user.user_id,
            username: user.username,
            role: role.role_name,
          },
        ],
      };
    }

    if (sql.includes("select customer_id, full_name from customer where user_id = $1")) {
      const [userId] = params;
      const customer = state.customers.find((item) => item.user_id === userId);
      if (!customer) return { rows: [] };
      return {
        rows: [
          {
            customer_id: customer.customer_id,
            full_name: customer.full_name,
          },
        ],
      };
    }

    if (sql.includes("select organizer_id, organizer_name from organizer where user_id = $1")) {
      const [userId] = params;
      const organizer = state.organizers.find((item) => item.user_id === userId);
      if (!organizer) return { rows: [] };
      return {
        rows: [
          {
            organizer_id: organizer.organizer_id,
            organizer_name: organizer.organizer_name,
          },
        ],
      };
    }

    throw new Error(`Unhandled SQL in test mock: ${rawSql}`);
  };

  return {
    query: (sql: string, params?: any[]) => exec(sql, params ?? []),
    connect: async () => ({
      query: (sql: string, params?: any[]) => exec(sql, params ?? []),
      release: () => {},
    }),
  };
}

const poolRef = pool as any;
const originalQuery = poolRef.query;
const originalConnect = poolRef.connect;
let app: Elysia;

function makeJsonRequest(path: string, payload: unknown) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}

describe("auth register/login", () => {
  beforeEach(() => {
    const db = createMockDb({
      users: [
        {
          user_id: "user-existing",
          username: "cust_existing",
          password: "existing_password",
        },
      ],
      accountRoles: [{ role_id: "r-customer", user_id: "user-existing" }],
      customers: [
        {
          customer_id: "customer-existing",
          full_name: "Existing User",
          phone_number: null,
          user_id: "user-existing",
        },
      ],
    });

    poolRef.query = db.query;
    poolRef.connect = db.connect;
    app = new Elysia().use(authRoutes);
  });

  afterEach(() => {
    poolRef.query = originalQuery;
    poolRef.connect = originalConnect;
  });

  test("registers a customer and allows immediate login with same credentials", async () => {
    const registerRes = await app.handle(
      makeJsonRequest("/auth/register", {
        username: "new_customer",
        password: "new_password",
        role: "customer",
        full_name: "New Customer",
        phone_number: "081234567890",
      })
    );

    expect(registerRes.status).toBe(200);
    const registerBody = (await registerRes.json()) as any;
    expect(registerBody.success).toBe(true);
    expect(registerBody.user.username).toBe("new_customer");

    const loginRes = await app.handle(
      makeJsonRequest("/auth/login", {
        username: "new_customer",
        password: "new_password",
      })
    );

    expect(loginRes.status).toBe(200);
    const loginBody = (await loginRes.json()) as any;
    expect(loginBody.success).toBe(true);
    expect(loginBody.user.username).toBe("new_customer");
    expect(loginBody.user.role).toBe("customer");
    expect(loginBody.user.full_name).toBe("New Customer");
  });

  test("rejects login with wrong password", async () => {
    await app.handle(
      makeJsonRequest("/auth/register", {
        username: "new_customer_wrong_pw",
        password: "real_password",
        role: "customer",
        full_name: "New Customer",
      })
    );

    const loginRes = await app.handle(
      makeJsonRequest("/auth/login", {
        username: "new_customer_wrong_pw",
        password: "wrong_password",
      })
    );

    expect(loginRes.status).toBe(401);
    const loginBody = (await loginRes.json()) as any;
    expect(loginBody.message).toBe("Username atau password salah.");
  });

  test("keeps existing user login behavior working", async () => {
    const loginRes = await app.handle(
      makeJsonRequest("/auth/login", {
        username: "cust_existing",
        password: "existing_password",
      })
    );

    expect(loginRes.status).toBe(200);
    const loginBody = (await loginRes.json()) as any;
    expect(loginBody.success).toBe(true);
    expect(loginBody.user).toMatchObject({
      username: "cust_existing",
      role: "customer",
      customer_id: "customer-existing",
      full_name: "Existing User",
    });
  });
});
