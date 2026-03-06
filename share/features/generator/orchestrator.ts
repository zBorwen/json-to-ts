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
   * 执行转换流水线 (带自愈能力)
   */
  async execute(input: unknown): Promise<ConversionResponse> {
    const startTime = Date.now();
    const request = ConversionRequestSchema.parse(input);

    let typescript = "";
    let currentAttempt = 1;
    const maxAttempts = 3;
    let lastViolation = "";

    while (currentAttempt <= maxAttempts) {
      console.log(`\n🔄 [Orchestrator]: Attempt ${currentAttempt}/${maxAttempts}...`);

      // 1. 构造提示词 (初始生成 vs 修复生成)
      const prompt = currentAttempt === 1
        ? request.json
        : `
          ARCHITECTURE VIOLATION DETECTED IN PREVIOUS ATTEMPT.
          
          ORIGINAL JSON:
          ${request.json}

          FAILED CODE:
          ${typescript}

          ERRORS TO FIX:
          ${lastViolation}

          INSTRUCTION:
          Analyze the errors above. Rewrite the TypeScript interfaces to be 100% compliant with the rules (PascalCase, Export, JSDoc, No Any).
          Return ONLY the fixed TypeScript code.
        `;

      // 2. AI 生成 (概率内核)
      const stream = await this.provider.generate(prompt);
      typescript = await this.readStream(stream);

      // 3. 物理校验 (确定性外壳)
      const tempFile = path.join(process.cwd(), `temp-check-${Date.now()}.ts`);
      fs.writeFileSync(tempFile, typescript);

      try {
        execSync(`npx tsx .agents/skills/json-to-ts/scripts/schema-check.ts ${tempFile}`, { stdio: 'pipe' });
        console.log(`✅ [Orchestrator]: 架构校验通过 (Attempt ${currentAttempt})`);

        return {
          typescript,
          metadata: {
            duration: Date.now() - startTime,
            interfaceCount: (typescript.match(/interface /g) || []).length
          }
        };
      } catch (error: any) {
        lastViolation = error.stderr?.toString() || error.stdout?.toString() || String(error);
        console.warn(`⚠️ [Orchestrator]: 架构校验失败 (Attempt ${currentAttempt}):\n${lastViolation}`);

        if (currentAttempt === maxAttempts) {
          console.error("❌ [Orchestrator]: 自愈失败，已达到最大重试次数。");
          throw new Error(`Architectural Violation (Self-healing failed): ${lastViolation}`);
        }

        console.log("🛠️ [Orchestrator]: 触发 AI 自愈流程...");
        currentAttempt++;
      } finally {
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      }
    }

    throw new Error("Unexpected orchestrator state.");
  }

  /**
   * 辅助函数：读取 ReadableStream
   */
  private async readStream(stream: ReadableStream<string>): Promise<string> {
    const reader = stream.getReader();
    let content = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      content += value;
    }
    return content;
  }
}
