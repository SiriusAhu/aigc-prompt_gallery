import type { PromptItem } from "./types";

/**
 * 提示词库。当前均为【示例】占位条目，用于验证版式、标签筛选与排序，
 * 正式内容接入时逐条替换即可。
 *
 * 约定：
 * - id 唯一，同时是详情页路径 /p/<id>
 * - kind 决定出现在 /image 还是 /video
 * - tags 就是分类，自由填写，第一个会显示在卡片角标
 * - added 用于按时间排序，格式 YYYY-MM-DD
 * - media.images 放同一条提示词的多张结果（可带 seed），卡片上悬停展开
 *   路径相对于素材库根目录：{ images: [{ src: "images/xxx/01.png", seed: 42 }] }
 * - media.video 有值才启用悬停播放
 */
export const PROMPTS: PromptItem[] = [
  {
    id: "film-course-boy-tv",
    kind: "image",
    title: "【示例】深夜看电视的男孩",
    tags: ["影视飓风"],
    models: ["gpt-image-2.5-sunburst"],
    prompt:
      "时间：夜晚，屋里的光几乎全部来自电视屏幕。\n\n" +
      "主体：一个七八岁的男孩盘腿坐在沙发上，背对镜头，抬头看着电视。\n\n" +
      "场景：小户型公寓的客厅，一张旧布艺沙发，茶几上放着半杯牛奶和遥控器。\n\n" +
      "风格：iPhone 随手拍的生活照质感。",
    params: { aspect: "1:1" },
    added: "2026-11-19",
    notes:
      "依据影视飓风 AI 课堂《图片提示词》思维导图（时间 / 主体 / 场景 / 风格 四条主轴）写的第一条基线。时间轴不写「晚上」两个字，而是把光源交给电视；风格轴不堆形容词，只落在一句「iPhone 随手拍」。后续消融实验逐段删减对比。",
    media: {
      images: [
        { src: "images/boy-watching-tv/01.webp", seed: null },
        { src: "images/boy-watching-tv/02.webp", seed: null },
        { src: "images/boy-watching-tv/03.webp", seed: null },
      ],
    },
  },

  // ── 图片 ──────────────────────────────────────────────
  {
    id: "example-image-cabin",
    kind: "image",
    title: "【示例】晨雾中的木屋",
    tags: ["场景", "氛围", "浅景深"],
    models: ["Midjourney v7", "Flux 1.1"],
    prompt:
      "【示例】清晨薄雾笼罩着林间木屋，暖光从窗口溢出，前景是湿润的苔藓与蕨类，空气中有细微水汽颗粒，浅景深，35mm 视角，冷暖对比较强。",
    negative: "过曝、塑料感、文字、水印",
    params: { aspect: "4:3" },
    added: "2026-11-19",
  },
  {
    id: "example-image-product",
    kind: "image",
    title: "【示例】极简产品特写",
    tags: ["产品", "布光"],
    models: ["Midjourney v7"],
    prompt:
      "【示例】哑光黑色的无线耳机置于深色反光台面，柔光箱在表面形成渐变高光，焦点落在耳罩接缝处，背景纯净无杂物。",
    params: { aspect: "1:1" },
    added: "2026-11-17",
  },
  {
    id: "example-image-neon",
    kind: "image",
    title: "【示例】霓虹雨夜街景",
    tags: ["场景", "夜景"],
    models: ["Flux 1.1"],
    prompt:
      "【示例】雨夜霓虹街道，湿润路面反射粉色与青色光晕，远处行人撑伞虚化成光斑，低机位广角，轻微手持感，胶片颗粒。",
    params: { aspect: "16:9" },
    added: "2026-11-15",
  },
  {
    id: "example-image-portrait",
    kind: "image",
    title: "【示例】柔光人像",
    tags: ["人像", "柔光"],
    models: ["Midjourney v7"],
    prompt:
      "【示例】窗边自然光人像，侧逆光在面部形成柔和过渡，背景虚化成浅色块，肤色自然不过曝，85mm 定焦。",
    params: { aspect: "3:2" },
    added: "2026-11-11",
  },

  // ── 视频 ──────────────────────────────────────────────
  {
    id: "example-video-orbit",
    kind: "video",
    title: "【示例】环绕推镜",
    tags: ["运镜", "产品"],
    models: ["Kling 2.1", "Runway Gen-4"],
    prompt:
      "【示例】A slow orbital camera push-in around a matte black headphone on a dark reflective surface, ending in a tight 3/4 close-up, shallow depth of field.",
    negative: "handheld shake, zoom, warping",
    params: { aspect: "16:9", duration: 5, fps: 30 },
    added: "2026-11-19",
  },
  {
    id: "example-video-dolly-zoom",
    kind: "video",
    title: "【示例】希区柯克变焦",
    tags: ["运镜", "情绪"],
    models: ["Kling 2.1"],
    prompt:
      "【示例】Vertigo dolly-zoom: camera physically dollies backward while zooming in, keeping the subject the same size as the background compresses and stretches.",
    negative: "cut, identity drift",
    params: { aspect: "9:16", duration: 5, fps: 24 },
    added: "2026-11-16",
  },
  {
    id: "example-video-volumetric",
    kind: "video",
    title: "【示例】体积光·雾气光柱",
    tags: ["光影", "棚拍"],
    models: ["Sora"],
    prompt:
      "【示例】A single hard spotlight cuts through dense atmospheric fog in a black studio, producing visible volumetric shafts; a silhouetted figure steps into the beam.",
    params: { aspect: "16:9", duration: 6, fps: 24 },
    added: "2026-11-14",
  },
  {
    id: "example-video-three-beats",
    kind: "video",
    title: "【示例】单镜头三拍",
    tags: ["结构", "节奏"],
    models: ["Sora", "Kling 2.1"],
    prompt:
      "【示例】One continuous take, no cuts. Beat 1 (0-2s): wide alley in rain. Beat 2 (2-4s): figure walks toward camera. Beat 3 (4-6s): focus racks to a neon sign reflection.",
    negative: "cut, scene change",
    params: { aspect: "16:9", duration: 6, fps: 24 },
    added: "2026-11-10",
  },
];
