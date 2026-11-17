const DEV_PREFIX = ((import.meta.env.VITE_ASSET_BASE as string | undefined) ?? "__assets__")
  .replace(/^\/+|\/+$/g, "");

/** 把数据里的相对媒体路径解析成可访问的 URL */
export function assetUrl(rel?: string): string | undefined {
  if (!rel) return undefined;
  if (/^(https?:)?\/\//i.test(rel) || rel.startsWith("data:") || rel.startsWith("blob:")) {
    return rel;
  }
  const clean = rel.replace(/^\/+/, "");
  if (import.meta.env.DEV) return `/${DEV_PREFIX}/${clean}`;
  const base = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${base}media/${clean}`;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 非安全上下文（http 局域网访问）时 clipboard API 不可用，退回 execCommand
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
