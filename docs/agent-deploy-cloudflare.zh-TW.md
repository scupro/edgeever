# AI Agent 線上部署 EdgeEver 約定

本檔案為 AI Agent（以及自動化部署工具）在 Cloudflare 上線上部署 EdgeEver 的標準操作規範與約定。

> 💡 **核心原則**：純 Serverless 架構部署，基於 Cloudflare 免費配額執行，無需購買 VPS 或配置 Docker/SSL 證書。

---

## 自動化部署標準步驟

1. **Fork 倉庫**
   - Fork `tianma-if/edgeever` 到目標 GitHub 賬戶。

2. **建立 Cloudflare 資源**
   - 建立名稱嚴格為 `edgeever` 的 D1 資料庫。
   - 準備 S3 相容的物件儲存桶（Backblaze B2、騰訊雲 COS、阿里雲 OSS、MinIO、Wasabi 等），並記下服務端點、區域、儲存桶名稱與憑證。

3. **Cloudflare 專案匯入**
   - 在 Cloudflare **Workers & Pages** 中匯入 Fork 倉庫，建立名為 `edgeever` 的 Worker。選擇倉庫根目錄和生產分支 `main`。
   - 在 Cloudflare Workers Builds 設定中保留預設部署命令 `npx wrangler deploy`。該命令由 Cloudflare 的構建環境執行，使用者無需在本機執行；倉庫會將其接入 EdgeEver 的受驗證部署流程。應用不要建立為 Pages 專案。
   - 點選 **Save and Deploy** 建立 Worker。首次構建可能因為尚未新增管理員 Secret 而失敗；完成下一步配置後重試。

4. **配置登入憑據與實例引數**
   - **Worker Secret**：Worker 建立後，新增執行時金鑰 `EDGE_EVER_AUTH_PASSWORD`，值為初始管理員登入密碼；建議使用至少 32 個字元的強密碼。
   - 該密碼只配置為 Worker 執行時 Secret，不要複製到 Workers Builds 構建變數；標準部署入口會複用並驗證已存在的 Secret。
   - 不要修改 `wrangler.toml`，也不要在控制檯重複新增 binding。部署命令會根據標準資源名稱生成 `DB` binding。
   - 對按舊版檔案部署的已有 Worker，不要要求使用者重新命名管理員帳號。沒有顯式覆蓋時，部署會自動保留線上管理員使用者名稱；物件儲存一律透過 `EDGE_EVER_S3_*` 部署變數設定。

5. **檢查 Workers Builds 配置**
   - 在 Cloudflare 的構建設定中保持倉庫根目錄、`main` 分支和預設部署命令 `npx wrangler deploy`。已有部署若在構建設定中使用顯式的 `bun run build:cloudflare` 與 `bun run deploy:cloudflare-builds` 命令，可繼續沿用。
   - 部署流程會根據 `edgeever` 資料庫名稱自動查詢 D1 UUID，並把所有實例引數僅寫入臨時生成的 Wrangler 配置。受版本控制的 `wrangler.toml` 必須保持不變；若把實例專屬配置提交到該檔案，部署會直接拒絕，避免 Fork 因基礎設施配置產生分叉。
   - 請確保 Workers Builds API Token 具有 D1 讀取和編輯權限。高階非敏感自定義引數應放在 `EDGE_EVER_*` Workers Builds 構建變數中。如使用其他資料庫名稱，設定 `EDGE_EVER_D1_DATABASE_NAME`；僅在無法自動查詢 UUID 時設定 `EDGE_EVER_D1_DATABASE_ID`。密碼始終屬於執行時 Secret。

6. **啟動首次構建與服務驗證**
   - 新增執行時 Secret 及使用者要求的使用者名稱覆蓋後，重試構建。部署完成後進行如下自動化驗證：
     - 檢查 `https://<你的 Worker 域名>/api/health` 返回 `200` 狀態碼且 JSON 內容為 `{"ok": true}`。
     - 檢查 `https://<你的 Worker 域名>/api/openapi.json` 可以訪問，且 JSON 含 `"ok": true`。
     - 使用配置的管理員使用者名稱（預設 `admin`）和 `EDGE_EVER_AUTH_PASSWORD` 驗證登入 API。

7. **驗證上游更新通道**
   - 在 Fork 倉庫的 **Actions** 標籤頁中啟用 **Update deployed EdgeEver**（公共 Fork 上定時任務預設關閉，必須手動啟用）。
   - 普通 Fork 預設作為部署映象，無需配置任何更新變數：工作流會把所選上游 Release 的產品程式碼快照應用到 `main`，再觸發 Cloudflare。
   - 更新器會把 Fork 自己的完整 `.github/workflows/**` 目錄及兩個更新輔助指令碼作為穩定的本機引導層保留。官方打包、簽名、測試與 Release 工作流繼續透過 `tianma-if/edgeever` 倉庫門禁限制執行，也不會被下游產品更新改寫。
   - 只有明確維護了應用程式碼修改的 Fork，才應建立 Actions 倉庫變數 `EDGE_EVER_PRESERVE_FORK_CHANGES=true`。啟用後改為 merge，並由倉庫所有者處理未來衝突；普通部署無需設定。
   - 在 Fork 的 **Actions** 中手動執行一次 **Update deployed EdgeEver**。即使 Fork 已對齊，手動執行也會重新發布所選版本，確保 Cloudflare 收到新的構建事件。
   - 開啟 Job **Summary**，確認 Fork mode 為 `mirror`，並顯示上游目標（stable Release 或 edge `main`），以及「已釋出更新」或明確的「已對齊」結果。
   - 若發生了 push，確認 Cloudflare **Deployments** 構建的是對應的 `main` commit。
   - 普通部署 Fork 不應修改部署檔案，日常升級也不要依賴 GitHub **Sync fork**；本工作流就是唯一需要的同步路徑。只有舊 Fork 必須取得新版更新工作流本身時，才使用一次 **Sync fork**，之後繼續使用 **Update deployed EdgeEver**。

## 可選：自定義初始管理員使用者名稱

普通部署直接使用預設使用者名稱 `admin`，不要主動詢問使用者是否需要修改。僅當使用者明確要求自定義管理員使用者名稱時，才在重試首次構建前透過 Workers Builds 構建變數設定 `EDGE_EVER_AUTH_USERNAME`，並在登入驗證時使用該使用者名稱。管理員帳號已建立後，僅修改該變數不會重新命名現有帳號。
