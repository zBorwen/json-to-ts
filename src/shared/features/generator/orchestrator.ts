import {
  generateText,
  getProviderId,
  ProviderConfig,
} from '@/shared/lib/ai/compatible-provider';
import {
  ConversionRequestSchema,
  ConversionResponse,
  createSuccessResponse,
  createErrorResponse
} from '@/shared/lib/schemas/conversion';
import { buildSystemPrompt, buildRepairPrompt, buildInitialPrompt } from '@/shared/lib/prompts/conversion-prompt';
import { EventEmitter, OrchestratorEvent } from '@/shared/lib/schemas/orchestrator-event';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

/**
 * Generator 编排器配置
 */
export interface OrchestratorConfig {
  /** Provider 配置 (可选，自动从环境变量读取) */
  provider?: ProviderConfig;
  /** 最大自愈重试次数 */
  maxAttempts?: number;
  /** SSE 事件发射器 (可选) */
  onEvent?: EventEmitter;
}

/** 辅助函数: 发射事件 */
function emit(onEvent: EventEmitter | undefined, event: Omit<OrchestratorEvent, 'timestamp'>) {
  if (onEvent) {
    onEvent({ ...event, timestamp: Date.now() });
  }
}

/**
 * 执行转换流水线 (带自愈能力)
 * 
 * @param input 用户输入 (将被验证)
 * @param config 可选配置
 * @returns 转换结果
 * 
 * @example
 * // 最简使用
 * const result = await executeConversion({ json: '{"name":"John"}' });
 * 
 * @example
 * // 自定义模型
 * const result = await executeConversion(
 *   { json: '{"name":"John"}' },
 *   { provider: { model: 'gpt-4o' } }
 * );
 */
export async function executeConversion(
  input: unknown,
  config?: OrchestratorConfig
): Promise<ConversionResponse> {
  const startTime = Date.now();
  const maxAttempts = config?.maxAttempts ?? 3;
  const providerId = getProviderId(config?.provider);
  const { onEvent } = config ?? {};

  // 发射开始事件
  emit(onEvent, {
    type: 'start',
    maxAttempts,
    provider: providerId,
    message: '开始转换流程...',
  });

  // 解析并验证请求
  const parseResult = ConversionRequestSchema.safeParse(input);
  if (!parseResult.success) {
    const errorMsg = `请求参数验证失败: ${parseResult.error.issues.map(e => e.message).join(', ')}`;
    emit(onEvent, {
      type: 'error',
      message: errorMsg,
      duration: Date.now() - startTime,
    });
    return createErrorResponse(errorMsg, { duration: Date.now() - startTime });
  }

  const request = parseResult.data;

  // 构建系统提示词 (根据请求配置)
  const systemPrompt = buildSystemPrompt({
    rootName: request.rootName,
    includeJSDoc: request.includeJSDoc,
  });

  let typescript = "";
  let currentAttempt = 1;
  let lastViolation = "";

  while (currentAttempt <= maxAttempts) {
    // 发射尝试开始事件
    emit(onEvent, {
      type: 'attempt',
      attempt: currentAttempt,
      maxAttempts,
      message: `开始第 ${currentAttempt}/${maxAttempts} 次尝试`,
    });
    console.log(`\n🔄 [Orchestrator]: Attempt ${currentAttempt}/${maxAttempts}...`);

    // 1. 构造提示词 (初始生成 vs 修复生成)
    const prompt = currentAttempt === 1
      ? buildInitialPrompt(request.json)
      : buildRepairPrompt({
        originalJson: request.json,
        failedCode: typescript,
        violations: lastViolation,
      });

    // 发射生成中事件
    emit(onEvent, {
      type: 'generating',
      attempt: currentAttempt,
      message: currentAttempt === 1 ? 'AI 正在生成 TypeScript...' : 'AI 正在修复代码...',
    });

    // 2. AI 生成 (概率内核)
    typescript = await generateText(prompt, systemPrompt, config?.provider);

    // 发射校验中事件
    emit(onEvent, {
      type: 'validating',
      attempt: currentAttempt,
      message: '执行架构校验...',
    });

    // 3. 物理校验 (确定性外壳)
    const tempFile = path.join(process.cwd(), `temp-check-${Date.now()}.ts`);
    fs.writeFileSync(tempFile, typescript);

    try {
      execSync(`npx tsx .agents/skills/json-to-ts/scripts/schema-check.ts ${tempFile}`, { stdio: 'pipe' });
      console.log(`✅ [Orchestrator]: 架构校验通过 (Attempt ${currentAttempt})`);

      // 发射校验通过事件
      emit(onEvent, {
        type: 'validation_pass',
        attempt: currentAttempt,
        message: '✅ 架构校验通过',
        typescript,
      });

      // 发射完成事件
      const duration = Date.now() - startTime;
      emit(onEvent, {
        type: 'complete',
        attempt: currentAttempt,
        message: '转换完成',
        typescript,
        duration,
        provider: providerId,
      });

      // 返回成功响应
      return createSuccessResponse(typescript, {
        duration: Date.now() - startTime,
        interfaceCount: (typescript.match(/interface /g) || []).length,
        provider: providerId,
        attempts: currentAttempt,
        inputLength: request.json.length,
        outputLength: typescript.length,
      });
    } catch (error: unknown) {
      const err = error as { stderr?: Buffer; stdout?: Buffer };
      lastViolation = err.stderr?.toString() || err.stdout?.toString() || String(error);
      console.warn(`⚠️ [Orchestrator]: 架构校验失败 (Attempt ${currentAttempt}):\n${lastViolation}`);

      // 发射校验失败事件
      emit(onEvent, {
        type: 'validation_fail',
        attempt: currentAttempt,
        message: '❌ 架构校验失败',
        violations: lastViolation,
      });

      if (currentAttempt === maxAttempts) {
        console.error("❌ [Orchestrator]: 自愈失败，已达到最大重试次数。");

        // 发射错误事件
        emit(onEvent, {
          type: 'error',
          attempt: currentAttempt,
          message: '自愈失败，已达到最大重试次数',
          violations: lastViolation,
          duration: Date.now() - startTime,
        });

        return createErrorResponse(
          `架构校验失败 (自愈重试已达上限): ${lastViolation}`,
          {
            duration: Date.now() - startTime,
            provider: providerId,
            attempts: currentAttempt,
            inputLength: request.json.length,
          }
        );
      }

      // 发射自愈事件
      emit(onEvent, {
        type: 'healing',
        attempt: currentAttempt,
        message: '🛠️ 触发 AI 自愈流程...',
        violations: lastViolation,
      });

      console.log("🛠️ [Orchestrator]: 触发 AI 自愈流程...");
      currentAttempt++;
    } finally {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    }
  }

  emit(onEvent, {
    type: 'error',
    message: 'Unexpected orchestrator state.',
    duration: Date.now() - startTime,
  });

  return createErrorResponse("Unexpected orchestrator state.", {
    duration: Date.now() - startTime,
  });
}

// 保留旧的 class API 以保持向后兼容 (标记为 deprecated)
/**
 * @deprecated 请使用 executeConversion 函数代替
 */
export class GeneratorOrchestrator {
  constructor(private providerConfig?: ProviderConfig) { }

  async execute(input: unknown): Promise<ConversionResponse> {
    return executeConversion(input, { provider: this.providerConfig });
  }
}