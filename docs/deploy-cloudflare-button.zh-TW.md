# EdgeEver 手動線上部署指南

透過 GitHub 和 Cloudflare 在瀏覽器中部署 EdgeEver，無需本機安裝程式碼或配置伺服器。

---

## 前置準備

- **GitHub 賬戶**（用於 Fork 倉庫及配置自動更新）
- **Cloudflare 賬戶**（用於託管 Worker 邏輯與 SQLite 資料庫）
- **S3 相容的物件儲存賬戶**（用於筆記附件與圖片；EdgeEver 不再內建 Cloudflare R2 儲存桶）

---

## 首次部署

### 步驟 1：Fork 倉庫

1. 訪問 EdgeEver 官方倉庫：`https://github.com/tianma-if/edgeever`。
2. 點選右上角 **Fork** 按鈕，將倉庫 Fork 到您的個人 GitHub 賬戶下。

---

### 步驟 2：在 Cloudflare 建立儲存與資料庫資源

登入 [Cloudflare Dashboard](https://dash.cloudflare.com/)；入口變化時參考官方的 [D1](https://developers.cloudflare.com/d1/get-started/) 指南：

1. **建立 D1 資料庫**：
   - 在 **Storage & databases** 中開啟 **D1 SQL Database**，點選 **Create database**。
   - 資料庫名稱嚴格填入：`edgeever`，點選 **Create**。
2. **準備 S3 相容的物件儲存桶**（用於儲存筆記附件與圖片）：
   - EdgeEver 不綁定 Cloudflare R2 儲存桶，任意 S3 相容服務皆可，例如 Backblaze B2（免費 10 GB）、騰訊雲 COS、阿里雲 OSS、MinIO 與 Wasabi。
   - 建立儲存桶（例如 `edgeever-resources`），並記下服務端點、區域、儲存桶名稱、存取金鑰 ID 與存取金鑰。

---

### 步驟 3：匯入專案

1. 開啟 **Workers & Pages**，點選 **Create application** → **Import a repository** 旁的 **Get started**。入口變化時參考 [Cloudflare 官方步驟](https://developers.cloudflare.com/workers/ci-cd/builds/#connect-a-new-worker)。
2. 按提示連線 GitHub 賬戶，授權 Cloudflare 訪問該 Fork，並選中您剛才 Fork 的 `edgeever` 倉庫。
3. 在專案設定中：
   - **Worker 名稱**：`edgeever`，與根目錄 `wrangler.toml` 中的 `name` 一致
   - **Git branch**（或 **Production branch**）：選擇 `main`
   - **Root directory**：保持留空，使用倉庫根目錄
   - Deploy command: npx wrangler deploy（保留 Cloudflare 預設值，由 Workers Builds 線上執行，無需在本機執行）
   - **API token**：自動生成的 token 可能沒有 D1 權限。選擇或建立限定到目標賬戶、具備 D1 讀取與編輯權限的 User API Token；權限不足時按構建日誌調整後重試。

部署命令會自動生成 `DB` binding，並查詢 D1 UUID。不要修改 `wrangler.toml` 或在控制檯重複新增 binding。

---

### 步驟 4：建立專案並設定管理員密碼

點選 **Save and Deploy** 建立 Worker。首次構建會因缺少管理員 Secret 而校驗失敗；先不要使用站點地址。在 Worker 的 **Settings** → **Variables and Secrets** 中點選 **Add**，新增執行時 Secret 並點選 **Deploy**：

| 型別 (Type) | 名稱 (Name) | 值 (Value) | 說明 |
| :--- | :--- | :--- | :--- |
| **Secret** | `EDGE_EVER_AUTH_PASSWORD` | 建議至少 32 個字元的強密碼 | 管理員登入密碼 |
| **Secret** | `EDGE_EVER_S3_SECRET_ACCESS_KEY` | 物件儲存帳戶的存取金鑰 | 物件儲存憑證 |

`EDGE_EVER_AUTH_PASSWORD` 是變數名，值是管理員登入密碼。它屬於 Worker 執行時 Secret，不是 Workers Builds 構建變數。

返回構建記錄並重試，確認構建及線上健康檢查成功。

---

### 步驟 5：驗證部署、登入與自動更新

1. 構建完成後，Cloudflare 會為您生成一個二級域名（如 `https://edgeever.your-subdomain.workers.dev`）。您也可以在 Worker 的 **Settings → Domains & Routes** 中繫結自己的自定義域名（強烈建議繫結自定義域名以保障國內直連穩定性並提升訪問速度）。
2. 在瀏覽器開啟該域名下的健康檢查介面：`https://你的域名/api/health`，確認返回 `200` 及 JSON：
   ```json
   { "ok": true }
   ```
3. 開啟主站首頁，輸入您配置的管理員使用者名稱（預設是 `admin`）和密碼（`EDGE_EVER_AUTH_PASSWORD`）測試登入並開始使用。
4. 返回 Fork 的 GitHub 倉庫 **Actions** 頁面，點選 **I understand my workflows, go ahead and enable them** 啟用工作流。
5. 手動執行一次 **Update deployed EdgeEver**，確保未來可自動跟進上游更新，並確認 Cloudflare 收到這次構建事件。

---

## 高階配置：更新通道設定

預設情況下，**Update deployed EdgeEver** 跟隨官方正式 Release（穩定版）。若希望跟隨上游 `main`（Edge 預覽版），請在 Fork 倉庫設定 **GitHub Repository Variable**（**Settings → Secrets and variables → Actions → Variables**）：

```text
EDGE_EVER_UPDATE_CHANNEL=edge
```

手動執行工作流時也可以直接選擇 `stable` / `edge`。

## 高階配置：實例引數

自定義實例時，在 Worker 的 **Settings → Build → Build variables and secrets** 中新增非敏感構建變數：

| 構建變數 | 用途 |
| :--- | :--- |
| `EDGE_EVER_AUTH_USERNAME` | 管理員使用者名稱，預設為 `admin` |
| `EDGE_EVER_WORKER_NAME` | Worker 名稱 |
| `EDGE_EVER_D1_DATABASE_NAME` | D1 資料庫名稱，UUID 會自動查詢 |
| `EDGE_EVER_D1_DATABASE_ID` | 自動查詢不可用時的可選 UUID 兜底值 |
| `EDGE_EVER_S3_ENDPOINT` | 物件儲存服務端點，例如 `https://s3.us-west-004.backblazeb2.com` |
| `EDGE_EVER_S3_REGION` | 物件儲存區域，預設 `us-east-1` |
| `EDGE_EVER_S3_BUCKET` | 存放筆記附件與圖片的儲存桶 |
| `EDGE_EVER_S3_ACCESS_KEY_ID` | 物件儲存存取金鑰 ID |
| `EDGE_EVER_S3_FORCE_PATH_STYLE` | MinIO 等僅支援路徑風格的服務請設為 `true` |
| `EDGE_EVER_WORKERS_DEV` | 啟用或禁用 `workers.dev` 路由 |
| `EDGE_EVER_CUSTOM_DOMAIN` / `EDGE_EVER_ROUTE_PATTERN` | 自定義路由 |

自定義管理員使用者名稱須在重試首次構建前設定；帳號建立後修改該變數不會重新命名帳號。

舊部署必須補上 `EDGE_EVER_S3_*` 物件儲存設定才能存放附件；原本的 `RESOURCES` R2 binding 已不再使用。已有專案的顯式構建命令也可繼續使用，詳見 [Workers Builds 配置](cloudflare-workers-builds.zh-TW.md)。

---

## 常見問題與排錯

- **首次構建失敗**：請檢查 Cloudflare 控制檯中 Worker 的 **Deployments** 構建日誌，確認日誌包含“routing it through EdgeEver's validated deployment pipeline”，D1 資料庫名稱嚴格為 `edgeever`、Workers Builds API Token 具有 D1 讀取和編輯權限，且 `EDGE_EVER_S3_*` 設定指向可連線的儲存桶。如有意使用其他 D1 資料庫，請設定 `EDGE_EVER_D1_DATABASE_NAME`；僅在自動查詢 UUID 不可用時再新增 `EDGE_EVER_D1_DATABASE_ID`。
- **無法同步上游更新**：
  1. 開啟 Fork 的 **Actions**，啟用 **Update deployed EdgeEver**（公共 Fork 上定時任務預設關閉）。
  2. 手動 **Run workflow** 一次，開啟中英雙語 Job **Summary**：會分別展示上游目標、Git 釋出結果、部署觸發狀態，以及線上部署是否已經驗證。
  3. 若定時執行綠色成功且 Summary 為 *Already on upstream target* / 已對齊，表示 Git 已是該通道目標版本，不是靜默故障。手動執行在已對齊時會自動重新發布所選版本；若此後網站仍舊，請對照 Cloudflare **Deployments** 的 commit SHA。
  4. 日常升級請優先用本工作流，而不是 GitHub **Sync fork**。
  5. 若舊版更新器報錯 `without workflows permission`，請使用倉庫所有者身份執行一次 **Sync fork**，然後重新執行 **Update deployed EdgeEver**。新版更新器會保留 `.github/workflows/**`，後續產品更新不會再觸發這項權限限制。
- **Git 已 push 但網站沒變**：確認 Workers Builds 是否針對新的 `main` SHA 構建。可選：新增倉庫 Secret `EDGE_EVER_CLOUDFLARE_DEPLOY_HOOK_URL`，讓工作流在 publish 後呼叫 Deploy Hook。
- **Android 或 iOS App 提示登入被 Cloudflare 或安全策略攔截**：
  1. 重試一次並記錄 App 顯示的診斷程式碼、Ray ID 和大致時間。在 Cloudflare 中開啟 **Security → Analytics → Events**，找到對應請求並確認其 **Service**、**Action** 和規則 ID，再決定調整哪項防護。
  2. 原生 App 會直接呼叫 `/api/*`，無法完成互動式瀏覽器驗證。不要嘗試在 App 中嵌入該驗證。請繼續啟用 EdgeEver 身份認證及應用層登入限流，但要確保合法 API 流量收到機器可解析的響應，而不是 Managed Challenge 或 Interactive Challenge。
  3. 如果是自定義 WAF 規則發起驗證，請縮小規則範圍，不要驗證 App 所需的 `/api/*` 請求。如果是 Managed Rules 或 Super Bot Fight Mode 誤判，請建立範圍儘可能小的 [Skip 規則或例外](https://developers.cloudflare.com/waf/custom-rules/skip/)，不要籠統關閉無關的安全防護。
  4. Cloudflare 免費版 Bot Fight Mode 無法透過 WAF Skip 規則繞過。如果 Security Events 顯示由 Bot Fight Mode 攔截，請按 Cloudflare 的[誤報處理指引](https://developers.cloudflare.com/bots/troubleshooting/false-positives/)關閉該功能，或改用支援精確例外的防護模式。
- **需要重置或手動恢復部署**：請參閱 [手動部署指南](manual-deploy.zh-TW.md)。
