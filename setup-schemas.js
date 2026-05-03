/* eslint-disable no-console */
// ============================================================
// VibeBuilder -- Blocks Data Gateway schema setup
// Requires Node.js 18+ (native fetch)
// Usage: node setup-schemas.js
// ============================================================

const CLIENT_ID     = "af55abda-5662-452d-b209-30914e86146c";
const CLIENT_SECRET = "e1814158af1e40539c481751d7ac58a3";
const BLOCKS_KEY    = "D9aab23f617c843d9a6806cc57af9f335";
const BASE_URL      = "https://api.seliseblocks.com";
const PROJECT_SLUG  = "dlqxcb";

// ============================================================

async function apiJson(path, { method = "GET", body, token } = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    "X-Blocks-Key": BLOCKS_KEY,
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  console.log(`\n--> ${method} ${url}`);
  if (body) console.log("    body:", JSON.stringify(body, null, 2));

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }

  console.log(`<-- ${res.status} ${res.statusText}`);
  console.log("    response:", JSON.stringify(data, null, 2));

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
  return data;
}

async function main() {
  // ----------------------------------------------------------
  // Step 1 -- Client credentials login
  // ----------------------------------------------------------
  console.log("\n== Step 1: Login (client_credentials) ==");
  const tokenUrl = `${BASE_URL}/idp/v1/Authentication/Token`;
  const form = new URLSearchParams();
  form.append("grant_type",    "client_credentials");
  form.append("client_id",     CLIENT_ID);
  form.append("client_secret", CLIENT_SECRET);
  form.append("scope",         "openid");

  console.log(`\n--> POST ${tokenUrl}`);
  console.log("    body:", form.toString());

  const loginRes = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Blocks-Key": BLOCKS_KEY,
    },
    body: form.toString(),
  });

  const loginText = await loginRes.text();
  let loginData;
  try { loginData = JSON.parse(loginText); } catch { loginData = loginText; }
  console.log(`<-- ${loginRes.status} ${loginRes.statusText}`);
  console.log("    response:", JSON.stringify(loginData, null, 2));
  if (!loginRes.ok) throw new Error(`Login failed HTTP ${loginRes.status}: ${loginText}`);

  const token = loginData.access_token || loginData.accessToken || loginData.token;
  if (!token) throw new Error("No token found. Keys: " + Object.keys(loginData).join(", "));
  console.log(`\nToken acquired: ${token.slice(0, 40)}...`);

  // ----------------------------------------------------------
  // Step 2 -- List existing schemas
  // ----------------------------------------------------------
  console.log("\n== Step 3: List existing schemas (pageSize=100) ==");
  const schemas = await apiJson(`/uds/v1/${PROJECT_SLUG}/schemas?pageSize=100&pageIndex=0`, { token });
  const list = Array.isArray(schemas)
    ? schemas
    : schemas?.data?.items ?? schemas?.data ?? schemas?.items ?? [];

  const wpSchema    = list.find(s => (s.schemaName ?? s.name) === "WebsiteProject");
  const plSchema    = list.find(s => (s.schemaName ?? s.name) === "PageLayout");
  // A previous run may have created "PageLayout " (trailing space) — find and delete it.
  const plBadSchema = list.find(s => (s.schemaName ?? s.name) !== "PageLayout" &&
                                     (s.schemaName ?? s.name).trim() === "PageLayout");
  console.log(`  WebsiteProject : ${wpSchema    ? wpSchema.id    : "NOT FOUND"}`);
  console.log(`  PageLayout     : ${plSchema    ? plSchema.id    : "NOT FOUND"}`);
  console.log(`  PageLayout(bad): ${plBadSchema ? plBadSchema.id : "none"}`);

  // Field definitions — "type" key matches what the API expects in both create and add-fields bodies.
  // "Object" is not a valid API type; components stored as String (JSON).
  const wpFields = [
    { name: "userId",   type: "String",  isArray: false },
    { name: "siteName", type: "String",  isArray: false },
    { name: "pages",    type: "String",  isArray: true  },
  ];
  const plFields = [
    { name: "pageId",      type: "String",  isArray: false },
    { name: "userId",      type: "String",  isArray: false },
    { name: "siteId",      type: "String",  isArray: false },
    { name: "slug",        type: "String",  isArray: false },
    { name: "isPublished", type: "Boolean", isArray: false },
    { name: "components",  type: "String",  isArray: false },
  ];

  // ----------------------------------------------------------
  // Step 3b -- Delete malformed "PageLayout " schema if present
  // ----------------------------------------------------------
  if (plBadSchema) {
    console.log(`\n== Step 3b: Delete malformed schema id=${plBadSchema.id} ==`);
    try {
      await apiJson(`/uds/v1/${PROJECT_SLUG}/schemas/${plBadSchema.id}?projectKey=${BLOCKS_KEY}`, { method: "DELETE", token });
      console.log("  Deleted.");
    } catch (err) {
      console.warn(`  WARNING: ${err.message} — continuing anyway`);
    }
  }

  // ----------------------------------------------------------
  // Step 4 -- Ensure WebsiteProject schema exists
  // ----------------------------------------------------------
  console.log("\n== Step 4: Ensure WebsiteProject schema ==");
  let wpId;
  if (wpSchema) {
    wpId = wpSchema.id;
    console.log(`  Already exists, id=${wpId} — will add any missing fields individually`);
  } else {
    const created = await apiJson(`/uds/v1/${PROJECT_SLUG}/schemas/define`, {
      method: "POST",
      body: {
        schemaName:     "WebsiteProject",
        collectionName: "WebsiteProjects",
        schemaType:     2,
        fields:         wpFields,
      },
      token,
    });
    wpId = created?.data?.itemId ?? created?.data?.id ?? created?.id;
    console.log(`  Created, id=${wpId}`);
  }

  // ----------------------------------------------------------
  // Step 5 -- Add fields to WebsiteProject (only when schema pre-existed)
  // ----------------------------------------------------------
  if (wpSchema) {
    console.log("\n== Step 5: Add fields to WebsiteProject ==");
    try {
      await apiJson(`/uds/v1/${PROJECT_SLUG}/schemas/fields`, {
        method: "POST",
        body: { schemaDefinitionItemId: wpId, fields: wpFields },
        token,
      });
      console.log("  Fields added.");
    } catch (err) {
      console.warn(`  WARNING: ${err.message}`);
    }
  } else {
    console.log("\n== Step 5: Fields included in create — skipping individual add ==");
  }

  // ----------------------------------------------------------
  // Step 6 -- Ensure PageLayout schema exists
  // ----------------------------------------------------------
  console.log("\n== Step 6: Ensure PageLayout schema ==");
  let plId;
  if (plSchema) {
    plId = plSchema.id;
    console.log(`  Already exists, id=${plId} — will add any missing fields individually`);
  } else {
    const created = await apiJson(`/uds/v1/${PROJECT_SLUG}/schemas/define`, {
      method: "POST",
      body: {
        schemaName:     "PageLayout",
        collectionName: "PageLayouts",
        schemaType:     2,
        fields:         plFields,
      },
      token,
    });
    plId = created?.data?.itemId ?? created?.data?.id ?? created?.id;
    console.log(`  Created, id=${plId}`);
  }

  // ----------------------------------------------------------
  // Step 7 -- Add fields to PageLayout (only when schema pre-existed)
  // ----------------------------------------------------------
  if (plSchema) {
    console.log("\n== Step 7: Add fields to PageLayout ==");
    try {
      await apiJson(`/uds/v1/${PROJECT_SLUG}/schemas/fields`, {
        method: "POST",
        body: { schemaDefinitionItemId: plId, fields: plFields },
        token,
      });
      console.log("  Fields added.");
    } catch (err) {
      console.warn(`  WARNING: ${err.message}`);
    }
  } else {
    console.log("\n== Step 7: Fields included in create — skipping individual add ==");
  }

  // ----------------------------------------------------------
  // Step 8 -- Reload config
  // ----------------------------------------------------------
  console.log("\n== Step 8: Reload Data Gateway configuration ==");
  await apiJson(`/uds/v1/${PROJECT_SLUG}/configurations/reload`, { method: "POST", token });

  // ----------------------------------------------------------
  console.log("\n== ALL DONE ==");
  console.log(`  WebsiteProject schema ID : ${wpId}`);
  console.log(`  PageLayout schema ID     : ${plId}`);
}

main().catch(err => { console.error("\nFATAL:", err.message); process.exit(1); });
