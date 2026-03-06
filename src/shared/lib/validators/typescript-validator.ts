import * as ts from 'typescript';

export interface ValidationResult {
  success: boolean;
  errors: string[];
}

/**
 * 纯内存 TypeScript 架构校验器
 * 
 * 验证规则:
 * 1. Interface & Type Alias 必须 PascalCase 且必须 Export
 * 2. 禁止 "I" 前缀 (IUser)
 * 3. 必须有 JSDoc
 * 4. 禁止空接口
 * 5. 禁止 any 类型 (含深度检查)
 * 
 * @param code TypeScript 代码字符串
 * @returns 验证结果
 */
export function validateTypeScript(code: string): ValidationResult {
  const sourceFile = ts.createSourceFile(
    'virtual.ts',
    code,
    ts.ScriptTarget.Latest,
    true
  );

  const errors: string[] = [];

  function report(node: ts.Node, message: string) {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
    errors.push(`[Line ${line + 1}, Col ${character + 1}]: ${message}`);
  }

  /**
   * 递归检查类型节点中是否包含 any
   */
  function hasAnyType(typeNode: ts.TypeNode): boolean {
    if (typeNode.kind === ts.SyntaxKind.AnyKeyword) return true;

    // 检查数组: any[]
    if (ts.isArrayTypeNode(typeNode)) {
      return hasAnyType(typeNode.elementType);
    }

    // 检查联合类型: string | any
    if (ts.isUnionTypeNode(typeNode) || ts.isIntersectionTypeNode(typeNode)) {
      return typeNode.types.some(hasAnyType);
    }

    // 检查泛型: Array<any>, Record<string, any>
    if (ts.isTypeReferenceNode(typeNode) && typeNode.typeArguments) {
      return typeNode.typeArguments.some(hasAnyType);
    }

    return false;
  }

  /**
   * 检查是否有 JSDoc
   */
  function hasJSDoc(node: ts.Node): boolean {
    // 检查 AST 挂载的 jsDoc
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jsDoc = (node as any).jsDoc;
    if (jsDoc && jsDoc.length > 0) return true;

    // 物理检查源码中的注释
    const ranges = ts.getLeadingCommentRanges(code, node.pos);
    if (!ranges) return false;
    return ranges.some(r => code.slice(r.pos, r.end).startsWith('/**'));
  }

  function checkNode(node: ts.Node) {
    // =================================================================
    // 规则 1: Interface & Type Alias 必须 PascalCase 且必须 Export
    // =================================================================
    if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
      const name = node.name.text;

      // 1.1 PascalCase 校验
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
        report(node.name, `Type "${name}" MUST be PascalCase.`);
      }

      // 1.2 禁止 "I" 前缀 (IUser)
      if (/^I[A-Z]/.test(name)) {
        report(node.name, `Type "${name}" should NOT use "I" prefix (Clean Code rule).`);
      }

      // 1.3 必须 Export
      const isExported = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
      if (!isExported) {
        report(node.name, `Type "${name}" MUST be exported.`);
      }

      // 1.4 必须有 JSDoc
      if (!hasJSDoc(node)) {
        report(node.name, `Type "${name}" MUST have JSDoc comments.`);
      }
    }

    // =================================================================
    // 规则 2: Interface 内部校验 (空接口 & 属性)
    // =================================================================
    if (ts.isInterfaceDeclaration(node)) {
      // 2.1 禁止空接口 (Empty Interface)
      if (node.members.length === 0) {
        report(node.name, `Interface "${node.name.text}" is empty. Use 'Record<string, unknown>' or infer correct types.`);
      }

      node.members.forEach(member => {
        if (ts.isPropertySignature(member) && member.type) {
          // 2.2 深度 Any 检查
          if (hasAnyType(member.type)) {
            report(member.type, `Property "${member.name.getText()}" contains explicit 'any'. Forbidden.`);
          }
        }
      });
    }

    // =================================================================
    // 规则 3: Type Alias 内部校验
    // =================================================================
    if (ts.isTypeAliasDeclaration(node)) {
      if (hasAnyType(node.type)) {
        report(node.type, `Type Alias "${node.name.text}" contains explicit 'any'. Forbidden.`);
      }
    }

    ts.forEachChild(node, checkNode);
  }

  // Start Checking
  checkNode(sourceFile);

  return {
    success: errors.length === 0,
    errors,
  };
}
