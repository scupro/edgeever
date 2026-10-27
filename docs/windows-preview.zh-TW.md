# Windows x64 預覽版

## 分發狀態

EdgeEver 透過官方 [GitHub Releases](https://github.com/scupro/edgeever/releases/latest)
頁面分發 Windows x64 預覽版。當前安裝包與應用內可執行檔案尚未使用
Authenticode 簽名，因此 Windows SmartScreen、防毒軟體或組織策略可能提示風險或
直接阻止安裝。這類提示是預覽階段的預期現象，但並不表示任意來源的副本都安全。

- 僅從 `tianma-if/edgeever` 官方 Release 下載。
- 不要為 EdgeEver 關閉 SmartScreen、防毒軟體或組織安全控制。
- 如果組織策略阻止安裝，請先使用 Web/PWA 客戶端，等待後續
  Authenticode 簽名版本。

## 自動更新

安裝包未簽名並不會阻止 NSIS 更新器下載和安裝後續 Release。EdgeEver 增加了獨立
信任門禁，避免更新通道只依賴同樣未簽名的 `latest.yml`：

1. 客戶端讀取 `latest.yml` 發現新版本，但此時不會開始 Windows 下載。
2. 客戶端從該版本的官方 Release 獲取 `latest-windows.json` 與
   `latest-windows.json.sig`。
3. 客戶端使用安裝包內固定的公鑰驗證 Ed25519 簽名，並要求版本、檔名、大小與
   SHA-512 和 `latest.yml` 完全一致。
4. 客戶端自動下載安裝包，再用已簽名清單核驗其大小、SHA-512 與 SHA-256。
5. 只有透過本機檔案複核的安裝包，才能在使用者確認重啟時安裝，或在使用者退出
   EdgeEver 時自動安裝。

清單缺失、金鑰未知、簽名無效、版本不一致或安裝包被修改時，更新一律停止。
Windows 安裝包未透過最終本機校驗前，應用不會開啟退出時自動安裝。

該機制保護更新決策和安裝包位元組，但不會消除首次安裝時的 Windows 信譽提示、
不會在資源管理器中提供釋出者身份，也無法繞過組織的應用控制策略；這些能力仍需
可信 Authenticode 簽名。

## Release 資產與離線簽名

每個正式 Release 包含以下 Windows 資產：

- `EdgeEver-<version>-windows-x64.exe`
- `latest.yml`
- `latest-windows.json`
- `latest-windows.json.sig`
- `SHA256SUMS-windows.txt`

GitHub Actions 構建並驗證未簽名安裝包，隨後把除簽名檔案以外的四項輸入上傳到
Draft Release。釋出命令使用 `EDGE_EVER_WINDOWS_UPDATE_SIGNING_KEY` 指向的
倉庫外金鑰，在本機為精確清單離線簽名；然後觸發獨立 GitHub Actions 審計，重新
下載全部五項資產並驗證簽名及安裝包摘要，全部透過後才允許公開發布。

私鑰必須是 Ed25519 PKCS#8 PEM 檔案，必須儲存在倉庫外，並在另一個安全位置留有
備份。釋出 shell 使用絕對路徑配置：

```bash
export EDGE_EVER_WINDOWS_UPDATE_SIGNING_KEY=/absolute/path/to/windows-update-ed25519-private.pem
```

首個信任錨的金鑰 ID 為 `edgeever-windows-update-2026-01`，SPKI DER SHA-256
指紋為 `ec12b4b5673a2e6ac3666d0cc90dd5c418f3650418cd2b91fa09cec969d50db9`。

私鑰缺失或與桌面客戶端固定的公鑰不匹配時，Release 會保持 Draft。金鑰輪換必須
跨兩個 Release：先發布同時信任新舊公鑰、但仍由舊金鑰簽名的客戶端；後續 Release
再切換到新金鑰簽名。

## 未來遷移到 Authenticode

獲得可信證書後：

1. 簽署所有隨包釋出的 PE，包括 `EdgeEver.exe`、Rust sidecar、輔助可執行檔案和
   最終 NSIS 安裝包。
2. 把證書精確主題配置為 electron-builder 的 `publisherName`，讓已簽名客戶端
   強制校驗釋出者連續性。
3. 必須在全部 Authenticode 簽名完成後再生成 `latest.yml`、EdgeEver 簽名清單與
   校驗和，因為簽名會改變檔案位元組。
4. 遷移期間及遷移後繼續保留獨立 Ed25519 門禁。現有未簽名預覽版沒有宣告
   Authenticode 釋出者，因此可以接收首個已簽名安裝包；新簽名客戶端隨後會對後續
   更新增加發布者校驗。

首次公開 Windows 平臺屬於使用者可感知的新平臺，必須按 SemVer 使用 minor 遞增，
不能作為 patch 釋出。
