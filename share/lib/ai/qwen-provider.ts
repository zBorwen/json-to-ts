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
   * 使用 DashScope 兼容接口进行流式生成
   */
  //   async generate(prompt: string): Promise<ReadableStream<string>> {
  //     const systemPrompt = `
  // You are an expert Frontend Architect. Your task is to convert the provided JSON into high-quality TypeScript interfaces.

  // CRITICAL ARCHITECTURAL RULES (DETERMINISTIC SHELL):
  // 1. **Naming**: Every interface name must be in PascalCase (e.g., UserProfile, not userProfile).
  // 2. **Documentation**: Every interface MUST have a detailed JSDoc comment explaining its purpose.
  // 3. **No 'any'**: You are strictly FORBIDDEN from using the \`any\` keyword. Use specific types, generic records, or nested interfaces.
  // 4. **Safety**: If a property can be null or undefined, use optional chaining \`?: type\` or union types \`type | null\`.
  // 5. **Output**: Return ONLY valid TypeScript code. Do not include markdown backticks or explanations.
  // `;

  //     const { textStream } = await streamText({
  //       model: this.qwen('qwen3.5-plus'),
  //       system: systemPrompt,
  //       prompt: prompt,
  //       temperature: 0,
  //     });

  //     return textStream;
  //   }

  /**
     * 使用 DashScope 兼容接口进行流式生成 (Enhanced Version)
     */
  async generate(prompt: string): Promise<ReadableStream<string>> {
    const systemPrompt = `
      You are a Senior Frontend Architect and TypeScript Expert. 
      Your task is to analyze the input JSON and generate "Enterprise-Grade" TypeScript interfaces.

      ### CORE ARCHITECTURAL RULES (The Deterministic Shell):

      1. **Smart Array Merging (CRITICAL)**: 
        - When encountering an array of objects, analyze ALL items.
        - **Merge Strategy**: Create a SINGLE interface that represents the union of all fields.
        - **Optional Inference**: If a field appears in some objects but not others, marks it as **Optional (?)**.
        - **Do NOT** generate union types like \`(UserA | UserB)[]\` unless they are strictly discriminated unions.

      2. **Advanced Type Inference**:
        - **Tuples**: If an array has fixed length and distinct types (e.g., coordinates \`[120, 30]\`), define it as a Tuple \`[number, number]\`.
        - **Unions/Enums**: If a string field has low cardinality (e.g., status: "active" | "inactive"), use a **Union Type**, not just \`string\`.
        - **Unknown**: For empty objects \`{}\`, use \`Record<string, unknown>\`. **NEVER use \`any\`**.
        - **Discriminated Unions**: If an array contains objects with a distinct \`type\` field (e.g., \`type: 'text'\` vs \`type: 'image'\`), define separate interfaces and a union type.

      3. **Strict Naming Conventions**:
        - Use **PascalCase** for all interface names (e.g., \`UserProfile\`).
        - Derive interface names from the context/property name (e.g., property \`user_list\` -> interface \`UserListItem\`).
        - If the root object has no name, use \`RootObject\` or \`AppConfig\`.

      4. **Documentation & JSDoc**:
        - Every interface and property MUST have a JSDoc comment.
        - Infer the semantic meaning from the field name and value (e.g., \`process_time_ms\` -> "Execution time in milliseconds").

      5. **Output Format**:
        - Return **ONLY** raw TypeScript code.
        - **NO** markdown backticks (\`\`\`).
        - **NO** conversational text before or after the code.
        - Start immediately with \`export interface...\`.
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
