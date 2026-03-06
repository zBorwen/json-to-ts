"use client";

import { OrchestratorEvent, OrchestratorState } from "@/shared/lib/schemas/orchestrator-event";
import { cn } from "@/lib/utils";
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Zap,
  AlertTriangle,
  Code,
  Shield
} from "lucide-react";

interface StatusPanelProps {
  state: OrchestratorState;
  className?: string;
}

/** 获取事件图标 */
function getEventIcon(type: OrchestratorEvent['type']) {
  switch (type) {
    case 'start':
      return <Zap className="w-4 h-4 text-indigo-400" />;
    case 'attempt':
      return <RefreshCw className="w-4 h-4 text-blue-400" />;
    case 'generating':
      return <Code className="w-4 h-4 text-purple-400 animate-pulse" />;
    case 'validating':
      return <Shield className="w-4 h-4 text-amber-400 animate-pulse" />;
    case 'validation_pass':
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'validation_fail':
      return <AlertTriangle className="w-4 h-4 text-red-400" />;
    case 'healing':
      return <RefreshCw className="w-4 h-4 text-orange-400 animate-spin" />;
    case 'complete':
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'error':
      return <XCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Loader2 className="w-4 h-4 animate-spin" />;
  }
}

/** 获取事件颜色样式 */
function getEventColorClass(type: OrchestratorEvent['type']) {
  switch (type) {
    case 'start':
      return 'border-l-indigo-500 bg-indigo-500/5';
    case 'attempt':
      return 'border-l-blue-500 bg-blue-500/5';
    case 'generating':
      return 'border-l-purple-500 bg-purple-500/5';
    case 'validating':
      return 'border-l-amber-500 bg-amber-500/5';
    case 'validation_pass':
      return 'border-l-green-500 bg-green-500/5';
    case 'validation_fail':
      return 'border-l-red-500 bg-red-500/5';
    case 'healing':
      return 'border-l-orange-500 bg-orange-500/5';
    case 'complete':
      return 'border-l-green-500 bg-green-500/10';
    case 'error':
      return 'border-l-red-500 bg-red-500/10';
    default:
      return 'border-l-zinc-500 bg-zinc-500/5';
  }
}

/** 格式化时间戳 */
function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/**
 * 自愈循环状态面板组件
 * 实时展示 Orchestrator 的执行状态
 */
export function StatusPanel({ state, className }: StatusPanelProps) {
  const { status, currentAttempt, maxAttempts, events } = state;
  
  return (
    <div className={cn(
      "flex flex-col h-full",
      "bg-zinc-900/50 backdrop-blur-sm rounded-lg",
      "border border-zinc-800",
      className
    )}>
      {/* 头部状态指示器 */}
      <div className="flex-none p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {status === 'running' && (
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            )}
            {status === 'failed' && (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            {status === 'idle' && (
              <div className="w-5 h-5 rounded-full bg-zinc-700" />
            )}
            <span className="text-sm font-medium text-zinc-300">
              {status === 'idle' && '等待开始'}
              {status === 'running' && '执行中...'}
              {status === 'success' && '转换成功'}
              {status === 'failed' && '转换失败'}
            </span>
          </div>
          {currentAttempt > 0 && (
            <span className="text-xs px-2 py-1 rounded-full bg-zinc-800 text-zinc-400">
              尝试 {currentAttempt}/{maxAttempts}
            </span>
          )}
        </div>
        
        {/* 进度条 */}
        {status === 'running' && (
          <div className="mt-3 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 animate-pulse"
              style={{ width: `${(currentAttempt / maxAttempts) * 100}%` }}
            />
          </div>
        )}
      </div>
      
      {/* 事件日志列表 */}
      <div className="flex-grow overflow-y-auto p-4 space-y-2 premium-scrollbar">
        {events.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-600 text-sm italic">
            提交 JSON 后将显示执行日志...
          </div>
        ) : (
          events.map((event, index) => (
            <div
              key={`${event.type}-${event.timestamp}-${index}`}
              className={cn(
                "p-3 rounded-md border-l-2 transition-all duration-300",
                "animate-in fade-in slide-in-from-left-2",
                getEventColorClass(event.type)
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-2">
                <div className="flex-none mt-0.5">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-200">
                      {event.message}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {formatTime(event.timestamp)}
                    </span>
                  </div>
                  
                  {/* 显示错误详情 */}
                  {event.violations && (
                    <pre className="mt-2 text-xs text-red-300/80 bg-red-950/30 p-2 rounded overflow-x-auto max-h-24 premium-scrollbar">
                      {event.violations.slice(0, 500)}
                      {event.violations.length > 500 && '...'}
                    </pre>
                  )}
                  
                  {/* 显示耗时 */}
                  {event.duration && (
                    <span className="text-xs text-zinc-500 mt-1 inline-block">
                      耗时: {event.duration}ms
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* 底部统计 */}
      {state.duration && (
        <div className="flex-none p-3 border-t border-zinc-800 text-xs text-zinc-500 flex justify-between">
          <span>总耗时: {state.duration}ms</span>
          {state.provider && <span>Provider: {state.provider}</span>}
        </div>
      )}
    </div>
  );
}
