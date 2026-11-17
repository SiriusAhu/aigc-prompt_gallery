# PromptVault

AI 视频提示词库。把有效的运镜、光位、材质和参数沉淀成可复用模板，按分类浏览，悬停看效果，点开复制。

Next.js 静态导出，零后端，部署在 GitHub Pages。

## 它解决什么问题

学 AI 视频最大的损耗不是想不出提示词，而是**想出来的好词没有沉淀**。跑出一个好镜头之后，提示词散在聊天记录、备忘录、截图里，下次要用只能重想。PromptVault 是一个本地优先、可版本管理的提示词仓库：

- 每条模板带正向/负向提示词、画幅时长帧率参数、**实测备注**（什么会崩、什么有效）
- 卡片封面上悬停 → 当场播放对应的生成视频
- 分类是真实路由（`/c/camera`、`/c/light`），每条模板有独立详情页（`/p/<id>`），可分享可收藏
- 数据是一个 TS 数组，改一个文件就加一条模板，git 记录你的积累过程

## 技术栈

| 层 | 选择 | 原因 |
|---|---|---|
| 框架 | **Next.js 16（App Router）** | 文件即路由、真实多页面、静态导出 |
| 输出 | **`output: "export"`** | GitHub Pages 只能托管静态文件 |
| 样式 | **Tailwind CSS 4**（PostCSS 插件） | 无运行时，构建期生成 |
| 路由 | App Router + `generateStaticParams` | 21 个页面全部预渲染成 HTML |
| 数据 | 单个 TS 模块 | 无需 CMS/数据库，git 即版本管理 |

筛选状态放在 URL query（`?q=` `?tag=` `?sort=`），刷新和分享都不丢。

## 快速开始

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # 校验数据 → 同步媒体 → 静态导出到 out/
pnpm validate     # 只跑数据校验
```

> **必须用 `localhost` 或 `127.0.0.1` 访问 dev server**。两者都已在 `next.config.ts` 的 `allowedDevOrigins` 里放行；换成局域网 IP 访问会触发 Next 的跨域拦截，导致页面不 hydrate、所有交互失效。

## 页面 / 路由

| 路由 | 内容 |
|---|---|
| `/` | 首页：分类入口、精选模板 |
| `/c/camera` 等 7 个 | 各分类的模板列表 |
| `/p/<id>` | 单条模板详情，含视频、完整提示词、参数、复制 |
| `/all` | 全部模板 + 搜索/标签/排序 |
| `404` | 兜底页 |

## 素材放在哪

这是唯一需要理解一次的约定：

| 位置 | 用途 | 进 git |
|---|---|---|
| `AI_Video/assets/`（仓库上一级） | 日常素材库，原始视频、大图 | ✗ |
| `prompt-vault/assets/`（仓内） | 发布用、CI 用，克隆即可运行 | ✓（视频默认忽略） |

`scripts/sync-media.mjs` 会读取 `src/data/prompts.ts` 里被引用到的媒体路径，从素材库复制到 `public/media/`，`next build` 再把它原样带进 `out/`。开发时默认读**上一级**的 `AI_Video/assets/`；CI 和克隆场景没有上一级，自动切到**仓内** `assets/`。

覆盖方式：

```bash
ASSETS_DIR=assets pnpm dev        # 强制用仓内素材
ASSETS_DIR=/d/clips pnpm dev      # 指向任意目录
```

数据里的路径都相对于素材库根目录：

```ts
media: { cover: "covers/foo.png", video: "videos/foo.mp4" }
```

也可以填 `https://...` 外链，运行时不会被当成本地路径。

> **关于视频体积**：GitHub 单文件上限 100MB。仓内 `assets/**/*.mp4` 默认被 `.gitignore` 忽略，只有 `demo.mp4` 放行。要发布真实视频，要么压到几 MB 后手动 `git add -f`，要么在数据里填外链。原始大文件放 `assets/raw/`。

## 加一条模板

在 `src/data/prompts.ts` 的 `PROMPTS` 里加一项，`generateStaticParams` 会自动为它生成详情页：

```ts
{
  id: "camera-whip-pan",              // 唯一，同时是 URL 片段
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

## 悬停播放的实现要点

- **封面优先**：默认只渲染封面图，视频 `preload="none"`。首屏不加载任何视频字节。
- **悬停才起播**：鼠标进入或键盘聚焦时 `load()` + `play()`，移出立刻 `pause()` 并归零。
- **失败不黑屏**：只有真实解码失败或 2.5 秒未出画才判定不可用并退回封面；浏览器拒绝自动播放不算损坏。
- **触摸设备不自动播**：`(hover: hover)` 不成立时跳过起播。
- **Range 支持**：`serve-out.mjs` 与生产环境都对 `206 Partial Content` 做了处理，视频可 seek。

## 验证

两个 CDP 脚本，真驱动浏览器，输出 JSON 断言，失败退出码 1：

```bash
# 1. 起 dev server
pnpm dev
# 2. 起一个开了调试端口的 Chrome
chrome --headless=new --remote-debugging-port=9333 --user-data-dir=.chrome-tmp about:blank
# 3. 跑验证
node scripts/verify-hover.mjs http://127.0.0.1:3000/      # 首页 + 分类页的悬停起播/暂停归零
```

验证生产产物（含 basePath）：

```bash
BASE=/prompt-vault/ ASSETS_DIR=assets pnpm build
node scripts/serve-out.mjs 5190 prompt-vault
node scripts/verify-prod.mjs http://127.0.0.1:5190/prompt-vault/
```

`verify-prod.mjs` 会断言：媒体 URL 带 basePath 前缀、封面加载成功、悬停后视频真的在播、详情页有视频和复制按钮。

## 部署到 GitHub Pages

`.github/workflows/deploy.yml` 已配好：

1. 仓库 Settings → Pages → Source 选 **GitHub Actions**
2. push 到 `main`
3. 访问 `https://<user>.github.io/<repo>/`

`basePath` 由 workflow 用仓库名自动注入。**不要**在 `next.config.ts` 里写死，否则换仓库名就全站 404。`postbuild.mjs` 会自动写入 `.nojekyll`，否则 Pages 的 Jekyll 会吞掉 `_next/` 目录。

## 目录

```
src/
├─ app/
│  ├─ layout.tsx          全局布局：字体、导航、页脚
│  ├─ page.tsx            首页
│  ├─ all/page.tsx        全部模板
│  ├─ c/[slug]/page.tsx   分类页（generateStaticParams ×7）
│  ├─ p/[id]/page.tsx     详情页（generateStaticParams ×12）
│  ├─ not-found.tsx       404
│  └─ globals.css         Tailwind 主题变量
├─ components/
│  ├─ HoverVideo.tsx      封面→视频状态机，含失败回退
│  ├─ PromptCard.tsx      卡片
│  ├─ Gallery.tsx         搜索/标签/排序，URL 同步
│  ├─ CopyButton.tsx      复制提示词/全部
│  ├─ SiteHeader.tsx      顶栏导航（真实 Link 跳页）
│  └─ SiteFooter.tsx
├─ data/
│  ├─ prompts.ts          ← 你唯一需要编辑的内容文件
│  ├─ categories.ts       分类元信息
│  └─ types.ts            类型定义
└─ lib/
   ├─ asset.ts            媒体路径解析（含 basePath）+ 剪贴板
   └─ prompts.ts          查询辅助
scripts/
├─ validate-prompts.mjs   数据自检（dev/build 前自动跑）
├─ sync-media.mjs         素材库 → public/media
├─ postbuild.mjs          写 .nojekyll + 报告体积
├─ serve-out.mjs          产物静态服务（支持 Range）
├─ verify-hover.mjs       CDP 悬停验证
└─ verify-prod.mjs        CDP 生产产物验证
```

## 已知边界

- 静态导出，所以没有服务端搜索/收藏同步。数据在文件里，靠 git 协作。
- 搜索是前端 linear scan，几千条以内无感。
- `next dev` 下访问 `/c/<不存在的分类>` 会先报一条 `generateStaticParams` 警告再返回 404，属于 dev 模式的已知行为；`next build` 不受影响。
- 详情页视频用原生 `<video controls>`，不是自定义播放器。
