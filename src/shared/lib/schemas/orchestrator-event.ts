/**
 * Orchestrator SSE 事件类型定义
 * 用于实时推送自愈循环状态到前端
 */

/** 事件类型枚举 */
export type OrchestratorEventType =
  | 'start'           // 流程开始
  | 'attempt'         // 开始新的尝试
  | 'generating'      // AI 生成中
  | 'validating'      // 校验中
  | 'validation_pass' // 校验通过
  | 'validation_fail' // 校验失败
  | 'healing'         // 触发自愈
  | 'complete'        // 流程完成
  | 'error';          // 流程出错

/** 单个事件结构 */
export interface OrchestratorEvent {
  type: OrchestratorEventType;
  timestamp: number;
  attempt?: number;
  maxAttempts?: number;
  message?: string;
  violations?: string;
  typescript?: string;
  duration?: number;
  provider?: string;
}

/** 完整的状态上下文 (用于 UI 展示) */
export interface OrchestratorState {
  /** 当前状态 */
  status: 'idle' | 'running' | 'success' | 'failed';
  /** 当前尝试次数 */
  currentAttempt: number;
  /** 最大尝试次数 */
  maxAttempts: number;
  /** 事件历史 */
  events: OrchestratorEvent[];
  /** 最终生成的 TypeScript */
  typescript?: string;
  /** 最后的错误信息 */
  error?: string;
  /** 总耗时 */
  duration?: number;
  /** Provider 标识 */
  provider?: string;
}

/** 创建初始状态 */
export function createInitialOrchestratorState(): OrchestratorState {
  return {
    status: 'idle',
    currentAttempt: 0,
    maxAttempts: 3,
    events: [],
  };
}

/** SSE 事件发送器类型 */
export type EventEmitter = (event: OrchestratorEvent) => void;
