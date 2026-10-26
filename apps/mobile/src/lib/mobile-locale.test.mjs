import { describe, expect, test } from "bun:test";
import { localizeMissingNotebookName, localizeUntitledMemoTitle, toMobileSyncErrorSourceText, translateMobileText } from "./mobile-locale.tsx";

describe("mobile locale translation", () => {
  test("keeps Chinese copy unchanged for the Chinese locale", () => {
    expect(translateMobileText("正在同步筆記", "zh-TW")).toBe("正在同步筆記");
  });

  test("translates mobile-only static copy", () => {
    expect(translateMobileText("正在同步筆記", "en-US")).toBe("Syncing your notes");
    expect(translateMobileText("從相簿選擇", "en-US")).toBe("Choose from library");
    expect(translateMobileText("正在同步筆記", "ja")).toBe("ノートを同期しています");
    expect(translateMobileText("從相簿選擇", "ja")).toBe("ライブラリから選ぶ");
    expect(translateMobileText("正在同步筆記", "pl")).toBe("Synchronizowanie notatek");
    expect(translateMobileText("從相簿選擇", "pl")).toBe("Wybierz z galerii");
  });

  test("translates the buttons, statuses and errors that were shown in Chinese for every locale", () => {
    // These literals reach users through LocalizedText, Alert and Pressable,
    // which only translate copy that has a dictionary entry.
    const copy = [
      "確定", "好的", "登入", "刪除失敗", "刪除中", "恢復中", "恢復失敗", "建立失敗", "請重試",
      "請檢查網路後重試", "當前無法連線實例，請稍後重試", "換個關鍵詞再試", "沒有找到匹配筆記", "重試載入",
      "請先建立一個筆記本", "附件上傳失敗", "儲存中", "準備中", "本機草稿", "未儲存",
      "缺少筆記資料，無法開啟富文字編輯器", "筆記載入失敗", "進入編輯並聚焦標題", "編輯筆記標題",
      "更改筆記所屬筆記本", "選擇歷史記錄後可預覽並恢復。", "當前無法讀取附件。", "當前無法讀取資源。",
      "請等待筆記同步完成。", "資源讀取失敗", "已取消下載", "當前裝置無法開啟系統分享面板",
      "登入成功但服務端沒有返回移動端會話。請確認服務端已更新到支援 App 登入的版本。",
    ];
    // Japanese writes "unsaved" with the same characters as Chinese.
    const sameInJapanese = new Set(["未保存"]);
    for (const locale of ["en-US", "ja", "pl"]) {
      const untranslated = copy.filter((value) => translateMobileText(value, locale) === value
        && !(locale === "ja" && sameInJapanese.has(value)));
      expect({ locale, untranslated }).toEqual({ locale, untranslated: [] });
    }
    expect(translateMobileText("登入", "pl")).toBe("Zaloguj się");
    expect(translateMobileText("確定", "zh-TW")).toBe("確定");
  });

  test("prefers specific mobile-only templates over broader templates", () => {
    expect(translateMobileText("已載入 12 / 40 條筆記", "en-US")).toBe("Loaded 12 of 40 notes");
    expect(translateMobileText("篩選：Pinned · 3 條", "en-US")).toBe("Filter: Pinned · 3 notes");
    expect(translateMobileText("已載入 12 / 40 條筆記", "pl")).toBe("Wczytane notatki: 12 z 40");
    expect(translateMobileText("篩選：Przypięte · 3 條", "pl")).toBe("Filtr: Przypięte · notatki: 3");
  });

  test("uses shared translations for the descendant preference", () => {
    expect(translateMobileText("父筆記本中顯示子筆記本筆記", "en-US")).toBe("Show notes from sub-notebooks");
    expect(translateMobileText("父筆記本中顯示子筆記本筆記", "ja")).toBe("サブノートブックのノートを表示");
    expect(translateMobileText("是否在父筆記本中顯示子筆記本中的筆記", "en-US")).toBe("Show notes from sub-notebooks in parent notebooks");
  });

  test("translates the hidden sub-notebook notes hint", () => {
    const hint = "子筆記本中還有 5 條筆記。可以開啟子筆記本檢視，或在設定中開啟“父筆記本中顯示子筆記本筆記”。";
    expect(translateMobileText(hint, "en-US"))
      .toBe("Its sub-notebooks still contain 5 notes. Open a sub-notebook to see them, or turn on \"Show notes from sub-notebooks\" in Settings.");
    expect(translateMobileText(hint, "ja"))
      .toBe("サブノートブックにはまだ 5 件のノートがあります。サブノートブックを開くか、設定で「サブノートブックのノートを表示」をオンにしてください。");
    expect(translateMobileText(hint, "pl"))
      .toBe("Notatki w podnotatnikach: 5. Otwórz podnotatnik, aby je zobaczyć, lub włącz w ustawieniach opcję „Pokazuj notatki z podnotatników”.");
    expect(translateMobileText("本級暫無筆記", "en-US")).toBe("No notes directly in this notebook");
    expect(translateMobileText("無法儲存“父筆記本中顯示子筆記本筆記”設定，請稍後重試", "en-US"))
      .toBe("Could not save the \"Show notes from sub-notebooks\" setting. Please try again.");
  });

  test("prefers specific shared templates over broader mobile-only templates", () => {
    expect(translateMobileText("永久刪除 3 條筆記", "en-US")).toBe("Delete 3 notes permanently");
    expect(translateMobileText("當前：Inbox，3 條筆記", "en-US")).toBe("Current: Inbox, 3 notes");
  });

  test("translates the mixed English explanations from the Android locale report", () => {
    expect(translateMobileText("修改後會保留當前裝置登入，並退出其他裝置上的登入會話。", "en-US"))
      .toBe("Keeps this device signed in and signs out other sessions.");
    expect(translateMobileText("修改後會保留當前裝置登入，並退出其他裝置上的登入會話。", "ja"))
      .toBe("この端末のログインは維持し、他の端末のセッションは終了します。");
    expect(translateMobileText("新增標籤", "en-US")).toBe("Add tags");
    expect(translateMobileText("沒有找到適合這篇筆記的新標籤。", "en-US")).toBe("No new tags fit this note.");
    expect(translateMobileText("切換產品介面的顯示語言。", "en-US")).toBe("Choose the language used in the app.");
    expect(translateMobileText("當前密碼不正確。", "en-US")).toBe("The current password is incorrect.");
    expect(translateMobileText("修改中...", "ja")).toBe("変更中...");
    expect(translateMobileText("正在剪藏文章", "en-US")).toBe("Clipping article");
    expect(translateMobileText("剪藏失敗", "ja")).toBe("ページを取り込めませんでした");
    expect(translateMobileText("正文剪藏失敗", "en-US")).toBe("Article extraction failed");
    expect(translateMobileText("微信文章請求失敗（HTTP 404）。", "en-US")).toBe("The WeChat article request failed (HTTP 404).");
    expect(translateMobileText("分享的圖片（2 張）", "ja")).toBe("共有された画像（2 枚）");
    expect(translateMobileText("分享的圖片（2 張）", "pl")).toBe("Udostępnione obrazy (2)");
    expect(translateMobileText("剪藏失敗", "pl")).toBe("Nie udało się zapisać strony");
    expect(translateMobileText("修改後會保留當前裝置登入，並退出其他裝置上的登入會話。", "pl"))
      .toBe("To urządzenie pozostanie zalogowane, a pozostałe sesje zostaną wylogowane.");
    expect(translateMobileText("來源：https://example.com", "en-US")).toBe("來源：https://example.com");
  });

  test("localizes only the default untitled title and the missing-notebook fallback", () => {
    expect(localizeUntitledMemoTitle("", "en-US")).toBe("Untitled note");
    expect(localizeUntitledMemoTitle("無標題筆記", "en-US")).toBe("Untitled note");
    expect(localizeUntitledMemoTitle("無標題筆記", "ja")).toBe("無題のノート");
    expect(localizeUntitledMemoTitle("  無標題筆記  ", "zh-TW")).toBe("無標題筆記");
    expect(localizeUntitledMemoTitle("會議記錄", "en-US")).toBe("會議記錄");
    expect(localizeMissingNotebookName("en-US")).toBe("Uncategorized");
    expect(localizeMissingNotebookName("ja")).toBe("未分類");
    expect(localizeMissingNotebookName("pl")).toBe("Nieprzypisane");
    expect(localizeMissingNotebookName("zh-TW")).toBe("未分類");
  });

  test("localizes the suspicious overwrite sync error the server reports in English", () => {
    const source = toMobileSyncErrorSourceText("Save blocked because the title changed while most of the note content disappeared.");
    expect(translateMobileText(source, "pl")).toStartWith("Zapis zablokowany");
    expect(translateMobileText(source, "en-US")).toStartWith("Save blocked: the title changed");
    expect(translateMobileText(source, "zh-TW")).toStartWith("已阻止儲存");
    expect(toMobileSyncErrorSourceText("Network request failed")).toBe("Network request failed");
    expect(toMobileSyncErrorSourceText(null)).toBeNull();
  });
});
