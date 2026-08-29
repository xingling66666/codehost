/**
 * CloudCode 代码托管后端
 * 基于 Cloudflare Workers + KV
 *
 * 功能：
 *  - 开发者上传代码文件，生成专属 URL（https://xx.com/1）
 *  - 每个文件有专属 ID，删除后不自动释放，可手动释放复用
 *  - 根路径 / 返回空白页面
 *  - /{id} 返回对应代码内容（供远程执行 / 云更新）
 *  - 精美 Material Design 3 蓝紫渐变后台 /admin
 *
 * 部署：
 *  1. wrangler kv namespace create "KV"
 *  2. wrangler.toml:
 *       name = "cloudhost"
 *       main = "worker.js"
 *       compatibility_date = "2024-01-01"
 *       [kv_namespaces]
 *       binding = "KV"
 *       id = "<namespace-id>"
 *  3. wrangler secret put ADMIN_PASSWORD
 *  4. wrangler deploy
 */

let KV = null;

import { adminPageHtml } from "./admin-page.js";

// 管理密码（从环境变量读取，也可硬编码备用）
const FALLBACK_PASSWORD = "admin123";
let ADMIN_PW = FALLBACK_PASSWORD;

const ADMIN_ROUTE = "/admin";
const ADMIN_API = "/admin/api";

// 扩展名 -> MIME
const EXT_MIME = {
  js:"text/javascript; charset=utf-8", mjs:"text/javascript; charset=utf-8", cjs:"text/javascript; charset=utf-8",
  ts:"text/javascript; charset=utf-8", py:"text/x-python; charset=utf-8", sh:"text/x-sh; charset=utf-8",
  bash:"text/x-sh; charset=utf-8", json:"application/json; charset=utf-8", txt:"text/plain; charset=utf-8",
  md:"text/markdown; charset=utf-8", html:"text/html; charset=utf-8", css:"text/css; charset=utf-8",
  xml:"application/xml; charset=utf-8", yaml:"text/yaml; charset=utf-8", yml:"text/yaml; charset=utf-8",
  lua:"text/x-lua; charset=utf-8", rb:"text/x-ruby; charset=utf-8", go:"text/x-go; charset=utf-8",
  rs:"text/x-rust; charset=utf-8", c:"text/x-c; charset=utf-8", h:"text/x-c; charset=utf-8",
  cpp:"text/x-c; charset=utf-8", hpp:"text/x-c; charset=utf-8", java:"text/x-java; charset=utf-8",
  php:"text/x-php; charset=utf-8", swift:"text/x-swift; charset=utf-8", kt:"text/x-kotlin; charset=utf-8",
  sql:"text/x-sql; charset=utf-8", dart:"text/x-dart; charset=utf-8", ps1:"text/x-powershell; charset=utf-8",
  bat:"text/x-bat; charset=utf-8", conf:"text/plain; charset=utf-8", ini:"text/plain; charset=utf-8",
  cfg:"text/plain; charset=utf-8"
};

// ============ 工具函数 ============
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}
function getPassword() {
  return ADMIN_PW || FALLBACK_PASSWORD;
}
function passwordMatches(pw) {
  return typeof pw === "string" && pw.length > 0 && safeEqual(pw, getPassword());
}
function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
function shortId(n = 16) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < n; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}
function nowIso() { return new Date().toISOString(); }
async function kvGetJson(key, fallback = null) {
  try {
    const raw = await KV.get(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (e) { return fallback; }
}
async function readJson(req) {
  try { return await req.json(); } catch (e) { return null; }
}

// 分配下一个可用 ID：优先复用已释放 ID，否则自增
async function nextAvailableId() {
  const available = await kvGetJson("available", []);
  if (available.length > 0) {
    const id = available.shift();
    await KV.put("available", JSON.stringify(available));
    return id;
  }
  let counter = parseInt(await KV.get("counter") || "0", 10);
  counter += 1;
  await KV.put("counter", String(counter));
  return counter;
}

// 释放 ID（标记可复用）
async function releaseId(id) {
  id = String(id);
  const available = await kvGetJson("available", []);
  if (!available.includes(id)) {
    available.push(id);
    await KV.put("available", JSON.stringify(available));
  }
}

function isNumericId(seg) { return /^\d+$/.test(seg); }

// ============ Worker 主入口 ============
async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // 管理后台页面
  if (path === ADMIN_ROUTE || path === ADMIN_ROUTE + "/") {
    return new Response(adminPageHtml(), {
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  // 管理 API
  if (path.startsWith(ADMIN_API)) {
    return handleAdminApi(request, url, path);
  }

  // 根路径返回空白页面
  if (path === "/" || path === "") {
    return new Response("", {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // /{id} 访问代码
  const seg = path.replace(/^\/+/, "").replace(/\/+$/, "");
  if (isNumericId(seg)) {
    return handleFileGet(seg);
  }

  // 未知路径：返回空白
  return new Response("", { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

// ---------- 访问文件内容 ----------
async function handleFileGet(id) {
  id = String(id);
  const content = await KV.get("file:" + id);
  const metaRaw = await KV.get("meta:" + id);

  if (content === null) {
    return new Response("404 Not Found", { status: 404 });
  }

  let ext = "";
  if (metaRaw) {
    try { ext = JSON.parse(metaRaw).ext || ""; } catch (e) {}
  }
  const mime = EXT_MIME[ext] || "text/plain; charset=utf-8";

  return new Response(content, {
    status: 200,
    headers: { "Content-Type": mime, "Cache-Control": "no-cache", "X-Code-Id": id },
  });
}

// ---------- 管理 API ----------
async function handleAdminApi(request, url, path) {
  const method = request.method;
  const api = path.slice(ADMIN_API.length);

  // 登录
  if (api === "/login") {
    if (method !== "POST") return json({ ok: false, message: "方法不允许" }, 405);
    const body = await readJson(request);
    if (passwordMatches(body && body.password)) {
      const token = randomToken();
      await KV.put("session:" + token, JSON.stringify({ created: nowIso() }), { expirationTtl: 7 * 24 * 3600 });
      return json({ ok: true, token });
    }
    return json({ ok: false, message: "密码错误" }, 401);
  }

  // 其余接口鉴权
  const auth = await authenticate(request);
  if (!auth.ok) return json({ ok: false, message: "未授权" }, 401);

  if (api === "/logout" && method === "POST") {
    const token = extractToken(request);
    if (token) await KV.delete("session:" + token);
    return json({ ok: true });
  }
  if (api === "/upload" && method === "POST") return handleUpload(request);
  if (api === "/files" && method === "GET") return handleListFiles();
  if (api === "/stats" && method === "GET") return handleStats();
  if (api.startsWith("/files/") && method === "GET") return handleGetFileMeta(api.slice("/files/".length));
  if (api.startsWith("/files/") && method === "PUT") return handleUpdateFile(api.slice("/files/".length), request);
  if (api.startsWith("/files/") && method === "DELETE") return handleDeleteFile(api.slice("/files/".length));
  if (api.startsWith("/release/") && method === "POST") return handleReleaseId(api.slice("/release/".length));

  return json({ ok: false, message: "未找到接口" }, 404);
}

function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
function extractToken(request) {
  const h = request.headers.get("Authorization") || "";
  if (h.startsWith("Bearer ")) return h.slice(7);
  const url = new URL(request.url);
  return url.searchParams.get("token") || null;
}
async function authenticate(request) {
  const token = extractToken(request);
  if (!token) return { ok: false };
  const session = await KV.get("session:" + token);
  if (session === null) return { ok: false };
  try { JSON.parse(session); return { ok: true }; } catch (e) { return { ok: false }; }
}

// ---------- 上传 ----------
async function handleUpload(request) {
  const contentType = request.headers.get("Content-Type") || "";
  let filename = "script.js";
  let content = "";
  let note = "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const fileField = form.get("file");
    if (fileField) {
      if (typeof fileField === "string") { content = fileField; }
      else { filename = fileField.name || "script.js"; content = await fileField.text(); }
    } else {
      content = form.get("content") || "";
      filename = form.get("filename") || "script.js";
    }
    note = form.get("note") || "";
  } else if (contentType.includes("application/json")) {
    const body = await readJson(request);
    if (!body) return json({ ok: false, message: "请求体无效" }, 400);
    filename = body.filename || "script.js";
    content = body.content || "";
    note = body.note || "";
  } else {
    content = await request.text();
  }

  if (!content || content.trim().length === 0) {
    return json({ ok: false, message: "代码内容不能为空" }, 400);
  }

  const id = await nextAvailableId();
  const parts = filename.split(".");
  const ext = parts.length > 1 ? parts.pop().toLowerCase() : "";

  const meta = {
    id: id, filename: filename, ext: ext, size: content.length,
    note: note, created: nowIso(), updated: nowIso(), secret: shortId(16),
  };

  await KV.put("file:" + id, content);
  await KV.put("meta:" + id, JSON.stringify(meta));

  return json({ ok: true, id: id, url: "/" + id, meta: meta }, 201);
}

// ---------- 列出文件 ----------
async function handleListFiles() {
  const list = await KV.list({ prefix: "meta:" });
  const files = [];
  for (const key of list.keys) {
    const raw = await KV.get(key.name);
    if (!raw) continue;
    try { files.push(JSON.parse(raw)); } catch (e) {}
  }
  files.sort((a, b) => (a.created < b.created ? 1 : -1));
  return json({ ok: true, files: files });
}

// ---------- 单个文件元数据 ----------
async function handleGetFileMeta(id) {
  id = String(id);
  const raw = await KV.get("meta:" + id);
  if (!raw) return json({ ok: false, message: "文件不存在" }, 404);
  return json({ ok: true, meta: JSON.parse(raw) });
}

// ---------- 更新文件 ----------
async function handleUpdateFile(id, request) {
  id = String(id);
  const body = await readJson(request);
  if (!body) return json({ ok: false, message: "请求体无效" }, 400);

  const existingRaw = await KV.get("meta:" + id);
  if (!existingRaw) return json({ ok: false, message: "文件不存在" }, 404);
  const meta = JSON.parse(existingRaw);

  if (body.content !== undefined) {
    if (body.content.trim().length === 0) return json({ ok: false, message: "代码内容不能为空" }, 400);
    await KV.put("file:" + id, body.content);
    meta.size = body.content.length;
  }
  if (body.note !== undefined) meta.note = body.note;
  if (body.filename !== undefined) {
    meta.filename = body.filename;
    const parts = body.filename.split(".");
    meta.ext = parts.length > 1 ? parts.pop().toLowerCase() : "";
  }
  meta.updated = nowIso();
  await KV.put("meta:" + id, JSON.stringify(meta));

  return json({ ok: true, meta: meta });
}

// ---------- 删除文件（不释放 ID） ----------
async function handleDeleteFile(id) {
  id = String(id);
  const metaRaw = await KV.get("meta:" + id);
  if (!metaRaw) return json({ ok: false, message: "文件不存在" }, 404);
  await KV.delete("file:" + id);
  await KV.delete("meta:" + id);
  return json({ ok: true, message: "已删除，ID " + id + " 已保留（可手动释放复用）" });
}

// ---------- 释放 ID ----------
async function handleReleaseId(id) {
  id = String(id);
  const metaRaw = await KV.get("meta:" + id);
  if (metaRaw) return json({ ok: false, message: "ID " + id + " 仍有关联文件，请先删除" }, 400);
  await releaseId(id);
  return json({ ok: true, message: "ID " + id + " 已释放，可被复用" });
}

// ---------- 统计 ----------
async function handleStats() {
  const list = await KV.list({ prefix: "meta:" });
  const counter = parseInt(await KV.get("counter") || "0", 10);
  const available = await kvGetJson("available", []);
  return json({ ok: true, stats: { totalFiles: list.keys.length, maxId: counter, released: available.length } });
}

export default {
  async fetch(request, env) {
    KV = env.KV;
    ADMIN_PW = env.ADMIN_PASSWORD || FALLBACK_PASSWORD;
    return handleRequest(request);
  },
};