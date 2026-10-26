# 本機 ACP Agent 的筆記庫訪問

桌面端在使用者向支援會話級 MCP 服務的本機 Agent 傳送訊息時，自動提供當前登入帳號的 EdgeEver MCP 工具。使用者無需在該 Agent 中配置 EdgeEver 實例或建立 API Token。工具遵循現有服務端筆記權限，可讀取、建立、修改和刪除當前工作區中的內容。Agent 的其他本機工具權限仍由其自身和 ACP 客戶端控制。

Claude Code 使用 ACP 專案提供的 `claude-agent-acp` 連線元件，Hermes Agent 使用 `hermes acp`；兩者均支援會話級 MCP 服務。請先分別安裝連線元件或 Agent 並完成認證，再在 EdgeEver 中選擇。OpenClaw 使用 `openclaw acp`，但它拒絕會話級 MCP 服務，因此可在 EdgeEver 中使用 ACP 對話，卻無法自動訪問當前帳號的筆記。如需讓 OpenClaw 訪問筆記，需在其 Gateway 中配置 EdgeEver MCP，並核對目標實例和帳號。

對於支援會話級 MCP 的 Agent，桌面主程序保留登入會話憑據，併為每次對話輪次建立僅監聽本機的臨時轉發入口。Agent 獲得的是該入口的臨時憑據；輪次結束、取消或當前實例及登入會話改變時，入口失效。無法確認當前登入狀態時，不啟動帶筆記工具的 Agent 輪次。

ACP 會話中的服務名為 `edgeever-current-workspace`。如果 Agent 自己已經配置了 EdgeEver MCP，它可能同時看到兩套工具。協議層面不會衝突，但兩套配置可能指向不同的實例或帳號，也可能導致重複寫入。EdgeEver 會在會話中指示 Agent 使用本次提供的服務，並在設定中提示使用者核對既有配置；ACP 協議無法保證覆蓋或移除 Agent 的持久 MCP 配置。

本功能改變了本機 ACP Agent 的權限邊界。正式釋出前仍須在受支援的真實 Agent、打包桌面客戶端和舊版本升級鏈路上驗證工具發現、帳號切換、讀寫及失敗恢復。
