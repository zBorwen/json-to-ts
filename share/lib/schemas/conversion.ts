import { z } from 'zod';

/**
 * JSON 转换请求架构
 * 用于验证用户提交的原始 JSON 及配置项
 */
export const ConversionRequestSchema = z.object({
  /** 原始 JSON 字符串 */
  json: z.string().min(1, "JSON 内容不能为空"),
  /** 目标根接口名称 */
  rootName: z.string().regex(/^[A-Z][a-zA-Z0-9]+$/, "根名称必须符合 PascalCase").default("Root"),
  /** 是否生成 JSDoc 注释 */
  includeJSDoc: z.boolean().default(true),
});

/**
 * 转换请求类型推导
 */
export type ConversionRequest = z.infer<typeof ConversionRequestSchema>;

/**
 * 转换响应架构
 * 用于验证 AI 生成的结果或 Mock 返回
 */
export const ConversionResponseSchema = z.object({
  /** 生成的 TypeScript 代码 */
  typescript: z.string(),
  /** 统计信息 */
  metadata: z.object({
    /** 生成耗时 (ms) */
    duration: z.number(),
    /** 接口数量 */
    interfaceCount: z.number(),
  }).optional(),
});

/**
 * 转换响应类型推导
 */
export type ConversionResponse = z.infer<typeof ConversionResponseSchema>;
