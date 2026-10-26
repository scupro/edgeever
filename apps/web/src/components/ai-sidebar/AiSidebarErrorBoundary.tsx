import React, { type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type State = { failed: boolean };

export class AiSidebarErrorBoundary extends React.Component<Props, State> {
  override state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Caught AI sidebar error", error, info.componentStack);
  }

  override render() {
    if (!this.state.failed) return this.props.children;
    if (!this.props.open) return null;
    const zh = navigator.language.toLowerCase().startsWith("zh");
    return (
      <aside
        className="relative h-full w-[min(100vw,380px)] shrink-0 border-l border-slate-200 bg-card max-md:fixed max-md:inset-y-0 max-md:right-0 max-md:z-50"
        role="alert"
      >
        <div className="flex h-full flex-col items-start justify-center gap-3 p-6 text-slate-900">
          <h2 className="text-base font-semibold">{zh ? "AI 側欄暫時無法開啟" : "The AI sidebar cannot open"}</h2>
          <p className="text-sm text-slate-600">
            {zh ? "筆記仍可檢視和編輯。你可以重試側欄，或關閉後繼續使用筆記。" : "You can still view and edit your note. Retry the sidebar or close it to continue."}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
              onClick={() => this.setState({ failed: false })}
            >
              {zh ? "重試側欄" : "Retry sidebar"}
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
              onClick={() => this.props.onOpenChange(false)}
            >
              {zh ? "關閉" : "Close"}
            </button>
          </div>
        </div>
      </aside>
    );
  }
}
