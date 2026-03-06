"use client";

import { useState, useCallback, useRef } from "react";
import { ConversionResponse } from "@/shared/lib/schemas/conversion";
import { OrchestratorState, OrchestratorEvent, createInitialOrchestratorState } from "@/shared/lib/schemas/orchestrator-event";
import { StatusPanel } from "./status-panel";
import { useTypewriter } from "@/hooks/use-typewriter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Zap, Copy, CheckCircle2, XCircle, SkipForward } from "lucide-react";

/**
 * Enterprise JSON-to-TS Generator Form
 * 使用 SSE 实时展示自愈循环状态
 */
export function GeneratorForm() {
  const [result, setResult] = useState<ConversionResponse | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [orchestratorState, setOrchestratorState] = useState<OrchestratorState>(
    createInitialOrchestratorState()
  );
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const formData = new FormData(e.currentTarget);
    const json = formData.get('json') as string;
    const includeJSDoc = formData.get('includeJSDoc') === 'on';
    
    // 重置状态
    setIsPending(true);
    setResult(null);
    setOrchestratorState({
      status: 'running',
      currentAttempt: 0,
      maxAttempts: 3,
      events: [],
    });
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    try {
      const response = await fetch('/api/generate/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ json, includeJSDoc }),
        signal: abortController.signal,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');
      
      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // 解析 SSE 事件
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.slice(6));
              
              // 处理最终结果事件
              if (eventData.type === 'result') {
                setResult(eventData.data);
                setOrchestratorState(prev => ({
                  ...prev,
                  status: eventData.data.success ? 'success' : 'failed',
                  typescript: eventData.data.typescript,
                  error: eventData.data.error,
                  duration: eventData.data.metadata?.duration,
                  provider: eventData.data.metadata?.provider,
                }));
                continue;
              }
              
              // 处理普通事件
              const event = eventData as OrchestratorEvent;
              setOrchestratorState(prev => {
                const newState: OrchestratorState = {
                  ...prev,
                  events: [...prev.events, event],
                };
                
                // 更新当前尝试次数
                if (event.attempt) {
                  newState.currentAttempt = event.attempt;
                }
                if (event.maxAttempts) {
                  newState.maxAttempts = event.maxAttempts;
                }
                
                // 更新状态
                if (event.type === 'complete') {
                  newState.status = 'success';
                  newState.typescript = event.typescript;
                  newState.duration = event.duration;
                  newState.provider = event.provider;
                } else if (event.type === 'error') {
                  newState.status = 'failed';
                  newState.error = event.message;
                  newState.duration = event.duration;
                }
                
                return newState;
              });
            } catch {
              console.warn('Failed to parse SSE event:', line);
            }
          }
        }
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return; // 请求被取消，忽略
      }
      
      console.error('SSE error:', error);
      setOrchestratorState(prev => ({
        ...prev,
        status: 'failed',
        events: [...prev.events, {
          type: 'error',
          timestamp: Date.now(),
          message: error instanceof Error ? error.message : '未知错误',
        }],
      }));
      toast.error('转换失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsPending(false);
      abortControllerRef.current = null;
    }
  }, []);

  // 打字机效果 - 校验通过后流式显示代码
  const { displayText, isTyping, skipAnimation, progress } = useTypewriter(
    result?.typescript || "",
    {
      charDelay: 2,      // 2ms per char = ~500 chars/sec
      initialDelay: 200, // 等待 200ms 后开始
      enabled: result?.success === true,
    }
  );

  const handleCopy = () => {
    if (result?.typescript) {
      navigator.clipboard.writeText(result.typescript);
      toast.success("代码已复制到剪贴板");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-[1600px] mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 items-start">
      {/* 左侧: 输入区域 */}
      <form onSubmit={handleSubmit} className="w-full lg:col-span-1">
        <Card className="flex flex-col h-[750px] border-none bg-white/60 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 dark:bg-zinc-900/60 dark:ring-white/10 overflow-hidden">
          <CardHeader className="flex-none">
            <CardTitle className="flex items-center gap-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              <Zap className="fill-indigo-600 text-indigo-600" />
              JSON 入参
            </CardTitle>
            <CardDescription>
              输入原始 JSON 数据，系统将自动基于 Vercel 专家级规范生成 TypeScript 类型。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow overflow-y-auto space-y-6 px-6 pb-6 pt-0 premium-scrollbar">
            <div className="space-y-2 flex flex-col h-[400px]">
              <Label htmlFor="json" className="text-sm font-semibold">
                JSON 原文
              </Label>
              <Textarea
                id="json"
                name="json"
                placeholder='{ "id": 1, "name": "John Doe", "email": "john@example.com" }'
                className="flex-grow font-mono bg-zinc-50/50 focus:bg-white transition-all duration-300 dark:bg-zinc-950/50 !field-sizing-content"
                style={{ fieldSizing: "content" } as React.CSSProperties}
                required
              />
            </div>
            <div className="flex items-center gap-2 flex-none pt-2">
              <input
                type="checkbox"
                id="includeJSDoc"
                name="includeJSDoc"
                defaultChecked
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
              />
              <Label htmlFor="includeJSDoc" className="cursor-pointer select-none">
                包含 JSDoc 注释
              </Label>
            </div>
          </CardContent>
          <CardFooter className="flex-none p-6 pt-0 border-t border-zinc-100 dark:border-zinc-800/50 mt-auto">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.01] active:scale-[0.98]"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  正在运行确定性校验...
                </>
              ) : (
                "立即转换 (Enterprise Standard)"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* 中间: 状态面板 */}
      <div className="w-full lg:col-span-1">
        <Card className="flex flex-col h-[750px] border-none bg-zinc-950 text-zinc-50 shadow-2xl overflow-hidden">
          <CardHeader className="flex-none border-b border-zinc-800 bg-zinc-900/50 py-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-zinc-300">执行日志</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow p-0 overflow-hidden">
            <StatusPanel state={orchestratorState} className="h-full rounded-none border-0" />
          </CardContent>
        </Card>
      </div>

      {/* 右侧: 输出区域 */}
      <div className="w-full lg:col-span-1">
        <Card className="flex flex-col h-[750px] border-none bg-zinc-950 text-zinc-50 shadow-2xl overflow-hidden">
          <CardHeader className="flex-none border-b border-zinc-800 bg-zinc-900/50">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  {result?.success ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span className="text-indigo-400">TypeScript 输出</span>
                    </>
                  ) : result?.error ? (
                    <>
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span className="text-red-400">生成失败</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-zinc-600" />
                      <span className="text-zinc-400">TypeScript 输出</span>
                    </>
                  )}
                </CardTitle>
                {result?.metadata && (
                  <CardDescription className="text-zinc-500 flex gap-3 mt-1 flex-wrap">
                    <span>耗时: {result.metadata.duration}ms</span>
                    {result.metadata.interfaceCount !== undefined && (
                      <span>接口数: {result.metadata.interfaceCount}</span>
                    )}
                    {result.metadata.attempts && result.metadata.attempts > 1 && (
                      <span className="text-amber-500">自愈重试: {result.metadata.attempts}次</span>
                    )}
                    {result.metadata.provider && (
                      <span className="text-indigo-400">Provider: {result.metadata.provider}</span>
                    )}
                  </CardDescription>
                )}
              </div>
              <div className="flex gap-2">
                {/* 打字中显示跳过按钮 */}
                {isTyping && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={skipAnimation}
                    className="hover:bg-zinc-800 text-zinc-400 hover:text-zinc-50"
                    title="跳过动画"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                )}
                {result?.typescript && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    className="hover:bg-zinc-800 text-zinc-400 hover:text-zinc-50"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-grow p-0 relative group overflow-hidden">
            {/* 打字进度条 */}
            {isTyping && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-zinc-800 z-20">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-100"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            )}
            
            {/* 错误展示 */}
            {result?.error && (
              <div className="absolute inset-0 z-10 bg-red-900/20 backdrop-blur-sm flex items-center justify-center p-6 text-center">
                <div className="space-y-2 max-w-md">
                  <div className="text-red-400 font-bold">❌ 校验异常 (Deterministic Shell Error)</div>
                  <div className="text-sm text-red-300 font-mono text-left bg-black/40 p-4 rounded-lg overflow-auto max-h-[300px]">
                    {result.error}
                  </div>
                </div>
              </div>
            )}
            
            {/* 代码展示 - 使用打字机效果 */}
            <pre className="p-6 font-mono text-sm overflow-auto h-full premium-scrollbar">
              {result?.typescript ? (
                <code className="text-indigo-300">
                  {displayText}
                  {/* 打字光标 */}
                  {isTyping && (
                    <span className="inline-block w-2 h-4 ml-0.5 bg-indigo-400 animate-pulse" />
                  )}
                </code>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-600 italic">
                  等待输入 JSON 数据并提交...
                </div>
              )}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}