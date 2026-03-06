"use server";

import { executeConversion } from "@/shared/features/generator/orchestrator";
import { ConversionResponse, validateJsonString, createErrorResponse } from "@/shared/lib/schemas/conversion";

/**
 * 转换 Server Action
 * 封装 Orchestrator 的调用逻辑，适配 React 19 useActionState
 */
export async function convertAction(
  prevState: unknown,
  formData: FormData
): Promise<ConversionResponse> {
  const startTime = Date.now();
  const json = formData.get("json") as string;
  const includeJSDoc = formData.get("includeJSDoc") === "on";

  // 快速失败：前置 JSON 语法校验
  const jsonValidation = validateJsonString(json || "");
  if (!jsonValidation.valid) {
    return createErrorResponse(
      `JSON 语法错误: ${jsonValidation.error}`,
      { duration: Date.now() - startTime }
    );
  }

  // 直接调用函数式 API，Provider 会自动从环境变量配置
  // Note: rootName 已移除，AI 将自动推断语义化接口名称
  const result = await executeConversion({
    json,
    includeJSDoc,
  });

  return result;
}