import { z } from 'zod';

// ============================================================================
// 自定义校验器
// ============================================================================

/**
 * JSON 字符串校验器
 * 验证字符串是否为有效的 JSON 格式
 */
const jsonStringSchema = z.string()
  .min(1, "JSON 内容不能为空")
  .refine(
    (value) => {
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    },
    { message: "无效的 JSON 语法，请检查格式" }
  );

// ============================================================================
// 请求 Schema
// ============================================================================

/**
 * JSON 转换请求架构
 * 用于验证用户提交的原始 JSON 及配置项
 * 
 * Note: rootName 已移除，AI 将自动根据 JSON 语义推断合适的接口名称
 */
export const ConversionRequestSchema = z.object({
  /** 原始 JSON 字符串 (必须是有效的 JSON 语法) */
  json: jsonStringSchema,
  /** 是否生成 JSDoc 注释 */
  includeJSDoc: z.boolean().default(true),
  /** 可选：指定使用的 Provider */
  preferredProvider: z.enum(['auto', 'openai', 'dashscope', 'mock']).optional().default('auto'),
});

/**
 * 转换请求类型推导
 */
export type ConversionRequest = z.infer<typeof ConversionRequestSchema>;

// ============================================================================
// 响应 Schema
// ============================================================================

/**
 * 转换元数据架构
 * 追踪生成过程的详细信息
 */
export const ConversionMetadataSchema = z.object({
  /** 生成耗时 (ms) */
  duration: z.number().nonnegative(),
  /** 生成的接口数量 */
  interfaceCount: z.number().nonnegative(),
  /** 使用的 AI Provider */
  provider: z.string().optional(),
  /** 使用的模型 */
  model: z.string().optional(),
  /** 尝试次数 (自愈重试) */
  attempts: z.number().min(1).max(10).optional(),
  /** 输入 JSON 的字符数 */
  inputLength: z.number().nonnegative().optional(),
  /** 生成代码的字符数 */
  outputLength: z.number().nonnegative().optional(),
});

/**
 * 转换元数据类型
 */
export type ConversionMetadata = z.infer<typeof ConversionMetadataSchema>;

/**
 * 转换响应架构
 * 用于验证 AI 生成的结果或 Mock 返回
 */
export const ConversionResponseSchema = z.object({
  /** 是否成功 */
  success: z.boolean(),
  /** 生成的 TypeScript 代码 (成功时存在) */
  typescript: z.string().optional(),
  /** 错误信息 (失败时存在) */
  error: z.string().optional(),
  /** 详细统计信息 */
  metadata: ConversionMetadataSchema.optional(),
});

/**
 * 转换响应类型推导
 */
export type ConversionResponse = z.infer<typeof ConversionResponseSchema>;

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 创建成功响应
 */
export function createSuccessResponse(
  typescript: string,
  metadata: Partial<ConversionMetadata>
): ConversionResponse {
  return {
    success: true,
    typescript,
    metadata: {
      duration: metadata.duration ?? 0,
      interfaceCount: metadata.interfaceCount ?? 0,
      ...metadata,
    },
  };
}

/**
 * 创建失败响应
 */
export function createErrorResponse(
  error: string,
  metadata?: Partial<ConversionMetadata>
): ConversionResponse {
  return {
    success: false,
    error,
    metadata: metadata ? {
      duration: metadata.duration ?? 0,
      interfaceCount: 0,
      ...metadata,
    } : undefined,
  };
}

/**
 * 预验证 JSON 字符串
 * @returns 解析结果或错误信息
 */
export function validateJsonString(json: string): { valid: true; data: unknown } | { valid: false; error: string } {
  try {
    const data = JSON.parse(json);
    return { valid: true, data };
  } catch (e) {
    const error = e instanceof Error ? e.message : "未知 JSON 解析错误";
    return { valid: false, error };
  }
}