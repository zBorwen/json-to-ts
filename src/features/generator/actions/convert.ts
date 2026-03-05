"use server";

import { MockAIProvider } from "@/../share/lib/ai/mock-provider";
import { GeneratorOrchestrator } from "@/../share/features/generator/orchestrator";
import { ConversionResponse } from "@/../share/lib/schemas/conversion";

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

  // 在 Phase 2 阶段，我们强制使用 MockAIProvider
  const provider = new MockAIProvider();
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
