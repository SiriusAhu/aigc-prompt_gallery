/** 提示词分类。新增分类时同步更新 CATEGORIES 的图标与文案。 */
export type Category =
  | "camera" // 运镜
  | "light" // 光影
  | "material" // 材质
  | "structure" // 叙事结构
  | "style" // 风格
  | "negative" // 负向提示
  | "workflow"; // 工作流

export type Aspect = "16:9" | "9:16" | "1:1" | "4:3" | "21:9";

export interface PromptParams {
  /** 画幅比例 */
  aspect?: Aspect;
  /** 时长（秒） */
  duration?: number;
  /** 帧率 */
  fps?: number;
  /** 其它模型特有参数，原样展示 */
  extra?: Record<string, string | number>;
}

/**
 * 媒体引用。路径相对于仓库根的 assets/ 目录，例如 "videos/demo.mp4"。
 * 也可以直接写 http(s) 外链，运行时不会被解析成本地路径。
 */
export interface MediaRef {
  /** 视频文件；有它才会启用「悬停播放」 */
  video?: string;
  /** 封面图；没有时用分类色块兜底 */
  cover?: string;
}

export interface PromptItem {
  /** 唯一 id，同时用作 URL 锚点：/#p/<id> */
  id: string;
  title: string;
  category: Category;
  /** 适用的模型，列表形式便于一个模板标注多个 */
  models: string[];
  /** 正向提示词正文，换行用 \n */
  prompt: string;
  /** 负向提示词 */
  negative?: string;
  params?: PromptParams;
  tags?: string[];
  /** 实测备注：什么会崩、什么有效 */
  notes?: string;
  /** 收录日期 YYYY-MM-DD */
  added?: string;
  /** 来源链接（教程、原视频等） */
  source?: string;
  media?: MediaRef;
}
