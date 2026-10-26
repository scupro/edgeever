# 移動端商店交付

GitHub Release 與移動端商店交付是兩個獨立操作：

- `bun run release` 建立並審計 GitHub Release。Android 資產只有透過 Play
  應用簽名門禁後才能正式釋出。當審計範圍內包含 iOS 執行時變化時，同一條命令
  還會啟動 Xcode Cloud，並把得到的構建提交 App Review。iOS 失敗不會把已經
  公開的 GitHub Release 恢復為 Draft；用 `bun run publish:stores` 重試即可。
- `bun run publish:stores` 針對一個匹配的 Draft 或已經存在的正式 Release tag，
  觸發商店交付工作流。Android 重建時應在 Draft 階段執行，以便正式釋出前用
  Play 簽名 APK 替換臨時的本機簽名 APK。省略 `--ios-build-number` 會啟動
  Xcode Cloud；只有提交已經上傳到 App Store Connect 的構建時才傳入該引數。
- 觸發商店交付就代表已經授權正式提交。預設情況下，Google Play 使用
  Production 軌道；iOS 在上傳 App Store Connect 後繼續提交 App Review。稽核
  透過後自動釋出。

## 安全模型

工作流檢出不可變的 Release tag，而不是 `main`。開始任何商店構建前都會驗證：

- tag 屬於匹配的 Draft 或正式、且非 Prerelease 的 GitHub Release；
- Release 目標提交與 Git tag 指向同一個提交；
- 與上一個正式 Release 相比，審計範圍內確實包含移動端執行時程式碼變化；
- 根版本和移動端 App 版本都與 Release tag 一致；
- Android `versionCode` 已遞增。

如果某個 Release 對所選平臺複用了上一版商店二進位，工作流會主動拒絕。它不
代表新的商店二進位，不應重複上傳。Android 交付要求 `apps/mobile` 執行時變化
且 `versionCode` 遞增；iOS 交付要求 `apps/ios` 或共享編輯器執行時變化，且
`MARKETING_VERSION` 與 Release tag 一致。

正式釋出門禁只接受 `ANDROID_PLAY_APP_SIGNER_SHA256`。本機上傳證書籤名的 APK
可以暫存在 Draft 中供商店處理，但不能成為正式 Release 的最終 Android 資產；
門禁失敗時釋出命令會停止並保留 Draft。即使繞過釋出命令手動公開 Release，
`published` 審計也會拒絕該 APK 並恢復 Draft。

## 前置配置

在 GitHub 倉庫中配置以下 Secrets：

- `EXPO_TOKEN`
- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`
- `ANDROID_PLAY_APP_SIGNER_SHA256`
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_BASE64`
- `APP_STORE_CONNECT_API_KEY_ID`
- `APP_STORE_CONNECT_API_ISSUER_ID`
- `APP_STORE_CONNECT_API_KEY_P8_BASE64`

將 Google Play 服務帳號金鑰上傳到 Android 應用的 EAS Submit Credentials，
同時將同一份服務帳號 JSON 以 base64 儲存到上述倉庫 Secret，並把 Play Console
中的**應用簽名證書**（不是上傳證書）SHA-256 指紋儲存為
`ANDROID_PLAY_APP_SIGNER_SHA256`。在 EAS 中配置 iOS 分發憑據和 App Store
Connect API Key。憑據和私鑰禁止提交到倉庫。

建立以下 GitHub Environments：

- `store-delivery`：用於 Android 測試軌道和 Apple App Review 交付。
- `store-production`：用於 Google Play Production 交付。

EAS Submit 要求應用已經在對應商店中建立；Google Play API 提交還要求服務帳號
擁有該應用的訪問權限。配置方法參考官方
[EAS Android 提交指南](https://docs.expo.dev/submit/android/)和
[EAS Submit 配置參考](https://docs.expo.dev/submit/eas-json/)。

## 命令

當兩個執行時都有變化時，同時提交 Google Play Production 和 Apple App Review：

```sh
bun run publish:stores -- --release v1.7.0
```

只交付 iOS，並啟動手動觸發的 Xcode Cloud Archive：

```sh
bun run publish:stores -- --release v1.7.0 --platform ios
```

在正式釋出前為 Draft 準備 Android Play 簽名資產：

```sh
bun run publish:stores -- \
  --release v1.7.0 \
  --platform android \
  --android-track production
```

只將 Android 交付到封閉測試軌道：

```sh
bun run publish:stores -- \
  --release v1.7.0 \
  --platform android \
  --android-track beta
```

使用 `--dry-run` 可以只輸出將要觸發的 GitHub 工作流，不實際啟動。

## 各平臺行為

### Google Play

自託管釋出 Runner 會從指定 tag 構建僅含 `arm64-v8a` 的簽名 AAB，驗證簽名和
R8 Mapping，將兩者保留為 GitHub Actions Artifacts，然後透過 EAS Submit 上傳
AAB。

Google Play 處理完 AAB 後，工作流會下載由 Play 應用簽名金鑰簽名的通用 APK，
核對固定的應用簽名證書，並替換 Draft 或正式 GitHub Release 中的 Android 資產。
Draft 中的替換結果還必須透過獨立的釋出前簽名門禁。這樣從 Play
和 GitHub 安裝的版本可以互相覆蓋升級。上傳的 AAB 會明確限制為
`arm64-v8a`，因此 Play 生成的通用 APK 不會再打包無用的 32 位 ARM 或 x86
原生庫。該 Release 必須關閉 Automatic Protection；當 Play 返回帶安裝來源限制
的產物時，下載器會直接失敗，防止此類 APK 再次釋出到 GitHub 供側載。

Internal、Alpha、Beta 和 Production 配置都會在所選軌道建立 Completed
Release。預設命令直接使用 Production；只有明確要求測試交付時才使用
`--android-track internal`、`alpha` 或 `beta`。

### App Store Connect

原生 iOS 商店二進位來自 **`apps/ios`**（SwiftUI），不再走 Expo EAS。
在 macOS beta 本機上，Archive 必須透過 **Xcode Cloud**，保證
`BuildMachineOSBuild` 來自正式系統映象——見
[iOS Xcode Cloud](ios-xcode-cloud.md)。商店交付工作流會按 Archive 工作流配置的
預設分支啟動這次手動構建，並要求 Cloud 原始碼的 MARKETING_VERSION 與 Release tag 一致，等到 App Store
Connect 將構建標為 Valid，再用 Fastlane（`apps/ios` 的 `submit_review`）提交
App Review，並設定為稽核透過後自動釋出。只有複用已經上傳的構建時才傳入
`--ios-build-number`。後設資料、協議、稽核資訊或憑據不完整時
工作流會失敗，不會改為提交其他構建。

商店列表本地化（含日文）存放在 `apps/mobile/store-assets/`，需在 App Store
Connect 和 Play Console 中貼上釋出。在控制檯補齊該語言的必填欄位之前，不要把
新語言加入 Fastlane `submit_review`。不完整的本地化會在不改二進位的情況下讓
App Review 失敗。
