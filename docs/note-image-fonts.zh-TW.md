# 分享圖片的可選字型

[English](note-image-fonts.md)

正文設定、海報設計和分享圖片使用同一份 23 款具名字型目錄，其中包含喬木設計師基礎包的全部五款字型。字型資源固定版本，遠端按需下載。Web、桌面、Android 和 iOS 的安裝資源均不增加這些字型的二進位檔案；選擇器、載入器和許可宣告會增加少量應用程式碼。

| 字型 | 固定的軟體包和樣式清單 |
| --- | --- |
| 得意黑 | `@chinese-fonts/dyh@3.0.0/dist/SmileySans-Oblique/result.css` |
| 霞鶩文楷 | `@chinese-fonts/lxgwwenkai@3.0.0/dist/LXGWWenKai-Regular/result.css` |
| 朱雀仿宋 | `@chinese-fonts/zqfs@3.0.0/dist/ZhuqueFangsong-Regular/result.css` |
| 思源黑體 Heavy | `@fontsource/noto-sans-sc@5.3.1/900.css` |
| 普惠體 Regular · 推薦 | `@fontpkg/alibaba-pu-hui-ti-3-0@3.1.2/AlibabaPuHuiTi-3-55-Regular.ttf` |
| 普惠體 Heavy · 推薦 | `@fontpkg/alibaba-pu-hui-ti-3-0@3.1.2/AlibabaPuHuiTi-3-105-Heavy.ttf` |
| 優設標題黑 · 推薦 | `@fontpkg/you-she-biao-ti-hei@1.0.0/優設標題黑.ttf` |
| 阿里媽媽數黑體 · 推薦 | `@fontpkg/alimama-shu-hei-ti@1.0.5/AlimamaShuHeiTi-Bold.ttf` |

得意黑也是五款推薦包的成員。新增四款推薦字型使用未經修改的原始檔案，固定位元組長度與 SHA-256 摘要；支援 Web Crypto 時校驗 SHA-256，所有環境均檢查長度與容器。四個檔案分別約 8.53 MB、2.54 MB、1.41 MB、1.36 MB，不轉換、不拆分。選中字型或其預覽行進入可見區域時，才下載對應原檔案，安裝應用時不下載。展開並滾動列表可能下載多款完整字型。

分享圖片、正文排版與海報設計共用的字型清單定義在 `packages/shared/src/font-catalog.ts`，`note-image-remote-fonts.ts` 保留原分享圖片匯出的相容入口，分片來自[中文網字計劃](https://github.com/KonghaYao/chinese-free-web-font-storage)和 [Fontsource](https://fontsource.org/fonts/noto-sans-sc)。每次請求先使用 jsDelivr，失敗後嘗試 unpkg。對於使用 CSS 分片的字型，只接受固定軟體包目錄內的 WOFF2 字型描述，不將遠端樣式直接插入頁面。

對於使用 CSS 分片的字型，選擇後才請求其樣式清單。渲染器根據卡片文字匹配 Unicode 範圍，僅下載命中的分片，不下載整個字型家族。字元匹配在本機進行，字型請求不會傳送筆記正文。清單和字型資料儲存在獨立、可丟棄的 IndexedDB 快取 `edgeever-share-font-cache` 中；重複下載會合並，失敗請求可以重試，儲存不可用時仍可聯網渲染。生成圖片前會等待字型載入完成。

離線複用需要清單和相關文字分片仍在快取中，新增字元可能需要另行下載。瀏覽器回收儲存、WebView 限制或清理站點資料可能使離線快取失效；可用時仍會使用 HTTP 快取和會話內請求複用。在正文設定中選擇目錄字型會改變編輯器排版；現有卡片主題字型仍然保留。

原先四款可選字型採用 SIL OFL 1.1；本次新增的四款推薦字型保留原廠商授權及內嵌宣告，不按 OFL 字型處理。版權宣告和完整許可保留在 `packages/shared/src/note-image-remote-font-notices.ts`，幷包含在 OFL 字型的生成 CSS 中，原始檔案字型則在 CSS 中保留來源說明。字型輪廓和字型檔名稱未經修改，CSS 家族別名用於隔離分享圖片與編輯器字型。

本次檢查包括共享單元測試、Web 與移動端型別檢查、Web 構建、iOS 編輯器型別檢查與構建，以及 Chrome 中聯網匯出和重新整理頁面後阻斷字型 CDN 的匯出驗證。Android USB 真機與 iOS 真機仍需單獨驗收，桌面瀏覽器結果不代表原生平臺已透過驗收。

Web 字型選擇器中的可見名稱以及當前選中值使用對應字型顯示，隱藏行不會啟動預覽下載。名稱預覽與圖片匯出共用已載入字型和持久資源快取，不額外生成內嵌 base64 樣式，也不載入紙張紋理。預覽失敗時保留可讀的系統字型名稱，不影響選擇。

## 正文與海報共用字型

`font-loader.ts` 統一負責可選字型的下載、完整性檢查、字型註冊和匯出 CSS。三個入口繼續使用原有 `edgeever-share-font-cache` 資料庫和 URL 快取鍵，先前下載的字型仍可複用。Web `FontLabel` 元件只為可見行預覽字型，各列表讀取相同的 23 款目錄條目及名稱。

正文字型沿用原有儲存鍵和舊選項。選擇目錄字型後，使用共享字型家族，並保留系統或原有本機字型回退。防抖觀察器會在正文變化或切換筆記時載入新增字元分片。公開分享透過既有正文字型設定接受目錄 ID，不改變資料庫結構、不新增遷移。

海報源稿保留既有中文字型家族名稱，載入時對映到目錄 ID。模板先載入所選搭配，以及實際使用的明確字型和固定文字，再完成最終排版；建立文字物件和匯出 PNG 時會等待對應文字的字型就緒。序列化源稿重開時走同一鏈路。全部 23 款海報字型統一使用共享載入器。舊正文選項保持可讀，已選中的舊選項仍可顯示；新選擇使用共同目錄。介面字型保留原有選項。

客戶端不新增字型二進位檔案，共享目錄、載入器與預覽控制元件會增加應用程式碼。Android 和 iOS 真機驗收仍需單獨完成，Web 與編輯器資源構建不能代替真機驗收。

## 23 款統一字型目錄

正文設定、海報設計和分享圖片使用同一份 23 款字型目錄，順序和名稱一致。各入口仍保留跟隨系統、跟隨主題等適用的特殊選項。舊正文設定保持可讀，當前已選中的舊字型仍可顯示，新選擇使用共同目錄。

新增接入的 15 款為：思源宋體、Anton、抖音美好體、馬善政楷書、江城圓體、站酷慶科黃油體、未來熒黑、站酷快樂體、思源黑體、思源宋體 Heavy、Inter、DM Serif Display、Bebas Neue、Space Grotesk 和 JetBrains Mono。複用倉庫提交 `0da78f6ce8a4643b2dfb7afe9f7a5101472c4ffb` 中已有的海報字型檔案，目錄記錄檔案長度和 SHA-256 摘要。Web 和桌面端優先複用已有 `/poster-fonts/` 資源，再嘗試固定提交的 jsDelivr GitHub 地址和 raw GitHub 映象；使用 file URL 的原生 WebView 使用遠端來源。所有來源共用快取鍵、完整性校驗、載入狀態和失敗重試。

這些已有檔案保持原樣，包括此前已做過子集化的 WOFF2 檔案。版權與許可全文透過 `poster-font-notices.ts` 保留在匯出 CSS 中。西文字型的中文字元使用常規後備字型，下載西文字型不會增加其中文字形。沒有新增或複製字型二進位到客戶端安裝包，僅增加目錄、許可和應用程式碼。

Android 直接讀取共享目錄。iOS 選項由 `bun scripts/sync-font-catalog.mjs` 從同一目錄生成，使用 `--check` 檢查同步情況，確保已儲存的分享字型與編輯器渲染一致。瀏覽器驗證不能替代原生裝置驗收。
