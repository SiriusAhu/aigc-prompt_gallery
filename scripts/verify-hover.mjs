/**
 * 用 Chrome DevTools Protocol 真实驱动浏览器，验证「悬停封面 → 视频起播」。
 * 不用 Puppeteer，靠 Node 内置 WebSocket + fetch 直连 CDP。
 *
 * 用法：node scripts/verify-hover.mjs <页面地址> [截图输出路径]
 */
const BASE = process.argv[2] ?? "http://127.0.0.1:5180/";
const SHOT = process.argv[3] ?? ".shots/hover.png";
const CDP_PORT = 9333;
const TITLE = "环绕推镜"; // demo 卡片的标题

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitFor(fn, timeout = 15000, label = "condition") {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const v = await fn();
    if (v) return v;
    await sleep(150);
  }
  throw new Error(`timeout waiting for ${label}`);
}

async function main() {
  const targets = await waitFor(
    async () => {
      try {
        const r = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
        const list = await r.json();
        return list.find((t) => t.type === "page") ?? null;
      } catch {
        return null;
      }
    },
    20000,
    "chrome devtools endpoint",
  );

  const ws = new WebSocket(targets.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = () => rej(new Error("ws connect failed"));
  });

  let seq = 0;
  const pending = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else resolve(msg.result);
    }
  };
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++seq;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

  const evaluate = async (expression) => {
    const r = await send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
    return r.result.value;
  };

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1200,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Page.navigate", { url: BASE });
  await sleep(1200);

  // 等 React 挂载出卡片
  const cardCount = await waitFor(
    async () => {
      const n = await evaluate(`document.querySelectorAll('article[role="button"]').length`);
      return n > 0 ? n : 0;
    },
    15000,
    "cards to mount",
  );

  // 找到 demo 卡片，并从 DOM 结构上确认「视频容器 + 封面图 + 惰性视频」
  const pre = await evaluate(`(() => {
    const cards = [...document.querySelectorAll('article[role="button"]')];
    const card = cards.find(c => c.textContent.includes(${JSON.stringify(TITLE)}));
    if (!card) return { found: false };
    const media = card.querySelector('[data-phase]');
    const video = media?.querySelector('video');
    const img = media?.querySelector('img');
    const r = media.getBoundingClientRect();
    return {
      found: true,
      phase: media.dataset.phase,
      hasVideo: !!video,
      videoPreload: video?.preload ?? null,
      videoPaused: video?.paused ?? null,
      coverLoaded: img ? img.complete && img.naturalWidth > 0 : false,
      coverVisible: img ? getComputedStyle(img).opacity : null,
      videoVisible: video ? getComputedStyle(video).opacity : null,
      center: { x: r.left + r.width / 2, y: r.top + r.height / 2 },
    };
  })()`);

  if (!pre.found) throw new Error("找不到 demo 卡片");

  // 真实鼠标移入
  await send("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x: pre.center.x,
    y: pre.center.y,
    button: "none",
    pointerType: "mouse",
  });
  await sleep(400);
  await send("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x: pre.center.x + 2,
    y: pre.center.y + 2,
    button: "none",
    pointerType: "mouse",
  });

  // 等视频真的进入播放态
  const playing = await waitFor(
    async () => {
      const s = await evaluate(`(() => {
        const cards = [...document.querySelectorAll('article[role="button"]')];
        const card = cards.find(c => c.textContent.includes(${JSON.stringify(TITLE)}));
        const media = card?.querySelector('[data-phase]');
        const video = media?.querySelector('video');
        if (!media || !video) return null;
        return {
          phase: media.dataset.phase,
          paused: video.paused,
          currentTime: video.currentTime,
          readyState: video.readyState,
        };
      })()`);
      if (!s) return null;
      return s.phase === "playing" && s.currentTime > 0 && !s.paused ? s : null;
    },
    8000,
    "video to start playing on hover",
  );

  // 截图留证
  const shot = await send("Page.captureScreenshot", { format: "png" });
  const fs = await import("node:fs");
  fs.mkdirSync(".shots", { recursive: true });
  fs.writeFileSync(SHOT, Buffer.from(shot.data, "base64"));

  // 移出后应暂停并回到片头
  await send("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x: 5,
    y: 5,
    button: "none",
    pointerType: "mouse",
  });
  await sleep(500);
  const after = await evaluate(`(() => {
    const cards = [...document.querySelectorAll('article[role="button"]')];
    const card = cards.find(c => c.textContent.includes(${JSON.stringify(TITLE)}));
    const media = card.querySelector('[data-phase]');
    const video = media.querySelector('video');
    const img = media.querySelector('img');
    return {
      phase: media.dataset.phase,
      paused: video.paused,
      currentTime: video.currentTime,
      videoOpacity: getComputedStyle(video).opacity,
      coverOpacity: getComputedStyle(img).opacity,
    };
  })()`);

  const ok =
    pre.hasVideo &&
    pre.videoPreload === "none" &&
    pre.phase === "cover" &&
    pre.coverLoaded &&
    Number(pre.coverVisible) > 0.9 &&
    playing.phase === "playing" &&
    after.phase === "cover" &&
    after.paused &&
    Number(after.videoOpacity) < 0.1 &&
    Number(after.coverOpacity) > 0.9;

  console.log(
    JSON.stringify(
      {
        cards: cardCount,
        beforeHover: {
          phase: pre.phase,
          preload: pre.videoPreload,
          coverLoaded: pre.coverLoaded,
          coverOpacity: pre.coverVisible,
          videoOpacity: pre.videoVisible,
        },
        duringHover: playing,
        afterLeave: after,
        screenshot: SHOT,
        PASS: ok,
      },
      null,
      2,
    ),
  );

  ws.close();
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
