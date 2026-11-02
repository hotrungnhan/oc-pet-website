export const REPOSITORY = "hotrungnhan/oc-pet-website";
export const REPO_URL = `https://github.com/${REPOSITORY}`;
export const RELEASES_URL = `${REPO_URL}/releases`;
export const AUTHOR_URL = "https://github.com/hotrungnhan";
export const CACHE_KEY = "oc-pet-releases-v1";
export const CACHE_TTL = 15 * 60 * 1000;
export interface Release {
  tag_name: string;
  published_at: string;
  draft?: boolean;
  prerelease?: boolean;
  assets: { name: string; browser_download_url: string; size: number }[];
}
export interface Download {
  url: string;
  version: string;
  name: string;
  size: number;
}
export type Downloads = Record<"mac" | "windows", Download | null>;
export interface ReleaseCache {
  releases: Release[];
  checkedAt: number;
  etag: string | null;
}
export interface ReleaseResult {
  downloads: Downloads;
  checkedAt: number;
  stale: boolean;
}
export function isReleaseList(value: unknown): value is Release[] {
  return (
    Array.isArray(value) &&
    value.every(
      (r) =>
        r &&
        typeof r.tag_name === "string" &&
        typeof r.published_at === "string" &&
        Array.isArray(r.assets) &&
        r.assets.every(
          (a: Release["assets"][number]) =>
            a &&
            typeof a.name === "string" &&
            typeof a.browser_download_url === "string" &&
            typeof a.size === "number",
        ),
    )
  );
}
export function selectDownloads(releases: Release[]): Downloads {
  const result: Downloads = { mac: null, windows: null };
  const published = releases
    .filter((r) => !r.draft && !r.prerelease)
    .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at));
  for (const platform of ["mac", "windows"] as const) {
    for (const release of published) {
      const asset = release.assets.find(
        (a) =>
          (platform === "mac" ? /\.dmg$/i : /-setup\.exe$/i).test(a.name) &&
          a.browser_download_url.startsWith(`${REPO_URL}/releases/download/`),
      );
      if (asset) {
        result[platform] = {
          url: asset.browser_download_url,
          version: release.tag_name,
          name: asset.name,
          size: asset.size,
        };
        break;
      }
    }
  }
  return result;
}
export function readCache(
  storage?: Pick<Storage, "getItem">,
): ReleaseCache | null {
  try {
    const cache = JSON.parse(storage?.getItem(CACHE_KEY) || "null");
    if (
      cache &&
      isReleaseList(cache.releases) &&
      Number.isFinite(cache.checkedAt) &&
      cache.checkedAt <= Date.now() &&
      (cache.etag === null || typeof cache.etag === "string")
    )
      return cache;
  } catch {
    /* Private browsing or a malformed cache must not block downloads. */
  }
  return null;
}
interface LoadOptions {
  storage?: Pick<Storage, "getItem" | "setItem">;
  request?: typeof fetch;
  now?: number;
  force?: boolean;
}
export async function loadReleases({
  storage,
  request = fetch,
  now = Date.now(),
  force = false,
}: LoadOptions = {}): Promise<ReleaseResult> {
  const cache = readCache(storage);
  const result = (entry: ReleaseCache, stale = false): ReleaseResult => ({
    downloads: selectDownloads(entry.releases),
    checkedAt: entry.checkedAt,
    stale,
  });
  if (!force && cache && now - cache.checkedAt < CACHE_TTL)
    return result(cache);
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
    };
    if (cache?.etag) headers["If-None-Match"] = cache.etag;
    const response = await request(
      `https://api.github.com/repos/${REPOSITORY}/releases?per_page=100`,
      { headers, signal: AbortSignal.timeout(10000) },
    );
    let next: ReleaseCache;
    if (response.status === 304 && cache) next = { ...cache, checkedAt: now };
    else {
      if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
      const data: unknown = await response.json();
      if (!isReleaseList(data)) throw new Error("Invalid release response");
      next = {
        releases: data,
        checkedAt: now,
        etag: response.headers.get("ETag"),
      };
    }
    try {
      storage?.setItem(CACHE_KEY, JSON.stringify(next));
    } catch {
      /* Downloads also work without storage. */
    }
    return result(next);
  } catch (error) {
    if (cache) return result(cache, true);
    throw error;
  }
}
