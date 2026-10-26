# Cloudflare Workers Builds

## 配置

手動匯入倉庫時，按[線上部署文件](deploy-cloudflare-button.zh-TW.md)選擇倉庫根目錄和 `main` 分支，保留預設部署命令 `npx wrangler deploy`。已有專案可繼續使用原來的顯式構建命令和 `bun run deploy:cloudflare-builds`。

授權：

1. 為部署倉庫授權 **Cloudflare Workers & Pages** GitHub App。
2. 如果 Agent 整合需要 Cloudflare API Token，使用限制到目標帳號的 User API Token。
3. 部署 API Token 在 Cloudflare **Worker -> Settings -> Build -> API token** 中配置。預設自動生成的 token 可能沒有 D1 權限；部署前應確認其具備目標賬戶的 D1 讀取與編輯權限。

在 Worker 的 **Settings → Variables and Secrets** 中設定執行時 Secret `EDGE_EVER_AUTH_PASSWORD`，不要放入 Builds 構建變數。

普通部署使用 D1 `edgeever`、S3 相容的物件儲存桶與使用者名稱 `admin`。可選的非敏感實例引數放在 **Settings → Build → Build variables and secrets**；這些變數僅供構建使用，部署命令會據此生成臨時 Wrangler 配置。不要修改倉庫中的 `wrangler.toml`。

未顯式覆蓋時，舊部署會保留當前管理員使用者名稱。

## 更新與排錯

- `main` 推送會自動構建、執行 D1 migration、部署並驗證。
- **Update deployed EdgeEver** 把部署用 Fork 當作上游的 **部署映象** 來維護：
  - 預設 `stable` 通道跟隨最新正式 Release tag。
  - 設定 GitHub Repository Variable `EDGE_EVER_UPDATE_CHANNEL=edge` 後跟隨上游 `main`。
  - 只讀 Fork（未改應用程式碼）會用一個新的線性提交應用目標版本的產品程式碼快照，不安裝依賴，也不執行專案測試套件。
  - 只有顯式設定 `EDGE_EVER_PRESERVE_FORK_CHANGES=true` 的 Fork 才會合併產品程式碼。定製合併會在 push 前執行本機 migration、完整非 E2E 測試、型別檢查和生產構建；任一步失敗都會保持 `main` 與線上版本不變。
  - 更新會保留 Fork 中的 `.github/workflows/**` 和更新輔助指令碼，無需授予 `GITHUB_TOKEN` 改寫工作流的權限。
  - Job **Summary** 會顯示 Git 和部署狀態。*Already on upstream target* / 已對齊表示定時執行未請求部署；push 成功後仍需在 Cloudflare 中確認部署。
  - 請優先用本工作流，而不是 GitHub **Sync fork**。Sync fork 跟的是上游 `main` 歷史，可能讓下一次 stable 執行合理變為 no-op。
- 可選：倉庫 Secret `EDGE_EVER_CLOUDFLARE_DEPLOY_HOOK_URL`，在成功 push 後觸發 Cloudflare Deploy Hook（Git 整合偶發未構建時有用）。
- 手動執行工作流會重新觸發 Cloudflare 構建，即使 Git 已是最新。
- 構建失敗：檢視 Worker **Deployments** 日誌，確認部署 commit SHA 與 Fork `main` 一致。
- 定時任務從不執行：公共 Fork 需在 **Actions** 中啟用 **Update deployed EdgeEver**（Fork 上 schedule 預設禁用，長期不活躍也可能被暫停）。
- 更新 push 被 `without workflows permission` 拒絕：說明 Fork 仍在使用舊版更新器。請用倉庫所有者權限執行一次 GitHub **Sync fork**，再重新執行 **Update deployed EdgeEver**；完成這次引導後，日常產品更新不再需要 **Sync fork**。
