import { ApiRequestError } from "@edgeever/client";
import { translateMobileText } from "./mobile-locale";

export type MobileLoginLocale = "zh-TW" | "en-US" | "ja" | "pl";

export const MISSING_MOBILE_SESSION_MESSAGE = "登入成功但服務端沒有返回移動端會話。請確認服務端已更新到支援 App 登入的版本。";

const appendDiagnostics = (
  message: string,
  diagnosticCode: string,
  rayId?: string,
) => `${message}\n${diagnosticCode}${rayId ? ` · Ray ID: ${rayId}` : ""}`;

export const formatMobileLoginError = (error: unknown, locale: MobileLoginLocale) => {
  const english = locale !== "zh-TW";

  if (error instanceof ApiRequestError) {
    const rayId = error.responseDiagnostics?.rayId;

    if (error.responseDiagnostics?.cloudflareMitigated) {
      return appendDiagnostics(
        english
          ? "A Cloudflare browser challenge intercepted the login API. Ask the instance administrator to adjust the WAF Challenge rule for the API."
          : "Cloudflare 人機驗證攔截了登入介面。請實例管理員調整針對 API 的 WAF Challenge 規則。",
        "cloudflare_challenge",
        rayId,
      );
    }
    if (error.code === "auth_not_configured") {
      return appendDiagnostics(
        english ? "Sign-in is not configured for this instance." : "這個實例還沒有配置登入功能。",
        "auth_not_configured",
        rayId,
      );
    }
    if (error.code === "database_not_ready") {
      return appendDiagnostics(
        english ? "The instance database is not ready." : "實例資料庫尚未就緒。",
        "database_not_ready",
        rayId,
      );
    }
    if (error.code === "password_hash_invalid") {
      return appendDiagnostics(
        english ? "The instance password configuration is invalid." : "實例的密碼配置無效。",
        "password_hash_invalid",
        rayId,
      );
    }
    if (error.code === "login_rate_limited" || error.status === 429) {
      return appendDiagnostics(
        english ? "Too many sign-in attempts. Try again later." : "登入嘗試次數過多，請稍後再試。",
        "login_rate_limited",
        rayId,
      );
    }
    if (error.code === "unauthorized" || error.status === 401) {
      return appendDiagnostics(
        english ? "The username or password is incorrect." : "使用者名稱或密碼不正確。",
        "invalid_credentials",
        rayId,
      );
    }
    if (error.status === 404) {
      return appendDiagnostics(
        english
          ? "No EdgeEver API was found at this instance address."
          : "該實例地址沒有找到 EdgeEver API，請檢查地址。",
        "edgeever_api_not_found",
        rayId,
      );
    }
    if (error.status === 403) {
      const isEdgeEverApiError = error.responseDiagnostics?.isEdgeEverApiError;
      return appendDiagnostics(
        isEdgeEverApiError
          ? (english ? "The instance rejected the login request." : "實例拒絕了登入請求。")
          : (english
            ? "A security policy blocked the request before it reached EdgeEver. Check Cloudflare Security Events, Access, WAF, or reverse-proxy rules."
            : "登入請求在到達 EdgeEver 前被安全策略攔截。請檢查 Cloudflare Security Events、Access、WAF 或反向代理規則。"),
        isEdgeEverApiError ? error.code || "http_403" : "security_policy_blocked",
        rayId,
      );
    }
    if (error.status >= 500) {
      return appendDiagnostics(
        english
          ? `The instance returned a server error (HTTP ${error.status}).`
          : `實例服務異常（HTTP ${error.status}）。`,
        `http_${error.status}`,
        rayId,
      );
    }
    return appendDiagnostics(
      english
        ? `The instance rejected the request (HTTP ${error.status}).`
        : `實例拒絕了請求（HTTP ${error.status}）。`,
      error.code || `http_${error.status}`,
      rayId,
    );
  }

  if (error instanceof Error && error.message === MISSING_MOBILE_SESSION_MESSAGE) {
    return appendDiagnostics(translateMobileText(error.message, locale), "mobile_session_missing");
  }

  if (error instanceof TypeError) {
    return appendDiagnostics(
      english
        ? "Unable to reach the instance. Check its address and your network connection."
        : "無法連線實例，請檢查實例地址和網路連線。",
      "network_unreachable",
    );
  }

  if (error instanceof SyntaxError) {
    return appendDiagnostics(
      english
        ? "The server response is not a valid EdgeEver response."
        : "服務端返回的內容不是有效的 EdgeEver 響應。",
      "invalid_instance_response",
    );
  }

  return appendDiagnostics(
    english ? "Sign-in failed. Try again later." : "登入失敗，請稍後再試。",
    "unexpected_login_error",
  );
};
