# Linux AppImage 預覽版

EdgeEver 會在每個正式 GitHub Release 中提供 x86_64 AppImage 預覽版。產物固定
在 Ubuntu 22.04 構建並驗證，以確保 Rust sidecar 不超過 glibc 2.35 基線；預計
可相容更新的 Ubuntu、Debian 12 和當前 Fedora，但預覽階段只提供盡力支援。

從同一個官方 Release 下載 `EdgeEver-<version>-linux-x64.AppImage` 和
`SHA256SUMS-linux.txt`，然後執行：

```bash
sha256sum --check SHA256SUMS-linux.txt
chmod +x EdgeEver-*-linux-x64.AppImage
./EdgeEver-*-linux-x64.AppImage
```

校驗和可發現下載損壞或檔案版本不匹配，但不代表程式碼簽名身份。請勿從第三方映象
下載此預覽版。

預覽版會檢查正式 GitHub Release，在後臺下載新版 AppImage，並在使用者選擇重啟後
替換當前 AppImage。每個正式版本釋出前都必須透過真實 AppImage 舊版本到新版本的
跨版本門禁。自動更新啟用前釋出的舊版本仍需最後手動替換一次。

自動替換要求使用者對當前 AppImage 及其所在目錄擁有寫權限。儲存在使用者自己的下載或
應用目錄中通常可以正常更新；如果由管理員放在 `/opt` 等系統級只讀位置，則仍需
管理員手動替換或調整權限。

AppImage 本身不會安裝桌面啟動器或檔案關聯，可由使用者使用的 AppImage 啟動器或
桌面環境管理整合。如果系統無法掛載 AppImage，可以嘗試：

```bash
./EdgeEver-*-linux-x64.AppImage --appimage-extract-and-run
```

反饋 Linux 專屬問題時，請附上發行版、桌面環境、顯示協議（Wayland 或 X11）、
系統架構和 EdgeEver 系統診斷資訊。
