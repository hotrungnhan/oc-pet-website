import { test } from "node:test";
import assert from "node:assert/strict";
import { detectPlatform } from "./platform.ts";
test("detects supported desktop platforms and excludes mobile and Linux", () => {
  assert.equal(
    detectPlatform({
      platform: "MacIntel",
      userAgent: "Mozilla Macintosh",
      maxTouchPoints: 0,
    }),
    "mac",
  );
  assert.equal(detectPlatform({ platform: "Win32" }), "windows");
  assert.equal(
    detectPlatform({ userAgent: "Mozilla Windows NT 10.0" }),
    "windows",
  );
  assert.equal(
    detectPlatform({
      platform: "MacIntel",
      maxTouchPoints: 5,
      userAgent: "Mozilla Macintosh",
    }),
    "unsupported",
  );
  assert.equal(
    detectPlatform({ platform: "iPhone", userAgent: "iPhone" }),
    "unsupported",
  );
  assert.equal(
    detectPlatform({ platform: "Linux aarch64", userAgent: "Android" }),
    "unsupported",
  );
  assert.equal(
    detectPlatform({ platform: "Linux x86_64", userAgent: "X11 Linux" }),
    "unsupported",
  );
  assert.equal(
    detectPlatform({ platform: "Linux x86_64", userAgent: "Macintosh" }),
    "unsupported",
  );
  assert.equal(
    detectPlatform({ platform: "Win32", maxTouchPoints: 10 }),
    "windows",
  );
  assert.equal(detectPlatform({}), "unsupported");
});
