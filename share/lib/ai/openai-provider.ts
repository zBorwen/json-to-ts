import { AIProvider } from './types';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

/**
 * OpenAI AI 提供者实现
 * 遵循“概率内核”与“确定性外壳”分离原则
 */
export class OpenAIProvider implements AIProvider {
  readonly id = 'openai';
  private openai;

  constructor(apiKey?: string) {
    this.openai = createOpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  /**
   * 使用 OpenAI SDK 进行流式生成
   */
  async generate(prompt: string): Promise<ReadableStream<string>> {
    const systemPrompt = `
You are an expert Frontend Architect. Your task is to convert the provided JSON into high-quality TypeScript interfaces.

CRITICAL ARCHITECTURAL RULES (DETERMINISTIC SHELL):
1. **Naming**: Every interface name must be in PascalCase (e.g., UserProfile, not userProfile).
2. **Documentation**: Every interface MUST have a detailed JSDoc comment explaining its purpose.
3. **No 'any'**: You are strictly FORBIDDEN from using the \`any\` keyword. Use specific types, generic records, or nested interfaces.
4. **Safety**: If a property can be null or undefined, use optional chaining \`?: type\` or union types \`type | null\`.
5. **Output**: Return ONLY valid TypeScript code. Do not include markdown backticks or explanations.

Example of expected quality:
/**
 * Represents a user in the enterprise system.
 */
interface UserProfile {
  id: string;
  name: string;
}
`;

    const { textStream } = await streamText({
      model: this.openai('gpt-4o'),
      system: systemPrompt,
      prompt: prompt,
      temperature: 0, // 降低熵值，提高确定性
    });

    return textStream;
  }
}
