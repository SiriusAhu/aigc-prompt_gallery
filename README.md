# PromptVault

个人 AIGC 提示词库。图片与视频分开管理，按标签筛选、按名称或时间排序，预览 + 一键复制。

Next.js 静态导出，零后端，计划部署到 GitHub Pages。

> **当前阶段：版式与交互完成，内容为【示例】占位。** 正式提示词逐条替换 `src/data/prompts.ts` 即可。

## 界面

| 路由 | 内容 |
|---|---|
| `/` | 首页：两个大入口（图片 / 视频），宽屏并排、窄屏堆叠 |
| `/image` | 图片提示词 |
| `/video` | 视频提示词 |
| `/p/<id>` | 单条详情：完整提示词、负向、参数、备注、复制 |

`/image` 与 `/video` **共用同一个 `PromptPage` 组件**，差异只有两处：预览框比例（4:3 vs 16:9）和视频条目的悬停播放能力。

## 条目版式：传统卡片

- 每条内容是一个 `border` + 极轻阴影的圆角卡片
- 预览框统一比例，`object-cover` 裁切，保证网格对齐
- 提示词固定两行截断，完整内容进详情页
- 底部一行：标签（最多 3 个）+ 复制按钮

实现见 `src/components/PromptCard.tsx`。

## 标签与排序

**分类就是标签**，没有独立的分类型字段。每条内容的 `tags` 自由填写，页面顶部自动汇总出该页出现过的所有标签（带出现次数），点选即可筛选。

排序提供四种：

| 选项 | 依据 |
|---|---|
| 默认顺序 | 数据文件里的原始顺序 |
| 按名称 | `localeCompare("zh-CN")`，按拼音 |
| 最新收录 | `added` 降序 |
| 最早收录 | `added` 升序 |

筛选与排序**写在 URL 上**，页面状态以 URL 为唯一来源：

```
/image?tag=场景
/video?sort=newest
/image?tag=场景&sort=oldest
```

- 刷新、分享、前进后退都能还原同一视图
- 用 `router.replace` 更新，连续切换不会把历史记录塞满
- 参数非法时（比如手改了 `tag`）会显示「没有找到标签」并给出返回全部的入口
- `sort` 为默认值时从 URL 中移除，保持地址干净

搜索暂未实现（pending）。

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

`src/app/globals.css` 定义一组语义色变量（`--canvas` / `--surface` / `--ink` / `--muted` / `--hairline` / `--accent`），浅色挂 `:root`，深色挂 `[data-theme="dark"]`。

组件只写 `bg-canvas`、`text-ink`、`border-hairline` 这类语义类名，**不需要为明暗各写一套样式**。

- 首次访问：`layout.tsx` 的内联脚本在首帧前读 `localStorage`，没有记录就跟随 `prefers-color-scheme`，避免闪烁
- 手动切换：右上角三段式控件（跟随系统 / 浅色 / 深色），选择写入 `localStorage`

## 数据模型

```ts
{
  id: "example-video-orbit",   // 唯一，同时是 /p/<id>
  kind: "video",               // image | video
  title: "【示例】环绕推镜",
  tags: ["运镜", "产品"],       // 分类即标签，第一个显示为卡片角标
  models: ["Kling 2.1"],
  prompt: "...",
  negative: "...",
  params: { aspect: "16:9", duration: 5, fps: 30 },
  notes: "实测备注",
  added: "2026-11-19",         // 用于按时间排序
  media: { cover: "covers/x.png", video: "videos/x.mp4" },
}
```

`pnpm validate` 检查 id 唯一、kind 合法、tags 非空、画幅/时长/日期格式、媒体文件是否存在。

## 素材

| 位置 | 用途 | 进 git |
|---|---|---|
| `AI_Video/assets/`（仓库上一级） | 日常素材库 | ✗ |
| `prompt-vault/assets/`（仓内） | 发布与 CI 用 | ✓（视频默认忽略） |

`scripts/sync-media.mjs` 只同步 `prompts.ts` 里被引用到的媒体到 `public/media/`。路径相对于素材库根目录，例如 `covers/foo.png`。

```bash
ASSETS_DIR=assets pnpm dev        # 强制用仓内素材
ASSETS_DIR=/d/clips pnpm dev      # 指向任意目录
```

## 提交规范

husky 挂了两个钩子：

- `pre-commit`：跑 `oxlint`
- `commit-msg`：跑 `commitlint`，不符合 Conventional Commits 直接拒绝

类型：`feat` `fix` `refactor` `style` `docs` `test` `ci` `chore` `perf` `build`。

## 部署

**线上地址：<https://ahublog.xyz/aigc-prompt_gallery/>**

仓库：<https://github.com/SiriusAhu/aigc-prompt_gallery>

`.github/workflows/deploy.yml`：安装依赖 → `pnpm audit --audit-level high` → 构建 → 上传 `out/` → 部署 Pages。push 到 `main` 自动触发。

`basePath` 由 workflow 从 `GITHUB_REPOSITORY` 自动推导成 `/<repo>/`，**不要在 `next.config.ts` 里写死**。`postbuild.mjs` 会自动写入 `.nojekyll`，否则 Pages 的 Jekyll 会吞掉 `_next/`。

> **自定义域名**：账号级绑定了 `ahublog.xyz`，所以项目站点实际走 `ahublog.xyz/<repo>/`，`siriusahu.github.io/<repo>/` 会 301 过去。分享链接时用自定义域名的地址。

> **pnpm 版本只能声明一处**：`package.json` 的 `packageManager` 是唯一来源，workflow 里不要再写 `version`，否则会报 `ERR_PNPM_BAD_PM_VERSION`。

## 目录

```
src/
├─ app/
│  ├─ layout.tsx        主题初始化脚本、导航、页脚
│  ├─ globals.css       语义色 token + 基础样式
│  ├─ page.tsx          首页
│  ├─ image/page.tsx    图片提示词
│  ├─ video/page.tsx    视频提示词
│  └─ p/[id]/page.tsx   详情页
├─ components/
│  ├─ PromptPage.tsx    两个提示词页共用的模板
│  ├─ PromptList.tsx    标签筛选 + 排序 + 网格
│  ├─ PromptCard.tsx    条目卡片
│  ├─ CopyButton.tsx    复制按钮
│  ├─ SiteHeader.tsx    毛玻璃导航
│  ├─ SiteFooter.tsx
│  └─ ThemeToggle.tsx   明暗切换
├─ data/
│  ├─ prompts.ts        ← 唯一需要编辑的内容文件
│  ├─ categories.ts     图片/视频两类的展示元信息
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

## 找回早期的东西

- 早期 12 条视频提示词模板：`git show 9d6dc2b:src/data/prompts.ts`
- 方案预览页（三种布局对比）：`git show 0e182d0:src/app/design/page.tsx`

## 已知边界

- 内容全是【示例】占位，标题与提示词以「【示例】」开头，便于一眼区分
- 搜索未实现
- 静态导出，没有服务端搜索或收藏同步
