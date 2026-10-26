---
draft: false
title: "從 Notion 遷移到自託管筆記應用：EdgeEver 指南"
snippet: "利用 Notion MCP 與 EdgeEver MCP，把 Notion 頁面遷到自託管筆記實例。"
image: {
    src: "/images/notion-migration.jpg",
    alt: "從 Notion 遷移到 EdgeEver"
}
publishDate: "2026-07-06 19:30"
category: "Migration"
author: "EdgeEver Team"
tags: [notion, migration, self-hosted, mcp]
---

得益於 EdgeEver 對 AI Agent 和 Model Context Protocol (MCP) 的原生支援，如果你想將 Notion 筆記庫搬遷到 EdgeEver，最優雅的方式是利用 AI 助手作為資料橋樑，同時掛載 **Notion MCP** 和 **EdgeEver MCP** 服務，實現全自動的雲對雲筆記匯入。

如果目標是自託管筆記而不是繼續留在 Notion，也可以先看 [EdgeEver 作為印象筆記替代方案](/self-hosted-evernote-alternative) 的說明。

### 常見問題

- **這是官方一鍵匯出嗎？** 不是。流程依賴 Notion MCP 與 EdgeEver MCP，由 AI 助手逐頁複製。
- **資料庫和塊屬性會原樣保留嗎？** 請在匯入後核對頁面內容。EdgeEver 是筆記工作區，不是 Notion 資料庫。
- **可以從印象筆記遷嗎？** 可以，見 [印象筆記遷移指南](/blog/evernote-migration-guide)。

---

### 遷移步驟

#### 步驟 1：在 AI 助手中安裝並啟用兩個 MCP 服務

1. **配置 Notion MCP 服務**：
   在你的 AI 助手（如 Claude Code/Cursor/Cline 等）中配置好 Notion MCP 服務。配置成功後，AI 助手將獲得直接讀取你 Notion 頁面（Pages）和資料庫（Databases）的授權。
   
2. **配置 EdgeEver MCP 服務**：
   - 登入你的 EdgeEver 實例，點選左下角的 **個人中心** -> **MCP 設定**。
   - 生成 API Token 並點選 **複製完整 MCP 配置**，安裝到你的 AI 助手中。

確保你的 AI 助手在執行中能夠同時呼叫這兩個 MCP 服務。

#### 步驟 2：對 AI 助手下達遷移指令

複製以下 Prompt 傳送給已經掛載好兩個 MCP 的 AI 助手：

```text
你是我的 AI 助手。現在你同時連線了我的 Notion MCP 服務 and 新 EdgeEver MCP 服務。
請幫我把舊 Notion 裡的筆記和資料庫頁面遷移到新 EdgeEver 中：
1. 首先呼叫 Notion MCP 的讀取介面，分批次讀出我的 Notion 頁面內容（包括標題、正文、建立時間、標籤等）。
2. 然後呼叫 EdgeEver MCP 的寫入介面，將這些讀取到的頁面批次匯入到我的 EdgeEver 實例中。
請在全量遷移完成後，告訴我總共成功同步匯入了多少篇筆記，以及是否有格式轉換失敗的頁面。
```

AI 助手將自動解析並轉換 Notion 的 Block 格式，並呼叫 EdgeEver 介面完成無痛資料寫入。

#### 步驟 3：在網頁端驗證
回到 EdgeEver 網頁端重新整理，確認所有的 Notion 頁面已成功轉入，筆記內容和排版也都已完美同步。
