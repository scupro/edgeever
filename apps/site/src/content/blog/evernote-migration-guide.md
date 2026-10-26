---
draft: false
title: "從印象筆記遷移到自託管筆記應用：EdgeEver ENEX 完整指南"
snippet: "透過 ENEX、evernote-backup 與 EdgeEver MCP，完整遷移筆記、附件、時間資訊和巢狀筆記本。"
image: {
    src: "/images/evernote-migration.jpg",
    alt: "從印象筆記遷移到 EdgeEver"
}
publishDate: "2026-07-02 01:00"
category: "Migration"
author: "EdgeEver Team"
tags: [evernote, migration, self-hosted, mcp]
---

> EdgeEver 與印象筆記、Evernote 無關聯。本指南僅用於說明使用者如何將自己擁有的資料遷移到 EdgeEver。印象筆記和 Evernote 是其各自權利人的商標。

我們推薦使用 AI 程式設計助手（如 Antigravity、Claude Code、Cursor 等）自動執行遷移。核心倉庫遷移指南說明：該方案已完成記憶體流式最佳化與空文字預處理，能應對數 GB 級別超大筆記庫，並保留建立/修改時間與巢狀筆記本目錄層級。

如果還在比較「自託管印象筆記替代方案」，可先看 [EdgeEver 品類說明](/self-hosted-evernote-alternative)，再按下面步驟搬家。

### 常見問題

- **會保留筆記本、附件和時間嗎？** 檔案化流程會保留建立/修改時間與巢狀筆記本層級。匯入後請抽查帶圖片的筆記。
- **必須用 AI 助手嗎？** 推薦，但不是唯一路徑。也可以下載 `scripts/import-evernote-enex-via-mcp.mjs`，按指令碼註釋手動執行。
- **和印象筆記官方有關係嗎？** 沒有。本指南只處理你自己擁有的資料。

---

### 步驟 1：配置並安裝 EdgeEver MCP 服務

1. 點選網頁端左下角的 **設定（Settings）** 圖示。
2. 在 **API & MCP 授權** 卡片生成 Token 後，點選 **複製完整 MCP 配置** 按鈕。
3. 把複製的 JSON 配置直接傳送給你的 AI 程式設計助手，讓它幫你配置到當前 AI 客戶端中：

```text
你是 AI 程式設計助手。這是我的 EdgeEver MCP 服務配置 JSON。請幫我把這個 MCP 服務直接配置到我當前使用的 AI 編輯器/客戶端（如 Claude Code, Cursor, Cline 等）的 MCP 伺服器配置檔案中：

<在此處貼上剛才複製的 JSON 配置內容>
```

---

### 步驟 2：使用 AI 助手拉取並匯入筆記

當 AI 助手配置好 MCP 後，複製以下 Prompt 傳送給它，讓它自動拉取印象筆記資料並匯入：

```text
你是 AI 程式設計助手。請幫我把本機的印象筆記全量遷移到我當前部署的 EdgeEver 實例中：
1. 檢查並使用 `pipx install evernote-backup` 自動安裝備份工具。
2. 提示我輸入印象筆記的使用者名稱和密碼並初始化資料庫（指定 china 後端），隨後同步資料並匯出到 `./evernote-export` 目錄。
3. 從 GitHub 下載最新版遷移指令碼：`https://raw.githubusercontent.com/tianma-if/edgeever/main/scripts/import-evernote-enex-via-mcp.mjs` 到本機。
4. 安裝指令碼所需的本機圖片壓縮庫 `sharp` 和 `fast-xml-parser` 依賴。
5. 使用先前配置的 URL 和 Token 執行該指令碼完成遷移（指令碼會自動進行 WebP 圖片轉換）：
   - 全量遷移：`bun import-evernote-enex-via-mcp.mjs --input "./evernote-export" --yes`
   - 指定遷移某些筆記本：追加 `--include "筆記本A,筆記本B"` 引數。

請告訴我你需要什麼資訊（如帳號密碼），收到後直接併發自動執行上述步驟。
```

> 手動模式備用：如果不使用 AI 助手，也可以前往 GitHub 倉庫 [EdgeEver GitHub](https://github.com/tianma-if/edgeever) 下載 `scripts/import-evernote-enex-via-mcp.mjs` 指令碼，並按指令碼頭部註釋執行。

---

### 步驟 3：在網頁端驗證匯入結果

1. 匯入完成後，回到 EdgeEver 網頁端並重新整理頁面。
2. 檢查左側欄，確認印象筆記原有的「筆記本組（堆疊）」層級結構已還原。
3. 開啟幾篇包含多張圖片的筆記，驗證其中的圖片是否已成功在編輯器中載入並能清晰顯示。
