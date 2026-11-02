export type Platform = "mac" | "windows" | "unsupported";
export interface PlatformHint {
  platform?: string;
  userAgent?: string;
  maxTouchPoints?: number;
}
export function detectPlatform({
  platform = "",
  userAgent = "",
  maxTouchPoints = 0,
}: PlatformHint): Platform {
  // iPadOS can identify itself as a Mac. Desktop installers cannot run there.
  if (
    /Android|iPhone|iPad|iPod/i.test(userAgent) ||
    (/Mac/i.test(platform) && maxTouchPoints > 1)
  )
    return "unsupported";
  if (/Win/i.test(platform)) return "windows";
  if (/Mac/i.test(platform)) return "mac";
  if (/Linux|X11|CrOS|Android|iPhone|iPad|iPod/i.test(platform))
    return "unsupported";
  if (/Windows NT/i.test(userAgent)) return "windows";
  if (/Macintosh/i.test(userAgent)) return "mac";
  return "unsupported";
}
