# Claude Code 自建閘道器配置

桌面端 Claude Code 連線元件在本機執行。憑證和模型配置屬於 Claude Code，與 EdgeEver 實例中配置的 AI 服務商相互獨立。

從 Finder 或 Dock 啟動的應用不會讀取 `~/.zshrc`。請將持久配置寫入使用者級 `~/.claude/settings.json`，不要僅依賴 shell 中的 export。EdgeEver 為 ACP 建立臨時工作目錄，因此開發專案 `.claude/` 目錄中的配置不會配置這些會話。

將下面的示例合併到已有使用者配置中，不要覆蓋其他設定。將地址、金鑰和模型 ID 替換成閘道器接受的實際值：

```json
{
  "model": "opus",
  "env": {
    "ANTHROPIC_BASE_URL": "https://your-gateway.example",
    "ANTHROPIC_API_KEY": "your-api-key",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "your-gateway-full-model-id"
  }
}
```

該配置選擇 `opus` 系列，並將其對映到閘道器的完整模型 ID。如果選擇 Sonnet 或 Haiku，還需配置對應的 `ANTHROPIC_DEFAULT_SONNET_MODEL` 或 `ANTHROPIC_DEFAULT_HAIKU_MODEL`。如果閘道器要求使用 `ANTHROPIC_AUTH_TOKEN` 而非 `ANTHROPIC_API_KEY`，請遵循閘道器說明，避免設定相互衝突的憑證。

該檔案包含憑證，請妥善保管。已有 shell 環境變數也可能影響模型選擇；連線元件優先使用 `ANTHROPIC_MODEL`，其次使用 `model` 設定。從終端啟動 EdgeEver 時，請檢查是否有衝突的 export。

在 EdgeEver 的“設定 → 模型與代理”中選擇“Claude Code”，重新檢查連線，再傳送一條簡短訊息確認閘道器實際接受配置的模型。連線檢查成功不能驗證模型權限、閘道器可用性或計費額度。

轉接器明確報告沒有憑證時，EdgeEver 顯示“未登入 / 缺少憑證”。轉接器宣告支援認證狀態報告但沒有返回狀態時，EdgeEver 提示無法驗證認證狀態。沒有該擴充套件的舊連線元件保留基於會話建立的連線檢查方式。

轉接器 stderr 經過限量、脫敏後，以 `acp.adapter-stderr` 事件寫入 `desktop.log`。macOS 預設位置為 `~/Library/Application Support/EdgeEver/logs/desktop.log`；自定義桌面資料目錄會改變此位置。分享前請檢查日誌，不要分享配置檔案或憑證。

參考：[Claude Code 配置](https://code.claude.com/docs/en/settings)、[模型配置](https://code.claude.com/docs/en/model-config)。
