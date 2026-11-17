/**
 * 悬停播放验证。自动寻找页面上第一张「带视频」的卡片，没有视频则明确跳过。
 *
 * 用法：先起 dev server 与开了调试端口的 Chrome，然后
 *   node scripts/verify-hover.mjs http://127.0.0.1:3000/ [页面路径...]
 */
const BASE = process.argv[2] ?? "http://127.0.0.1:3000/";
const PATHS = process.argv.slice(3).length ? process.argv.slice(3) : ["/", "/all/"];
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
const errors = [];
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
    errors.push((m.params.exceptionDetails.exception?.description ?? "").slice(0, 200));
  }
};
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
const ev = async (expression) => {
  const r = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
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

/** 在页面上找第一张带 <video> 的卡片，返回它的位置与初始状态 */
async function findVideoCard() {
  return ev(`(() => {
    const cards = [...document.querySelectorAll('a[href*="/p/"]')];
    const card = cards.find(c => c.querySelector('video'));
    if (!card) return null;
    const m = card.querySelector('[data-phase]');
    const v = m.querySelector('video');
    const img = m.querySelector('img');
    const r = m.getBoundingClientRect();
    return {
      title: card.querySelector('h3')?.textContent?.trim() ?? null,
      phase: m.dataset.phase,
      preload: v.preload,
      coverLoaded: img ? img.complete && img.naturalWidth > 0 : false,
      center: { x: r.left + r.width / 2, y: r.top + r.height / 2 },
    };
  })()`);
}

const results = [];
let skipped = 0;

for (const path of PATHS) {
  await send("Page.navigate", { url: new URL(path, BASE).href });
  await sleep(3000);

  const card = await findVideoCard();
  if (!card) {
    skipped++;
    results.push({ path, skipped: true, reason: "页面上没有带视频的卡片" });
    continue;
  }

  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 5, y: 5, pointerType: "mouse" });
  await sleep(150);
  await send("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x: card.center.x,
    y: card.center.y,
    pointerType: "mouse",
  });
  await sleep(1600);

  const during = await ev(`(() => {
    const card = [...document.querySelectorAll('a[href*="/p/"]')].find(c => c.querySelector('video'));
    const m = card.querySelector('[data-phase]');
    const v = m.querySelector('video');
    return { phase: m.dataset.phase, paused: v.paused, t: Number(v.currentTime.toFixed(2)) };
  })()`);

  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 5, y: 5, pointerType: "mouse" });
  await sleep(500);
  const after = await ev(`(() => {
    const card = [...document.querySelectorAll('a[href*="/p/"]')].find(c => c.querySelector('video'));
    const m = card.querySelector('[data-phase]');
    const v = m.querySelector('video');
    const img = m.querySelector('img');
    return {
      phase: m.dataset.phase,
      paused: v.paused,
      t: Number(v.currentTime.toFixed(2)),
      videoOpacity: getComputedStyle(v).opacity,
      coverOpacity: img ? getComputedStyle(img).opacity : null,
    };
  })()`);

  const pass =
    card.phase === "cover" &&
    card.preload === "none" &&
    during.phase === "playing" &&
    during.t > 0 &&
    after.phase === "cover" &&
    after.paused &&
    after.t === 0 &&
    Number(after.videoOpacity) < 0.1 &&
    (after.coverOpacity === null || Number(after.coverOpacity) > 0.9);

  results.push({ path, title: card.title, before: card, during, after, PASS: pass });
}

const tested = results.filter((r) => !r.skipped);
const pass = tested.every((r) => r.PASS) && (tested.length > 0 || skipped === results.length);

console.log(
  JSON.stringify(
    {
      results,
      summary: {
        tested: tested.length,
        skipped,
        allPass: tested.every((r) => r.PASS),
        note: tested.length === 0 ? "当前没有任何带视频的模板，悬停逻辑无从验证" : undefined,
      },
      exceptions: errors.slice(0, 3),
      PASS: pass,
    },
    null,
    2,
  ),
);

ws.close();
process.exit(pass ? 0 : 1);
