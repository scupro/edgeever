import React, { type ErrorInfo, type ReactNode } from "react";
import { markRendererRecoveryRequired } from "@/lib/renderer-recovery";
import { reportDesktopRendererReadyAfterPaint } from "@/lib/desktop-renderer-ready";

type RendererErrorDetails = {
  kind: "react-error";
  message: string;
  stack: string;
  componentStack: string;
};

type State = {
  error: RendererErrorDetails | null;
  reporting: boolean;
};

const isChineseInterface = () => navigator.language.toLowerCase().startsWith("zh");

export class DesktopRendererErrorBoundary extends React.Component<{ children: ReactNode }, State> {
  override state: State = { error: null, reporting: false };

  static getDerivedStateFromError(error: unknown): Pick<State, "error"> {
    const normalized = error instanceof Error ? error : new Error(String(error));
    return {
      error: {
        kind: "react-error",
        message: normalized.message,
        stack: normalized.stack ?? "",
        componentStack: "",
      },
    };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    markRendererRecoveryRequired();
    const details: RendererErrorDetails = {
      kind: "react-error",
      message: error.message,
      stack: error.stack ?? "",
      componentStack: info.componentStack ?? "",
    };
    this.setState({ error: details });
    console.error("Caught React renderer error", error, info.componentStack);
    void window.edgeeverDesktop?.recordRendererError(details).catch(() => undefined);
    reportDesktopRendererReadyAfterPaint();
  }

  private report = async () => {
    const { error } = this.state;
    if (!error || !window.edgeeverDesktop) return;
    this.setState({ reporting: true });
    try {
      await window.edgeeverDesktop.openRendererIssue(error);
    } finally {
      this.setState({ reporting: false });
    }
  };

  override render() {
    if (!this.state.error) return this.props.children;
    const zh = isChineseInterface();
    const desktop = Boolean(window.edgeeverDesktop?.isAvailable);

    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-slate-900">
        <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-card p-6 shadow-sm" role="alert">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-xl text-rose-700">!</div>
          <h1 className="text-lg font-semibold">{zh ? "EdgeEver 頁面出現異常" : "EdgeEver encountered a page error"}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {desktop
              ? (zh
                  ? "問題已經記錄到這臺裝置。重新載入後會進入安全啟動模式，不再自動開啟剛才的筆記。"
                  : "The problem was recorded on this device. Reloading will enter safe startup mode instead of reopening the previous note.")
              : (zh
                  ? "安全重新載入後不會自動開啟剛才的筆記。如果問題仍然出現，請檢查瀏覽器控制檯。"
                  : "A safe reload will avoid reopening the previous note. If the problem persists, check the browser console.")}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
              type="button"
              onClick={() => window.location.reload()}
            >
              {zh ? "安全重新載入" : "Reload safely"}
            </button>
            {desktop ? (
              <button
                className="rounded-lg border border-slate-300 bg-card px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
                type="button"
                disabled={this.state.reporting}
                onClick={() => void this.report()}
              >
                {this.state.reporting
                  ? (zh ? "正在開啟…" : "Opening…")
                  : (zh ? "報告到 GitHub" : "Report to GitHub")}
              </button>
            ) : null}
          </div>
        </section>
      </main>
    );
  }
}
