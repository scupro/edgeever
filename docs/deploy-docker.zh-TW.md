# 使用 Docker 部署 EdgeEver

EdgeEver 在 Cloudflare 與 Docker 中共用同一套 Web 應用、Hono 路由、業務服務、
鑑權、MCP 實現和只增不改的 migration。兩種部署僅有薄執行入口和基礎
設施轉接器不同：Docker 使用 Bun + SQLite + 本機檔案（或 S3 相容物件儲存），
Cloudflare 使用 Workers + D1 + 外部 S3 相容物件儲存。

## 環境要求

- Docker Engine 24 或更高版本，包含 Docker Compose v2。
- `amd64` 或 `arm64` Linux 主機。
- Linux 5.6 或更高版本核心。更舊的核心不屬於正式支援的 Docker 環境，因為 Bun
  在這些環境中可能無法解析容器依賴。安裝器會發出警告但不會阻止安裝；如果啟動
  日誌出現 `EISDIR reading .../node_modules/...`，應先升級宿主機系統或核心，
  不要先修改 `/data` 權限或替換應用資料。
- 實例離開可信區域網時，必須使用帶 HTTPS 的反向代理。

## 一鍵安裝

已安裝 Docker Compose v2 的主機可直接執行：

```sh
curl -fsSL https://dogbro.store/install.sh | bash
```

指令碼會建立 `~/edgeever`、生成管理員密碼、拉取 `latest`、啟動容器並等待健康
檢查透過。安裝指令碼和 Compose 配置使用官方 GHCR 映象。再次執行同一命令即可
升級，已有密碼和 `/data` 卷保持不變。

> 💡 **網路提示**：官方映象託管於 GitHub（GHCR）。若在部分網路環境下遇到拉取緩慢或超時，請在部署前自行配置可用的網路代理或可信的映象加速服務。

預設情況下，指令碼會透過當前使用者的 crontab 設定每日自動更新，於伺服器本機時間
04:17 執行 `~/edgeever/update.sh`。更新程式會重新整理 Compose 配置、拉取已配置的
映象標籤、按需重建服務並驗證容器健康狀態，執行記錄追加到
`~/edgeever/update.log`。預設的 `latest` 標籤會自動獲得新版本；透過 `--version`
指定的版本保持固定。使用 `--no-auto-update` 或
`EDGE_EVER_AUTO_UPDATE=false` 可關閉自動更新。如果系統沒有 `crontab`，安裝指令碼
會保留 `update.sh`，並提示透過 NAS 的任務計劃程式執行。

按需使用 `--version vX.Y.Z`、`--port PORT` 或 `--install-dir DIR`；執行以下命令
可檢視全部引數：

```sh
curl -fsSL https://dogbro.store/install.sh | bash -s -- --help
```

## 手動使用 Compose

下載 `compose.yaml`，選擇要執行的正式版本，並設定高強度實例密碼：

```sh
export EDGE_EVER_VERSION=vX.Y.Z
export AUTH_PASSWORD='請替換為足夠長的隨機密碼'
docker compose up -d
docker compose ps
```

開啟 `http://localhost:8787`。只有共享的 `/api/health` 確認鑑權、SQLite 和物件
儲存均已就緒後，容器才會進入 healthy 狀態。

### 映象地址

官方映象為 `ghcr.io/scupro/edgeever`，支援 `linux/amd64` 與 `linux/arm64`。
生產環境應透過 `EDGE_EVER_VERSION` 固定正式版本標籤。

Compose 會建立一個命名卷。所有需要在容器替換後保留的資料都位於 `/data`：

```text
/data/edgeever.sqlite            SQLite 資料庫
/data/edgeever-secrets.json      憑據加密根金鑰
/data/resources/                 本機圖片與附件
```

映象以非 root 的 `bun` 使用者執行（UID/GID 均為 `1000`）。如果 NAS 必須使用主機
目錄繫結而不是命名卷，請先建立目錄，併為 UID/GID `1000` 授予讀寫權限。
安裝或自動更新失敗時，指令碼會對 `/data` 執行實際寫入測試，輸出掛載型別、來源、
容器使用者和目錄狀態。確認是權限問題後，還會根據 Docker 命名卷或 NAS 目錄繫結
給出對應的修復命令；指令碼不會擅自修改現有資料的權限。

## 配置

常用環境變數：

| 變數                                   | 預設值   | 用途                                      |
| -------------------------------------- | -------- | ----------------------------------------- |
| `AUTH_USER`              | `admin`  | 初始管理員使用者名稱                          |
| `AUTH_PASSWORD`              | 無       | 初始密碼；新資料庫必須提供                |
| `AUTH_PASSWORD_HASH`         | 無       | 可替代明文引導密碼的 PBKDF2 hash          |
| `EDGE_EVER_SESSION_TTL_DAYS`           | `400`    | 登入會話有效期                            |
| `EDGE_EVER_IDLE_TIMEOUT_SECONDS`       | `120`    | Bun 流式響應空閒超時，可設為 10 到 255 秒 |
| `EDGE_EVER_CREDENTIALS_ENCRYPTION_KEY` | 寫入 `/data` | 可選的獨立 AI 憑據加密金鑰。未設定時，Docker 會把認證 Secret 或自動生成的金鑰寫入 `/data/edgeever-secrets.json`。 |
| `EDGE_EVER_COMMUNITY_REGISTRY_URL` | 不設定 | 可選。簽名社群外掛目錄的 HTTPS 地址。不設定時，市場只顯示內建官方外掛。 |

Secret 可在受支援的變數名後追加 `_FILE`，並指向 Docker secret，例如
`AUTH_PASSWORD_FILE=/run/secrets/auth_password`。密碼/hash 和 S3
訪問憑據均支援這種形式。同一個 Secret 不得同時設定直接變數與
對應的 `_FILE` 變數。

`EDGE_EVER_ALLOW_UNAUTHENTICATED=true` 僅用於隔離的開發環境，嚴禁將未鑑權
實例暴露到網路。

## 使用 S3 相容附件儲存

SQLite 仍儲存在 `/data`，新附件可以寫入 MinIO、AWS S3、阿里雲 OSS、騰訊雲
COS、Backblaze B2 或其他相容服務：

```yaml
environment:
  EDGE_EVER_STORAGE_BACKEND: s3
  EDGE_EVER_S3_ENDPOINT: https://s3.example.com
  EDGE_EVER_S3_REGION: us-east-1
  EDGE_EVER_S3_BUCKET: edgeever
  EDGE_EVER_S3_ACCESS_KEY_ID_FILE: /run/secrets/s3_access_key
  EDGE_EVER_S3_SECRET_ACCESS_KEY_FILE: /run/secrets/s3_secret_key
  EDGE_EVER_S3_FORCE_PATH_STYLE: "true"
```

切換預設後端不會遷移歷史附件。在完成匯出或遷移前，必須保持舊後端可用。

## HTTPS 與網路暴露

容器在 `8787` 埠提供 HTTP。請使用維護活躍的 Caddy、Traefik 或 Nginx 終止
HTTPS，並轉發原始 Host 和客戶端地址。嚴禁公開 SQLite、`/data` 或物件儲存的
管理埠。

## 備份與恢復

可使用 EdgeEver ZIP 匯出製作跨環境內容備份，同時應冷備份 `/data` 卷以支援
完整實例恢復：

1. 執行 `docker compose stop edgeever`，等待日誌出現 shutdown complete。
   EdgeEver 會在優雅停機時 checkpoint SQLite WAL。
2. 完整複製或快照命名卷，包括 SQLite 檔案、`edgeever-secrets.json` 與
   `resources` 目錄。
3. 執行 `docker compose start edgeever` 恢復服務。

Docker 會把憑據加密根金鑰儲存在 `/data/edgeever-secrets.json`，因此完整的
`/data` 卷備份在容器重建後仍可解密已儲存的 AI 與物件儲存憑據。如果你在資料卷
之外單獨管理金鑰，請繼續備份顯式配置的
`EDGE_EVER_CREDENTIALS_ENCRYPTION_KEY`。Cloudflare 部署仍使用 Worker Secret，
不會讀寫該檔案。使用 S3 時還需獨立備份儲存桶。

只能在 EdgeEver 停止時恢復到空卷。應定期在獨立實例中驗證備份。

## 升級與回滾

生產環境應使用不可變的正式版本標籤，不要依賴 `latest`：

```sh
export EDGE_EVER_VERSION=vX.Y.Z
docker compose pull
docker compose up -d
docker compose ps
```

容器會在接收流量前應用與 D1 共用的 `migrations/*.sql`。升級前必須先備份。
回退應用映象不會逆向撤銷資料庫 migration；需要回退資料時，應恢復升級前的
卷備份。

映象預設命令是 `bun scripts/self-hosted-server.js`，同時保留
`scripts/self-hosted-server.mjs` 作為別名，因為 NAS/GUI 面板常會沿用 v1.62
及更早版本儲存的啟動命令。如果日誌出現
`Module not found "scripts/self-hosted-server.mjs"`，請拉取包含該別名的版本，
或清空自定義命令以使用映象預設入口。

在 Cloudflare 與 Docker 之間遷移時，請使用 EdgeEver 的完整備份/匯出與恢復
流程。不要複製線上 D1 資料庫檔案，也不要改寫 migration 歷史。

## 從原始碼構建

```sh
docker build --tag edgeever:local .
docker run --rm -p 8787:8787 \
  -e AUTH_PASSWORD='請替換為足夠長的隨機密碼' \
  -v edgeever-data:/data \
  edgeever:local
```

### 系統資訊中的後設資料

**設定 → 系統資訊** 會區分映象如何構建與實例如何部署。官方映象會填寫構建欄位；
自行構建的映象如未傳入下列構建引數，這些欄位顯示為未知。

| 欄位 | 來源 | 含義 |
| ---- | ---- | ---- |
| 實例構建 | `--build-arg EDGE_EVER_BUILD_ID` | 構建映象所用的提交 |
| 映象構建時間 | `--build-arg EDGE_EVER_BUILD_CREATED_AT`（ISO 8601） | 映象的構建時間，而不是部署或啟動時間 |
| 映象構建來源 | `--build-arg EDGE_EVER_BUILD_TRIGGER` / `EDGE_EVER_BUILD_METHOD` | 映象的產出方式，例如官方正式版映象為 `github_release` · `github_actions` |
| 容器映象來源 | 執行時 `EDGE_EVER_CONTAINER_IMAGE` | 映象拉取自哪個倉庫；官方 `compose.yaml` 會設定 |
| 部署來源 | 執行時 `EDGE_EVER_DEPLOYMENT_TRIGGER` / `EDGE_EVER_DEPLOYMENT_METHOD` | 你如何部署此實例；未設定時為未知 |
| 實例部署時間 | 僅 Cloudflare | Docker 不提供部署時間 |

觸發方式為 `github_release`、`main_push` 或 `manual`。`EDGE_EVER_DEPLOYMENT_METHOD=docker`
表示容器部署，而 `github_actions`、`cloudflare_workers_builds` 和 `local_cli`
表示執行構建或部署的機制。EdgeEver 不會自行推斷 Docker 或映象倉庫，因為同一服務
也可直接在 Bun 下執行，映象也可能被複制到其他倉庫。缺失或無效的值顯示為未知。

自行構建映象時：

```sh
docker build \
  --build-arg EDGE_EVER_BUILD_ID="$(git rev-parse HEAD)" \
  --build-arg EDGE_EVER_BUILD_CREATED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --build-arg EDGE_EVER_BUILD_TRIGGER=manual \
  --build-arg EDGE_EVER_BUILD_METHOD=local_cli \
  --tag edgeever:local .
docker run --rm -p 8787:8787 \
  -e AUTH_PASSWORD='請替換為足夠長的隨機密碼' \
  -e EDGE_EVER_CONTAINER_IMAGE=edgeever:local \
  -e EDGE_EVER_DEPLOYMENT_TRIGGER=manual \
  -e EDGE_EVER_DEPLOYMENT_METHOD=docker \
  -v edgeever-data:/data \
  edgeever:local
```

Docker 首發版本不支援 PostgreSQL。它仍是未來的儲存轉接器，不會形成另一套
業務程式碼分支。
