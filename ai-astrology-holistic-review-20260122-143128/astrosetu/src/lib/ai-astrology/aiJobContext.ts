import { AsyncLocalStorage } from "node:async_hooks";

export type AIJobMode = "sync" | "background";

export type AIJobMetrics = {
  openaiCalls: number;
  openaiRetries: number;
  prokeralaCalls: number;
};

export type AIJobContext = {
  mode: AIJobMode;
  requestId?: string;
  reportId?: string;
  reportType?: string;
  degradedInputUsed?: boolean;
  metrics: AIJobMetrics;
};

const als = new AsyncLocalStorage<AIJobContext>();

export function runWithAIJobContext<T>(ctx: Omit<AIJobContext, "metrics"> & { metrics?: Partial<AIJobMetrics> }, fn: () => T): T {
  const full: AIJobContext = {
    ...ctx,
    metrics: {
      openaiCalls: 0,
      openaiRetries: 0,
      prokeralaCalls: 0,
      ...(ctx.metrics || {}),
    },
  };
  return als.run(full, fn);
}

export function getAIJobContext(): AIJobContext | undefined {
  return als.getStore();
}

export function bumpMetric(name: keyof AIJobMetrics, inc: number = 1): void {
  const store = als.getStore();
  if (!store) return;
  store.metrics[name] = (store.metrics[name] || 0) + inc;
}


