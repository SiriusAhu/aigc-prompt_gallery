# PromptVault

个人 AIGC 提示词库。图片与视频分开管理，按分类浏览，预览 + 一键复制。

Next.js 静态导出，零后端，计划部署到 GitHub Pages。

> **当前阶段：结构定稿中。** 三个主界面和主题系统已经完成，提示词内容是空的，条目呈现方式还在从 `/design` 方案预览页里选。

## 界面

| 路由 | 内容 |
|---|---|
| `/` | 首页：两个大入口（图片 / 视频），带预览占位 |
| `/image` | 图片提示词 |
| `/video` | 视频提示词 |
| `/design` | **方案预览**：三种条目布局 + 首页布局 + 明暗色板，用于定稿 |

`/image` 与 `/video` **共用同一个 `PromptPage` 组件**，差异只有两处：预览框比例（4:3 vs 16:9）和视频条目的悬停播放能力。

> 详情页 `/p/<id>` 暂未挂载。静态导出要求 `generateStaticParams` 至少产出一条路由，内容为空时会导致构建失败，等有内容后再启用。

## 技术栈

| 层 | 选择 |
|---|---|
| 框架 | Next.js 16 App Router（`output: "export"`） |
| 样式 | Tailwind CSS 4 + 语义色 CSS 变量 |
| 主题 | 浅色 / 深色，默认跟随系统，可手动切换并记忆 |
| 字体 | 系统字体栈（SF Pro / Segoe UI / PingFang SC） |
| 提交 | commitlint + husky 强制 Conventional Commits |

## 快速开始

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # 校验数据 → 同步媒体 → 静态导出到 out/
pnpm lint         # oxlint
pnpm validate     # 只跑数据校验
```

> 必须用 `localhost` 或 `127.0.0.1` 访问 dev server。两者都在 `next.config.ts` 的 `allowedDevOrigins` 里放行；用局域网 IP 会触发 Next 的跨域拦截，导致页面不 hydrate。

## 主题系统

`src/app/globals.css` 里定义了一组语义色变量（`--canvas` / `--surface` / `--ink` / `--muted` / `--hairline` / `--accent`），浅色挂在 `:root`，深色挂在 `[data-theme="dark"]`。

组件只写 `bg-canvas`、`text-ink`、`border-hairline` 这类语义类名，**不需要为明暗各写一套样式**。

- 首次访问：`layout.tsx` 里的内联脚本在首帧前读取 `localStorage`，没有记录就跟随 `prefers-color-scheme`，避免闪烁
- 手动切换：右上角三段式控件（跟随系统 / 浅色 / 深色），选择写入 `localStorage`

## 数据模型

```ts
{
  id: "camera-orbit",
  kind: "video",              // image | video —— 决定出现在哪个页面
  title: "环绕推镜",
  category: "camera",         // 取值见 categories.ts 对应 kind
  models: ["Kling 2.1"],
  prompt: "...",
  negative: "...",
  params: { aspect: "16:9", duration: 5, fps: 30 },
  tags: ["推镜"],
  notes: "实测备注",
  media: { cover: "covers/x.png", video: "videos/x.mp4" },
}
```

两套分类体系：

- **图片**：人像 / 场景 / 产品 / 插画 / 建筑 / 风格
- **视频**：运镜 / 光影 / 材质 / 结构 / 风格 / 负向 / 流程

`pnpm validate` 会检查 id 唯一、kind 与 category 匹配、画幅/时长格式、媒体文件是否存在。内容为空时只提示、不报错。

## 素材

| 位置 | 用途 | 进 git |
|---|---|---|
| `AI_Video/assets/`（仓库上一级） | 日常素材库 | ✗ |
| `prompt-vault/assets/`（仓内） | 发布与 CI 用 | ✓（视频默认忽略） |

`scripts/sync-media.mjs` 只同步 `prompts.ts` 里被引用到的媒体到 `public/media/`。路径相对于素材库根目录，例如 `covers/foo.png`。

覆盖方式：

```bash
ASSETS_DIR=assets pnpm dev        # 强制用仓内素材
ASSETS_DIR=/d/clips pnpm dev      # 指向任意目录
```

## 提交规范

husky 挂了两个钩子：

- `pre-commit`：跑 `oxlint`
- `commit-msg`：跑 `commitlint`，不符合 Conventional Commits 直接拒绝

类型：`feat` `fix` `refactor` `style` `docs` `test` `ci` `chore` `perf` `build`。

```bash
git commit -m "feat: 增加图片提示词分类筛选"
git commit -m "fix: 修正深色模式下占位文字对比度"
```

## 部署（尚未执行）

`.github/workflows/deploy.yml` 已就绪：安装依赖 → `pnpm audit --audit-level high` → 构建 → 上传 `out/` → 部署 Pages。

`basePath` 由 workflow 从 `GITHUB_REPOSITORY` 自动推导成 `/<repo>/`，**不要在 `next.config.ts` 里写死**。`postbuild.mjs` 会自动写入 `.nojekyll`，否则 Pages 的 Jekyll 会吞掉 `_next/`。

## 目录

```
src/
├─ app/
│  ├─ layout.tsx        主题初始化脚本、导航、页脚
│  ├─ globals.css       语义色 token + 基础样式
│  ├─ page.tsx          首页
│  ├─ image/page.tsx    图片提示词
│  ├─ video/page.tsx    视频提示词
│  └─ design/page.tsx   方案预览
├─ components/
│  ├─ PromptPage.tsx    两个提示词页共用的模板
│  ├─ PromptItemView.tsx 条目三种呈现（tile / card / list）
│  ├─ CopyButton.tsx    复制按钮
│  ├─ SiteHeader.tsx    毛玻璃导航
│  ├─ SiteFooter.tsx
│  └─ ThemeToggle.tsx   明暗切换
├─ data/
│  ├─ prompts.ts        ← 唯一需要编辑的内容文件
│  ├─ categories.ts     两套分类体系
│  └─ types.ts
└─ lib/
   ├─ asset.ts          媒体路径解析 + 剪贴板
   └─ prompts.ts        按类型/id 查询
scripts/
├─ validate-prompts.mjs 数据自检
├─ sync-media.mjs       素材库 → public/media
├─ postbuild.mjs        写 .nojekyll + 报告体积
└─ serve-out.mjs        本地预览 out/
```

## 找回早期模板

仓库里曾经收录 12 条视频提示词模板（运镜/光影/材质等），在重构时清空。需要取回：

```bash
git show 9d6dc2b:src/data/prompts.ts
```

## 已知边界

- 提示词库为空，所有列表与详情能力只有骨架，没有内容可验证
- `/design` 里的预览图是占位色块，不是真实素材
- 没有搜索、筛选、排序——等内容定型后再加
- 静态导出，没有服务端搜索或收藏同步
