const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
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
    errs.push("EXCEPTION " + (m.params.exceptionDetails.exception?.description ?? "").slice(0, 200));
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

const CARD = `[...document.querySelectorAll('a[href^="/p/"]')].find(a => a.textContent.includes('环绕推镜'))`;

await send("Runtime.enable");
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 1100,
  deviceScaleFactor: 1,
  mobile: false,
});

async function testPage(url, label) {
  await send("Page.navigate", { url });
  await sleep(3500);

  const before = await ev(`(() => {
    const m = ${CARD}.querySelector('[data-phase]');
    const v = m.querySelector('video');
    const img = m.querySelector('img');
    return {
      phase: m.dataset.phase,
      preload: v?.preload ?? null,
      coverLoaded: img ? img.complete && img.naturalWidth > 0 : false,
      center: (() => { const r = m.getBoundingClientRect(); return { x: r.left + r.width/2, y: r.top + r.height/2 }; })(),
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
  await sleep(1600);

  const during = await ev(`(() => {
    const m = ${CARD}.querySelector('[data-phase]');
    const v = m.querySelector('video');
    return { phase: m.dataset.phase, paused: v.paused, t: Number(v.currentTime.toFixed(2)) };
  })()`);

  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 5, y: 5, pointerType: "mouse" });
  await sleep(500);
  const after = await ev(`(() => {
    const m = ${CARD}.querySelector('[data-phase]');
    const v = m.querySelector('video');
    const img = m.querySelector('img');
    return {
      phase: m.dataset.phase,
      paused: v.paused,
      t: Number(v.currentTime.toFixed(2)),
      videoOpacity: getComputedStyle(v).opacity,
      coverOpacity: getComputedStyle(img).opacity,
    };
  })()`);

  return { label, before, during, after };
}

const results = [];
results.push(await testPage("http://127.0.0.1:3000/c/camera/", "category"));
results.push(await testPage("http://127.0.0.1:3000/", "home"));

const pass = results.every(
  (r) =>
    r.before.phase === "cover" &&
    r.before.preload === "none" &&
    r.during.phase === "playing" &&
    r.during.t > 0 &&
    r.after.phase === "cover" &&
    r.after.paused &&
    r.after.t === 0 &&
    Number(r.after.videoOpacity) < 0.1 &&
    Number(r.after.coverOpacity) > 0.9,
);

console.log(JSON.stringify({ results, PAss: pass, exceptions: errs.slice(0, 3) }, null, 2));
ws.close();
process.exit(pass ? 0 : 1);
