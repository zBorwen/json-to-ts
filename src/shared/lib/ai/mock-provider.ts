import { AIProvider } from './types';

/**
 * Mock AI 提供者
 * 用于离线开发与确定性测试，模拟 AI 生成过程
 */
export class MockAIProvider implements AIProvider {
  readonly id = 'mock';

  /**
   * 模拟延迟与流式返回
   * 生成的代码包含故意的瑕疵，用于测试自愈闭环
   * @param _prompt 用户输入 (忽略)
   * @param _systemPrompt 系统提示 (忽略)
   */
  async generate(_prompt: string, _systemPrompt?: string): Promise<ReadableStream<string>> {
    // 模拟一段符合规范的代码片段
    const chunks = [
      "/**\n * 自动生成的响应模型 (Enterprise Standard)\n */\n",
      "export interface GeneratedResponse {\n",
      "  /** 响应 ID */\n",
      "  id: number;\n",
      "  /** 响应名称 */\n",
      "  name: string;\n",
      "}\n"
    ];

    return new ReadableStream<string>({
      async start(controller) {
        for (const chunk of chunks) {
          // 模拟网络延迟 (50-200ms)
          await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 150));
          controller.enqueue(chunk);
        }
        controller.close();
      }
    });
  }
}