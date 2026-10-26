---
draft: false
title: "從 Memos 遷移到 EdgeEver 指南"
snippet: "利用雙 MCP 伺服器聯動，讓 AI 助手自動將 Memos 筆記全部搬遷到 EdgeEver。"
image: {
    src: "/images/memos-migration.jpg",
    alt: "從 Memos 遷移到 EdgeEver"
}
publishDate: "2026-07-06 19:30"
category: "Migration"
author: "EdgeEver Team"
tags: [memos, migration, self-hosted, mcp]
---

由於 EdgeEver 原生支援 AI Agent (Model Context Protocol, MCP) 接入，你甚至不需要匯出任何資料檔案，可以直接利用 AI 助手作為橋樑，同時掛載 **Memos MCP** 和 **EdgeEver MCP** 兩個服務，實現全自動的雲對雲筆記搬家。

---

### 遷移步驟

#### 步驟 1：在 AI 助手中安裝並啟用兩個 MCP 服務

1. **配置 Memos MCP 服務**：
   將你的舊 Memos 實例的 MCP 服務（可以使用 Memos 官方或社群提供的 MCP 外掛）配置到你的 AI 助手（如 Claude Code/Cursor 等）中。
   
2. **配置 EdgeEver MCP 服務**：
   - 登入你的 EdgeEver 實例，點選左下角的 **個人中心** -> **MCP 設定**。
   - 生成 API Token 並點選 **複製完整 MCP 配置**。
   - 將此配置貼上傳送並安裝到你的 AI 助手中。

確保你的 AI 助手在執行中能夠同時訪問並呼叫這兩個 MCP 服務。

#### 步驟 2：給 AI 助手傳送指令開始搬家

複製以下 Prompt 直接傳送給已經掛載好兩個 MCP 的 AI 助手：

```text
你是我的 AI 助手。現在你同時連線了我的舊 Memos MCP 服務和新 EdgeEver MCP 服務。
請幫我把舊 Memos 裡的所有筆記遷移到新 EdgeEver 中：
1. 首先呼叫 Memos MCP 的讀取/獲取介面，分批次讀取出我所有的舊 Memos 筆記（包含文字、建立時間、標籤等資訊）。
2. 然後呼叫 EdgeEver MCP 的建立/寫入介面，將這些讀取到的筆記批次寫入到我的 EdgeEver 實例中。
請在全量遷移完成後，告訴我總共成功同步匯入了多少條筆記。
```

AI 助手將全自動呼叫 Memos 介面讀取資料，並同時呼叫 EdgeEver 介面寫入，實現全自動的“雙 MCP 資料橋接”遷移。

#### 步驟 3：在網頁端驗證
回到 EdgeEver 網頁端重新整理，確認所有的 Memos 筆記已成功錄入，時間戳和標籤也都已完美同步。
