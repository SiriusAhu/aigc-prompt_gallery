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

export interface MediaRef {
  /** 视频文件；有它才会启用「悬停播放」 */
  video?: string;
  /** 预览图；同时也是视频的封面 */
  cover?: string;
}

export interface PromptItem {
  /** 唯一 id，同时用作详情页路径 /p/<id> */
  id: string;
  /** 图片还是视频 */
  kind: PromptKind;
  title: string;
  /** 分类 id，取值见 categories.ts 中对应 kind 的列表 */
  category: string;
  /** 适用模型 */
  models?: string[];
  /** 正向提示词正文 */
  prompt: string;
  /** 负向提示词 */
  negative?: string;
  params?: PromptParams;
  tags?: string[];
  /** 实测备注 */
  notes?: string;
  /** 收录日期 YYYY-MM-DD */
  added?: string;
  /** 来源链接 */
  source?: string;
  media?: MediaRef;
}
