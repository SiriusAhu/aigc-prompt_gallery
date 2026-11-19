/** 内容类型：图片提示词 / 视频提示词 */
export type PromptKind = "image" | "video";

export type Aspect = "1:1" | "4:3" | "16:9" | "9:16" | "3:2" | "21:9";

export interface PromptParams {
  aspect?: Aspect;
  duration?: number;
  fps?: number;
  /** 其它模型特有参数，原样展示 */
  extra?: Record<string, string | number>;
}

/** 一张生成结果 */
export interface MediaImage {
  /** 相对素材库根目录的路径 */
  src: string;
  /**
   * 生成种子。
   * 省略或 null 表示该模型不暴露种子（如 gpt-image 系列），展示为 seed N/A。
   */
  seed?: number | null;
}

export interface MediaRef {
  /**
   * 同一条提示词的多张结果。
   * 卡片上只占一个位置，悬停时像抽牌一样展开。
   */
  images?: MediaImage[];
  /** 视频文件；有它才会启用「悬停播放」 */
  video?: string;
}

export interface PromptItem {
  /** 唯一 id，同时用作详情页路径 /p/<id> */
  id: string;
  /** 图片还是视频 */
  kind: PromptKind;
  title: string;
  /** 分类即标签，自由填写；第一个同时作为卡片角标 */
  tags: string[];
  /** 生成所用的模型，展示时署名在底部 */
  models?: string[];
  /** 正向提示词正文 */
  prompt: string;
  /** 负向提示词 */
  negative?: string;
  params?: PromptParams;
  /** 实测备注 */
  notes?: string;
  /** 收录日期 YYYY-MM-DD，用于按时间排序 */
  added?: string;
  /** 来源链接 */
  source?: string;
  media?: MediaRef;
}
