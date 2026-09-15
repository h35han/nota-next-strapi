#!/usr/bin/env node
/**
 * Wait until the Strapi backend is reachable before letting the frontend
 * dev/start server come up. Prevents the startup race where Next.js (ready
 * in ~300ms) serves SSR requests against a still-booting backend and dies
 * with ECONNREFUSED 500s / multi-second stalls.
 *
 * Two gates:
 *  1. TCP connect to BACKEND_HOST:BACKEND_PORT (the port opens early).
 *  2. HTTP GET {BACKEND_API_URL}/homepage resolves with a status < 500,
 *     proving the Content API is actually answering before we continue.
 *
 * Usage: node scripts/wait-for-backend.cjs
 * Env:   BACKEND_HOST (default 127.0.0.1), BACKEND_PORT (default 1337),
 *        BACKEND_API_URL (default http://127.0.0.1:1337/api),
 *        WAIT_TIMEOUT_MS (default 120000)
 */
const net = require("node:net");

const host = process.env.BACKEND_HOST || "127.0.0.1";
const port = Number(process.env.BACKEND_PORT || 1337);
const apiUrl = process.env.BACKEND_API_URL || `http://127.0.0.1:${port}/api`;
const timeoutMs = Number(process.env.WAIT_TIMEOUT_MS || 120000);
const probePath = "/homepage";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const tryConnect = () =>
  new Promise((resolve) => {
    const sock = net.connect({ host, port });
    const done = (ok) => {
      sock.destroy();
      resolve(ok);
    };
    sock.once("connect", () => done(true));
    sock.once("error", () => done(false));
  });

const tryHttp = async () => {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${apiUrl}${probePath}`, { signal: controller.signal });
    clearTimeout(timer);
    return res.status < 500;
  } catch {
    return false;
  }
};

(async () => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if ((await tryConnect()) && (await tryHttp())) {
      console.log(`[wait-for-backend] ${host}:${port} API is ready.`);
      process.exit(0);
    }
    await sleep(500);
  }
  console.error(
    `[wait-for-backend] ${host}:${port} did not become ready within ${timeoutMs}ms.`
  );
  process.exit(1);
})();