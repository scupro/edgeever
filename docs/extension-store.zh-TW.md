# 網頁剪藏外掛商店提交

Chrome、Edge 和 Firefox 的上架由官方倉庫工作流 **Submit Web Clipper** 提交。
它和 `bun run release` 分開。正式 GitHub Release 釋出後會非同步觸發商店工作流；
商店提交不阻塞 GitHub Release，稽核結果也不會改變已釋出的 Release。

擴充套件使用 `apps/extension/package.json` 中的獨立版本號，不跟隨根目錄
`package.json` 的主應用版本。僅釋出擴充套件時，合併後手動執行工作流，選擇 `main`
並留空 `release_tag` 即可，不必另發主應用的 GitHub Release。

Edge 使用者安裝的是 Chrome 網上應用店商品
`gjadpfmanienmlofajibkfkkpfdkclgo`。一次 Chrome 提交覆蓋這個商品。Firefox
單獨提交到 `edgeever-web-clipper`。這條工作流不向 Microsoft Edge 附加元件網站
釋出。

工作流會構建安裝包、上傳並提交稽核。它不能代替商店稽核。使用者會留在各自商店
最後一個已透過的版本，直到 Chrome 和 Mozilla 分別稽核完成。已經上傳過的版本號
不能重複使用。提交改動前要先提高 `apps/extension/package.json` 裡的版本。

呼叫任何商店介面前，命令會把 Firefox 稽核原始碼 ZIP 解壓到乾淨目錄，使用凍結的
鎖檔案安裝依賴並重新構建。每個產物檔案的 SHA-256 必須與提交版本一致，否則停止
提交。原始碼包包含外掛引用的 Web 共享 UI 元件；構建 CI 會監聽這些依賴的變化，
並執行相同的重建檢查。兩個工作流均使用檢出程式碼中根目錄 `package.json` 指定的
Bun 版本。

## 執行

開啟 https://github.com/tianma-if/edgeever/actions/workflows/extension-store.yml，
選擇 **Run workflow**。Firefox 更新說明留空時，使用一行版本說明；也可以貼上
希望 Mozilla 展示的說明。`dry_run` 只構建安裝包，不會呼叫商店。

本機環境裡已經放好下面的憑據時，也可以直接執行：

```sh
bun run publish:extension -- --dry-run
bun run publish:extension -- --notes "這次改了什麼。"
```

`--platform chrome` 或 `--platform firefox` 可以只重試一個商店。Chrome
上同一個版本已經在稽核中時，會保持原提交。Firefox 上同一個版本正在稽核但還沒有
原始碼包時，下一次執行會補上原始碼包。

Actions 日誌和 Summary 會分別報告每個商店的提交動作、API 狀態、已確認的公開
版本（如有）、失敗階段，以及 API 返回的詳細錯誤或警告。`submitted` /
`already-submitted` 表示已提交稽核，不代表正式上架；`STAGED` 表示稽核透過但仍
待發布。只有 API 確認的公開版本或 `PUBLISHED` 狀態才會標記為已上架。工作流不會
等待後續稽核結果。
診斷資訊會隱藏憑據和私密稽核說明，過長的錯誤響應會明確標記為截斷。API 只返回
通用錯誤時，仍需開啟報告中的開發者後臺連結檢視 API 未公開的具體缺項。
修復單個商店的問題後，僅重試對應平臺即可。

## 憑據

把這些 Actions secrets 加到 `tianma-if/edgeever`。Fork 不會執行這個 Job。

Chrome 可以使用服務帳號，也可以使用 refresh token。服務帳號不會過幾天就失效：

1. 在 Google Cloud 啟用 Chrome Web Store API，並建立一個服務帳號。不要給它
   額外的專案角色。
2. 在 Chrome 網上應用店開發者後臺的 Account 裡新增這個服務帳號郵箱。一個釋出者
   只能登記一個服務帳號。
3. 建立 JSON 金鑰，把整個檔案存為
   `CHROME_WEB_STORE_SERVICE_ACCOUNT_JSON`。

refresh token 這條替代路徑使用 `CHROME_WEB_STORE_CLIENT_ID`、
`CHROME_WEB_STORE_CLIENT_SECRET` 和 `CHROME_WEB_STORE_REFRESH_TOKEN`，範圍是
`https://www.googleapis.com/auth/chromewebstore`。Google 帳號需要開啟兩步驗證。
OAuth 客戶端如果停留在測試狀態，refresh token 會在七天後失效，所以要把同意螢幕
釋出出去，或者改用服務帳號。

Firefox 使用 https://addons.mozilla.org/developers/addon/api/key/ 生成的 API 金鑰：

- `AMO_JWT_ISSUER`
- `AMO_JWT_SECRET`

下面兩個可選 secret 會寫進 Firefox 給稽核員的說明：

- `EDGE_EVER_REVIEW_INSTANCE_URL`
- `EDGE_EVER_REVIEW_API_TOKEN`

Chrome 的上傳介面沒有更新說明欄位。Chrome 的商店簡介和隱私披露保持後臺裡上次
儲存的內容。權限或公開介紹發生變化時，先在後臺修改。Firefox 會把工作流裡的說明
作為 `en-US` 版本說明，並附上 `apps/extension/SOURCE_BUILD.md` 裡的構建步驟。

當前 Firefox 商品使用許可證 `AGPL-3.0-only`。工作流每次提交版本都會帶上這個許可證。
