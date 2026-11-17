# PromptVault

AI 视频提示词库。把有效的运镜、光位、材质和参数沉淀成可复用模板，悬停看效果，点开复制。

纯前端静态站，零后端，部署在 GitHub Pages。

## 它解决什么问题

学 AI 视频最大的损耗不是想不出提示词，而是**想出来的好词没有沉淀**。跑出一个好镜头之后，提示词散在聊天记录、备忘录、截图里，下次要用只能重想。PromptVault 就是一个本地优先、可版本管理的提示词仓库：

- 每条模板带正向/负向提示词、画幅时长帧率参数、**实测备注**（什么会崩、什么有效）
- 卡片封面上悬停 → 当场播放对应的生成视频，看完就知道值不值得抄
- 分类、标签、全文搜索、深链分享（`#p/<id>`），复制一键完成
- 数据是一个 TS 数组，改一个文件就加一条模板，git 记录你的积累过程

## 技术栈

- **Vite 8** + **React 19** + **TypeScript 7**
- **Tailwind CSS 4**（通过 `@tailwindcss/vite`，无 PostCSS 配置）
- 无路由库：深链用 `location.hash`，静态托管零配置

## 快速开始

```bash
pnpm install
pnpm dev          # http://127.0.0.1:5173
pnpm build        # 校验数据 → 类型检查 → 打包
pnpm preview      # 本地预览构建产物
```

`pnpm dev` 和 `pnpm build` 都会先跑 `scripts/validate-prompts.mjs`。id 重复、分类拼错、媒体路径写错会**直接中断**并指出是哪一条，不会让你在浏览器里对着白屏猜。

## 素材放在哪

这是唯一需要理解一次的约定：

| 位置 | 用途 | 进 git |
|---|---|---|
| `AI_Video/assets/`（仓库上一级） | 日常素材库，原始视频、大图 | ✗ |
| `prompt-vault/assets/`（仓内） | 发布用，克隆即可运行 | ✓（视频默认忽略） |

开发时默认读**上一级**的 `AI_Video/assets/`，这样素材可以跟你其它的 AI 视频实验放在一起，不用塞进页面仓库。CI 和克隆场景没有上一级，自动切到**仓内** `assets/`。

需要覆盖时：

```bash
ASSETS_DIR=assets pnpm dev      # 强制用仓内素材
ASSETS_DIR=/d/clips pnpm dev    # 指向任意目录
```

数据里的路径都相对于素材库根目录：

```ts
media: { cover: "covers/foo.png", video: "videos/foo.mp4" }
```

也可以填 `https://...` 外链，运行时不会被当成本地路径。

> **关于视频体积**：GitHub 单文件上限 100MB。`assets/**/*.mp4` 默认被 `.gitignore` 忽略，只有 `demo.mp4` 放行。要发布真实视频，要么压到几 MB 后手动 `git add -f`，要么在数据里填外链。原始大文件放 `assets/raw/`，那里整体被忽略。

## 加一条模板

在 `src/data/prompts.ts` 的 `PROMPTS` 里加一项：

```ts
{
  id: "camera-whip-pan",              // 唯一，用作 #p/<id>
  title: "甩镜转场：撞击感",
  category: "camera",                 // camera|light|material|structure|style|negative|workflow
  models: ["Kling 2.1"],
  prompt: "A violent whip pan from left to right ...",
  negative: "motion blur mush, frame tearing",
  params: { aspect: "16:9", duration: 3, fps: 30 },
  tags: ["甩镜", "转场"],
  notes: "实测 3 秒内甩 120° 最稳，超过会糊成一片。",
  added: "2026-11-17",
  media: { cover: "covers/whip-pan.png", video: "videos/whip-pan.mp4" },
}
```

`media` 整个省略也行 —— 卡片会退化成分类色块 + 文字，不会出现灰框或破图。

## 交互设计要点

- **封面优先**：默认只渲染封面图，视频 `preload="none"`。首屏不加载任何视频字节，几十条卡片也不会卡。
- **悬停才起播**：鼠标进入或键盘聚焦时 `load()` + `play()`，移出立刻 `pause()` 并归零。
- **失败不黑屏**：只有真实解码失败或 2.5 秒未出画才判定素材不可用并退回封面；浏览器拒绝自动播放（省电模式等）不算素材损坏，静默回退。
- **触摸设备不自动播**：`(hover: hover)` 不成立时跳过起播，避免点按卡片时意外出声。
- **Range 支持**：开发期素材中间件实现了 `206 Partial Content`，视频可以正常 seek。

## 数据校验

```bash
pnpm validate
```

检查 id 唯一性、分类合法性、画幅/时长/日期格式、模型非空，以及媒体文件是否真实存在、是否越出素材库目录。媒体文件缺失只警告（页面有兜底），路径穿越直接报错。

## 验证悬停行为

不靠肉眼看截图，用 CDP 真驱动浏览器。先起 dev server，再启动一个开了调试端口的 Chrome：

```bash
chrome --headless=new --remote-debugging-port=9333 --user-data-dir=.chrome-tmp about:blank
pnpm verify:hover              # 断言悬停起播、移出暂停归零
pnpm verify:ui                 # 断言深链弹窗、Esc 关闭、搜索、分类筛选、空状态
```

两个脚本都会输出 JSON 结果，任一断言失败即退出码 1，可以直接挂进 CI。

- `verify:hover` 检查四个状态：初始是封面且视频 `preload=none`、悬停后 `currentTime` 在增长、移出后暂停并归零、封面恢复不透明。
- `verify:ui` 检查 `#p/<id>` 深链直接开弹窗、Esc 关闭并清空 hash、搜索命中数、分类筛选只留对应卡片、无结果时出现空状态和清除按钮。

检查构建产物（生产模式，含 base 路径）：

```bash
BASE=/prompt-vault/ ASSETS_DIR=assets pnpm build
node scripts/serve-dist.mjs 5190 prompt-vault
```

> `vite preview` 在自定义 `base` 下会把 `.js` 请求错误地回退成 `index.html`，所以这里用 `scripts/serve-dist.mjs` 做产物验证，它对 `dist` 的 MIME 和 Range 处理是正确的。

## 部署到 GitHub Pages

仓库里已经带好 `.github/workflows/deploy.yml`：

1. 仓库 Settings → Pages → Source 选 **GitHub Actions**
2. push 到 `main`
3. 访问 `https://<user>.github.io/<repo>/`

`base` 由 workflow 用仓库名自动注入（`/<repo>/`）。**不要**在 `vite.config.ts` 里写死 base，否则换仓库名就全站 404。

## 目录

```
src/
├─ components/
│  ├─ HoverVideo.tsx   封面→视频的状态机，含失败回退
│  ├─ PromptCard.tsx   卡片
│  ├─ FilterBar.tsx    搜索 / 分类 / 标签 / 排序
│  └─ DetailModal.tsx  详情弹窗，逐段复制
├─ data/
│  ├─ prompts.ts       ← 你唯一需要编辑的内容文件
│  ├─ categories.ts    分类元信息（图标、配色）
│  └─ types.ts         类型定义
├─ lib/asset.ts        媒体路径解析 + 剪贴板
└─ App.tsx             筛选状态与深链
scripts/
├─ validate-prompts.mjs  数据自检（dev/build 前自动跑）
├─ verify-hover.mjs      CDP 悬停行为验证
├─ verify-ui.mjs         CDP 交互回归（深链/搜索/筛选）
└─ serve-dist.mjs        产物静态服务，验证生产构建
```

## 已知边界

- 没有后端，所以没有登录、收藏同步、多人协作。数据在文件里，靠 git 协作。
- 搜索是纯前端 linear scan，几千条以内无感；再大需要建索引。
- 详情弹窗手写了焦点管理，没有做完整的 focus trap（Tab 可以走到背景元素）。
