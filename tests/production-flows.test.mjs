import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

async function text(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("middleware protects product and persistence routes", async () => {
  const middleware = await text("middleware.ts");

  for (const route of [
    "/dashboard/:path*",
    "/history/:path*",
    "/profile/:path*",
    "/share/create/:path*",
    "/api/history/:path*",
    "/api/share/:path*",
  ]) {
    assert.match(middleware, new RegExp(route.replace(/[/*]/g, "\\$&")));
  }

  assert.match(middleware, /signIn:\s*"\/login"/);
});

test("prediction API validates input and handles worker timeouts", async () => {
  const route = await text("src/app/api/predict/route.ts");

  assert.match(route, /predictionRequestSchema\.safeParse/);
  assert.match(route, /AbortController/);
  assert.match(route, /PREDICTION_TIMEOUT_MS/);
  assert.match(route, /predictionId/);
});

test("share flow requires ownership before creating or deleting shares", async () => {
  const createRoute = await text("src/app/api/share/route.ts");
  const deleteRoute = await text("src/app/api/share/[slug]/route.ts");

  assert.match(createRoute, /requireCurrentUser/);
  assert.match(createRoute, /shareCreateSchema\.safeParse/);
  assert.match(createRoute, /predictionId:\s*prediction\.id/);
  assert.match(deleteRoute, /userId:\s*user\.id/);
});

test("history supports search, deletion, and pagination-shaped responses", async () => {
  const historyRoute = await text("src/app/api/history/route.ts");
  const deleteRoute = await text("src/app/api/history/[id]/route.ts");

  assert.match(historyRoute, /historyQuerySchema\.safeParse/);
  assert.match(historyRoute, /hasMore/);
  assert.match(historyRoute, /contains:\s*q/);
  assert.match(deleteRoute, /prisma\.predictionHistory\.delete/);
});
