/**
 * JSON-to-TypeScript 转换 Prompt 模块
 * 集中管理所有 AI 生成相关的提示词模板
 */

/**
 * 核心转换系统提示词
 * 定义 TypeScript 生成的架构规则 (确定性外壳)
 */
export const CONVERSION_SYSTEM_PROMPT = `
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
`.trim();

/**
 * 自愈修复提示词模板
 * 当架构校验失败时，用于引导 AI 修复违规代码
 */
export function buildRepairPrompt(params: {
  originalJson: string;
  failedCode: string;
  violations: string;
}): string {
  return `
ARCHITECTURE VIOLATION DETECTED IN PREVIOUS ATTEMPT.

ORIGINAL JSON:
${params.originalJson}

FAILED CODE:
${params.failedCode}

ERRORS TO FIX:
${params.violations}

INSTRUCTION:
Analyze the errors above. Rewrite the TypeScript interfaces to be 100% compliant with the rules (PascalCase, Export, JSDoc, No Any).
Return ONLY the fixed TypeScript code.
`.trim();
}

/**
 * 初始生成提示词模板
 * 用于首次转换请求
 */
export function buildInitialPrompt(json: string): string {
  return `Generate TypeScript interfaces for this JSON:\n\n${json}`;
}

/**
 * Prompt 配置选项
 */
export interface PromptOptions {
  /** 是否包含 JSDoc 注释 */
  includeJSDoc?: boolean;
  /** 自定义根接口名称 */
  rootName?: string;
  /** 附加约束规则 */
  additionalRules?: string[];
}

/**
 * 根据选项动态构建系统提示词
 */
export function buildSystemPrompt(options?: PromptOptions): string {
  let prompt = CONVERSION_SYSTEM_PROMPT;

  if (options?.rootName) {
    prompt += `\n\n7. **Root Interface Name**: Name the root interface as \`${options.rootName}\`.`;
  }

  if (options?.additionalRules?.length) {
    const startNum = options.rootName ? 8 : 7;
    options.additionalRules.forEach((rule, index) => {
      prompt += `\n\n${startNum + index}. ${rule}`;
    });
  }

  return prompt;
}
