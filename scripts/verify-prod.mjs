const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BASE = process.argv[2] ?? "http://127.0.0.1:5190/prompt-vault/";
const list = await (await fetch("http://127.0.0.1:9333/json/list")).json();
const p = list.find((t) => t.type === "page");
const ws = new WebSocket(p.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let i = 0;
const pend = new Map();
const errs = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pend.has(m.id)) {
    pend.get(m.id)(m.result);
    pend.delete(m.id);
    return;
  }
  if (m.method === "Runtime.exceptionThrown") {
    errs.push((m.params.exceptionDetails.exception?.description ?? "").slice(0, 200));
  }
};
const send = (method, params = {}) =>
  new Promise((res) => {
    const id = ++i;
    pend.set(id, res);
    ws.send(JSON.stringify({ id, method, params }));
  });
const ev = async (x) =>
  (await send("Runtime.evaluate", { expression: x, returnByValue: true, awaitPromise: true })).result
    .value;

const CARD = `[...document.querySelectorAll('a[href*="/p/"]')].find(a => a.textContent.includes('环绕推镜'))`;

await send("Runtime.enable");
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 1100,
  deviceScaleFactor: 1,
  mobile: false,
});
await send("Page.navigate", { url: `${BASE}c/camera/` });
await sleep(4000);

const before = await ev(`(() => {
  const m = ${CARD}.querySelector('[data-phase]');
  const v = m.querySelector('video');
  const img = m.querySelector('img');
  const r = m.getBoundingClientRect();
  return {
    phase: m.dataset.phase,
    preload: v?.preload ?? null,
    videoSrc: v?.getAttribute('src') ?? null,
    coverSrc: img?.getAttribute('src') ?? null,
    coverLoaded: img ? img.complete && img.naturalWidth > 0 : false,
    center: { x: r.left + r.width/2, y: r.top + r.height/2 },
  };
})()`);

await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 5, y: 5, pointerType: "mouse" });
await sleep(150);
await send("Input.dispatchMouseEvent", {
  type: "mouseMoved",
  x: before.center.x,
  y: before.center.y,
  pointerType: "mouse",
});
await sleep(1800);
const during = await ev(`(() => {
  const m = ${CARD}.querySelector('[data-phase]');
  const v = m.querySelector('video');
  return { phase: m.dataset.phase, paused: v.paused, t: Number(v.currentTime.toFixed(2)) };
})()`);

// 详情页也点进去看看
await send("Page.navigate", { url: `${BASE}p/camera-orbit-push-in/` });
await sleep(3000);
const detail = await ev(`({
  title: document.querySelector('h1')?.textContent ?? null,
  hasVideo: !!document.querySelector('video'),
  videoSrc: document.querySelector('video')?.getAttribute('src') ?? null,
  copies: [...document.querySelectorAll('button')].filter(b => b.textContent.includes('复制')).length
})`);

const pass =
  before.phase === "cover" &&
  before.preload === "none" &&
  before.videoSrc?.includes("/prompt-vault/media/") &&
  before.coverLoaded &&
  during.phase === "playing" &&
  during.t > 0 &&
  detail.hasVideo &&
  detail.videoSrc?.includes("/prompt-vault/media/") &&
  detail.copies >= 3;

console.log(JSON.stringify({ before, during, detail, exceptions: errs.slice(0, 3), PASS: pass }, null, 2));
ws.close();
process.exit(pass ? 0 : 1);
