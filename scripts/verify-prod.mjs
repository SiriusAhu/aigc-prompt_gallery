/**
 * 生产产物验证（含 basePath）。
 * 有视频时断言悬停播放，没视频时断言「无视频卡片不出现 video 元素、页面正常渲染」。
 *
 * 用法：node scripts/serve-out.mjs 5190 prompt-vault
 *       node scripts/verify-prod.mjs http://127.0.0.1:5190/prompt-vault/
 */
const BASE = process.argv[2] ?? "http://127.0.0.1:5190/prompt-vault/";
const CDP_PORT = 9333;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const list = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
const page = list.find((t) => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => {
  ws.onopen = res;
  ws.onerror = () => rej(new Error("ws connect failed"));
});

let seq = 0;
const pending = new Map();
const exceptions = [];
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id);
    pending.delete(m.id);
    if (m.error) reject(new Error(JSON.stringify(m.error)));
    else resolve(m.result);
    return;
  }
  if (m.method === "Runtime.exceptionThrown") {
    exceptions.push((m.params.exceptionDetails.exception?.description ?? "").slice(0, 200));
  }
};
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
const ev = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
  return r.result.value;
};

await send("Runtime.enable");
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 1100,
  deviceScaleFactor: 1,
  mobile: false,
});

// 1. 所有页面都能打开，链接都带 basePath
await send("Page.navigate", { url: `${BASE}c/camera/` });
await sleep(3000);

const pageInfo = await ev(`(() => {
  const cards = [...document.querySelectorAll('a[href*="/p/"]')];
  const badLinks = [...document.querySelectorAll('a[href^="/"]')]
    .map(a => a.getAttribute('href'))
    .filter(h => h && !h.startsWith(${JSON.stringify(new URL(BASE).pathname)}));
  return {
    cards: cards.length,
    withVideo: cards.filter(c => c.querySelector('video')).length,
    badLinks,
    title: document.querySelector('h1')?.textContent?.trim() ?? null,
  };
})()`);

// 2. 详情页
const firstId = await ev(`document.querySelector('a[href*="/p/"]')?.getAttribute('href') ?? null`);
const detailUrl = firstId ? new URL(firstId, BASE).href : `${BASE}p/none/`;
await send("Page.navigate", { url: detailUrl });
await sleep(2500);
const detail = await ev(`({
  title: document.querySelector('h1')?.textContent?.trim() ?? null,
  copies: [...document.querySelectorAll('button')].filter(b => b.textContent.includes('复制')).length,
  hasVideo: !!document.querySelector('video')
})`);

// 3. 有视频时跑一次悬停
let hover = { skipped: true, reason: "该页面没有带视频的卡片" };
if (pageInfo.withVideo > 0) {
  await send("Page.navigate", { url: `${BASE}c/camera/` });
  await sleep(2500);
  const center = await ev(`(() => {
    const card = [...document.querySelectorAll('a[href*="/p/"]')].find(c => c.querySelector('video'));
    const r = card.querySelector('[data-phase]').getBoundingClientRect();
    return { x: r.left + r.width/2, y: r.top + r.height/2 };
  })()`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 5, y: 5, pointerType: "mouse" });
  await sleep(150);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: center.x, y: center.y, pointerType: "mouse" });
  await sleep(1800);
  hover = await ev(`(() => {
    const card = [...document.querySelectorAll('a[href*="/p/"]')].find(c => c.querySelector('video'));
    const m = card.querySelector('[data-phase]');
    const v = m.querySelector('video');
    return { phase: m.dataset.phase, paused: v.paused, t: Number(v.currentTime.toFixed(2)) };
  })()`);
  hover.skipped = false;
}

const baseOk =
  pageInfo.cards > 0 &&
  pageInfo.badLinks.length === 0 &&
  detail.copies >= 2 &&
  exceptions.length === 0;
const pass = pageInfo.withVideo === 0 ? baseOk : baseOk && hover.phase === "playing" && hover.t > 0;

console.log(
  JSON.stringify(
    { pageInfo, detail, hover, exceptions: exceptions.slice(0, 3), PASS: pass },
    null,
    2,
  ),
);
ws.close();
process.exit(pass ? 0 : 1);
