import test from "node:test";
import assert from "node:assert/strict";
import { validateEnvironment, frontendOrigin } from "../src/config/env.js";

test("producao exige segredos e origem HTTPS sem subpasta", () => {
  const saved = { ...process.env };
  try {
    process.env.NODE_ENV = "production";
    process.env.DATABASE_URL = "mysql://test:test@localhost:3306/test";
    delete process.env.JWT_SECRET;
    assert.throws(validateEnvironment, /JWT_SECRET/);
    process.env.FRONTEND_URL = "https://frontend.invalid/tecti/2026/gpec12/";
    assert.throws(frontendOrigin, /sem a subpasta/);
    process.env.FRONTEND_URL = "http://frontend.invalid";
    assert.throws(frontendOrigin, /HTTPS/);
    process.env.FRONTEND_URL = "https://frontend.invalid";
    assert.equal(frontendOrigin(), "https://frontend.invalid");
  } finally {
    for (const key of Object.keys(process.env)) if (!(key in saved)) delete process.env[key];
    Object.assign(process.env, saved);
  }
});
