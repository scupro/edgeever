import React, { type ErrorInfo, type ReactNode } from "react";
import { clearRendererRecoveryRequired, markRendererRecoveryRequired } from "@/lib/renderer-recovery";

type Props = {
  children: ReactNode;
  resetKey: string | null;
  onBackToList: () => void;
};

type State = {
  error: Error | null;
};

const isChineseInterface = () => navigator.language.toLowerCase().startsWith("zh");

export class EditorPaneErrorBoundary extends React.Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    markRendererRecoveryRequired();
    const details = {
      kind: "react-error" as const,
      message: error.message,
      stack: error.stack ?? "",
      componentStack: info.componentStack ?? "",
    };
    console.error("Caught note editor error", error, info.componentStack);
    void window.edgeeverDesktop?.recordRendererError(details).catch(() => undefined);
  }

  override componentDidUpdate(previousProps: Props) {
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      clearRendererRecoveryRequired();
      this.setState({ error: null });
    }
  }

  private retry = () => {
    clearRendererRecoveryRequired();
    this.setState({ error: null });
  };

  override render() {
    if (!this.state.error) return this.props.children;
    const zh = isChineseInterface();

    return (
      <main className="flex h-full min-h-0 items-center justify-center bg-workspace-canvas p-6 text-slate-900">
        <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-card p-6 shadow-sm" role="alert">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-xl text-amber-700">!</div>
          <h1 className="text-lg font-semibold">{zh ? "這條筆記暫時無法顯示" : "This note cannot be displayed"}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {zh
              ? "異常已被限制在當前筆記，筆記列表和應用其他功能仍可繼續使用。請選擇另一條筆記，或重試當前筆記。"
              : "The failure was isolated to this note. The note list and the rest of the app remain available. Choose another note or retry this one."}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
              type="button"
              onClick={this.props.onBackToList}
            >
              {zh ? "返回筆記列表" : "Back to note list"}
            </button>
            <button
              className="rounded-lg border border-slate-300 bg-card px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
              type="button"
              onClick={this.retry}
            >
              {zh ? "重試當前筆記" : "Retry this note"}
            </button>
          </div>
        </section>
      </main>
    );
  }
}

export const EditorRecoveryPane = () => {
  const zh = isChineseInterface();
  return (
    <main className="flex h-full min-h-0 items-center justify-center bg-workspace-canvas p-6 text-slate-900">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-card p-6 shadow-sm" role="status">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-800">✓</div>
        <h1 className="text-lg font-semibold">{zh ? "已進入安全啟動模式" : "Safe startup mode is active"}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {zh
            ? "EdgeEver 沒有重新開啟上次出錯的筆記。請從左側列表選擇其他筆記繼續使用；選擇後會自動退出安全模式。"
            : "EdgeEver did not reopen the note that failed last time. Choose another note from the list to continue; safe mode will then turn off automatically."}
        </p>
      </section>
    </main>
  );
};
