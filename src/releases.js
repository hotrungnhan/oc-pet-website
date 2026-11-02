export const REPOSITORY = "hotrungnhan/oc-pet-website";
export const REPO_URL = `https://github.com/${REPOSITORY}`;
export const RELEASES_URL = `${REPO_URL}/releases`;
// Find the newest available installer per platform, even when versions differ.
export function selectDownloads(releases) {
  const published = releases
    .filter((r) => !r.draft && !r.prerelease)
    .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at));
  return Object.fromEntries(
    ["mac", "windows"].map((platform) => {
      for (const release of published) {
        const asset = (release.assets || []).find(
          (a) =>
            (platform === "mac" ? /\.dmg$/i : /-setup\.exe$/i).test(a.name) &&
            a.browser_download_url?.startsWith(
              `${REPO_URL}/releases/download/`,
            ),
        );
        if (asset)
          return [
            platform,
            {
              url: asset.browser_download_url,
              version: release.tag_name,
              name: asset.name,
              size: asset.size,
            },
          ];
      }
      return [platform, null];
    }),
  );
}
