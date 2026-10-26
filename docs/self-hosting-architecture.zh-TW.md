# 自託管與 Docker 架構預留

EdgeEver 透過 Docker 支援 VPS、NAS 和家庭伺服器自託管，同時不會形成第二套
產品實現。Cloudflare 與 Docker 執行同一個 Hono 應用，僅在薄執行入口和基礎
設施轉接器邊界存在差異。

## 當前邊界

API 的業務邏輯和路由邏輯應依賴
`apps/api/src/storage-contract.ts` 中的儲存契約，而不是直接依賴
Cloudflare SDK 型別。目前的具體實現位於
`apps/api/src/cloudflare-storage-adapter.ts`：

- `DatabaseAdapter`：SQL 語句與批處理。
- `BlobStoreAdapter`：附件的 `get`、`put` 和 `delete` 操作。

Cloudflare 將 D1 與 S3 相容物件儲存轉接器注入 `fetchEdgeEverApp`；Bun 入口則向同一個函式
注入 SQLite/檔案系統或 SQLite/S3 轉接器。兩個入口均不得包含路由或業務判斷。

共享的自託管配置結構定義為 `SelfHostedStorageConfig`，包含統一的應用
資料目錄、SQLite 資料庫檔案和附件目錄。

PostgreSQL 已透過與驅動無關的 `RelationalDatabaseAdapter` 和
`PostgreSQLStorageConfig` 契約預留為第二種關聯式資料庫後端，但當前尚未實現。
SQLite 仍是自託管預設資料庫；未來 PostgreSQL 更適合較大團隊、更高寫入併發
以及獨立資料庫運維場景。

## Docker 形態

正式支援的容器部署為單應用容器，只需掛載一個持久化 `/data` 目錄：

```text
EdgeEver 容器
├── SQLite 資料庫          -> /data/edgeever.sqlite
├── 憑據加密根金鑰         -> /data/edgeever-secrets.json
└── 附件儲存               -> /data/resources
```

自託管轉接器繼續複用現有 SQLite 結構和 `migrations/*.sql`；附件繼續使用
`resources.object_key` 中儲存的不透明物件鍵。執行入口支援本機檔案系統和
S3 相容物件儲存兩種後端。

未來實現 PostgreSQL 時，必須明確處理 SQL 方言以及 PostgreSQL 專用的全文搜尋
和事務行為，並提供獨立遷移策略，不能讓現有 SQLite/D1 migration 檔案產生歧義。

## 相容性要求

- 保持 `/api/*`、`/mcp`、`/api/health` 以及探活用的 `/api/openapi.json` 不變。`/api/openapi.json` 不是 API 目錄。
- 繼續追加 `migrations/*.sql`，禁止為 Docker 分叉資料庫結構。
- 根金鑰必須透過環境變數或 Docker secrets 注入，不能寫入映象或資料庫。自託管執行入口可以把副本寫在 `/data`（SQLite 之外），以便 NAS/GUI 升級丟掉容器環境變數後仍能加密憑據。Cloudflare 繼續只使用 Worker Secret。物件儲存 Secret 與個人 AI 模型 API Key 預設從已有實例認證 Secret 派生各自用途的專用金鑰；高階 AI 金鑰輪換場景可選用 `EDGE_EVER_CREDENTIALS_ENCRYPTION_KEY` 覆蓋。所有憑據在資料庫中只能儲存為 AES-GCM 密文。
- 將 `/data` 作為唯一必需的應用持久化路徑，方便 NAS 使用者備份一個卷。
- 生產入口保持 `scripts/self-hosted-server.js`，並保留
  `scripts/self-hosted-server.mjs` 別名，以便 NAS/GUI 繼續使用 v1.62 及更早版本
  儲存的啟動命令。
- 容器入口需要支援 `EDGE_EVER_AUTH_USERNAME`、`EDGE_EVER_AUTH_PASSWORD` 和
  會話配置，同時不能把 Cloudflare 專有配置當作前置條件。
- 登入暴力破解防護必須使用應用層的 SQLite/D1 相容儲存實現；Cloudflare
  Rate Limiting 和 WAF 只能作為部署層的可選增強，不能作為執行前提。
- 健康檢查應區分程序可用、資料庫就緒和附件儲存就緒。

Secret、HTTPS、備份、升級與 NAS 權限等運維說明請檢視
[使用 Docker 部署 EdgeEver](deploy-docker.zh-TW.md)。

Docker 映象與本機開發共用同一個 Bun 執行入口：

```sh
bun run build:web
EDGE_EVER_AUTH_PASSWORD='<強密碼>' bun run start:self-hosted
```

可透過 `EDGE_EVER_DATA_DIR` 指定需要由 Docker 或 NAS 卷持久化的目錄。
長時間流式響應預設使用 120 秒空閒超時。可將
`EDGE_EVER_IDLE_TIMEOUT_SECONDS` 設定為 10 到 255 之間的值進行覆蓋。

同一個入口也可以使用 S3 相容物件儲存：

```sh
EDGE_EVER_STORAGE_BACKEND=s3 \
EDGE_EVER_S3_ENDPOINT='http://minio:9000' \
EDGE_EVER_S3_REGION='us-east-1' \
EDGE_EVER_S3_BUCKET='edgeever' \
EDGE_EVER_S3_ACCESS_KEY_ID='<access-key>' \
EDGE_EVER_S3_SECRET_ACCESS_KEY='<secret-key>' \
bun run start:self-hosted
```

實現使用 `@aws-sdk/client-s3`，Cloudflare Worker 入口不會載入該 SDK。

## AI 模型請求

AI 模型請求預設由客戶端直接發起，包括筆記生成、對話、標籤建議、發現、資訊圖、連線測試、模型列表和擴充套件影片摘要。Web 端初始請求遇到瀏覽器網路或 CORS 限制時，透過已認證的實例中轉兜底。中轉僅允許訪問當前工作區已儲存並啟用的模型服務介面，保留流式輸出和取消能力，不轉發瀏覽器 Cookie。已有 HTTP 響應或開始接收結果後的錯誤不會觸發第二次模型呼叫。桌面端及原生移動端繼續直連，內網端點須能從裝置訪問；Web 端兜底則要求實例能訪問模型地址。舊生成介面仍要求升級客戶端；中轉複用客戶端的 AI 編排邏輯，不在後端重複實現。
