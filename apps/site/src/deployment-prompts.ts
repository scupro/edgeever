export const deploymentPrompts = {
  "en-US": `Deploy EdgeEver entirely through GitHub and Cloudflare:
1. Fork https://github.com/scupro/edgeever.
2. Create D1 \`edgeever\` in Cloudflare and prepare an S3-compatible object storage bucket for attachments.
3. In Workers & Pages, create a Worker named \`edgeever\` from the Fork's \`main\` branch.
   Use the repository root, keep Cloudflare's default Workers Builds deploy command,
   and ensure its API token can read and edit D1. Select Save and Deploy.
4. After the Worker is created, add the user's chosen password as the runtime Secret
   \`EDGE_EVER_AUTH_PASSWORD\` (preferably at least 32 characters).
   The username defaults to \`admin\`.
   If the user specifies another, set \`EDGE_EVER_AUTH_USERNAME\` as a Workers Builds
   variable before the next build.
5. Run the build again, verify \`/api/health\` and \`/api/openapi.json\`, then log in
   with that administrator username and password.
6. Enable and manually run the GitHub Actions workflow named \`Update deployed EdgeEver\`
   once so the Fork can automatically receive future stable releases and fixes.`,
  "zh-TW": `請全程透過 GitHub 和 Cloudflare 線上部署 EdgeEver：
1. Fork https://github.com/scupro/edgeever。
2. 在 Cloudflare 中建立 D1 \`edgeever\`，並準備一個存放附件的 S3 相容物件儲存桶。
3. 在 Workers & Pages 中從 Fork 的 \`main\` 分支建立名為 \`edgeever\` 的 Worker。
   使用儲存庫根目錄，保留 Cloudflare Workers Builds 的預設部署指令，確認其 API Token
   具備 D1 讀取及編輯權限，然後儲存並部署。
4. Worker 建立後，設定執行時 Secret \`EDGE_EVER_AUTH_PASSWORD\`，值為使用者指定的密碼
   （建議至少 32 個字元）。管理員使用者名稱預設為 \`admin\`；如需自訂，請在再次建置前
   設定 Workers Builds 建置變數 \`EDGE_EVER_AUTH_USERNAME\`。
5. 再次建置，驗證 \`/api/health\` 和 \`/api/openapi.json\`，再用該管理員
   使用者名稱和密碼驗證登入。
6. 啟用並手動執行一次名為 \`Update deployed EdgeEver\` 的 GitHub Actions 工作流程，
   以便後續自動同步正式版本，持續獲得 EdgeEver 的功能更新與問題修復。`,
};

export const manualDeploymentCopy = {
  "en-US": {
    intro: "Complete setup in 6 web steps:",
    steps: [
      {
        title: "Fork the Repository",
        body: "Click Fork at the top right of GitHub to fork EdgeEver into your personal account.",
      },
      {
        title: "Create Cloudflare Resources",
        body: "Create D1 edgeever and prepare an S3-compatible object storage bucket (Backblaze B2, Tencent COS, Alibaba OSS, MinIO or Wasabi).",
      },
      {
        title: "Import & Configure the Project",
        body: "Create a Worker named edgeever from the Fork's main branch in Cloudflare Workers & Pages. Use the repository root and keep Cloudflare's default Workers Builds deploy command, which runs in Cloudflare. Ensure its API token can read and edit D1. The deploy command creates the bindings; do not edit Fork files.",
      },
      {
        title: "Choose the Administrator Password",
        body: "Choose an administrator password, preferably at least 32 characters. Once the Worker is created, save it as the runtime Secret EDGE_EVER_AUTH_PASSWORD.",
      },
      {
        title: "Build & Verify",
        body: "Save and Deploy creates the Worker and starts a build. The initial build primarily initializes the Worker instance; if it fails due to missing administrator Secret, this is expected behavior. Simply add the runtime Secret EDGE_EVER_AUTH_PASSWORD from Step 4 and click retry. The username defaults to admin; to use another, set EDGE_EVER_AUTH_USERNAME as a Workers Builds variable before retrying. Once deployed, confirm /api/health returns 200, then log in with the configured username and password.",
      },
      {
        title: "Enable Automatic Updates",
        body: "Open the Fork's Actions tab, click I understand my workflows, go ahead and enable them, then manually run Update deployed EdgeEver once so the Fork can automatically receive future stable releases and fixes.",
      },
    ],
  },
  "zh-TW": {
    intro: "只需在網頁端完成 6 步設定：",
    steps: [
      {
        title: "Fork 儲存庫",
        body: "在 GitHub 點選右上角 Fork，將專案 Fork 到您的個人帳戶下。",
      },
      {
        title: "建立 Cloudflare 資源",
        body: "建立 D1 edgeever，並準備 S3 相容的物件儲存（例如 Backblaze B2、騰訊雲 COS、阿里雲 OSS、MinIO 或 Wasabi）。",
      },
      {
        title: "匯入並設定專案",
        body: "在 Cloudflare Workers & Pages 中從 Fork 的 main 分支建立名為 edgeever 的 Worker。使用儲存庫根目錄，保留由 Cloudflare 線上執行的 Workers Builds 預設部署指令，並確認其 API Token 具備 D1 讀取及編輯權限。binding 由部署指令產生，不要修改 Fork 中的檔案。",
      },
      {
        title: "準備管理員密碼",
        body: "準備管理員登入密碼，建議至少 32 個字元。Worker 建立後，將它儲存為執行時 Secret EDGE_EVER_AUTH_PASSWORD。",
      },
      {
        title: "首次建置與驗證",
        body: "儲存並部署會建立 Worker 並啟動建置。首次建置主要用於初始化實例，若因尚未配置管理員 Secret 而報錯屬於預期行為，只需在第 4 步新增執行時 Secret EDGE_EVER_AUTH_PASSWORD 後點選重試建置即可透過。管理員使用者名稱預設為 admin；如需使用其他名稱，請在重試建置前設定 Workers Builds 建置變數 EDGE_EVER_AUTH_USERNAME。部署完成後造訪 /api/health，確認回傳 200，再用設定的管理員使用者名稱和密碼登入。",
      },
      {
        title: "啟用自動更新",
        body: "進入 Fork 的 Actions 分頁，點選 I understand my workflows, go ahead and enable them，然後手動執行一次 Update deployed EdgeEver，確保後續能夠自動獲得正式版本的功能更新與修復。",
      },
    ],
  },
};
