# Cloudflare Workers Builds

## 配置

手動匯入倉庫時，按[線上部署文件](deploy-cloudflare-button.zh-TW.md)選擇倉庫根目錄和 `main` 分支，保留預設部署命令 `npx wrangler deploy`。已有專案可繼續使用原來的顯式構建命令和 `bun run deploy:cloudflare-builds`。

授權：

1. 為部署倉庫授權 **Cloudflare Workers & Pages** GitHub App。
2. 如果 Agent 整合需要 Cloudflare API Token，使用限制到目標帳號的 User API Token。
3. 部署 API Token 在 Cloudflare **Worker -> Settings -> Build -> API token** 中配置。預設自動生成的 token 可能沒有 D1 權限；部署前應確認其具備目標賬戶的 D1 讀取與編輯權限。

在 Worker 的 **Settings → Variables and Secrets** 中設定執行時 Secret `AUTH_PASSWORD`，不要放入 Builds 構建變數。

普通部署使用 D1 `edgeever`、S3 相容的物件儲存桶與使用者名稱 `admin`。可選的非敏感實例引數可放在 **Settings → Build → Build variables and secrets**，也可直接寫在 `wrangler.toml`（`name`、`workers_dev`、路由、`compatibility_date` 與 `[vars]` 區塊）。構建變數僅在構建期間可用，部署命令會把它們合併進臨時 Wrangler 配置，`wrangler.toml` 的值作為預設。

未顯式覆蓋時，舊部署會保留當前管理員使用者名稱。

## 更新與排錯

- `main` 推送會自動構建、執行 D1 migration、部署並驗證。
- 本倉庫不含定時同步上游的工作流，升級需自行執行：
  - `git remote add upstream https://github.com/scupro/edgeever.git`
  - `git fetch upstream --tags`
  - `git merge upstream/<tag>`（或 `git rebase upstream/main`），解決衝突後 `git push`
  - Cloudflare 會針對推送的 commit 建置，同一條流程會套用 migration 並驗證部署。
- 可選：倉庫 Secret `EDGE_EVER_CLOUDFLARE_DEPLOY_HOOK_URL`，在成功 push 後觸發 Cloudflare Deploy Hook（Git 整合偶發未構建時有用）。
- 構建失敗：檢視 Worker **Deployments** 日誌，確認部署 commit SHA 與 Fork `main` 一致。
