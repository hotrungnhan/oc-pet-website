import { test } from "node:test";
import assert from "node:assert/strict";
import { selectDownloads, REPO_URL } from "./releases.js";
const release = (tag, date, names, extra = {}) => ({
  tag_name: tag,
  published_at: date,
  assets: names.map((name) => ({
    name,
    size: 1234,
    browser_download_url: `${REPO_URL}/releases/download/${tag}/${name}`,
  })),
  ...extra,
});
test("selects newest installer independently per platform", () => {
  const downloads = selectDownloads([
    release("v0.17.4", "2026-11-01", [
      "OCPet-0.17.4.dmg",
      "OCPet-0.17.4-setup.exe",
    ]),
    release("v0.17.5", "2026-11-02", ["OCPet-0.17.5.dmg"]),
    release("v0.18", "2026-11-03", ["OCPet-0.18-setup.exe"], {
      prerelease: true,
    }),
  ]);
  assert.equal(downloads.mac.version, "v0.17.5");
  assert.equal(downloads.windows.version, "v0.17.4");
});
test("empty releases and drafts never invent download URLs", () => {
  assert.deepEqual(selectDownloads([]), { mac: null, windows: null });
  assert.equal(
    selectDownloads([release("v1", "2026-11-02", ["a.dmg"], { draft: true })])
      .mac,
    null,
  );
});
test("ignores download links outside this repository", () => {
  assert.equal(
    selectDownloads([
      {
        published_at: "2026-11-02",
        assets: [
          { name: "a.dmg", browser_download_url: "https://example.com/a.dmg" },
        ],
      },
    ]).mac,
    null,
  );
});
