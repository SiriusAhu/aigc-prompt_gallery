/**
 * 交互回归：深链弹窗、搜索、分类筛选、复制按钮。
 * 用法：先起 dev server，再 node <本脚本> <地址>
 */
const BASE = process.argv[2] ?? "http://127.0.0.1:5180/";
const CDP_PORT = 9333;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const list = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
const page = list.find((t) => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => {
  ws.onopen = res;
  ws.onerror = () => rej(new Error("ws fail"));
});

let seq = 0;
const pending = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id);
    pending.delete(m.id);
    if (m.error) reject(new Error(JSON.stringify(m.error)));
    else resolve(m.result);
  }
};
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
const evalJs = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
  return r.result.value;
};

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: 1400,
  height: 1100,
  deviceScaleFactor: 1,
  mobile: false,
});
await send("Page.navigate", { url: BASE });
await sleep(1500);

const results = {};

// 1) 深链直接打开详情弹窗
await send("Page.navigate", { url: `${BASE}#p/style-film-grain` });
await sleep(1500);
results.deepLink = await evalJs(`(() => {
  const dlg = document.querySelector('[role="dialog"]');
  return {
    open: !!dlg,
    title: dlg?.querySelector('h2')?.textContent ?? null,
    hasPrompt: dlg?.textContent.includes('16mm film') ?? false,
  };
})()`);

// 2) Esc 关闭并清掉 hash
await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
await sleep(400);
results.escClose = await evalJs(`({
  open: !!document.querySelector('[role="dialog"]'),
  hash: location.hash
})`);

// 3) 搜索过滤
results.search = await evalJs(`(() => {
  const input = document.querySelector('input[placeholder^="搜索"]');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(input, 'dolly');
  input.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
})()`);
await sleep(500);
results.searchResult = await evalJs(`({
  cards: document.querySelectorAll('article[role="button"]').length,
  allMatch: [...document.querySelectorAll('article[role="button"]')]
    .every(c => c.textContent.toLowerCase().includes('dolly'))
})`);

// 4) 清空搜索，点分类筛选
await evalJs(`(() => {
  const input = document.querySelector('input[placeholder^="搜索"]');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(input, '');
  input.dispatchEvent(new Event('input', { bubbles: true }));
})()`);
await sleep(300);
results.categoryFilter = await evalJs(`(() => {
  const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('光影'));
  btn?.click();
  return btn?.textContent ?? null;
})()`);
await sleep(400);
// 用媒体区左上角的分类角标判定，避免正文里的英文提示词误判
results.categoryResult = await evalJs(`(() => {
  const cards = [...document.querySelectorAll('article[role="button"]')];
  const pills = cards.map(c => c.querySelector('span[style*="color"]')?.parentElement?.textContent?.trim() ?? '');
  return { cards: cards.length, pills };
})()`);
// 5) 无结果时的空状态 + 清除按钮
await evalJs(`(() => {
  const input = document.querySelector('input[placeholder^="搜索"]');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(input, 'zzz-不可能匹配');
  input.dispatchEvent(new Event('input', { bubbles: true }));
})()`);
await sleep(400);
results.emptyState = await evalJs(`(() => {
  const txt = document.body.textContent;
  return {
    showsEmpty: txt.includes('没有匹配的模板'),
    hasReset: [...document.querySelectorAll('button')].some(b => b.textContent.includes('清除全部筛选')),
    cards: document.querySelectorAll('article[role="button"]').length,
  };
})()`);

const ok =
  results.deepLink.open &&
  results.deepLink.title.includes("胶片") &&
  results.deepLink.hasPrompt &&
  results.escClose.open === false &&
  results.escClose.hash === "" &&
  results.searchResult.cards > 0 &&
  results.searchResult.cards < 12 &&
  results.searchResult.allMatch &&
  results.categoryResult.cards === 2 &&
  results.categoryResult.pills.every((p) => p.includes("光影")) &&
  results.emptyState.showsEmpty &&
  results.emptyState.hasReset &&
  results.emptyState.cards === 0;

console.log(JSON.stringify({ ...results, PASS: ok }, null, 2));
ws.close();
process.exit(ok ? 0 : 1);
