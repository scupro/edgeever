type StartupMark = "index-ready" | "workspace-first-commit" | "workspace-data-ready" | "workspace-interactive";

type NativeStartupTiming = {
  endTime?: number | null;
  executeJavaScriptBundleEntryPointStart?: number | null;
  initializeRuntimeStart?: number | null;
  startTime?: number | null;
};

const marks = new Map<StartupMark, number>();
let latestEditorStartupMs: number | null = null;
let editorOpenStartedAt: number | null = null;

const logPerformance = (metric: string, durationMs: number) => {
  console.info(`[EdgeEverPerformance] ${metric}=${Math.max(0, durationMs).toFixed(0)}ms`);
};

export const markStartup = (name: StartupMark) => {
  if (!marks.has(name)) {
    const now = performance.now();
    marks.set(name, now);
    const nativeStart = (performance as Performance & { rnStartupTiming?: NativeStartupTiming }).rnStartupTiming?.startTime ?? 0;
    logPerformance(name, now - nativeStart);
  }
};

export const beginEditorStartup = () => {
  editorOpenStartedAt = performance.now();
};

export const recordEditorStartup = (durationMs: number) => {
  if (Number.isFinite(durationMs) && durationMs >= 0) {
    latestEditorStartupMs = durationMs;
    logPerformance("local-editor-ready", durationMs);
    if (editorOpenStartedAt !== null) {
      logPerformance("editor-open-to-ready", performance.now() - editorOpenStartedAt);
      editorOpenStartedAt = null;
    }
  }
};

export const getStartupPerformanceItems = () => {
  const nativeTiming = (performance as Performance & { rnStartupTiming?: NativeStartupTiming }).rnStartupTiming;
  const nativeStart = nativeTiming?.startTime ?? 0;
  const duration = (end?: number | null, start?: number | null) =>
    typeof end === "number" && typeof start === "number" ? `${Math.max(0, end - start).toFixed(0)} ms` : "暫不可用";
  const sinceNativeStart = (name: StartupMark) => {
    const value = marks.get(name);
    return typeof value === "number" ? `${Math.max(0, value - nativeStart).toFixed(0)} ms` : "尚未記錄";
  };

  return [
    { label: "原生執行時啟動", value: duration(nativeTiming?.endTime, nativeTiming?.startTime) },
    { label: "啟動至 JS 執行", value: duration(nativeTiming?.executeJavaScriptBundleEntryPointStart, nativeTiming?.startTime) },
    { label: "啟動至會話/快取就緒", value: sinceNativeStart("index-ready") },
    { label: "啟動至工作區首幀", value: sinceNativeStart("workspace-first-commit") },
    { label: "啟動至列表資料就緒", value: sinceNativeStart("workspace-data-ready") },
    { label: "啟動至互動空閒", value: sinceNativeStart("workspace-interactive") },
    { label: "最近一次本機編輯器啟動", value: latestEditorStartupMs === null ? "尚未記錄" : `${latestEditorStartupMs.toFixed(0)} ms` },
  ];
};
