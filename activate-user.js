/* eslint-disable no-console */
// ============================================================
// VibeBuilder — Activate user via Selise Blocks IAM
// Requires Node.js 18+ (native fetch)
// Usage: node activate-user.js
// ============================================================

const TARGET_EMAIL  = "bhondotrt@gmail.com";
const CLIENT_ID     = "af55abda-5662-452d-b209-30914e86146c";
const CLIENT_SECRET = "e1814158af1e40539c481751d7ac58a3";
const BLOCKS_KEY    = "D9aab23f617c843d9a6806cc57af9f335";
const BASE_URL      = "https://api.seliseblocks.com";

// ============================================================

async function call(method, path, { body, token, form } = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { "x-blocks-key": BLOCKS_KEY };

  if (token)  headers["Authorization"]  = `Bearer ${token}`;
  if (form)   headers["Content-Type"]   = "application/x-www-form-urlencoded";
  else        headers["Content-Type"]   = "application/json";

  console.log(`\n--> ${method} ${url}`);
  if (body) console.log("    body:", JSON.stringify(body, null, 2));
  if (form) console.log("    form:", form.toString());

  const res = await fetch(url, {
    method,
    headers,
    body: form ? form.toString() : body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }

  console.log(`<-- ${res.status} ${res.statusText}`);
  console.log("    response:", JSON.stringify(data, null, 2));

  return { ok: res.ok, status: res.status, data };
}

async function main() {
  // ----------------------------------------------------------
  // Step 1 — Client credentials token
  // ----------------------------------------------------------
  console.log("\n== Step 1: Get client credentials token ==");
  const form = new URLSearchParams();
  form.append("grant_type",    "client_credentials");
  form.append("client_id",     CLIENT_ID);
  form.append("client_secret", CLIENT_SECRET);
  form.append("scope",         "openid");

  const loginRes = await call("POST", "/idp/v1/Authentication/Token", { form });
  if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);

  const token = loginRes.data.access_token;
  if (!token) throw new Error("No access_token in response");
  console.log(`\nToken: ${token.slice(0, 40)}...`);

  // ----------------------------------------------------------
  // Step 2 — Find user by email
  // ----------------------------------------------------------
  console.log(`\n== Step 2: Find user '${TARGET_EMAIL}' ==`);
  const usersRes = await call("POST", "/idp/v1/Iam/GetUsers", {
    token,
    body: {
      page: 0,
      pageSize: 50,
      filter: { name: "", email: TARGET_EMAIL },
      projectKey: BLOCKS_KEY,
    },
  });

  const userList = usersRes.data?.data ?? usersRes.data?.items ?? usersRes.data ?? [];
  const users    = Array.isArray(userList) ? userList : [];
  const user     = users.find(
    (u) => (u.email ?? u.userName ?? "").toLowerCase() === TARGET_EMAIL.toLowerCase()
  );

  if (!user) {
    console.log("\n  User not found in first page — printing full list for inspection:");
    console.log(JSON.stringify(users, null, 2));
    throw new Error(`User '${TARGET_EMAIL}' not found. Check the full response above.`);
  }

  // Blocks API uses `itemId` as the user identifier in responses
  const userId = user.itemId ?? user.userId ?? user.id;
  console.log(`\n  Found user:`);
  console.log(`    itemId   : ${userId}`);
  console.log(`    email    : ${user.email}`);
  console.log(`    active   : ${user.active}`);
  console.log(`    verified : ${user.isVarified}`);
  console.log(`    roles    : ${user.memberships?.[0]?.roles?.join(", ")}`);

  // ----------------------------------------------------------
  // Step 3 — Attempt activation
  //
  //   3a. ResendActivation with userId — sends activation email (best for
  //       never-activated accounts: active=false, isVarified=false)
  //   3b. Update with itemId + memberships — the only documented admin update
  //       endpoint; test whether passing active=true takes effect
  // ----------------------------------------------------------

  // 3a — Resend activation email
  console.log("\n== Step 3a: POST /idp/v1/Iam/ResendActivation (userId) ==");
  await call("POST", "/idp/v1/Iam/ResendActivation", {
    token,
    body: { userId, projectKey: BLOCKS_KEY },
  });

  // 3b — Admin Update with itemId (the field the API actually uses)
  console.log("\n== Step 3b: POST /idp/v1/Iam/Update (itemId + memberships) ==");
  await call("POST", "/idp/v1/Iam/Update", {
    token,
    body: {
      itemId:      userId,
      memberships: user.memberships,
      projectKey:  BLOCKS_KEY,
    },
  });

  // ----------------------------------------------------------
  // Step 4 — Re-fetch user to confirm final status
  // ----------------------------------------------------------
  console.log("\n== Step 4: Re-fetch user to confirm status ==");
  const checkRes = await call("POST", "/idp/v1/Iam/GetUsers", {
    token,
    body: {
      page: 0,
      pageSize: 50,
      filter: { name: "", email: TARGET_EMAIL },
      projectKey: BLOCKS_KEY,
    },
  });

  const checkList  = checkRes.data?.data ?? checkRes.data?.items ?? checkRes.data ?? [];
  const checkUsers = Array.isArray(checkList) ? checkList : [];
  const checkUser  = checkUsers.find(
    (u) => (u.email ?? "").toLowerCase() === TARGET_EMAIL.toLowerCase()
  );

  if (checkUser) {
    console.log(`\n  Final status for ${TARGET_EMAIL}: ${checkUser.status ?? checkUser.isActive ?? "unknown"}`);
  }

  console.log("\n== DONE — review responses above to see which step succeeded ==");
}

main().catch((err) => { console.error("\nFATAL:", err.message); process.exit(1); });
