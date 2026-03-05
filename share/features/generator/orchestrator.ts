import { AIProvider } from '../../lib/ai/types';
import { ConversionRequestSchema, ConversionResponse } from '../../lib/schemas/conversion';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

/**
 * Generator 编排器
 * 负责：请求验证 -> AI 生成 -> 确定性外壳校验 -> 自愈(由 Agent 完成)
 */
export class GeneratorOrchestrator {
  constructor(private provider: AIProvider) { }

  /**
   * 执行转换流水线
   */
  async execute(input: unknown): Promise<ConversionResponse> {
    const startTime = Date.now();

    // 1. Zod 脚本验证输入 (确定性外壳第一层)
    const request = ConversionRequestSchema.parse(input);

    // 2. AI 生成 (概率内核)
    const stream = await this.provider.generate(request.json);
    const reader = stream.getReader();
    let typescript = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      typescript += value;
    }

    // 3. 物理校验 (确定性外壳第二层)
    // 写入临时文件进行 ts-check
    const tempFile = path.join(process.cwd(), 'temp-check.ts');
    fs.writeFileSync(tempFile, typescript);

    try {
      // 调用 Phase 1 部署的校验脚本
      execSync(`npx tsx .agents/skills/json-to-ts/scripts/schema-check.ts ${tempFile}`, { stdio: 'pipe' });
      console.log("✅ [Orchestrator]: 架构校验通过");
    } catch (error: unknown) {
      console.error("❌ [Orchestrator]: 架构校验失败，触发 Agent 自愈语义...");
      // 注意：物理脚本会抛出异常，这里通过日志触发 Agent 的 auto-loop 规则
      const errorMessage = error instanceof Error ? error.message : String(error);
      const stdout = (error as any).stdout?.toString() || "";
      throw new Error(`Architectural Violation: ${stdout || errorMessage}`);
    } finally {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    }

    return {
      typescript,
      metadata: {
        duration: Date.now() - startTime,
        interfaceCount: (typescript.match(/interface /g) || []).length
      }
    };
  }
}
