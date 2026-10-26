import { describe, expect, test } from "bun:test";
import { ApiRequestError } from "@edgeever/client";
import { formatMobileLoginError, MISSING_MOBILE_SESSION_MESSAGE } from "./login-error.ts";

describe("mobile login error messages", () => {
  test("explains a Cloudflare challenge and preserves its Ray ID", () => {
    const error = new ApiRequestError("Request failed", 403, undefined, undefined, {
      cloudflareMitigated: true,
      isEdgeEverApiError: false,
      rayId: "abc123-NRT",
    });

    expect(formatMobileLoginError(error, "zh-TW")).toContain("Cloudflare 人機驗證攔截了登入介面");
    expect(formatMobileLoginError(error, "zh-TW")).toContain("cloudflare_challenge · Ray ID: abc123-NRT");
    expect(formatMobileLoginError(error, "en-US")).toContain("A Cloudflare browser challenge intercepted the login API");
  });

  test("distinguishes credentials, edge security blocks, and EdgeEver 403 responses", () => {
    expect(formatMobileLoginError(new ApiRequestError("Unauthorized", 401), "zh-TW"))
      .toContain("使用者名稱或密碼不正確");

    const blocked = new ApiRequestError("Forbidden", 403, undefined, undefined, {
      cloudflareMitigated: false,
      isEdgeEverApiError: false,
      rayId: "def456-SJC",
    });
    expect(formatMobileLoginError(blocked, "zh-TW")).toContain("安全策略攔截");
    expect(formatMobileLoginError(blocked, "zh-TW")).toContain("security_policy_blocked");

    const forbidden = new ApiRequestError("Forbidden", 403, "forbidden", undefined, {
      cloudflareMitigated: false,
      isEdgeEverApiError: true,
    });
    expect(formatMobileLoginError(forbidden, "en-US")).toContain("The instance rejected the login request");
  });

  test("provides actionable network and server messages", () => {
    expect(formatMobileLoginError(new TypeError("Failed to fetch"), "en-US"))
      .toContain("Unable to reach the instance");
    expect(formatMobileLoginError(new ApiRequestError("Unavailable", 503), "zh-TW"))
      .toContain("實例服務異常（HTTP 503）");
  });

  test("keeps the missing mobile session guidance in each language", () => {
    const error = new Error(MISSING_MOBILE_SESSION_MESSAGE);
    expect(formatMobileLoginError(error, "zh-TW"))
      .toBe(`${MISSING_MOBILE_SESSION_MESSAGE}\nmobile_session_missing`);
    expect(formatMobileLoginError(error, "en-US"))
      .toBe("Signed in, but the server did not return a mobile session. Make sure the server is updated to a version that supports app sign-in.\nmobile_session_missing");
    expect(formatMobileLoginError(error, "ja"))
      .toContain("サーバーがモバイルセッションを返しませんでした");
    expect(formatMobileLoginError(error, "pl"))
      .toContain("serwer nie zwrócił sesji mobilnej");
    expect(formatMobileLoginError(new Error("Something else"), "en-US"))
      .toBe("Sign-in failed. Try again later.\nunexpected_login_error");
  });
});
