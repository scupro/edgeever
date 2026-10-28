# AGENTS.md

本檔案用於約束和指導參與本專案的 AI 代理與協作者。

## 檔案約束

- **技術棧與背景**：優先參考 `README.md`。
- **移動端平臺邊界**：行動端客戶端位於 `apps/mobile`，使用 Expo / React Native 實現；本倉庫不包含 iOS 客戶端。
- **雙語同步**：修改中文檔案時必須同步更新對應的英文檔案。修改根目錄 README 時必須同步 `README.md`、`README.zh-TW.md`、`README.ja.md`、`README.pl-PL.md`。

## 變更風險評估

- **面向所有使用者修復**：使用者要求解決問題時，必須把修復寫進倉庫的產品程式碼，讓後續版本里的所有使用者生效；不得只處理維護者本機的配置、程式或臨時狀態。
- **先評估後實現**：動手前說明功能價值、影響範圍、最壞後果、回滾方案和未驗證項；低價值但可能擾動成熟鏈路的需求，預設拒絕或提供低風險替代方案。
- **核心鏈路從嚴**：安裝器、自動升級、資料儲存、認證及遷移的機制或配置變化一律按高風險變更處理，必須驗證真實的舊版本到新版本鏈路，不能只驗證新版本自身。
- **禁止無依據保證**：未完成對應平臺及跨版本驗證時，必須明確標註風險，嚴禁聲稱“不影響現有使用者”或“不影響自動升級”。

## Android 調測約束

- **USB 真機優先**：Android 功能調測必須使用透過 USB 連線的真實裝置和 `adb`，不得啟動或使用 QEMU、AVD 等 Android 模擬器；未連線可用真機時，明確標註真機驗證未完成，不得以模擬器結果替代。

## GitHub 溝通語言

- 回覆 Issue、PR 或提交 PR Review（含行內審查意見）時，使用對方正文或當前討論的主要語言：英文用英文回覆，中文用中文回覆。
- 對方明確指定溝通語言時，遵循其要求；中英混合或無法判斷時，預設使用英文。
- 不得因與倉庫維護者的本機對話使用中文，就在英文 Issue 或 PR 中使用中文回覆。
- **合併後同步本機**：代理把 PR 合併進 `main` 後，若本機就在 `main` 且工作區乾淨，必須 `git fetch` 並快進到 `origin/main`，再結束本次任務。工作區不乾淨或不能快進時停下來說明，禁止 reset、rebase 或覆蓋本機改動。同步程式碼不包括執行資料庫遷移。

## GitHub Actions 與 Release 約束及流程

1. **Fork 工作流邊界**：配置 GitHub Actions 時必須考慮大量使用者會 Fork 倉庫進行自部署；僅官方倉庫需要的 Job 必須使用 `github.repository == 'tianma-if/edgeever'` 門禁，嚴禁在下游 Fork 中分配 Runner 或執行。
2. **版本號與基線**：`vX.Y.Z`（非 Draft/Prerelease）。釋出須顯式 `--bump patch|minor|major`（指令碼不自動選級）；按 SemVer 選擇，**禁止因發版節奏把使用者可感知的新能力或新平臺壓成 patch**。遞增根目錄 `package.json`；含移動端修改時同步 `apps/mobile/app.json` 的 `expo.version` 並遞增 `android.versionCode`。上一個正式 Release 為審計基線。
3. **跨平臺 Release 資產**：每個正式 Release 頁面必須同時包含 macOS arm64 DMG、macOS x64 DMG、Windows x64 Preview 安裝包、Linux x64 AppImage Preview 和 Android arm64 APK。Windows Preview 未使用 Authenticode 簽名時必須同時提供經倉庫外 Ed25519 私鑰簽名的更新清單；Linux Preview 必須包含 `latest-linux.yml` 更新後設資料和獨立 SHA-256 清單；兩者均須在釋出前透過獨立下載與摘要審計。若本次未修改對應原生執行時程式碼、依賴、配置或構建工具，直接複用上一個正式 Release 中已驗證的原始資產，保留原檔名與校驗和，禁止僅為匹配新版本號而重新命名。官方倉庫正式 Release 中的 Android APK 必須使用固定的 Google Play 應用簽名證書；本機上傳證書籤名的 APK 只能作為 Draft 臨時資產，未經 Play 簽名替換和釋出前門禁核驗不得公開。
4. **驗證命令**：必須透過 `bun run typecheck`、`bun run typecheck:mobile` 和 `bun run build:web`。
5. **測試職責邊界**：正式 Release 必須先在官方倉庫及與下游一致的 Ubuntu 環境透過完整非 E2E 測試，嚴禁將上游自身的測試失敗轉嫁給下游 Fork 發現。只讀部署 Fork 僅同步產品快照且不執行測試；只有顯式保留定製改動的 Fork 才驗證合併結果，失敗時必須保持 `main` 與生產環境不變。
6. **原生資產構建與複用**：由 `scripts/plan-native-release.mjs` 決定重建或複用；桌面資產包含 `apps/web`。修改判定規則時同步更新測試。移動端重建使用 `bun run build:android:apk:local`，簽名配置儲存在倉庫外。
7. **Draft 內準備資產**：透過帶 `release_tag` 的 `workflow_dispatch` 在 Draft 中準備並驗證資產；Android 重建時須在 Draft 階段完成 Google Play 交付、用 Play 簽名 APK 替換臨時資產並透過獨立簽名門禁；`published` 事件只審計，禁止重新構建或上傳，簽名不符時恢復 Draft。
8. **桌面驗證職責**：桌面 Release 工作流負責測試、包結構檢查、簽名與公證；代理不再重複下載 Draft 或執行本機首次啟動驗收，除非使用者明確要求。
9. **釋出後更新**：正式釋出後，釋出流程預設不得下載、覆蓋安裝或啟動 `/Applications/EdgeEver.app`；已安裝的 macOS、Windows 與 Linux 桌面端透過應用內自動更新機制獲取新版，其中 Linux Preview 必須在 Draft 階段透過真實 AppImage 跨版本更新門禁。僅在使用者明確要求時使用 `--install-desktop` 執行原有安裝驗收，功能體驗由使用者在實際使用中驗證。
10. **失敗處理**：Release 阻塞工作流或資產審計失敗時保持或恢復 Draft，修復後重跑；不得公開已知損壞的 Release。GHCR 映象屬於阻塞門禁；騰訊雲 TCR 公共映象由獨立工作流在正式釋出後非同步同步和審計，其耗時或失敗不得阻塞 GitHub Release 或將已釋出版本恢復為 Draft。
11. **Release 說明結構**：使用中英文雙語格式（正文禁止包含字面量 `\n`），只寫使用者可感知的變化、影響以及必要的升級或遷移提醒。型別檢查、構建命令、簽名、公證、資產複用等技術驗證細節保留在 Actions 和關聯 Issue 中，不寫入公開 Release 正文。功能/修復關聯對應 Issue 並標記 Label，釋出後回鏈並關閉 Issue。正文結構：

```md
## 主要更新

- 面向使用者說明本次變化及影響。

關聯 Issue：#<issue-number>

## Key Changes

- User-facing summary of changes in English.

Related Issue: #<issue-number>
```

12. **外部貢獻者署名**：維護者本人無需署名；外部貢獻逐條註明帳號與 PR，或集中致謝。正文名單不重複列名，保留 GitHub 原生 Contributors 頭像區。引數用法見 `docs/release.zh-TW.md` / `docs/release.md`。

## 環境、部署與元件約束

- **AI 模型 API 優先客戶端直連**：所有平臺、所有功能的 AI 模型 API 請求優先由客戶端直接呼叫模型服務；Web 端遇到瀏覽器網路或 CORS 限制時，允許透過 EdgeEver 後端兜底。桌面端及原生移動端保持直連；已有 HTTP 響應或開始接收流式結果後，不得因錯誤自動切換到後端重複呼叫。
- **Cloudflare 部署**：嚴格按 `docs/agent-deploy-cloudflare.md` 執行。
- **跨執行時架構**：專案未來將正式支援 Docker 自託管；實現新功能時必須保持業務邏輯與 Cloudflare 解耦，併為其他執行時預留擴充套件邊界。Cloudflare 與 Docker 必須共用同一套業務程式碼，僅允許保留薄且穩定、不包含業務判斷的執行入口和基礎設施驅動轉接器。
- **資料庫 Migration**：資料庫或種子變化時，在 `migrations/` 下新增遞增編號 SQL，禁止修改已執行的舊 Migration。
- **本機啟動**：預設 `bun run dev`（純本機環境）。使用者要求“啟動/重啟 Web 端”時，預設含 Web 與 API，必須使用 `bun run dev`；只有使用者明確要求“純前端”或明確指定 `dev:web` 時，才使用 `bun run dev:web`。指定遠端實例用 `EDGE_EVER_INSTANCE=<實例名> bun run dev:remote`。
- **Demo 示例同步**：修改示例筆記後，在 `main` 分支幹淨狀態下執行 `bun run demo:sync` 重置公開 Demo。
- **禁止重複造輪子**：嚴禁重複實現已有成熟方案；優先採用維護活躍、廣泛驗證的開源元件與依賴，並優先複用 `shadcn/ui`；複雜或重複模組封裝為獨立元件。
- UI和互動的原則是，產品始終表現得可靠、可預測、確定、被接住。
- **懸停提示**：所有懸停或聚焦提示嚴禁使用 HTML 原生 `title`；Web 端必須統一使用 shadcn/ui 的 Tooltip 元件，並確保鍵盤聚焦時同樣可見。

## 品牌視覺規範 / Brand Identity

- **品牌色**：複用現有的 UI 黑灰配色，Logo 圖形色 `#07130B`。
- 修改 Logo 後執行 `bun run prepare:brand:icons` 同步各平臺資源。
