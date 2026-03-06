"use server";

import { MockAIProvider } from "@/../share/lib/ai/mock-provider";
import { OpenAIProvider } from "@/../share/lib/ai/openai-provider";
import { GeneratorOrchestrator } from "@/../share/features/generator/orchestrator";
import { ConversionResponse } from "@/../share/lib/schemas/conversion";
import { AIProvider } from "@/../share/lib/ai/types";

/**
 * 转换 Server Action
 * 封装 Orchestrator 的调用逻辑，适配 React 19 useActionState
 */
export async function convertAction(
  prevState: unknown,
  formData: FormData
): Promise<{ data?: ConversionResponse; error?: string }> {
  const json = formData.get("json") as string;
  const rootName = (formData.get("rootName") as string) || "Root";
  const includeJSDoc = formData.get("includeJSDoc") === "on";

  // 根据环境变量自动选择提供者 (平衡概率内核的接入方式)
  const provider: AIProvider = process.env.OPENAI_API_KEY
    ? new OpenAIProvider()
    : new MockAIProvider();

  const orchestrator = new GeneratorOrchestrator(provider);

  try {
    const result = await orchestrator.execute({
      json,
      rootName,
      includeJSDoc,
    });
    return { data: result };
  } catch (error: unknown) {
    console.error("Conversion failed:", error);
    return { error: error instanceof Error ? error.message : "转换过程中发生未知错误" };
  }
}
