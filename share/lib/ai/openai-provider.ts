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

      ### CRITICAL ARCHITECTURAL RULES (DETERMINISTIC SHELL):

      1. **Export All Types (CRITICAL)**: Every single interface and type alias MUST be prefixed with the \`export\` keyword.
      2. **Naming (Strict PascalCase)**: Use PascalCase for all names. **NEVER** use the "I" prefix (e.g., \`User\`, NOT \`IUser\`).
      3. **Documentation (Total JSDoc)**: Every interface AND every property MUST have a detailed JSDoc comment.
      4. **No 'any'**: You are strictly FORBIDDEN from using the \`any\` keyword. Use \`unknown\` or specific types.
      5. **Safety**: If a property can be null or undefined, use optional chaining \`?: type\` or union types \`type | null\`.
      6. **Output**: Return ONLY valid TypeScript code. NO markdown backticks.

      Example of expected quality:
      /**
       * Represents a user in the enterprise system.
       */
      export interface UserProfile {
        /** The unique identifier for the user */
        id: string;
        /** The full name of the user */
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
