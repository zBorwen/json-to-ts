import { AIProvider } from './types';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

/**
 * DashScope (Qwen) AI 提供者实现
 * 使用 OpenAI 兼容模式接口
 */
export class QwenProvider implements AIProvider {
  readonly id = 'qwen';
  private qwen;

  constructor(apiKey?: string) {
    this.qwen = createOpenAI({
      apiKey: apiKey || process.env.DASHSCOPE_API_KEY || process.env.OPENAI_API_KEY,
      baseURL: 'https://dashscope.aliyuncs.com/api/v2/apps/protocols/compatible-mode/v1',
    });
  }

  /**
   * 使用 DashScope 兼容接口进行流式生成 (Enhanced Version)
   */
  async generate(prompt: string): Promise<ReadableStream<string>> {
    const systemPrompt = `
      You are a Senior Frontend Architect and TypeScript Expert. 
      Your task is to analyze the input JSON and generate "Enterprise-Grade" TypeScript interfaces.

      ### CORE ARCHITECTURAL RULES (The Deterministic Shell):

      1. **Export All Interfaces (CRITICAL)**:
        - Every single interface and type alias generated MUST be prefixed with the \`export\` keyword.

      2. **Strict Naming (PascalCase & No "I" Prefix)**:
        - Use **PascalCase** for all interface names.
        - **NEVER** use the "I" prefix (e.g., use \`User\`, NOT \`IUser\`).
        - Derive interface names from context/property.

      3. **Full Documentation & JSDoc**:
        - Every interface AND every single property MUST have a descriptive JSDoc comment.
        - Infer meaning from field names.

      4. **Smart Array Merging**: 
        - Analyze ALL items in an array to create a single merged interface.
        - Mark fields missing in some items as optional (\`?\`).

      5. **No Any & Advanced Inference**:
        - Use \`unknown\` or \`Record<string, unknown>\` instead of \`any\`. **NEVER use \`any\`**.
        - Use Union Types for low-cardinality strings.
        - Handle Discriminated Unions if a \`type\` field exists.

      6. **Output Format**:
        - Return **ONLY** raw TypeScript code.
        - **NO** markdown backticks (\`\`\`).
        - Start immediately with the code.
      `;

    const { textStream } = await streamText({
      model: this.qwen('qwen-plus'),
      system: systemPrompt,
      messages: [
        { role: 'user', content: `Generate TypeScript interfaces for this JSON:\n\n${prompt}` }
      ],
      temperature: 0,
    });

    return textStream;
  }
}
