import crypto from "node:crypto";
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "public");
const port = Number(process.env.PORT || 3030);
const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;
const userId = "demo-user";

const providers = ["x", "telegram", "instagram", "whatsapp_manual"];
const xScopes = ["tweet.read", "users.read", "offline.access"];
const telegramLoginScopes = ["openid", "profile"];
const db = {
  connected_accounts: [],
  external_profiles: [
    row("external_profiles", { user_id: userId, provider: "instagram", url: "https://instagram.com/", label: "Instagram", status: "unsupported" }),
    row("external_profiles", { user_id: userId, provider: "whatsapp_manual", url: "whatsapp://send", label: "WhatsApp", status: "unsupported" })
  ],
  updates: [
    row("updates", {
      user_id: userId,
      provider: "telegram",
      source_kind: "bot_message",
      author_name: "Weavr Demo",
      author_username: "weavr_demo",
      text: "Forward a Telegram message to the Weavr bot and it lands here as a normalized update.",
      media_urls: [],
      occurred_at: new Date(Date.now() - 3600_000).toISOString(),
      ingested_at: new Date(Date.now() - 3500_000).toISOString(),
      visibility: "private",
      raw_payload: { demo: true }
    }),
    row("updates", {
      user_id: userId,
      provider: "x",
      source_kind: "oauth_fetch",
      external_id: "demo-x-1",
      author_name: "Weavr",
      author_username: "weavr",
      text: "X imports use OAuth 2.0 PKCE and only appear when your API access permits tweet reads.",
      media_urls: [],
      external_url: "https://x.com/",
      occurred_at: new Date(Date.now() - 7200_000).toISOString(),
      ingested_at: new Date(Date.now() - 7100_000).toISOString(),
      visibility: "public_link",
      raw_payload: { demo: true }
    })
  ],
  sync_runs: []
};
const oauthStates = new Map();

function row(table, data) {
  const now = new Date().toISOString();
  return { id: crypto.randomUUID(), created_at: now, updated_at: now, ...data };
}

function json(res, status, body) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body, null, 2));
}

function redirect(res, location) {
  res.writeHead(302, { location });
  res.end();
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1_000_000) req.destroy();
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function base64Url(input) {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function providerAssert(provider) {
  if (!providers.includes(provider)) throw new Error(`Unsupported provider ${provider}`);
}

function upsertAccount(account) {
  providerAssert(account.provider);
  const idx = db.connected_accounts.findIndex(existing => existing.user_id === account.user_id && existing.provider === account.provider && existing.provider_user_id === account.provider_user_id);
  const next = { ...row("connected_accounts", account), updated_at: new Date().toISOString() };
  if (idx >= 0) db.connected_accounts[idx] = { ...db.connected_accounts[idx], ...next };
  else db.connected_accounts.push(next);
  return idx >= 0 ? db.connected_accounts[idx] : next;
}

function createSyncRun(data) {
  const sync = row("sync_runs", { updates_created: 0, started_at: new Date().toISOString(), ...data });
  db.sync_runs.unshift(sync);
  return sync;
}

function normalizeXPost(account, post) {
  db.updates.unshift(row("updates", {
    user_id: account.user_id,
    connected_account_id: account.id,
    provider: "x",
    source_kind: "oauth_fetch",
    external_id: post.id,
    author_name: account.display_name,
    author_username: account.username,
    text: post.text,
    media_urls: [],
    external_url: account.username ? `https://x.com/${account.username}/status/${post.id}` : undefined,
    occurred_at: post.created_at || new Date().toISOString(),
    ingested_at: new Date().toISOString(),
    visibility: "public_link",
    raw_payload: post
  }));
}

async function exchangeXCode(code, verifier) {
  if (!process.env.X_CLIENT_ID) {
    return {
      blocked: true,
      code: "missing_x_client_id",
      message: "Add X_CLIENT_ID and, if required by your app type, X_CLIENT_SECRET before live X OAuth can complete."
    };
  }
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: `${baseUrl}/api/auth/x/callback`,
    code_verifier: verifier,
    client_id: process.env.X_CLIENT_ID
  });
  const headers = { "content-type": "application/x-www-form-urlencoded" };
  if (process.env.X_CLIENT_SECRET) {
    headers.authorization = `Basic ${Buffer.from(`${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`).toString("base64")}`;
  }
  const response = await fetch("https://api.x.com/2/oauth2/token", { method: "POST", headers, body });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(payload.error_description || "X token exchange failed"), { payload, status: response.status });
  return payload;
}

async function fetchXMe(accessToken) {
  const response = await fetch("https://api.x.com/2/users/me?user.fields=profile_image_url,name,username", {
    headers: { authorization: `Bearer ${accessToken}` }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(payload.detail || "X profile fetch failed"), { payload, status: response.status });
  return payload.data;
}

async function fetchXPosts(account) {
  const sync = createSyncRun({ connected_account_id: account.id, provider: "x", status: "success" });
  try {
    const response = await fetch(`https://api.x.com/2/users/${account.provider_user_id}/tweets?max_results=10&tweet.fields=created_at`, {
      headers: { authorization: `Bearer ${account.access_token_encrypted}` }
    });
    const payload = await response.json().catch(() => ({}));
    if (response.status === 429) throw Object.assign(new Error("X rate limit reached."), { syncStatus: "rate_limited", code: "rate_limited" });
    if (!response.ok) throw Object.assign(new Error("X is connected, but this API tier does not allow post import yet."), { syncStatus: "blocked", code: "api_access_blocked", payload });
    for (const post of payload.data || []) normalizeXPost(account, post);
    sync.updates_created = (payload.data || []).length;
    sync.status = "success";
  } catch (error) {
    sync.status = error.syncStatus || "error";
    sync.error_code = error.code || "x_sync_error";
    sync.error_message = error.message;
    const target = db.connected_accounts.find(item => item.id === account.id);
    if (target) target.status = sync.status === "blocked" ? "blocked" : "error";
  } finally {
    sync.finished_at = new Date().toISOString();
  }
}

function verifyTelegramLogin(params) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return { ok: false, error: "Set TELEGRAM_BOT_TOKEN to validate Telegram Login." };
  const hash = params.get("hash");
  const pairs = [...params.entries()].filter(([key]) => key !== "hash").sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join("\n");
  const secret = crypto.createHash("sha256").update(botToken).digest();
  const expected = crypto.createHmac("sha256", secret).update(pairs).digest("hex");
  if (!hash || hash.length !== expected.length) return { ok: false, error: "Telegram Login signature could not be verified." };
  return { ok: crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expected)), error: "Telegram Login signature could not be verified." };
}

function normalizeTelegramUpdate(update) {
  const message = update.message || update.channel_post;
  if (!message) return null;
  const sourceKind = update.channel_post ? "channel_post" : message.forward_origin || message.forward_from || message.forward_sender_name ? "forwarded_message" : "bot_message";
  const chat = message.sender_chat || message.chat || {};
  const user = message.from || {};
  const photos = message.photo || [];
  return row("updates", {
    user_id: userId,
    provider: "telegram",
    source_kind: sourceKind,
    external_id: String(message.message_id || update.update_id),
    author_name: chat.title || [user.first_name, user.last_name].filter(Boolean).join(" ") || message.forward_sender_name || "Telegram",
    author_username: chat.username || user.username,
    text: message.text || message.caption || "",
    media_urls: photos.length ? [`telegram:file:${photos.at(-1).file_id}`] : [],
    occurred_at: new Date((message.date || Math.floor(Date.now() / 1000)) * 1000).toISOString(),
    ingested_at: new Date().toISOString(),
    visibility: "private",
    raw_payload: update
  });
}

async function serveStatic(req, res) {
  const url = new URL(req.url, baseUrl);
  const filePath = path.normalize(path.join(publicDir, url.pathname === "/" ? "index.html" : url.pathname));
  if (!filePath.startsWith(publicDir)) return json(res, 403, { error: "Forbidden" });
  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    const contentType = ext === ".css" ? "text/css" : ext === ".js" ? "text/javascript" : "text/html";
    res.writeHead(200, { "content-type": `${contentType}; charset=utf-8` });
    res.end(data);
  } catch {
    json(res, 404, { error: "Not found" });
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, baseUrl);
    if (url.pathname === "/api/state") return json(res, 200, { ...db, xScopes, telegramLoginScopes, productRules: { whatsappStatus: "rejected", instagram: "deferred" } });
    if (url.pathname === "/api/auth/x/start") {
      const verifier = base64Url(crypto.randomBytes(32));
      const challenge = base64Url(crypto.createHash("sha256").update(verifier).digest());
      const state = base64Url(crypto.randomBytes(24));
      oauthStates.set(state, { verifier, createdAt: Date.now() });
      if (!process.env.X_CLIENT_ID) return redirect(res, `/?x=blocked&reason=missing_x_client_id`);
      const auth = new URL("https://x.com/i/oauth2/authorize");
      auth.search = new URLSearchParams({ response_type: "code", client_id: process.env.X_CLIENT_ID, redirect_uri: `${baseUrl}/api/auth/x/callback`, scope: xScopes.join(" "), state, code_challenge: challenge, code_challenge_method: "S256" });
      return redirect(res, auth.toString());
    }
    if (url.pathname === "/api/auth/x/callback") {
      const stored = oauthStates.get(url.searchParams.get("state"));
      if (!stored) return redirect(res, "/?x=needs_reconnect");
      oauthStates.delete(url.searchParams.get("state"));
      const token = await exchangeXCode(url.searchParams.get("code"), stored.verifier);
      if (token.blocked) return redirect(res, `/?x=blocked&reason=${token.code}`);
      const profile = await fetchXMe(token.access_token);
      const account = upsertAccount({ user_id: userId, provider: "x", provider_user_id: profile.id, username: profile.username, display_name: profile.name, avatar_url: profile.profile_image_url, access_token_encrypted: token.access_token, refresh_token_encrypted: token.refresh_token, token_expires_at: new Date(Date.now() + (token.expires_in || 0) * 1000).toISOString(), scopes: xScopes, status: "connected" });
      await fetchXPosts(account);
      return redirect(res, "/?x=connected");
    }
    if (url.pathname === "/api/auth/telegram/callback") {
      const check = verifyTelegramLogin(url.searchParams);
      if (!check.ok) return json(res, 401, check);
      upsertAccount({ user_id: userId, provider: "telegram", provider_user_id: url.searchParams.get("id"), username: url.searchParams.get("username"), display_name: [url.searchParams.get("first_name"), url.searchParams.get("last_name")].filter(Boolean).join(" "), avatar_url: url.searchParams.get("photo_url"), scopes: telegramLoginScopes, status: "connected" });
      return redirect(res, "/?telegram=connected");
    }
    if (url.pathname === "/api/dev/telegram-login" && req.method === "POST") {
      const body = JSON.parse(await readBody(req) || "{}");
      upsertAccount({ user_id: userId, provider: "telegram", provider_user_id: body.id || "telegram-demo", username: body.username || "telegram_demo", display_name: body.display_name || "Telegram Demo", avatar_url: body.photo_url, scopes: telegramLoginScopes, status: "connected" });
      return json(res, 200, { ok: true });
    }
    if (url.pathname === "/api/webhooks/telegram" && req.method === "POST") {
      const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
      if (expected && req.headers["x-telegram-bot-api-secret-token"] !== expected) return json(res, 401, { error: "Invalid Telegram webhook secret." });
      const update = JSON.parse(await readBody(req) || "{}");
      const normalized = normalizeTelegramUpdate(update);
      if (normalized) db.updates.unshift(normalized);
      return json(res, 200, { ok: true, created: Boolean(normalized) });
    }
    return serveStatic(req, res);
  } catch (error) {
    json(res, 500, { error: error.message });
  }
});

server.listen(port, () => console.log(`Weavr ingress MVP running at ${baseUrl}`));
