# Release 釋出指南

## 執行釋出

在 macOS 上從與 `origin/main` 一致且工作區乾淨的 `main` 分支執行：

任何需要重建桌面資產的 Release，都應先讓釋出 shell 指向倉庫外儲存的 Windows
更新清單 Ed25519 私鑰：

```bash
export EDGE_EVER_WINDOWS_UPDATE_SIGNING_KEY=/absolute/path/to/windows-update-ed25519-private.pem
```

```bash
bun run release -- \
  --bump patch \
  --issue-title "Improve the release workflow" \
  --label enhancement \
  --change-en "Run required release checks in parallel." \
  --change-zh "並行執行釋出所需檢查。" \
  --change-locale "ja:必要なリリースチェックを並列実行します。" \
  --change-commit "abcdef1"
```

多項變化需要按組重複傳入 `--change-en`、`--change-zh`、
`--change-locale ja:` 和 `--change-commit`。站點會發布日文版發布摘要，因此必須提供
日文說明。一項變化可以關聯多個以逗號分隔的提交：

```bash
--change-commit "abcdef1,1234567"
```

上一個正式 Release 之後的每個提交都必須被覆蓋。不面向使用者的提交需要填寫
具體原因後顯式排除：

```bash
--ignore-commit "89abcde:僅增加測試覆蓋"
```

覆蓋審計在修改本機或 GitHub 狀態之前執行，對映記錄在跟蹤 Issue 中。
使用 `--dry-run` 預覽提交覆蓋、原生端重建計劃和 Release 說明。

### 外部貢獻者署名

- 維護者本人完成的內容無需署名；外部貢獻在對應條目末尾註明 `@username` 和 PR。
- 同一人貢獻多項時可改為集中致謝。結尾名單僅列出未逐條致謝的人，名單為空則省略。
- GitHub 原生 Contributors 頭像區由正文中的 `@username` 自動生成，逐條提及同樣有效。

逐條署名寫入 `--change-zh` / `--change-en`；集中名單使用可重複的
`--contributor alice`，指令碼會在雙語說明末尾追加
`貢獻者 / Contributors：@alice`。該引數不自動推斷貢獻者。
續跑已有 Draft 時保留原說明，調整署名需直接編輯 Draft。

## EdgeEver 特有規則

- 正式 Tag 和 Release 標題使用 `vX.Y.Z`。`--bump` 須顯式指定，按 SemVer 選擇；
  禁止因發版節奏把使用者可感知的新能力或新平臺壓成 patch（詳見 `AGENTS.md`）。
- 根版本表示整體產品 Release。只有對應原生執行時重建時，才更新原生展示版本。
  Android `versionCode` 是獨立且嚴格遞增的標識。
- 每個正式 Release 包含 macOS arm64 與 x64 DMG、按架構區分的更新 ZIP、帶獨立
  簽名更新清單的未簽名 Windows x64 預覽版安裝包、帶更新後設資料與 SHA-256 清單的 Linux x64
  AppImage 預覽版，以及 Android arm64 APK。
  未變化的原生資產沿用原檔名、版本和校驗和。
- 桌面端和 Android 更新檢查使用對應 Release 資產中記錄的版本，而不是整體
  GitHub Tag，避免僅涉及 Web 或 API 的 Release 觸發無效原生更新。
- 指令碼負責建立跟蹤 Issue 和 Draft Release、驗證或複用原生資產、準備並審計
  GHCR 多架構 Docker 映象、正式釋出、關閉 Issue，
  預設不安裝桌面端應用；安裝驗收需顯式傳入 `--install-desktop`。
  輸出 Actions 連結後，Demo 部署會獨立繼續執行。
- 獨立工作流會把同一個已驗證 Git 提交傳送到 CNB；正式 Release 釋出後，CNB
  在騰訊雲側非同步構建並審計 TCR 公共映象。其耗時或失敗不會阻塞 GitHub
  Release，也不會把已釋出版本恢復為 Draft。
- 公開發布後的桌面和 Android 審計透過 Release API URL 讀取檔名並下載安裝包。
  Draft 剛公開時，`gh release view --json assets` 和 `gh release download`
  可能持續看不到這些檔案；如果把空列表當成資產缺失，釋出會被退回 Draft。
- 重建後的桌面資產上傳到 Draft 後，本機釋出命令只簽署
  `latest-windows.json`，私鑰不會進入 GitHub Actions。第二次桌面工作流會重新
  下載 Windows 安裝包、`latest.yml`、清單、簽名和校驗和檔案並獨立審計，透過後
  才能公開發布。詳見 [Windows 預覽版安全與更新說明](windows-preview.zh-TW.md)。

## 映象倉庫憑據

GitHub 官方倉庫必須配置 `CNB_TCR_BUILD_PUSH_TOKEN` Actions Secret，該令牌僅
擁有 CNB 原始碼映象倉庫的寫權限。CNB 私有金鑰倉庫向可信的 `push` 和
`tag_push` 流水線提供 `TCR_USERNAME` 與 `TCR_PASSWORD`。對於 TCR 個人版，
使用者名稱是騰訊雲帳號 ID，密碼是在 TCR 控制檯初始化的固定登入密碼。GHCR 是正式
釋出的阻塞門禁；CNB 根據同一個 Git 提交非同步構建 TCR，寫入相同的公共標籤，
並獨立核驗匿名訪問和雙架構。兩邊獨立構建，不要求 Registry Digest 相同。

## 失敗與續跑

- 本機驗證、Windows 簽名/審計、Draft 資產或 GHCR 映象失敗時，Release 保持
  未釋出狀態。
- CNB/TCR 非同步構建失敗時保留正式 Release，並獨立修復、重跑。
- 中斷後重新執行相同命令，會續跑匹配的 Draft，不會重複建立 Issue、提交或
  Release。
- 釋出後的原生資產或 GHCR 映象審計失敗時，指令碼會嘗試將 Release 恢復為
  Draft，並保留 Issue。
- 這些審計透過後，指令碼會關閉跟蹤 Issue。
- 顯式安裝時若替換應用失敗，指令碼會儘可能從 macOS 廢紙簍備份恢復上一版應用。
