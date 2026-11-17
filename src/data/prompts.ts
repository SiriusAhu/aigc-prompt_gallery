import type { PromptItem } from "./types";

/**
 * 提示词库。新增条目直接往这里加，id 保持唯一。
 *
 * media.video / media.cover 的路径相对于仓库根的 assets/ 目录：
 *   media: { cover: "covers/demo.png", video: "videos/demo.mp4" }
 * 也可以填 https 外链。只填 cover 就只显示静图，不填就走色块兜底。
 */
export const PROMPTS: PromptItem[] = [
  {
    id: "camera-orbit-push-in",
    title: "环绕推镜：产品特写",
    category: "camera",
    models: ["Kling 2.1", "Runway Gen-4", "Sora"],
    prompt:
      "A slow orbital camera push-in around a matte black wireless headphone on a dark reflective surface. " +
      "Camera starts at 30° to the left, arcs to the right while dollying forward, ending in a tight 3/4 close-up. " +
      "Shallow depth of field, focus locks on the earcup seam. Studio softbox reflections glide across the surface. " +
      "No zoom, no shake — the move is a smooth dolly arc.",
    negative: "handheld shake, zoom, warp, morphing, extra objects, text, flicker",
    params: { aspect: "16:9", duration: 5, fps: 30 },
    tags: ["推镜", "产品", "环绕", "浅景深"],
    notes:
      "「orbital + push-in」写在一起模型容易只取其一。改成先描述轨迹（arc 30°→right）、再描述终点景别（tight 3/4 close-up）最稳。5 秒内不要超过 90° 的弧线。",
    added: "2026-11-17",
    media: { cover: "covers/demo.png", video: "videos/demo.mp4" },
  },
  {
    id: "camera-dolly-zoom",
    title: "希区柯克变焦：情绪挤压",
    category: "camera",
    models: ["Kling 2.1", "Runway Gen-4"],
    prompt:
      "Vertigo dolly-zoom: camera physically dollies backward while zooming in, keeping the subject's face the same size in frame " +
      "as the background compresses and stretches. Subject in a narrow corridor, harsh overhead practical light, walls smearing outward. " +
      "Slight vertigo rotation, no cut.",
    negative: "cut, crossfade, identity drift, cartoon",
    params: { aspect: "9:16", duration: 5, fps: 24 },
    tags: ["变焦", "眩晕", "情绪", "竖屏"],
    notes: "一定要写 camera physically dollies backward while zooming in，否则模型只做数字放大，背景不会压缩。",
    added: "2026-11-17",
  },
  {
    id: "light-golden-pool",
    title: "金色光池：逆光轮廓",
    category: "light",
    models: ["Kling 2.1", "Sora", "Pika 2.2"],
    prompt:
      "Late golden-hour sunlight pours through a slatted blind, casting a pool of warm 3200K light on a bare wooden floor. " +
      "A figure walks into the pool from the right, backlit, rim light ignites the edge of their hair and shoulder. " +
      "Dust motes drift in the beam. Shadows stay deep and cool on the opposite side at 5600K.",
    negative: "flat lighting, overexposed highlights, lens flare spam, text",
    params: { aspect: "21:9", duration: 6, fps: 24 },
    tags: ["逆光", "轮廓光", "色温", "尘埃"],
    notes: "同时给两个色温数值（3200K 暖区 / 5600K 冷区）比只说“warm and cool”有效得多。",
    added: "2026-11-17",
  },
  {
    id: "light-volume-fog",
    title: "体积光：雾气中的光柱",
    category: "light",
    models: ["Sora", "Runway Gen-4"],
    prompt:
      "A single hard spotlight cuts through dense atmospheric fog in a black studio, producing visible volumetric shafts. " +
      "Fog density increases toward the floor. A silhouetted figure stands at the edge of the beam, then steps into it, " +
      "their outline dissolving into haze. Slow push-in.",
    negative: "flat grey, banding, visible grain noise, cut",
    params: { aspect: "16:9", duration: 6, fps: 24 },
    tags: ["体积光", "雾", "剪影", "棚拍"],
    notes: "体积光要同时给光源形状（single hard spotlight）和介质（dense atmospheric fog），只写 god rays 会出廉价辉光。",
    added: "2026-11-17",
  },
  {
    id: "material-water-fabric",
    title: "湿织物：重力与贴合",
    category: "material",
    models: ["Kling 2.1", "Runway Gen-4"],
    prompt:
      "A deep crimson silk sheet soaked in water drops onto a stone slab in slow motion. The fabric lands, clings, " +
      "and spreads under its own weight; water squeezes out along the folds and beads on the wet stone. " +
      "Macro lens, 120fps look, raking side light reveals the weave.",
    negative: "plastic sheen, stiff fabric, floating water, morphing folds",
    params: { aspect: "16:9", duration: 4, fps: 60 },
    tags: ["织物", "水", "慢动作", "微距"],
    notes: "描述材质要写“受力行为”（lands, clings, spreads under its own weight），比堆形容词更能骗过模型。",
    added: "2026-11-17",
  },
  {
    id: "material-glass-refraction",
    title: "玻璃折射：分形般的色散",
    category: "material",
    models: ["Sora", "Runway Gen-4"],
    prompt:
      "A faceted crystal rotates slowly on a turntable against a deep black background. A single warm key light and a cyan rim light " +
      "pass through it, throwing chromatic dispersion and caustic patterns across the black floor. The camera holds a static macro shot, " +
      "only the crystal moves.",
    negative: "noisy caustics, aliasing, rainbow clipping, camera shake",
    params: { aspect: "1:1", duration: 4, fps: 30 },
    tags: ["玻璃", "色散", "焦散", "转台"],
    notes: "静态机位 + 只让主体转，能显著降低形变概率。焦散写 caustic patterns 比 sparkle 可控。",
    added: "2026-11-17",
  },
  {
    id: "structure-single-take",
    title: "单镜头叙事：三拍节奏",
    category: "structure",
    models: ["Sora", "Kling 2.1"],
    prompt:
      "One continuous take, no cuts. Beat 1 (0-2s): wide shot of an empty rain-slicked alley, neon sign flickering. " +
      "Beat 2 (2-4s): a figure in a translucent poncho walks toward camera, umbrella tilted back. " +
      "Beat 3 (4-6s): the camera racks focus past the figure to the neon sign reflecting in a puddle. " +
      "Rain stays consistent throughout, same lighting direction.",
    negative: "cut, scene change, character drift, extra people",
    params: { aspect: "16:9", duration: 6, fps: 24 },
    tags: ["单镜头", "节奏", "雨夜", "变焦"],
    notes: "把 6 秒切成三拍并标明秒数，是控制单镜头叙事最有效的写法；不写秒数模型会把三件事同时塞进一帧。",
    added: "2026-11-17",
  },
  {
    id: "structure-first-last-frame",
    title: "首尾帧接续：场景过渡",
    category: "structure",
    models: ["Kling 2.1", "Runway Gen-4"],
    prompt:
      "Image-to-video between two keyframes. Start frame: interior of a train car, empty seats, dawn light. " +
      "End frame: same car, seats filled with passengers, harsh noon light. The transition is a seamless dissolve driven by " +
      "the camera drifting forward through the aisle; light shifts continuously from cool 4300K to neutral 5600K.",
    negative: "hard cut, ghosting, seat morphing, duplicate passengers",
    params: { aspect: "16:9", duration: 5, fps: 24, extra: { mode: "首尾帧" } },
    tags: ["首尾帧", "过渡", "时间流逝", "列车"],
    notes: "首尾帧模式的关键是把“中间发生什么”写清楚（光的变化 + 相机运动），否则模型会在两帧之间随机插值。",
    added: "2026-11-17",
  },
  {
    id: "style-film-grain",
    title: "胶片颗粒：16mm 年代感",
    category: "style",
    models: ["Kling 2.1", "Pika 2.2", "Sora"],
    prompt:
      "Shot on 16mm film with visible organic grain, slight halation around highlights, and a muted Kodak 2383 color print look. " +
      "A deserted gas station at dusk, a single car idling. Gate weave is subtle but present. No digital sharpening.",
    negative: "4k clean digital, sharpening, oversaturated, HDR glow, watermark",
    params: { aspect: "4:3", duration: 5, fps: 24 },
    tags: ["胶片", "颗粒", "复古", "4:3"],
    notes: "写具体胶片型号（16mm、Kodak 2383）比写 vintage film 稳定得多；再补一句 no digital sharpening 防止被数码锐化。",
    added: "2026-11-17",
  },
  {
    id: "style-anime-cel",
    title: "赛璐璐动画：手绘质感",
    category: "style",
    models: ["Kling 2.1", "Pika 2.2"],
    prompt:
      "Hand-drawn cel animation, two-tone shadows with hard edges, slight line boil, watercolor background painted on textured paper. " +
      "A girl on a bicycle coasts down a hillside road, wind in her hair. Limited animation: 12fps on twos.",
    negative: "3d render, smooth shading, cgi, photorealistic, gradient mesh",
    params: { aspect: "16:9", duration: 4, fps: 12 },
    tags: ["动画", "赛璐璐", "手绘", "12fps"],
    notes: "on twos（一拍二）这个术语能直接把节奏压到动画感；配合 negative 里的 3d render 才压得住。",
    added: "2026-11-17",
  },
  {
    id: "negative-universal-video",
    title: "通用负向池：视频专用",
    category: "negative",
    models: ["通用"],
    prompt: "（这张不用正向提示词，直接把这串贴进 negative 栏）",
    negative:
      "warping, morphing, melting, extra limbs, distorted face, identity drift, flicker, jitter, " +
      "text, watermark, logo, subtitles, frame tearing, duplicate subject, cut, scene change, " +
      "oversaturated, plastic skin, cgi look, low resolution, compression artifacts",
    tags: ["负向", "防崩", "通用"],
    notes:
      "负向词不是越多越好。超过 ~25 个 token 会稀释注意力，反而让画面变糊。分场景取用：人物类留着 identity drift / face，风景类可以去掉。",
    added: "2026-11-17",
  },
  {
    id: "workflow-multi-segment",
    title: "多段接续：长镜头拼接",
    category: "workflow",
    models: ["Kling 2.1", "Runway Gen-4"],
    prompt:
      "Segment 1 (5s): wide establishing shot of a lighthouse at storm, camera slowly pushes toward the tower. " +
      "Segment 2 (5s): continues from the exact end frame of segment 1 — closer to the tower, rain heavier, same framing and light direction. " +
      "Segment 3 (5s): inside the lantern room, storm outside the windows. " +
      "All segments: same lens, same 5600K cold key, consistent wave direction.",
    negative: "style shift between segments, lighting jump, lens change",
    params: { aspect: "16:9", duration: 15, fps: 24, extra: { mode: "分段生成" } },
    tags: ["长镜头", "接续", "一致性", "灯塔"],
    notes:
      "拼接的一致性靠三件事：末帧当首帧、固定镜头与光位描述、每段都重复同一句风格锚点。缺一句就会换一部片子。",
    added: "2026-11-17",
  },
];
