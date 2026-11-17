/**
 * 媒体路径解析。
 * 素材由 scripts/sync-media.mjs 同步到 public/media/，所以 URL 固定是 /media/<rel>，
 * 只需要在 GitHub Pages 子路径部署时加上 basePath。
 */
const BASE_PATH = (
  (process.env.NEXT_PUBLIC_BASE_PATH as string | undefined) ??
  process.env.NEXT_PUBLIC_BASE_PATH ??
  ""
).replace(/\/+$/, "");

export function assetUrl(rel?: string): string | undefined {
  if (!rel) return undefined;
  if (/^(https?:)?\/\//i.test(rel) || rel.startsWith("data:") || rel.startsWith("blob:")) {
    return rel;
  }
  const clean = rel.replace(/^\/+/, "");
  return `${BASE_PATH}/media/${clean}`;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}
