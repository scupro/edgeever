# Cloudflare 手動部署與恢復

本頁只用於高階配置、故障排查和緊急恢復。普通使用者請使用[從 Fork 線上部署](deploy-cloudflare-button.zh-TW.md)，AI Agent 請使用[AI Agent 線上部署](agent-deploy-cloudflare.zh-TW.md)。

## 首次手動部署

1. Fork 倉庫並克隆到本機。
2. 安裝 Node.js 22+ 和 Bun。
3. 初始化配置和 Cloudflare 資源：

   ```sh
   cp .env.local.example .env.local
   bun install
   EDGE_EVER_PASSWORD='<首次登入密碼>' bun run deploy:setup
   bun run deploy:doctor
   bun run deploy:manual
   ```

`deploy:setup` 會建立或複用 D1，並將配置寫入被 Git 忽略的 `.env.local`。新部署必須提供 `EDGE_EVER_PASSWORD`，生產環境不存在預設密碼。

使用本機 CLI 部署時，可在 `.env.local` 中設定 `EDGE_EVER_DEPLOYMENT_URL=https://<你的 Worker 域名>`，讓部署驗證同時請求線上的 `/api/health`；CI 部署會自動從 Wrangler 輸出中識別公網地址。未顯式配置地址時，本機驗證仍會檢查遠端 D1 schema 和 Worker Secret，並明確提示已跳過線上健康檢查。

部署完成後，確認：

- `/api/health` 返回 `200` 和 `"ok": true`
- `/api/openapi.json` 可以訪問（僅探活，不是 API 目錄）
- `admin` 可以使用透過 `EDGE_EVER_PASSWORD` 提供的密碼登入

## 手動建立資源

```sh
cp .env.local.example .env.local
bun install
bunx wrangler d1 create edgeever
bunx wrangler r2 bucket create edgeever-resources
```

將返回的 D1 ID 和資源名稱寫入 `.env.local`：

```text
EDGE_EVER_D1_DATABASE_ID=<database_id>
EDGE_EVER_S3_ENDPOINT=https://s3.us-west-004.backblazeb2.com
EDGE_EVER_S3_REGION=us-east-1
EDGE_EVER_S3_BUCKET=edgeever-resources
EDGE_EVER_S3_ACCESS_KEY_ID=<access_key_id>
EDGE_EVER_S3_SECRET_ACCESS_KEY=<secret_access_key>
EDGE_EVER_AUTH_USERNAME=admin
EDGE_EVER_AUTH_PASSWORD=<強密碼>
EDGE_EVER_SESSION_TTL_DAYS=400
# 可選的應用層登入防護引數；同樣適用於 Docker + SQLite。
EDGE_EVER_AUTH_LOGIN_WINDOW_SECONDS=900
EDGE_EVER_AUTH_LOGIN_USERNAME_MAX_ATTEMPTS=5
EDGE_EVER_AUTH_LOGIN_USERNAME_COOLDOWN_SECONDS=900
EDGE_EVER_AUTH_LOGIN_IP_MAX_ATTEMPTS=30
EDGE_EVER_AUTH_LOGIN_IP_COOLDOWN_SECONDS=300
```

然後執行：

```sh
bun run deploy:doctor
bun run deploy:manual
```

不要提交 `.env.local`，也不要把密碼寫入 D1。

## 啟用第三方 OSS 設定

在**設定 → 高階設定**中配置相容 S3 API 的物件儲存，並在儲存前使用“測試連線”。
EdgeEver 會使用從現有實例認證 Secret 派生的專用金鑰加密外部 Secret Access Key，
再將其儲存到 D1，無需增加其他加密變數。請保持實例認證 Secret 穩定並安全備份；
丟失或更換它會導致已儲存的外部憑據無法使用。

## 故障恢復

- 資料庫未就緒：確認 D1 binding 為 `DB`，然後執行 `bun run deploy:manual`。
- 鑑權未配置：在 `.env.local` 設定 `EDGE_EVER_AUTH_PASSWORD`，然後重新部署。
- 忘記管理員密碼：

  ```sh
  EDGE_EVER_PASSWORD='<新密碼>' bun run auth:reset-password -- --remote --username admin
  ```

## 自動更新

手動部署完成後，按 [Cloudflare Workers Builds](cloudflare-workers-builds.zh-TW.md) 配置自動部署，並在 Fork 的 **Actions** 中啟用 **Update deployed EdgeEver**。
