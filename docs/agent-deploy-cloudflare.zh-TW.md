# AI Agent 線上部署 EdgeEver 約定

本檔案為 AI Agent（以及自動化部署工具）在 Cloudflare 上線上部署 EdgeEver 的標準操作規範與約定。

> 💡 **核心原則**：純 Serverless 架構部署，基於 Cloudflare 免費配額執行，無需購買 VPS 或配置 Docker/SSL 證書。

---

## 自動化部署標準步驟

1. **Fork 倉庫**
   - Fork `scupro/edgeever` 到目標 GitHub 賬戶。

2. **建立 Cloudflare 資源**
   - 建立名稱嚴格為 `edgeever` 的 D1 資料庫。
   - 準備 S3 相容的物件儲存桶（Backblaze B2、騰訊雲 COS、阿里雲 OSS、MinIO、Wasabi 等），並記下服務端點、區域、儲存桶名稱與憑證。

3. **Cloudflare 專案匯入**
   - 在 Cloudflare **Workers & Pages** 中匯入 Fork 倉庫，建立名為 `edgeever` 的 Worker。選擇倉庫根目錄和生產分支 `main`。
   - 在 Cloudflare Workers Builds 設定中保留預設部署命令 `npx wrangler deploy`。該命令由 Cloudflare 的構建環境執行，使用者無需在本機執行；倉庫會將其接入 EdgeEver 的受驗證部署流程。應用不要建立為 Pages 專案。
   - 點選 **Save and Deploy** 建立 Worker。首次構建可能因為尚未新增管理員 Secret 而失敗；完成下一步配置後重試。

4. **配置登入憑據與實例引數**
   - **Worker Secret**：Worker 建立後，新增執行時金鑰 `AUTH_PASSWORD`，值為初始管理員登入密碼；建議使用至少 32 個字元的強密碼。
   - 該密碼只配置為 Worker 執行時 Secret，不要複製到 Workers Builds 構建變數；標準部署入口會複用並驗證已存在的 Secret。
   - 可以修改 `wrangler.toml`，包含新增 `[vars]` 區塊設定非敏感環境變數；部署命令仍會根據標準資源名稱生成 `DB` binding，因此不要在控制檯重複新增 binding。
   - 對按舊版檔案部署的已有 Worker，不要要求使用者重新命名管理員帳號。沒有顯式覆蓋時，部署會自動保留線上管理員使用者名稱；物件儲存一律透過 `EDGE_EVER_S3_*` 部署變數設定。

5. **檢查 Workers Builds 配置**
   - 在 Cloudflare 的構建設定中保持倉庫根目錄、`main` 分支和預設部署命令 `npx wrangler deploy`。已有部署若在構建設定中使用顯式的 `bun run build:cloudflare` 與 `bun run deploy:cloudflare-builds` 命令，可繼續沿用。
   - 部署流程會根據 `edgeever` 資料庫名稱自動查詢 D1 UUID，並把實例引數合併寫入臨時生成的 Wrangler 配置。受版本控制的 `wrangler.toml` 可自由調整，包括 `name`、`workers_dev`、`[vars]`、路由與 `compatibility_date`，因為本 Fork 部署的是自有實例，而非上游映象。
   - 請確保 Workers Builds API Token 具有 D1 讀取和編輯權限。高階非敏感自定義引數應放在 `EDGE_EVER_*` Workers Builds 構建變數中。如使用其他資料庫名稱，設定 `EDGE_EVER_D1_DATABASE_NAME`；僅在無法自動查詢 UUID 時設定 `EDGE_EVER_D1_DATABASE_ID`。密碼始終屬於執行時 Secret。

6. **啟動首次構建與服務驗證**
   - 新增執行時 Secret 及使用者要求的使用者名稱覆蓋後，重試構建。部署完成後進行如下自動化驗證：
     - 檢查 `https://<你的 Worker 域名>/api/health` 返回 `200` 狀態碼且 JSON 內容為 `{"ok": true}`。
     - 檢查 `https://<你的 Worker 域名>/api/openapi.json` 可以訪問，且 JSON 含 `"ok": true`。
     - 使用配置的管理員使用者名稱（預設 `admin`）和 `AUTH_PASSWORD` 驗證登入 API。

7. **更新實例**
   - 本部署就是 `scupro/edgeever` 的普通 Fork，倉庫不含任何定時同步上游的工作流程。升級時把所需上游 tag 合併進 Fork 並推送，即可重新觸發 Cloudflare 構建。
   - 執行 `git remote add upstream https://github.com/scupro/edgeever.git`，再 `git fetch upstream --tags`，於部署分支 `git merge upstream/<tag>`（或 rebase）並解決衝突後推送。
   - 推送後依上方 `/api/health` 檢查，並在 Cloudflare **Deployments** 確認對應 commit 已重新部署。

## 可選：自定義初始管理員使用者名稱

普通部署直接使用預設使用者名稱 `admin`，不要主動詢問使用者是否需要修改。僅當使用者明確要求自定義管理員使用者名稱時，才在重試首次構建前透過 Workers Builds 構建變數設定 `AUTH_USER`，並在登入驗證時使用該使用者名稱。管理員帳號已建立後，僅修改該變數不會重新命名現有帳號。
