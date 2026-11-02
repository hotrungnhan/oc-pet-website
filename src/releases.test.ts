import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CACHE_KEY,
  CACHE_TTL,
  loadReleases,
  selectDownloads,
  REPO_URL,
  type Release,
} from "./releases.ts";
const release = (
  tag: string,
  date: string,
  names: string[],
  extra: Partial<Release> = {},
): Release => ({
  tag_name: tag,
  published_at: date,
  assets: names.map((name) => ({
    name,
    size: 1234,
    browser_download_url: `${REPO_URL}/releases/download/${tag}/${name}`,
  })),
  ...extra,
});
const releases = [
  release("v0.17.4", "2026-11-01", [
    "OCPet-0.17.4.dmg",
    "OCPet-0.17.4-setup.exe",
  ]),
  release("v0.17.5", "2026-11-02", ["OCPet-0.17.5.dmg"]),
];
function memory(initial: string | null = null) {
  let value = initial;
  return {
    getItem: (_key: string) => value,
    setItem: (_key: string, next: string) => {
      value = next;
    },
  };
}
const now = Date.now();
const cached = (checkedAt: number) =>
  JSON.stringify({ releases, checkedAt, etag: '"release-etag"' });
test("selects newest stable installer independently for each platform", () => {
  const files = selectDownloads([
    ...releases,
    release("v1", "2026-11-03", ["v1-setup.exe"], { prerelease: true }),
    release("v2", "2026-11-04", ["v2.dmg"], { draft: true }),
  ]);
  assert.equal(files.mac?.version, "v0.17.5");
  assert.equal(files.windows?.version, "v0.17.4");
  assert.deepEqual(selectDownloads([]), { mac: null, windows: null });
});
test("rejects download links outside the public repo", () => {
  const fake = release("v1", "2026-11-02", ["a.dmg"]);
  fake.assets[0].browser_download_url = "https://example.com/a.dmg";
  assert.equal(selectDownloads([fake]).mac, null);
});
test("fresh cache avoids network calls", async () => {
  let calls = 0;
  const result = await loadReleases({
    storage: memory(cached(now - 1000)),
    now,
    request: async () => {
      calls++;
      throw Error("unexpected");
    },
  });
  assert.equal(calls, 0);
  assert.equal(result.stale, false);
  assert.equal(result.downloads.mac?.version, "v0.17.5");
});
test("expired cache revalidates with ETag and renews on 304", async () => {
  const store = memory(cached(now - CACHE_TTL));
  const result = await loadReleases({
    storage: store,
    now,
    request: async (_url, init) => {
      assert.equal(
        (init?.headers as Record<string, string>)["If-None-Match"],
        '"release-etag"',
      );
      return new Response(null, { status: 304 });
    },
  });
  assert.equal(result.checkedAt, now);
  assert.equal(result.stale, false);
  assert.equal(JSON.parse(store.getItem(CACHE_KEY)!).checkedAt, now);
});
test("new response updates cached releases and ETag", async () => {
  const store = memory();
  const result = await loadReleases({
    storage: store,
    now,
    request: async () =>
      Response.json(releases, { headers: { ETag: '"new"' } }),
  });
  assert.equal(result.downloads.windows?.version, "v0.17.4");
  assert.equal(JSON.parse(store.getItem(CACHE_KEY)!).etag, '"new"');
});
test("rate limits, offline errors, and malformed responses retain stale downloads", async () => {
  for (const request of [
    async () => new Response(null, { status: 403 }),
    async () => {
      throw Error("offline");
    },
    async () => Response.json({ message: "bad" }),
  ]) {
    const result = await loadReleases({
      storage: memory(cached(now - CACHE_TTL)),
      now,
      request,
    });
    assert.equal(result.stale, true);
    assert.equal(result.downloads.mac?.version, "v0.17.5");
  }
});
test("corrupt or blocked storage does not break network downloads", async () => {
  for (const store of [
    memory("broken"),
    {
      getItem: () => {
        throw Error("blocked");
      },
      setItem: () => {
        throw Error("blocked");
      },
    },
  ]) {
    const result = await loadReleases({
      storage: store,
      now,
      request: async () => Response.json(releases),
    });
    assert.equal(result.stale, false);
  }
});
test("errors without a cache surface for a GitHub Releases fallback", async () => {
  await assert.rejects(
    loadReleases({ request: async () => new Response(null, { status: 429 }) }),
  );
});
