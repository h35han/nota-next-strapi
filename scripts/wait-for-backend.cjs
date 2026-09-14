#!/usr/bin/env node
/**
 * Wait until the Strapi backend accepts TCP connections before letting the
 * frontend dev/start server come up. Prevents the startup race where Next.js
 * (ready in ~300ms) serves SSR requests against a still-booting backend and
 * dies with ECONNREFUSED 500s.
 *
 * Usage: node scripts/wait-for-backend.cjs
 * Env:   BACKEND_HOST (default 127.0.0.1), BACKEND_PORT (default 1337),
 *        WAIT_TIMEOUT_MS (default 120000)
 */
const net = require("node:net");

const host = process.env.BACKEND_HOST || "127.0.0.1";
const port = Number(process.env.BACKEND_PORT || 1337);
const timeoutMs = Number(process.env.WAIT_TIMEOUT_MS || 120000);

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

(async () => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await tryConnect()) {
      console.log(`[wait-for-backend] ${host}:${port} is accepting connections.`);
      process.exit(0);
    }
    await sleep(500);
  }
  console.error(
    `[wait-for-backend] ${host}:${port} did not accept connections within ${timeoutMs}ms.`
  );
  process.exit(1);
})();