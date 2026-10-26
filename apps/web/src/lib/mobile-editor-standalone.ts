import { emptyDoc, resolveMemoContentDoc, type MemoDetail, type Resource, type TiptapDoc } from "@edgeever/shared";
import { ApiRequestError, api } from "@/lib/api";

export const MOBILE_EDITOR_LEAVE_SAVE_TIMEOUT_MS = 1600;
export const MOBILE_EDITOR_INITIAL_FOCUS_DELAY_MS = 160;
export const MOBILE_EDITOR_DRAFT_STORAGE_PREFIX = "edgeever-mobile-tiptap-draft:";
export const DEFAULT_MOBILE_EDITOR_MEMO_TITLE = "無標題筆記";

export type MobileEditorMemoResponse = {
  memo: MemoDetail;
};

export type MobileEditorResourceResponse = {
  resource: Resource;
};

export type MobileEditorDraft = {
  expectedRevision?: number;
  title: string;
  tagsText: string;
  contentJson: TiptapDoc;
  updatedAt: string;
};

export type MobileEditorSaveState =
  | "loading"
  | "idle"
  | "dirty"
  | "saving"
  | "saved"
  | "compressing"
  | "uploading"
  | "error"
  | "local-draft"
  | "leaving";

export const getMobileEditorSaveLabel = (saveState: MobileEditorSaveState) =>
  saveState === "loading"
    ? "載入中"
    : saveState === "saving"
      ? "儲存中"
      : saveState === "compressing"
        ? "壓縮中"
        : saveState === "uploading"
          ? "上傳中"
          : saveState === "dirty"
            ? "未儲存"
            : saveState === "saved"
              ? "已儲存"
              : saveState === "local-draft"
                ? "本機草稿"
                : saveState === "leaving"
                  ? "返回中"
                  : saveState === "error"
                    ? "儲存失敗"
                    : "已儲存";

export const getMobileEditorStatusClassName = (saveState: MobileEditorSaveState) =>
  saveState === "error"
    ? "error"
    : saveState === "dirty" || saveState === "saving" || saveState === "compressing" || saveState === "uploading" || saveState === "leaving"
      ? "active"
      : "";

export const getMobileEditorParams = () =>
  new URLSearchParams(window.location.hash ? window.location.hash.slice(1) : window.location.search);

export const getMobileEditorDraftKey = (memoId: string | null) =>
  memoId ? `${MOBILE_EDITOR_DRAFT_STORAGE_PREFIX}${memoId}` : "";

export const parseMobileEditorTags = (value: string) =>
  value
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean);

export const safeMobileEditorReturnPath = (value: string | null) => {
  const fallback = import.meta.env.BASE_URL.startsWith(".")
    ? `${import.meta.env.BASE_URL}index.html`
    : import.meta.env.BASE_URL;

  if (value?.startsWith("/")) return value;
  if (import.meta.env.BASE_URL.startsWith(".") && value?.startsWith(`${import.meta.env.BASE_URL}index.html`)) {
    return value;
  }
  return fallback;
};

export const requestMobileEditorJson = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  const headers = new Headers(init?.headers);
  const isFormData = init?.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    credentials: "include",
    ...init,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const error = body && typeof body === "object" && "error" in body ? (body as { error?: { code?: string; message?: string } }).error : undefined;
    const message =
      body && typeof body === "object" && "error" in body
        ? error?.message
        : response.statusText;
    throw new ApiRequestError(message || "Request failed", response.status, error?.code);
  }

  return response.json() as Promise<T>;
};

export const uploadMobileEditorResource = async (memoId: string, file: File) => {
  return api.uploadMemoResource(memoId, file);
};

export const normalizeMobileEditorDoc = (memo: MemoDetail): TiptapDoc => {
  if (!memo.contentJson && !memo.contentMarkdown) {
    return emptyDoc();
  }

  return resolveMemoContentDoc(memo.contentJson, memo.contentMarkdown);
};
