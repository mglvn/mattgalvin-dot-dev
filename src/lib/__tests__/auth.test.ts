import { describe, it, expect } from "vitest";
import { createSessionCookie, verifySession, clearSessionCookie, COOKIE_NAME } from "../auth";

const SECRET = "test-secret-for-unit-tests";

describe("createSessionCookie", () => {
  it("returns a string containing the cookie name", async () => {
    const cookie = await createSessionCookie(SECRET);
    expect(cookie).toContain(`${COOKIE_NAME}=`);
  });

  it("includes HttpOnly and SameSite=Strict", async () => {
    const cookie = await createSessionCookie(SECRET);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Strict");
  });

  it("includes Secure flag when secure=true", async () => {
    const cookie = await createSessionCookie(SECRET, true);
    expect(cookie).toContain("Secure");
  });

  it("omits Secure flag when secure=false", async () => {
    const cookie = await createSessionCookie(SECRET, false);
    expect(cookie).not.toContain("Secure");
  });

  it("produces a token in ts.sig format", async () => {
    const cookie = await createSessionCookie(SECRET);
    const token = cookie.split("; ")[0].slice(COOKIE_NAME.length + 1);
    expect(token).toMatch(/^\d+\..+$/);
  });
});

describe("verifySession", () => {
  it("verifies a valid token created with the same secret", async () => {
    const cookie = await createSessionCookie(SECRET);
    const token = cookie.split("; ")[0].slice(COOKIE_NAME.length + 1);
    expect(await verifySession(token, SECRET)).toBe(true);
  });

  it("rejects a token with a wrong secret", async () => {
    const cookie = await createSessionCookie(SECRET);
    const token = cookie.split("; ")[0].slice(COOKIE_NAME.length + 1);
    expect(await verifySession(token, "wrong-secret")).toBe(false);
  });

  it("rejects a tampered token", async () => {
    const cookie = await createSessionCookie(SECRET);
    const token = cookie.split("; ")[0].slice(COOKIE_NAME.length + 1);
    const tampered = token.slice(0, -4) + "XXXX";
    expect(await verifySession(tampered, SECRET)).toBe(false);
  });

  it("rejects a token with no dot separator", async () => {
    expect(await verifySession("nodothere", SECRET)).toBe(false);
  });
});

describe("clearSessionCookie", () => {
  it("sets Max-Age=0", () => {
    expect(clearSessionCookie()).toContain("Max-Age=0");
  });

  it("uses the correct cookie name", () => {
    expect(clearSessionCookie()).toContain(`${COOKIE_NAME}=`);
  });
});
