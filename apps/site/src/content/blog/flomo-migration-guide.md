---
draft: false
title: "從 flomo 遷移到 EdgeEver 指南"
snippet: "匯出 flomo 筆記，配置 EdgeEver MCP，用一條 Prompt 完成全量遷移。"
image: {
    src: "/images/flomo-migration.jpg",
    alt: "從 flomo 遷移到 EdgeEver"
}
publishDate: "2026-07-31 22:13"
category: "Migration"
author: "EdgeEver Team"
tags: [flomo, migration, mcp]
---

### 步驟 1：匯出 flomo

在 flomo 網頁版或桌面客戶端中，點選左上角使用者名稱及會員標識右側的小下拉箭頭，在賬戶選單中進入 **設定 → 帳號詳情**，然後滾動帳號詳情內容區到頁面最下方，點選全域性匯出並下載 HTML 匯出 ZIP。

### 步驟 2：配置 EdgeEver MCP

在 EdgeEver 的 **設定 → API & MCP 授權** 中生成具有筆記、筆記本和資源讀寫權限的 Token，點選 **複製完整 MCP 配置**，並將其配置到 Codex、Claude Code、Cursor 等 AI Agent 中。

### 步驟 3：傳送一條 Prompt 完成匯入

把下面的 `/path/to/flomo-export.zip` 替換成真實路徑，然後將整段 Prompt 傳送給已經連線 EdgeEver MCP 的 Agent：

```text
請透過已配置的 EdgeEver MCP，將 `/path/to/flomo-export.zip` 中的全部筆記遷移到 `flomo` 筆記本，完整保留正文、標籤、建立時間、圖片和附件。遷移完成後校驗完整性並報告結果。
```

確認遷移完整前，請保留原始 flomo ZIP。
