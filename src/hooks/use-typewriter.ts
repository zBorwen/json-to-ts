"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface UseTypewriterOptions {
  /** 每个字符的打字延迟 (ms) */
  charDelay?: number;
  /** 初始延迟 (ms) */
  initialDelay?: number;
  /** 是否启用打字机效果 */
  enabled?: boolean;
  /** 打字完成回调 */
  onComplete?: () => void;
}

export interface UseTypewriterReturn {
  /** 当前显示的文本 */
  displayText: string;
  /** 是否正在打字 */
  isTyping: boolean;
  /** 打字进度 (0-1) */
  progress: number;
  /** 跳过动画，直接显示完整文本 */
  skipAnimation: () => void;
  /** 重置并重新开始 */
  reset: () => void;
}

/**
 * 打字机效果 Hook
 * 
 * @param text 要显示的完整文本
 * @param options 配置选项
 * @returns 打字机状态和控制函数
 * 
 * @example
 * const { displayText, isTyping } = useTypewriter(code, { charDelay: 5 });
 */
export function useTypewriter(
  text: string,
  options: UseTypewriterOptions = {}
): UseTypewriterReturn {
  const {
    charDelay = 3,      // 3ms per char = ~333 chars/sec, 很快但有动画感
    initialDelay = 100, // 100ms 初始延迟
    enabled = true,
    onComplete,
  } = options;

  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const indexRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const textRef = useRef(text);
  const completedRef = useRef(false);

  // 跳过动画
  const skipAnimation = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setDisplayText(textRef.current);
    setIsTyping(false);
    if (!completedRef.current) {
      completedRef.current = true;
      onComplete?.();
    }
  }, [onComplete]);

  // 重置
  const reset = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    indexRef.current = 0;
    completedRef.current = false;
    setDisplayText("");
    setIsTyping(false);
  }, []);

  useEffect(() => {
    // 如果文本变化，重置
    if (text !== textRef.current) {
      textRef.current = text;
      reset();
    }

    if (!text || !enabled) {
      setDisplayText(text || "");
      return;
    }

    // 使用 requestAnimationFrame 实现流畅动画
    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }

      const elapsed = timestamp - lastTimeRef.current;

      // 批量添加字符以提高性能
      const charsToAdd = Math.floor(elapsed / charDelay);

      if (charsToAdd > 0) {
        lastTimeRef.current = timestamp;
        const newIndex = Math.min(indexRef.current + charsToAdd, text.length);
        indexRef.current = newIndex;
        setDisplayText(text.slice(0, newIndex));

        if (newIndex >= text.length) {
          setIsTyping(false);
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete?.();
          }
          return;
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    // 初始延迟后开始
    const timeoutId = setTimeout(() => {
      setIsTyping(true);
      indexRef.current = 0;
      lastTimeRef.current = 0;
      rafRef.current = requestAnimationFrame(animate);
    }, initialDelay);

    return () => {
      clearTimeout(timeoutId);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [text, charDelay, initialDelay, enabled, onComplete, reset]);

  const progress = text ? displayText.length / text.length : 0;

  return {
    displayText,
    isTyping,
    progress,
    skipAnimation,
    reset,
  };
}
