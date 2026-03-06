/**
 * AI 提供者通用接口封装
 * 遵循"概率内核"与"确定性外壳"分离原则
 */
export interface AIProvider {
  /** 提供者名称 (例如: 'mock', 'openai', 'dashscope') */
  readonly id: string;

  /**
   * 生成 TypeScript 类型
   * @param prompt 提示词或结构化输入
   * @param systemPrompt 可选的系统提示词 (由 Orchestrator 注入)
   * @returns 流式或全量返回的生成的代码片段
   */
  generate(prompt: string, systemPrompt?: string): Promise<ReadableStream<string>>;
}

/**
 * AI 生成配置
 */
export interface AICompletionConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}