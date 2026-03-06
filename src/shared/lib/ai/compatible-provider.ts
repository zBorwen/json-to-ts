import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

/**
 * Provider 配置接口
 * 只需要配置这些参数，其他都是自动的
 */
export interface ProviderConfig {
  /** API Key (默认从 AI_API_KEY 环境变量读取) */
  apiKey?: string;
  /** 基础 URL (默认从 AI_BASE_URL 环境变量读取) */
  baseURL?: string;
  /** 模型名称 (默认从 AI_MODEL 环境变量读取) */
  model?: string;
  /** 温度参数 (0-2, 默认 0) */
  temperature?: number;
}

/**
 * 环境变量配置说明:
 * 
 * - AI_API_KEY: API 密钥 (必须)
 * - AI_BASE_URL: API 基础 URL (可选，默认使用 OpenAI 官方)
 * - AI_MODEL: 模型名称 (可选，默认 gpt-4o)
 * 
 * @example .env 配置示例 (OpenAI):
 * AI_API_KEY=sk-xxx
 * AI_MODEL=gpt-4o
 * 
 * @example .env 配置示例 (DashScope/Qwen):
 * AI_API_KEY=sk-xxx
 * AI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
 * AI_MODEL=qwen-plus
 * 
 * @example .env 配置示例 (本地 Ollama):
 * AI_API_KEY=ollama
 * AI_BASE_URL=http://localhost:11434/v1
 * AI_MODEL=llama3
 */

/**
 * 从环境变量获取 API Key
 */
function resolveApiKey(config?: ProviderConfig): string {
  if (config?.apiKey) return config.apiKey;
  if (process.env.AI_API_KEY) return process.env.AI_API_KEY;
  // 向后兼容旧的环境变量名
  if (process.env.DASHSCOPE_API_KEY) return process.env.DASHSCOPE_API_KEY;
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  throw new Error('No API key configured. Set AI_API_KEY environment variable.');
}

/**
 * 解析后的配置类型
 */
interface ResolvedConfig {
  apiKey: string;
  baseURL: string | undefined;
  model: string;
  temperature: number;
}

/**
 * 从环境变量自动解析配置
 */
function resolveConfig(config?: ProviderConfig): ResolvedConfig {
  const apiKey = resolveApiKey(config);

  // 全部从环境变量读取，config 参数可覆盖
  return {
    apiKey,
    baseURL: config?.baseURL ?? process.env.AI_BASE_URL,
    model: config?.model ?? process.env.AI_MODEL ?? 'gpt-4o',
    temperature: config?.temperature ?? 0,
  };
}

/**
 * 获取当前 Provider ID (用于 metadata)
 */
export function getProviderId(config?: ProviderConfig): string {
  const baseURL = config?.baseURL ?? process.env.AI_BASE_URL ?? '';
  if (baseURL.includes('dashscope')) return 'dashscope';
  if (baseURL.includes('localhost') || baseURL.includes('127.0.0.1')) return 'local';
  if (baseURL) return 'custom';
  return 'openai';
}

/**
 * 流式生成 TypeScript
 * 
 * @param prompt 用户输入或修复提示
 * @param systemPrompt 系统提示词
 * @param config 可选配置 (通常不需要传，自动从环境变量读取)
 * @returns 可读流
 * 
 * @example
 * // 最简使用 - 只需配置环境变量
 * const stream = await generate(jsonInput, systemPrompt);
 * 
 * @example
 * // 覆盖默认配置
 * const stream = await generate(jsonInput, systemPrompt, {
 *   model: 'gpt-4o-mini',
 *   temperature: 0.5,
 * });
 */
export async function generate(
  prompt: string,
  systemPrompt?: string,
  config?: ProviderConfig
): Promise<ReadableStream<string>> {
  const resolved = resolveConfig(config);

  const client = createOpenAI({
    apiKey: resolved.apiKey,
    baseURL: resolved.baseURL,
  });

  const { textStream } = await streamText({
    model: client(resolved.model),
    system: systemPrompt,
    prompt,
    temperature: resolved.temperature,
  });

  return textStream;
}

/**
 * 非流式生成 (适合内部使用)
 */
export async function generateText(
  prompt: string,
  systemPrompt?: string,
  config?: ProviderConfig
): Promise<string> {
  const stream = await generate(prompt, systemPrompt, config);
  const reader = stream.getReader();
  const chunks: string[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  return chunks.join('');
}