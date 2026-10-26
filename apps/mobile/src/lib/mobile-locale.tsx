import { DEFAULT_MEMO_TITLE, getMemoSaveErrorReasonKey } from "@edgeever/shared";
import { enUS, ja, pl, zhTW } from "@edgeever/shared/i18n";
import { resolveSupportedLocale } from "@edgeever/shared/i18n/locales";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  readMobileLocalePreference,
  writeMobileLocalePreference,
  type MobileLocalePreference,
} from "./preferences";

type SupportedMobileLocale = "zh-TW" | "en-US" | "ja" | "pl";
type MobileLocaleContextValue = {
  preference: MobileLocalePreference;
  resolvedLocale: SupportedMobileLocale;
  setPreference: (preference: MobileLocalePreference) => void;
  translate: (value: string) => string;
};

type TranslationPair = { source: string; target: string; pattern?: RegExp; placeholders?: string[] };

const mobileOnlyTranslations = new Map<string, string>([
  ["確定", "OK"],
  ["好的", "OK"],
  ["登入", "Sign in"],
  ["刪除失敗", "Could not delete"],
  ["刪除中", "Deleting"],
  ["恢復中", "Restoring"],
  ["恢復失敗", "Could not restore"],
  ["建立失敗", "Could not create"],
  ["請重試", "Please try again"],
  ["請檢查網路後重試", "Check your network and try again"],
  ["當前無法連線實例，請稍後重試", "Cannot reach the instance right now. Try again later."],
  ["換個關鍵詞再試", "Try a different keyword"],
  ["沒有找到匹配筆記", "No matching notes"],
  ["重試載入", "Retry loading"],
  ["請先建立一個筆記本", "Create a notebook first"],
  ["附件上傳失敗", "Could not upload the attachment"],
  ["儲存中", "Saving"],
  ["準備中", "Preparing"],
  ["本機草稿", "Local draft"],
  ["未儲存", "Not saved"],
  ["缺少筆記資料，無法開啟富文字編輯器", "The note data is missing, so the rich text editor cannot open."],
  ["筆記載入失敗", "Could not load the note"],
  ["進入編輯並聚焦標題", "Starts editing and moves focus to the title"],
  ["編輯筆記標題", "Edit note title"],
  ["更改筆記所屬筆記本", "Change the note's notebook"],
  ["選擇歷史記錄後可預覽並恢復。", "Select a version to preview and restore it."],
  ["當前無法讀取附件。", "The attachment cannot be read right now."],
  ["當前無法讀取資源。", "The resource cannot be read right now."],
  ["請等待筆記同步完成。", "Wait for the note to finish syncing."],
  ["資源讀取失敗", "Could not read the resource"],
  ["已取消下載", "Download canceled"],
  ["當前裝置無法開啟系統分享面板", "This device cannot open the system share sheet"],
  ["登入成功但服務端沒有返回移動端會話。請確認服務端已更新到支援 App 登入的版本。", "Signed in, but the server did not return a mobile session. Make sure the server is updated to a version that supports app sign-in."],
  ["新建筆記本", "New notebook"],
  ["建立筆記本", "Create notebook"],
  ["筆記本名稱", "Notebook name"],
  ["頂層筆記本", "Top level"],
  ["位於「{{name}}」下", "Under {{name}}"],
  ["暫無筆記本", "No notebooks"],
  ["先建立一個筆記本，再開始記錄。", "Create a notebook to start taking notes."],
  ["建立筆記本失敗，請重試", "Could not create the notebook. Try again."],
  ["連線尚未就緒", "Connection is not ready"],
  ["筆記本已建立", "Notebook created"],
  ["本機快取更新失敗，正在重新同步。", "The local cache could not update. Syncing again now."],
  ["本級暫無筆記", "No notes directly in this notebook"],
  ["無法儲存“父筆記本中顯示子筆記本筆記”設定，請稍後重試", "Could not save the \"Show notes from sub-notebooks\" setting. Please try again."],
  ["子筆記本中還有 {{count}} 條筆記。可以開啟子筆記本檢視，或在設定中開啟“父筆記本中顯示子筆記本筆記”。", "Its sub-notebooks still contain {{count}} notes. Open a sub-notebook to see them, or turn on \"Show notes from sub-notebooks\" in Settings."],
  ["返回", "Back"],
  ["關閉對話方塊", "Close dialog"],
  ["切換到深色模式", "Switch to dark mode"],
  ["切換到淺色模式", "Switch to light mode"],
  ["完成編輯", "Finish editing"],
  ["完成新建筆記", "Finish creating note"],
  ["Markdown 原始碼編輯", "Edit Markdown source"],
  ["資源", "Resources"],
  ["筆記列表操作", "Note list actions"],
  ["搜尋", "Search"],
  ["搜尋標題、正文或標籤", "Search titles, content, or tags"],
  ["輸入關鍵詞開始搜尋", "Enter a keyword to search"],
  ["搜尋本機同步快取，結果會即時顯示", "Search the local synced cache with instant results"],
  ["筆記操作", "Note actions"],
  ["AI 筆記助手", "AI note assistant"],
  ["版本歷史", "Version history"],
  ["分享筆記", "Share note"],
  ["分享為圖片", "Share as image"],
  ["選擇筆記", "Select note"],
  ["複製筆記 ID", "Copy note ID"],
  ["同步後可複製筆記 ID", "Copy note ID after sync"],
  ["筆記 ID 已複製", "Note ID copied"],
  ["複製筆記 ID 失敗", "Could not copy note ID"],
  ["分享失敗", "Could not share"],
  ["無法建立分享連結，請檢查網路後重試。", "Could not create a share link. Check your connection and try again."],
  ["同步衝突", "Sync conflict"],
  ["同步失敗", "Sync failed"],
  ["待同步", "Pending sync"],
  ["已同步", "Synced"],
  ["立即同步", "Sync now"],
  ["檢視同步狀態並立即重試", "View sync status and retry now"],
  ["本機改動還在等待上傳到雲端。可立即重試同步。", "Local changes are waiting to upload. You can retry sync now."],
  ["本機改動未能上傳到雲端。可立即重試同步。", "Local changes could not upload. You can retry sync now."],
  ["本機改動未能上傳到雲端。內容仍儲存在本機，可立即重試。", "Local changes could not upload. They remain on this device and you can retry now."],
  ["本機改動待上傳。下拉重新整理或點此可立即同步。", "Local changes are pending upload. Pull to refresh or tap to sync now."],
  ["檢視並處理同步衝突", "Review and resolve the sync conflict"],
  ["雲端筆記已在其他標籤頁、裝置，或離線期間被更新，本機草稿無法直接覆蓋。可先複製本機草稿，再採用雲端版本後繼續編輯。", "The cloud note was updated in another tab, on another device, or while you were offline. Copy your local draft, then use the cloud version before editing again."],
  ["雲端筆記已在其他標籤頁、裝置，或離線期間被更新。可先複製本機草稿，再採用雲端版本後繼續編輯。", "The cloud note was updated in another tab, on another device, or while you were offline. Copy your local draft, then use the cloud version before editing again."],
  ["檢視歷史", "View history"],
  ["使用雲端版本", "Use cloud version"],
  ["採用雲端並重新載入", "Use cloud and reload"],
  ["採用雲端版本失敗", "Could not use the cloud version"],
  ["複製本機草稿", "Copy local draft"],
  ["本機草稿已複製到剪貼簿。", "Local draft copied to the clipboard."],
  ["沒有可複製的本機草稿。", "There is no local draft to copy."],
  ["已複製", "Copied"],
  ["更多", "More"],
  ["載入失敗", "Failed to load"],
  ["請稍後重試", "Please try again later"],
  ["重試", "Retry"],
  ["圖片上傳失敗", "Image upload failed"],
  ["請檢查網路連線後重試", "Check your connection and try again"],
  ["新增圖片或附件", "Add image or attachment"],
  ["選擇拍照、相簿或裝置檔案", "Take a photo or choose from your library or device"],
  ["關閉圖片來源選擇", "Close image source picker"],
  ["拍照", "Take photo"],
  ["從相簿選擇", "Choose from library"],
  ["選擇檔案", "Choose file"],
  ["需要相機權限", "Camera access required"],
  ["允許 EdgeEver 使用相機後，才能直接拍照插入筆記。", "Allow EdgeEver to use the camera to take photos and insert them into notes."],
  ["相機權限已被關閉。請前往系統設定允許 EdgeEver 使用相機。", "Camera access is disabled. Open system settings and allow EdgeEver to use the camera."],
  ["前往設定", "Open settings"],
  ["系統未能恢復上次選擇的圖片，請重試", "The system could not restore the previously selected image. Please try again."],
  ["退出新建筆記？", "Exit the new note?"],
  ["內容已自動儲存為本機草稿，下次新建時會繼續恢復。", "The content is saved as a local draft and will be restored the next time you create a note."],
  ["繼續編輯", "Keep editing"],
  ["放棄草稿", "Discard draft"],
  ["保留並退出", "Keep and exit"],
  ["丟棄本機變更？", "Discard local changes?"],
  ["此操作會移除這條待同步記錄，不會修改服務端筆記。", "This removes the queued local change without modifying the server note."],
  ["丟棄", "Discard"],
  ["正在同步新筆記", "New note is syncing"],
  ["首次同步完成後即可上傳本機圖片；圖片連結現在就可以直接貼上到正文。", "Local images can be uploaded after the first sync. Image links can already be pasted into the note."],
  ["儲存更改？", "Save changes?"],
  ["當前筆記有未儲存修改。", "This note has unsaved changes."],
  ["放棄修改", "Discard changes"],
  ["無法開啟資源", "Unable to open resource"],
  ["系統沒有可用應用開啟此連結。", "No installed app can open this link."],
  ["已刪除筆記不能上傳附件，請先恢復筆記", "Deleted notes cannot receive attachments. Restore the note first."],
  ["圖片預覽", "Image preview"],
  ["放大", "Zoom in"],
  ["縮小", "Zoom out"],
  ["上一張", "Previous image"],
  ["下一張", "Next image"],
  ["開啟原檔案", "Open original file"],
  ["密碼已更新", "Password updated"],
  ["下次登入請使用新密碼。", "Use the new password the next time you sign in."],
  ["編輯筆記", "Edit note"],
  ["所在筆記本", "Notebook"],
  ["筆記標題", "Note title"],
  ["筆記標籤", "Note tags"],
  ["選擇筆記本", "Choose notebook"],
  ["點選已有標籤，或輸入名稱建立新標籤", "Select existing tags or enter a name to create a new one"],
  ["按標籤篩選", "Filter by tag"],
  ["選擇一個標籤，只檢視帶有該標籤的筆記", "Choose a tag to view only notes with that tag"],
  ["搜尋標籤", "Search tags"],
  ["沒有匹配的標籤", "No matching tags"],
  ["搜尋或輸入新標籤", "Search or enter a new tag"],
  ["沒有匹配的現有標籤，可直接新建", "No matching tags. You can create a new one."],
  ["新建", "Create"],
  ["{{count}} 條筆記", "{{count}} notes"],
  ["重新整理 Token", "Refresh tokens"],
  ["Token 名稱", "Token name"],
  ["沒有正文預覽", "No content preview"],
  ["原生執行時啟動", "Native runtime startup"],
  ["啟動至 JS 執行", "Launch to JavaScript execution"],
  ["啟動至會話/快取就緒", "Launch to session/cache ready"],
  ["啟動至工作區首幀", "Launch to workspace first frame"],
  ["啟動至列表資料就緒", "Launch to list data ready"],
  ["啟動至互動空閒", "Launch to interaction idle"],
  ["最近一次本機編輯器啟動", "Latest local editor startup"],
  ["正在啟動編輯器", "Starting editor"],
  ["編輯器啟動時間過長", "The editor is taking too long to start"],
  ["正在準備本機編輯器，筆記內容是安全的。", "Preparing the local editor. Your note is safe."],
  ["本機編輯器未能及時啟動，可以重試或返回，當前草稿不會丟失。", "The local editor did not start in time. You can retry or go back; your current draft will not be lost."],
  ["暫不可用", "Unavailable"],
  ["尚未記錄", "Not recorded"],
  ["正在搜尋", "Searching"],
  ["退出搜尋", "Exit search"],
  ["重置", "Reset"],
  ["置頂", "Pinned"],
  ["有標籤", "Tagged"],
  ["無標籤", "Untagged"],
  ["正在同步筆記", "Syncing your notes"],
  ["正在準備首次同步…", "Preparing your notes for the first sync…"],
  ["正在載入筆記", "Loading notes"],
  ["正在載入筆記本和筆記…", "Loading notebooks and notes…"],
  ["同步已暫停", "Sync paused"],
  ["已載入的筆記仍可使用，請檢查網路後重試。", "Loaded notes remain available. Check your connection and retry."],
  ["已選擇 {{count}} 條", "{{count}} selected"],
  ["{{count}} 條結果", "Results: {{count}}"],
  ["篩選：{{filter}} · {{count}} 條", "Filter: {{filter}} · {{count}} notes"],
  ["已載入 {{loaded}} / {{total}} 條筆記", "Loaded {{loaded}} of {{total}} notes"],
  ["從模板新建", "New from template"],
  ["模板", "Templates"],
  ["選擇一個模板快速開始。所有模板都可以在網頁端修改或刪除。", "Choose a template to get started. Every template can be edited or deleted on the web."],
  ["模板暫時無法載入，請稍後重試。", "Templates could not load. Please try again later."],
  ["暫無模板。可在網頁端新建模板，或將常用筆記另存為模板。", "No templates yet. Create one or save a note as a template on the web."],
  ["正在載入模板", "Loading templates"],
  ["新建筆記", "New note"],
  ["選擇建立方式", "Choose how to create"],
  ["空白筆記", "Blank note"],
  ["從空白頁開始記錄", "Start with an empty page"],
  ["使用會議紀要、週報等預設結構", "Use meeting notes, weekly reviews, and more"],
  ["模板", "Template"],
  ["應用模板？", "Apply template?"],
  ["當前內容將被模板內容替換。", "The current content will be replaced by the template."],
  ["替換", "Replace"],
  ["關閉", "Close"],
  ["修改後會保留當前裝置登入，並退出其他裝置上的登入會話。", "Keeps this device signed in and signs out other sessions."],
  ["新增標籤", "Add tags"],
  ["正在生成智慧標籤", "Generating smart tags"],
  ["智慧標籤生成失敗", "Could not generate smart tags"],
  ["智慧標籤已新增", "Smart tags added"],
  ["沒有找到適合這篇筆記的新標籤。", "No new tags fit this note."],
  ["沒有匹配的筆記本", "No matching notebooks"],
  ["偏好設定", "Preferences"],
  ["切換產品介面的顯示語言。", "Choose the language used in the app."],
  ["上傳大圖時在本機壓縮，節省資源佔用。", "Compress large images on this device before upload."],
  ["已恢復上次未完成的本機草稿", "Restored your unfinished local draft"],
  ["連線你的自託管筆記空間", "Connect to your self-hosted notes"],
  ["首次登入密碼", "Password for first sign-in"],
  ["GitHub 倉庫", "GitHub repository"],
  ["操作失敗，請稍後再試", "Something went wrong. Please try again."],
  ["正在剪藏文章", "Clipping article"],
  ["正在提取標題、正文和圖片連結…", "Extracting the title, body, and image links…"],
  ["正文剪藏失敗", "Article extraction failed"],
  ["已保留文章連結，你可以稍後重新分享重試。", "The article link was kept. Share it again later to retry."],
  ["頁面載入完成，但沒有找到可剪藏的正文。", "The page finished loading, but there was no article text to clip."],
  ["微信文章載入超時。", "The WeChat article took too long to load."],
  ["沒有找到可剪藏的正文。", "No article text was found to clip."],
  ["無法解析微信文章正文。", "Could not read the WeChat article text."],
  ["微信文章載入失敗。", "Could not load the WeChat article."],
  ["微信文章請求失敗（HTTP {{status}}）。", "The WeChat article request failed (HTTP {{status}})."],
  ["無法讀取分享圖片", "Could not read the shared image"],
  ["請重新分享後再試。", "Share it again and retry."],
  ["無法儲存圖片", "Unable to save images"],
  ["請先在 EdgeEver 中建立一個筆記本。", "Create a notebook in EdgeEver first."],
  ["分享的圖片", "Shared image"],
  ["分享的圖片（{{count}} 張）", "Shared images ({{count}})"],
  ["無法讀取分享內容", "Could not read the shared content"],
  ["分享內容裡沒有可識別的網頁連結或圖片。", "The shared content has no recognizable web link or image."],
  ["無法儲存剪藏", "Unable to save clip"],
  ["剪藏失敗", "Could not clip the page"],
  ["無法讀取分享的網頁，請稍後重試。", "Could not read the shared page. Try again later."],
]);

const mobileOnlyJapanese = new Map<string, string>([
  ["確定", "OK"],
  ["好的", "OK"],
  ["登入", "ログイン"],
  ["刪除失敗", "削除できませんでした"],
  ["刪除中", "削除しています"],
  ["恢復中", "復元しています"],
  ["恢復失敗", "復元できませんでした"],
  ["建立失敗", "作成できませんでした"],
  ["請重試", "再試行してください"],
  ["請檢查網路後重試", "ネットワークを確認して再試行してください"],
  ["當前無法連線實例，請稍後重試", "現在インスタンスに接続できません。しばらくしてから再試行してください。"],
  ["換個關鍵詞再試", "別のキーワードで試してください"],
  ["沒有找到匹配筆記", "一致するノートはありません"],
  ["重試載入", "再読み込み"],
  ["請先建立一個筆記本", "先にノートブックを作成してください"],
  ["附件上傳失敗", "添付をアップロードできませんでした"],
  ["保存中", "保存しています"],
  ["準備中", "準備しています"],
  ["本機草稿", "ローカル下書き"],
  ["未保存", "未保存"],
  ["缺少筆記資料，無法開啟富文字編輯器", "ノートのデータがないため、リッチテキストエディタを開けません。"],
  ["筆記載入失敗", "ノートを読み込めませんでした"],
  ["進入編輯並聚焦標題", "編集を開始してタイトルにフォーカスします"],
  ["編輯筆記標題", "ノートのタイトルを編集"],
  ["更改筆記所屬筆記本", "ノートのノートブックを変更"],
  ["選擇歷史記錄後可預覽並恢復。", "履歴を選ぶとプレビューして復元できます。"],
  ["當前無法讀取附件。", "現在添付を読み込めません。"],
  ["當前無法讀取資源。", "現在リソースを読み込めません。"],
  ["請等待筆記同步完成。", "ノートの同期が終わるまでお待ちください。"],
  ["資源讀取失敗", "リソースを読み込めませんでした"],
  ["已取消下載", "ダウンロードをキャンセルしました"],
  ["當前裝置無法開啟系統分享面板", "この端末ではシステムの共有シートを開けません"],
  ["登入成功但服務端沒有返回移動端會話。請確認服務端已更新到支援 App 登入的版本。", "サインインしましたが、サーバーがモバイルセッションを返しませんでした。サーバーがアプリのサインインに対応したバージョンに更新されているか確認してください。"],
  ["新建筆記本", "新しいノートブック"],
  ["建立筆記本", "ノートブックを作成"],
  ["筆記本名稱", "ノートブック名"],
  ["頂層筆記本", "最上位"],
  ["位於「{{name}}」下", "「{{name}}」の下"],
  ["暫無筆記本", "ノートブックがありません"],
  ["先建立一個筆記本，再開始記錄。", "ノートブックを作成して記録を始めましょう。"],
  ["建立筆記本失敗，請重試", "ノートブックを作成できませんでした。再試行してください。"],
  ["連線尚未就緒", "接続の準備ができていません"],
  ["筆記本已建立", "ノートブックを作成しました"],
  ["本機快取更新失敗，正在重新同步。", "端末のキャッシュを更新できませんでした。再同期しています。"],
  ["本級暫無筆記", "このノートブック直下にノートはありません"],
  ["無法儲存“父筆記本中顯示子筆記本筆記”設定，請稍後重試", "「サブノートブックのノートを表示」の設定を保存できませんでした。しばらくしてから再試行してください。"],
  ["子筆記本中還有 {{count}} 條筆記。可以開啟子筆記本檢視，或在設定中開啟“父筆記本中顯示子筆記本筆記”。", "サブノートブックにはまだ {{count}} 件のノートがあります。サブノートブックを開くか、設定で「サブノートブックのノートを表示」をオンにしてください。"],
  ["返回", "戻る"],
  ["關閉對話方塊", "ダイアログを閉じる"],
  ["切換到深色模式", "ダークモードに切り替え"],
  ["切換到淺色模式", "ライトモードに切り替え"],
  ["完成編輯", "編集を終える"],
  ["完成新建筆記", "ノート作成を終える"],
  ["Markdown 原始碼編輯", "Markdown ソースを編集"],
  ["資源", "リソース"],
  ["筆記列表操作", "ノート一覧の操作"],
  ["搜索", "検索"],
  ["搜尋標題、正文或標籤", "タイトル、本文、タグを検索"],
  ["輸入關鍵詞開始搜尋", "キーワードを入力して検索"],
  ["搜尋本機同步快取，結果會即時顯示", "端末内の同期キャッシュを検索し、結果をすぐ表示します"],
  ["筆記操作", "ノート操作"],
  ["AI 筆記助手", "AI ノートアシスタント"],
  ["版本歷史", "版履歴"],
  ["分享筆記", "ノートを共有"],
  ["分享為圖片", "画像として共有"],
  ["選擇筆記", "ノートを選択"],
  ["複製筆記 ID", "ノート ID をコピー"],
  ["同步後可複製筆記 ID", "同期後にノート ID をコピー"],
  ["筆記 ID 已複製", "ノート ID をコピーしました"],
  ["複製筆記 ID 失敗", "ノート ID をコピーできませんでした"],
  ["分享失敗", "共有できませんでした"],
  ["無法建立分享連結，請檢查網路後重試。", "共有リンクを作成できませんでした。接続を確認して再試行してください。"],
  ["同步衝突", "同期の競合"],
  ["同步失敗", "同期に失敗しました"],
  ["待同步", "同期待ち"],
  ["已同步", "同期済み"],
  ["立即同步", "今すぐ同期"],
  ["檢視同步狀態並立即重試", "同期状態を見て今すぐ再試行"],
  ["本地改動還在等待上傳到雲端。可立即重試同步。", "ローカルの変更はまだアップロード待ちです。今すぐ同期を再試行できます。"],
  ["本地改動未能上傳到雲端。可立即重試同步。", "ローカルの変更をアップロードできませんでした。今すぐ同期を再試行できます。"],
  ["本地改動未能上傳到雲端。內容仍儲存在本機，可立即重試。", "ローカルの変更をアップロードできませんでした。内容は端末に残っており、今すぐ再試行できます。"],
  ["本地改動待上傳。下拉重新整理或點此可立即同步。", "ローカルの変更はアップロード待ちです。下に引くか、ここをタップして今すぐ同期できます。"],
  ["檢視並處理同步衝突", "同期の競合を確認して解消"],
  ["雲端筆記已在其他標籤頁、裝置，或離線期間被更新，本機草稿無法直接覆蓋。可先複製本機草稿，再採用雲端版本後繼續編輯。", "クラウド上のノートが他のタブ、他の端末、またはオフライン中に更新されたため、ローカル下書きで上書きできません。先に下書きをコピーし、クラウド版を採用してから編集を続けてください。"],
  ["雲端筆記已在其他標籤頁、裝置，或離線期間被更新。可先複製本機草稿，再採用雲端版本後繼續編輯。", "クラウド上のノートが他のタブ、他の端末、またはオフライン中に更新されました。先に下書きをコピーし、クラウド版を採用してから編集を続けてください。"],
  ["檢視歷史", "履歴を見る"],
  ["使用雲端版本", "クラウド版を使う"],
  ["採用雲端並重新載入", "クラウド版を使って再読み込み"],
  ["採用雲端版本失敗", "クラウド版を使えませんでした"],
  ["複製本機草稿", "ローカル下書きをコピー"],
  ["本機草稿已複製到剪貼簿。", "ローカル下書きをクリップボードにコピーしました。"],
  ["沒有可複製的本機草稿。", "コピーできるローカル下書きはありません。"],
  ["已複製", "コピーしました"],
  ["更多", "その他"],
  ["載入失敗", "読み込めませんでした"],
  ["請稍後重試", "しばらくしてから再試行してください"],
  ["重試", "再試行"],
  ["圖片上傳失敗", "画像のアップロードに失敗しました"],
  ["請檢查網路連線後重試", "接続を確認して再試行してください"],
  ["新增圖片或附件", "画像または添付を追加"],
  ["選擇拍照、相簿或裝置檔案", "撮影、ライブラリ、またはファイルから選ぶ"],
  ["關閉圖片來源選擇", "画像ソースの選択を閉じる"],
  ["拍照", "写真を撮る"],
  ["從相簿選擇", "ライブラリから選ぶ"],
  ["選擇檔案", "ファイルを選ぶ"],
  ["需要相機權限", "カメラの許可が必要です"],
  ["允許 EdgeEver 使用相機後，才能直接拍照插入筆記。", "カメラで撮影してノートに入れるには、EdgeEver のカメラ使用を許可してください。"],
  ["相機權限已被關閉。請前往系統設定允許 EdgeEver 使用相機。", "カメラの許可がオフです。システム設定で EdgeEver のカメラ使用を許可してください。"],
  ["前往設定", "設定を開く"],
  ["系統未能恢復上次選擇的圖片，請重試", "前回選んだ画像をシステムが復元できませんでした。再試行してください。"],
  ["退出新建筆記？", "新しいノートを閉じますか？"],
  ["內容已自動儲存為本機草稿，下次新建時會繼續恢復。", "内容はローカル下書きとして保存済みで、次に新規作成するときに復元されます。"],
  ["繼續編輯", "編集を続ける"],
  ["放棄草稿", "下書きを捨てる"],
  ["保留並退出", "残して閉じる"],
  ["丟棄本地變更？", "ローカルの変更を捨てますか？"],
  ["此操作會移除這條待同步記錄，不會修改服務端筆記。", "この操作は同期待ちの記録だけを消し、サーバー上のノートは変更しません。"],
  ["丟棄", "捨てる"],
  ["正在同步新筆記", "新しいノートを同期しています"],
  ["首次同步完成後即可上傳本地圖片；圖片連結現在就可以直接貼上到正文。", "初回同期のあとでローカル画像をアップロードできます。画像リンクは今すぐ本文に貼れます。"],
  ["保存更改？", "変更を保存しますか？"],
  ["當前筆記有未儲存修改。", "このノートには未保存の変更があります。"],
  ["放棄修改", "変更を捨てる"],
  ["無法開啟資源", "リソースを開けません"],
  ["系統沒有可用應用開啟此連結。", "このリンクを開けるアプリがありません。"],
  ["已刪除筆記不能上傳附件，請先恢復筆記", "削除済みノートには添付をアップロードできません。先に復元してください。"],
  ["圖片預覽", "画像プレビュー"],
  ["放大", "拡大"],
  ["縮小", "縮小"],
  ["上一張", "前の画像"],
  ["下一張", "次の画像"],
  ["開啟原檔案", "元のファイルを開く"],
  ["密碼已更新", "パスワードを更新しました"],
  ["下次登入請使用新密碼。", "次回のログインから新しいパスワードを使ってください。"],
  ["編輯筆記", "ノートを編集"],
  ["所在筆記本", "ノートブック"],
  ["筆記標題", "ノートのタイトル"],
  ["筆記標籤", "ノートのタグ"],
  ["選擇筆記本", "ノートブックを選ぶ"],
  ["點選已有標籤，或輸入名稱建立新標籤", "既存のタグを選ぶか、名前を入力して新規作成"],
  ["按標籤篩選", "タグで絞り込み"],
  ["選擇一個標籤，只檢視帶有該標籤的筆記", "タグを選ぶと、そのタグのノートだけを表示します"],
  ["搜尋標籤", "タグを検索"],
  ["沒有匹配的標籤", "一致するタグはありません"],
  ["搜尋或輸入新標籤", "検索するか、新しいタグを入力"],
  ["沒有匹配的現有標籤，可直接新建", "一致する既存タグはありません。新規作成できます。"],
  ["新建", "作成"],
  ["{{count}} 條筆記", "{{count}} 件のノート"],
  ["刷新 Token", "トークンを更新"],
  ["Token 名稱", "トークン名"],
  ["沒有正文預覽", "本文プレビューはありません"],
  ["原生執行時啟動", "ネイティブ実行環境の起動"],
  ["啟動至 JS 執行", "JS 実行までの起動"],
  ["啟動至會話/快取就緒", "セッション/キャッシュ準備までの起動"],
  ["啟動至工作區首幀", "ワークスペース初回描画までの起動"],
  ["啟動至列表資料就緒", "一覧データ準備までの起動"],
  ["啟動至互動空閒", "操作可能になるまでの起動"],
  ["最近一次本地編輯器啟動", "直近のローカルエディタ起動"],
  ["正在啟動編輯器", "エディタを起動しています"],
  ["編輯器啟動時間過長", "エディタの起動に時間がかかっています"],
  ["正在準備本地編輯器，筆記內容是安全的。", "ローカルエディタを準備しています。ノートの内容は失われません。"],
  ["本地編輯器未能及時啟動，可以重試或返回，當前草稿不會丟失。", "ローカルエディタが時間内に起動しませんでした。再試行するか戻ってください。下書きは失われません。"],
  ["暫不可用", "利用できません"],
  ["尚未記錄", "未記録"],
  ["正在搜索", "検索中"],
  ["退出搜索", "検索を終了"],
  ["重置", "リセット"],
  ["置頂", "ピン留め"],
  ["有標籤", "タグあり"],
  ["無標籤", "タグなし"],
  ["正在同步筆記", "ノートを同期しています"],
  ["正在準備首次同步…", "初回同期を準備しています…"],
  ["正在載入筆記", "ノートを読み込んでいます"],
  ["正在載入筆記本和筆記…", "ノートブックとノートを読み込んでいます…"],
  ["同步已暫停", "同期を一時停止しました"],
  ["已載入的筆記仍可使用，請檢查網路後重試。", "読み込み済みのノートは使えます。接続を確認して再試行してください。"],
  ["已選擇 {{count}} 條", "{{count}} 件を選択"],
  ["{{count}} 條結果", "結果: {{count}} 件"],
  ["篩選：{{filter}} · {{count}} 條", "絞り込み: {{filter}} · {{count}} 件"],
  ["已載入 {{loaded}} / {{total}} 條筆記", "{{loaded}} / {{total}} 件のノートを読み込み済み"],
  ["從模板新建", "テンプレートから作成"],
  ["模板", "テンプレート"],
  ["選擇一個模板快速開始。所有模板都可以在網頁端修改或刪除。", "テンプレートを選んで始めます。テンプレートの編集と削除はウェブからできます。"],
  ["模板暫時無法載入，請稍後重試。", "テンプレートを読み込めませんでした。しばらくしてから再試行してください。"],
  ["暫無模板。可在網頁端新建模板，或將常用筆記另存為模板。", "テンプレートはまだありません。ウェブで作成するか、よく使うノートをテンプレートとして保存できます。"],
  ["正在載入模板", "テンプレートを読み込んでいます"],
  ["新建筆記", "新しいノート"],
  ["選擇建立方式", "作成方法を選ぶ"],
  ["空白筆記", "空白のノート"],
  ["從空白頁開始記錄", "空白のページから書き始める"],
  ["使用會議紀要、週報等預設結構", "会議メモや週報などの型を使う"],
  ["應用模板？", "テンプレートを適用しますか？"],
  ["當前內容將被模板內容替換。", "現在の内容はテンプレートの内容に置き換わります。"],
  ["替換", "置き換え"],
  ["關閉", "閉じる"],
  ["修改後會保留當前裝置登入，並退出其他裝置上的登入會話。", "この端末のログインは維持し、他の端末のセッションは終了します。"],
  ["新增標籤", "タグを追加"],
  ["正在生成智慧標籤", "スマートタグを生成しています"],
  ["智慧標籤生成失敗", "スマートタグを生成できませんでした"],
  ["智慧標籤已新增", "スマートタグを追加しました"],
  ["沒有找到適合這篇筆記的新標籤。", "このノートに合う新しいタグはありません。"],
  ["沒有匹配的筆記本", "一致するノートブックはありません"],
  ["偏好設定", "環境設定"],
  ["切換產品介面的顯示語言。", "アプリの表示言語を切り替えます。"],
  ["上傳大圖時在本地壓縮，節省資源佔用。", "大きな画像はアップロード前にこの端末で圧縮し、容量を抑えます。"],
  ["已恢復上次未完成的本機草稿", "前回の未完成の下書きを復元しました"],
  ["連線你的自託管筆記空間", "セルフホストのノートスペースに接続"],
  ["首次登入密碼", "初回ログインのパスワード"],
  ["GitHub 倉庫", "GitHub リポジトリ"],
  ["操作失敗，請稍後再試", "操作に失敗しました。しばらくしてから再試行してください。"],
  ["正在剪藏文章", "記事を取り込んでいます"],
  ["正在提取標題、正文和圖片連結…", "タイトル、本文、画像リンクを抽出しています…"],
  ["正文剪藏失敗", "本文を取り込めませんでした"],
  ["已保留文章連結，你可以稍後重新分享重試。", "記事リンクは残してあります。あとから再共有してやり直せます。"],
  ["頁面載入完成，但沒有找到可剪藏的正文。", "ページの読み込みは終わりましたが、取り込める本文がありません。"],
  ["微信文章載入超時。", "WeChat 記事の読み込みがタイムアウトしました。"],
  ["沒有找到可剪藏的正文。", "取り込める本文が見つかりません。"],
  ["無法解析微信文章正文。", "WeChat 記事の本文を読み取れませんでした。"],
  ["微信文章載入失敗。", "WeChat 記事を読み込めませんでした。"],
  ["微信文章請求失敗（HTTP {{status}}）。", "WeChat 記事のリクエストに失敗しました（HTTP {{status}}）。"],
  ["無法讀取分享圖片", "共有された画像を読み取れませんでした"],
  ["請重新分享後再試。", "もう一度共有してから再試行してください。"],
  ["無法儲存圖片", "画像を保存できませんでした"],
  ["請先在 EdgeEver 中建立一個筆記本。", "先に EdgeEver でノートブックを作成してください。"],
  ["分享的圖片", "共有された画像"],
  ["分享的圖片（{{count}} 張）", "共有された画像（{{count}} 枚）"],
  ["無法讀取分享內容", "共有された内容を読み取れませんでした"],
  ["分享內容裡沒有可識別的網頁連結或圖片。", "共有された内容に、認識できるウェブリンクも画像もありません。"],
  ["無法儲存剪藏", "クリップを保存できませんでした"],
  ["剪藏失敗", "ページを取り込めませんでした"],
  ["無法讀取分享的網頁，請稍後重試。", "共有されたページを読み取れませんでした。しばらくしてから再試行してください。"],
]);

const mobileOnlyPolish = new Map<string, string>([
  ["確定", "OK"],
  ["好的", "OK"],
  ["登入", "Zaloguj się"],
  ["刪除失敗", "Nie udało się usunąć"],
  ["刪除中", "Usuwanie"],
  ["恢復中", "Przywracanie"],
  ["恢復失敗", "Nie udało się przywrócić"],
  ["建立失敗", "Nie udało się utworzyć"],
  ["請重試", "Spróbuj ponownie"],
  ["請檢查網路後重試", "Sprawdź sieć i spróbuj ponownie"],
  ["當前無法連線實例，請稍後重試", "Nie można teraz połączyć się z instancją. Spróbuj ponownie później."],
  ["換個關鍵詞再試", "Spróbuj innego słowa kluczowego"],
  ["沒有找到匹配筆記", "Brak pasujących notatek"],
  ["重試載入", "Wczytaj ponownie"],
  ["請先建立一個筆記本", "Najpierw utwórz notatnik"],
  ["附件上傳失敗", "Nie udało się przesłać załącznika"],
  ["保存中", "Zapisywanie"],
  ["準備中", "Przygotowywanie"],
  ["本機草稿", "Wersja robocza na urządzeniu"],
  ["未保存", "Nie zapisano"],
  ["缺少筆記資料，無法開啟富文字編輯器", "Brak danych notatki, więc nie można otworzyć edytora tekstu sformatowanego."],
  ["筆記載入失敗", "Nie udało się wczytać notatki"],
  ["進入編輯並聚焦標題", "Rozpoczyna edycję i przenosi fokus na tytuł"],
  ["編輯筆記標題", "Edytuj tytuł notatki"],
  ["更改筆記所屬筆記本", "Zmień notatnik tej notatki"],
  ["選擇歷史記錄後可預覽並恢復。", "Wybierz wersję, aby ją podejrzeć i przywrócić."],
  ["當前無法讀取附件。", "Nie można teraz odczytać załącznika."],
  ["當前無法讀取資源。", "Nie można teraz odczytać zasobu."],
  ["請等待筆記同步完成。", "Poczekaj na zakończenie synchronizacji notatki."],
  ["資源讀取失敗", "Nie udało się odczytać zasobu"],
  ["已取消下載", "Pobieranie anulowane"],
  ["當前裝置無法開啟系統分享面板", "Na tym urządzeniu nie można otworzyć systemowego okna udostępniania"],
  ["登入成功但服務端沒有返回移動端會話。請確認服務端已更新到支援 App 登入的版本。", "Zalogowano, ale serwer nie zwrócił sesji mobilnej. Upewnij się, że serwer jest zaktualizowany do wersji obsługującej logowanie w aplikacji."],
  ["新建筆記本", "Nowy notatnik"],
  ["建立筆記本", "Utwórz notatnik"],
  ["筆記本名稱", "Nazwa notatnika"],
  ["頂層筆記本", "Najwyższy poziom"],
  ["位於「{{name}}」下", "W notatniku „{{name}}”"],
  ["暫無筆記本", "Brak notatników"],
  ["先建立一個筆記本，再開始記錄。", "Utwórz notatnik, aby zacząć robić notatki."],
  ["建立筆記本失敗，請重試", "Nie udało się utworzyć notatnika. Spróbuj ponownie."],
  ["連線尚未就緒", "Połączenie nie jest jeszcze gotowe"],
  ["筆記本已建立", "Notatnik utworzony"],
  ["本機快取更新失敗，正在重新同步。", "Nie udało się zaktualizować lokalnej pamięci podręcznej. Trwa ponowna synchronizacja."],
  ["本級暫無筆記", "Brak notatek bezpośrednio w tym notatniku"],
  ["無法儲存“父筆記本中顯示子筆記本筆記”設定，請稍後重試", "Nie udało się zapisać ustawienia „Pokazuj notatki z podnotatników”. Spróbuj ponownie później."],
  ["子筆記本中還有 {{count}} 條筆記。可以開啟子筆記本檢視，或在設定中開啟“父筆記本中顯示子筆記本筆記”。", "Notatki w podnotatnikach: {{count}}. Otwórz podnotatnik, aby je zobaczyć, lub włącz w ustawieniach opcję „Pokazuj notatki z podnotatników”."],
  ["返回", "Wstecz"],
  ["關閉對話方塊", "Zamknij okno"],
  ["切換到深色模式", "Przełącz na ciemny motyw"],
  ["切換到淺色模式", "Przełącz na jasny motyw"],
  ["完成編輯", "Zakończ edycję"],
  ["完成新建筆記", "Zakończ tworzenie notatki"],
  ["Markdown 原始碼編輯", "Edytuj źródło Markdown"],
  ["資源", "Zasoby"],
  ["筆記列表操作", "Działania na liście notatek"],
  ["搜索", "Szukaj"],
  ["搜尋標題、正文或標籤", "Szukaj w tytułach, treści lub tagach"],
  ["輸入關鍵詞開始搜尋", "Wpisz słowo kluczowe, aby wyszukać"],
  ["搜尋本機同步快取，結果會即時顯示", "Przeszukuj lokalną kopię zsynchronizowanych notatek z natychmiastowymi wynikami"],
  ["筆記操作", "Działania na notatce"],
  ["AI 筆記助手", "Asystent AI notatek"],
  ["版本歷史", "Historia wersji"],
  ["分享筆記", "Udostępnij notatkę"],
  ["分享為圖片", "Udostępnij jako obraz"],
  ["選擇筆記", "Wybierz notatkę"],
  ["複製筆記 ID", "Kopiuj ID notatki"],
  ["同步後可複製筆記 ID", "ID notatki można skopiować po synchronizacji"],
  ["筆記 ID 已複製", "Skopiowano ID notatki"],
  ["複製筆記 ID 失敗", "Nie udało się skopiować ID notatki"],
  ["分享失敗", "Nie udało się udostępnić"],
  ["無法建立分享連結，請檢查網路後重試。", "Nie udało się utworzyć linku udostępniania. Sprawdź połączenie i spróbuj ponownie."],
  ["同步衝突", "Konflikt synchronizacji"],
  ["同步失敗", "Synchronizacja nie powiodła się"],
  ["待同步", "Oczekuje na synchronizację"],
  ["已同步", "Zsynchronizowano"],
  ["立即同步", "Synchronizuj teraz"],
  ["檢視同步狀態並立即重試", "Zobacz stan synchronizacji i spróbuj ponownie"],
  ["本地改動還在等待上傳到雲端。可立即重試同步。", "Lokalne zmiany czekają na przesłanie. Możesz teraz ponowić synchronizację."],
  ["本地改動未能上傳到雲端。可立即重試同步。", "Nie udało się przesłać lokalnych zmian. Możesz teraz ponowić synchronizację."],
  ["本地改動未能上傳到雲端。內容仍儲存在本機，可立即重試。", "Nie udało się przesłać lokalnych zmian. Pozostają na tym urządzeniu i możesz teraz spróbować ponownie."],
  ["本地改動待上傳。下拉重新整理或點此可立即同步。", "Lokalne zmiany czekają na przesłanie. Przeciągnij w dół lub dotknij, aby zsynchronizować teraz."],
  ["檢視並處理同步衝突", "Przejrzyj i rozwiąż konflikt synchronizacji"],
  ["雲端筆記已在其他標籤頁、裝置，或離線期間被更新，本機草稿無法直接覆蓋。可先複製本機草稿，再採用雲端版本後繼續編輯。", "Notatka w chmurze została zmieniona w innej karcie, na innym urządzeniu lub gdy byłeś offline, więc lokalny szkic nie może jej nadpisać. Skopiuj lokalny szkic, a potem użyj wersji z chmury i kontynuuj edycję."],
  ["雲端筆記已在其他標籤頁、裝置，或離線期間被更新。可先複製本機草稿，再採用雲端版本後繼續編輯。", "Notatka w chmurze została zmieniona w innej karcie, na innym urządzeniu lub gdy byłeś offline. Skopiuj lokalny szkic, a potem użyj wersji z chmury i kontynuuj edycję."],
  ["檢視歷史", "Zobacz historię"],
  ["使用雲端版本", "Użyj wersji z chmury"],
  ["採用雲端並重新載入", "Użyj wersji z chmury i wczytaj ponownie"],
  ["採用雲端版本失敗", "Nie udało się użyć wersji z chmury"],
  ["複製本機草稿", "Kopiuj lokalny szkic"],
  ["本機草稿已複製到剪貼簿。", "Skopiowano lokalny szkic do schowka."],
  ["沒有可複製的本機草稿。", "Brak lokalnego szkicu do skopiowania."],
  ["已複製", "Skopiowano"],
  ["更多", "Więcej"],
  ["載入失敗", "Nie udało się wczytać"],
  ["請稍後重試", "Spróbuj ponownie później"],
  ["重試", "Spróbuj ponownie"],
  ["圖片上傳失敗", "Nie udało się przesłać obrazu"],
  ["請檢查網路連線後重試", "Sprawdź połączenie i spróbuj ponownie"],
  ["新增圖片或附件", "Dodaj obraz lub załącznik"],
  ["選擇拍照、相簿或裝置檔案", "Zrób zdjęcie lub wybierz z galerii albo z plików urządzenia"],
  ["關閉圖片來源選擇", "Zamknij wybór źródła obrazu"],
  ["拍照", "Zrób zdjęcie"],
  ["從相簿選擇", "Wybierz z galerii"],
  ["選擇檔案", "Wybierz plik"],
  ["需要相機權限", "Wymagany dostęp do aparatu"],
  ["允許 EdgeEver 使用相機後，才能直接拍照插入筆記。", "Zezwól EdgeEver na używanie aparatu, aby robić zdjęcia i wstawiać je do notatek."],
  ["相機權限已被關閉。請前往系統設定允許 EdgeEver 使用相機。", "Dostęp do aparatu jest wyłączony. Otwórz ustawienia systemu i zezwól EdgeEver na używanie aparatu."],
  ["前往設定", "Otwórz ustawienia"],
  ["系統未能恢復上次選擇的圖片，請重試", "System nie mógł przywrócić ostatnio wybranego obrazu. Spróbuj ponownie."],
  ["退出新建筆記？", "Zamknąć nową notatkę?"],
  ["內容已自動儲存為本機草稿，下次新建時會繼續恢復。", "Treść zapisano jako lokalny szkic. Zostanie przywrócona przy następnym tworzeniu notatki."],
  ["繼續編輯", "Kontynuuj edycję"],
  ["放棄草稿", "Odrzuć szkic"],
  ["保留並退出", "Zachowaj i zamknij"],
  ["丟棄本地變更？", "Odrzucić lokalne zmiany?"],
  ["此操作會移除這條待同步記錄，不會修改服務端筆記。", "Usuwa to oczekującą lokalną zmianę bez modyfikowania notatki na serwerze."],
  ["丟棄", "Odrzuć"],
  ["正在同步新筆記", "Trwa synchronizacja nowej notatki"],
  ["首次同步完成後即可上傳本地圖片；圖片連結現在就可以直接貼上到正文。", "Lokalne obrazy można przesłać po pierwszej synchronizacji. Linki do obrazów możesz wkleić do treści już teraz."],
  ["保存更改？", "Zapisać zmiany?"],
  ["當前筆記有未儲存修改。", "Ta notatka ma niezapisane zmiany."],
  ["放棄修改", "Odrzuć zmiany"],
  ["無法開啟資源", "Nie można otworzyć zasobu"],
  ["系統沒有可用應用開啟此連結。", "Żadna zainstalowana aplikacja nie może otworzyć tego linku."],
  ["已刪除筆記不能上傳附件，請先恢復筆記", "Do usuniętej notatki nie można przesyłać załączników. Najpierw ją przywróć."],
  ["圖片預覽", "Podgląd obrazu"],
  ["放大", "Powiększ"],
  ["縮小", "Pomniejsz"],
  ["上一張", "Poprzedni obraz"],
  ["下一張", "Następny obraz"],
  ["開啟原檔案", "Otwórz oryginalny plik"],
  ["密碼已更新", "Zaktualizowano hasło"],
  ["下次登入請使用新密碼。", "Przy następnym logowaniu użyj nowego hasła."],
  ["編輯筆記", "Edytuj notatkę"],
  ["所在筆記本", "Notatnik"],
  ["筆記標題", "Tytuł notatki"],
  ["筆記標籤", "Tagi notatki"],
  ["選擇筆記本", "Wybierz notatnik"],
  ["點選已有標籤，或輸入名稱建立新標籤", "Wybierz istniejące tagi lub wpisz nazwę, aby utworzyć nowy"],
  ["按標籤篩選", "Filtruj według tagu"],
  ["選擇一個標籤，只檢視帶有該標籤的筆記", "Wybierz tag, aby zobaczyć tylko notatki z tym tagiem"],
  ["搜尋標籤", "Szukaj tagów"],
  ["沒有匹配的標籤", "Brak pasujących tagów"],
  ["搜尋或輸入新標籤", "Szukaj lub wpisz nowy tag"],
  ["沒有匹配的現有標籤，可直接新建", "Brak pasujących tagów. Możesz utworzyć nowy."],
  ["新建", "Utwórz"],
  ["{{count}} 條筆記", "Notatki: {{count}}"],
  ["刷新 Token", "Odśwież tokeny"],
  ["Token 名稱", "Nazwa tokenu"],
  ["沒有正文預覽", "Brak podglądu treści"],
  ["原生執行時啟動", "Uruchamianie natywnego środowiska"],
  ["啟動至 JS 執行", "Od uruchomienia do wykonania JavaScript"],
  ["啟動至會話/快取就緒", "Od uruchomienia do gotowości sesji/pamięci podręcznej"],
  ["啟動至工作區首幀", "Od uruchomienia do pierwszej klatki obszaru roboczego"],
  ["啟動至列表資料就緒", "Od uruchomienia do gotowości danych listy"],
  ["啟動至互動空閒", "Od uruchomienia do gotowości na interakcję"],
  ["最近一次本地編輯器啟動", "Ostatnie uruchomienie lokalnego edytora"],
  ["正在啟動編輯器", "Uruchamianie edytora"],
  ["編輯器啟動時間過長", "Uruchamianie edytora trwa zbyt długo"],
  ["正在準備本地編輯器，筆記內容是安全的。", "Przygotowywanie lokalnego edytora. Twoja notatka jest bezpieczna."],
  ["本地編輯器未能及時啟動，可以重試或返回，當前草稿不會丟失。", "Lokalny edytor nie uruchomił się na czas. Spróbuj ponownie lub wróć – bieżący szkic nie zostanie utracony."],
  ["暫不可用", "Niedostępne"],
  ["尚未記錄", "Nie zarejestrowano"],
  ["正在搜索", "Wyszukiwanie"],
  ["退出搜索", "Zamknij wyszukiwanie"],
  ["重置", "Resetuj"],
  ["置頂", "Przypięte"],
  ["有標籤", "Z tagami"],
  ["無標籤", "Bez tagów"],
  ["正在同步筆記", "Synchronizowanie notatek"],
  ["正在準備首次同步…", "Przygotowywanie pierwszej synchronizacji…"],
  ["正在載入筆記", "Wczytywanie notatek"],
  ["正在載入筆記本和筆記…", "Wczytywanie notatników i notatek…"],
  ["同步已暫停", "Synchronizacja wstrzymana"],
  ["已載入的筆記仍可使用，請檢查網路後重試。", "Wczytane notatki są nadal dostępne. Sprawdź połączenie i spróbuj ponownie."],
  ["已選擇 {{count}} 條", "Zaznaczono: {{count}}"],
  ["{{count}} 條結果", "Wyniki: {{count}}"],
  ["篩選：{{filter}} · {{count}} 條", "Filtr: {{filter}} · notatki: {{count}}"],
  ["已載入 {{loaded}} / {{total}} 條筆記", "Wczytane notatki: {{loaded}} z {{total}}"],
  ["從模板新建", "Nowa z szablonu"],
  ["模板", "Szablony"],
  ["選擇一個模板快速開始。所有模板都可以在網頁端修改或刪除。", "Wybierz szablon, aby szybko zacząć. Każdy szablon można edytować lub usunąć w wersji webowej."],
  ["模板暫時無法載入，請稍後重試。", "Nie udało się wczytać szablonów. Spróbuj ponownie później."],
  ["暫無模板。可在網頁端新建模板，或將常用筆記另存為模板。", "Brak szablonów. Utwórz szablon w wersji webowej lub zapisz notatkę jako szablon."],
  ["正在載入模板", "Wczytywanie szablonów"],
  ["新建筆記", "Nowa notatka"],
  ["選擇建立方式", "Wybierz sposób tworzenia"],
  ["空白筆記", "Pusta notatka"],
  ["從空白頁開始記錄", "Zacznij od pustej strony"],
  ["使用會議紀要、週報等預設結構", "Użyj gotowych struktur, np. notatek ze spotkań czy podsumowań tygodnia"],
  ["應用模板？", "Zastosować szablon?"],
  ["當前內容將被模板內容替換。", "Bieżąca treść zostanie zastąpiona treścią szablonu."],
  ["替換", "Zastąp"],
  ["關閉", "Zamknij"],
  ["修改後會保留當前裝置登入，並退出其他裝置上的登入會話。", "To urządzenie pozostanie zalogowane, a pozostałe sesje zostaną wylogowane."],
  ["新增標籤", "Dodaj tagi"],
  ["正在生成智慧標籤", "Generowanie inteligentnych tagów"],
  ["智慧標籤生成失敗", "Nie udało się wygenerować inteligentnych tagów"],
  ["智慧標籤已新增", "Dodano inteligentne tagi"],
  ["沒有找到適合這篇筆記的新標籤。", "Brak nowych tagów pasujących do tej notatki."],
  ["沒有匹配的筆記本", "Brak pasujących notatników"],
  ["偏好設定", "Preferencje"],
  ["切換產品介面的顯示語言。", "Wybierz język interfejsu aplikacji."],
  ["上傳大圖時在本地壓縮，節省資源佔用。", "Kompresuj duże obrazy na tym urządzeniu przed przesłaniem."],
  ["已恢復上次未完成的本機草稿", "Przywrócono niedokończony lokalny szkic"],
  ["連線你的自託管筆記空間", "Połącz się ze swoimi samodzielnie hostowanymi notatkami"],
  ["首次登入密碼", "Hasło do pierwszego logowania"],
  ["GitHub 倉庫", "Repozytorium GitHub"],
  ["操作失敗，請稍後再試", "Coś poszło nie tak. Spróbuj ponownie."],
  ["正在剪藏文章", "Zapisywanie artykułu"],
  ["正在提取標題、正文和圖片連結…", "Wyodrębnianie tytułu, treści i linków do obrazów…"],
  ["正文剪藏失敗", "Nie udało się wyodrębnić treści artykułu"],
  ["已保留文章連結，你可以稍後重新分享重試。", "Link do artykułu został zachowany. Udostępnij go ponownie później, aby spróbować jeszcze raz."],
  ["頁面載入完成，但沒有找到可剪藏的正文。", "Strona się wczytała, ale nie znaleziono treści artykułu do zapisania."],
  ["微信文章載入超時。", "Wczytywanie artykułu WeChat trwało zbyt długo."],
  ["沒有找到可剪藏的正文。", "Nie znaleziono treści artykułu do zapisania."],
  ["無法解析微信文章正文。", "Nie udało się odczytać treści artykułu WeChat."],
  ["微信文章載入失敗。", "Nie udało się wczytać artykułu WeChat."],
  ["微信文章請求失敗（HTTP {{status}}）。", "Żądanie artykułu WeChat nie powiodło się (HTTP {{status}})."],
  ["無法讀取分享圖片", "Nie udało się odczytać udostępnionego obrazu"],
  ["請重新分享後再試。", "Udostępnij ponownie i spróbuj jeszcze raz."],
  ["無法儲存圖片", "Nie można zapisać obrazów"],
  ["請先在 EdgeEver 中建立一個筆記本。", "Najpierw utwórz notatnik w EdgeEver."],
  ["分享的圖片", "Udostępniony obraz"],
  ["分享的圖片（{{count}} 張）", "Udostępnione obrazy ({{count}})"],
  ["無法讀取分享內容", "Nie udało się odczytać udostępnionej treści"],
  ["分享內容裡沒有可識別的網頁連結或圖片。", "Udostępniona treść nie zawiera rozpoznawalnego linku ani obrazu."],
  ["無法儲存剪藏", "Nie można zapisać wycinka"],
  ["剪藏失敗", "Nie udało się zapisać strony"],
  ["無法讀取分享的網頁，請稍後重試。", "Nie udało się odczytać udostępnionej strony. Spróbuj ponownie później."],
]);

const flattenStrings = (value: unknown, prefix = "", output = new Map<string, string>()) => {
  if (typeof value === "string") {
    output.set(prefix, value);
    return output;
  }
  if (!value || typeof value !== "object") {
    return output;
  }
  for (const [key, child] of Object.entries(value)) {
    flattenStrings(child, prefix ? `${prefix}.${key}` : key, output);
  }
  return output;
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const createTranslationPair = (source: string, target: string): TranslationPair => {
  const placeholders: string[] = [];
  const patternSource = escapeRegExp(source).replace(/\\\{\\\{(\w+)\\\}\\\}/g, (_match, placeholder: string) => {
    placeholders.push(placeholder);
    return "(.+?)";
  });
  return {
    source,
    target,
    pattern: placeholders.length > 0 ? new RegExp(`^${patternSource}$`) : undefined,
    placeholders,
  };
};
const zhStrings = flattenStrings(zhTW);
const enStrings = flattenStrings(enUS);
const jaStrings = flattenStrings(ja);
const plStrings = flattenStrings(pl);

const buildTranslationPairs = (targets: Map<string, string>) =>
  Array.from(zhStrings.entries()).flatMap(([key, source]) => {
    const target = targets.get(key);
    if (!target || source === target) {
      return [];
    }
    return [createTranslationPair(source, target)];
  });

const enTranslationPairs = buildTranslationPairs(enStrings);
const jaTranslationPairs = buildTranslationPairs(jaStrings);
const plTranslationPairs = buildTranslationPairs(plStrings);
const exactEnglishTranslations = new Map(
  enTranslationPairs.filter((pair) => !pair.pattern).map((pair) => [pair.source, pair.target]),
);
const exactJapaneseTranslations = new Map(
  jaTranslationPairs.filter((pair) => !pair.pattern).map((pair) => [pair.source, pair.target]),
);
const exactPolishTranslations = new Map(
  plTranslationPairs.filter((pair) => !pair.pattern).map((pair) => [pair.source, pair.target]),
);
const mobileTemplateTranslations: TranslationPair[] = Array.from(mobileOnlyTranslations.entries())
  .filter(([source]) => source.includes("{{"))
  .map(([source, target]) => createTranslationPair(source, target));
const mobileJapaneseTemplateTranslations: TranslationPair[] = Array.from(mobileOnlyJapanese.entries())
  .filter(([source]) => source.includes("{{"))
  .map(([source, target]) => createTranslationPair(source, target));
const mobilePolishTemplateTranslations: TranslationPair[] = Array.from(mobileOnlyPolish.entries())
  .filter(([source]) => source.includes("{{"))
  .map(([source, target]) => createTranslationPair(source, target));
const englishTemplateTranslations = [
  ...mobileTemplateTranslations,
  ...enTranslationPairs.filter((pair) => pair.pattern),
].sort((left, right) => right.source.length - left.source.length);
const japaneseTemplateTranslations = [
  ...mobileJapaneseTemplateTranslations,
  ...jaTranslationPairs.filter((pair) => pair.pattern),
].sort((left, right) => right.source.length - left.source.length);
const polishTemplateTranslations = [
  ...mobilePolishTemplateTranslations,
  ...plTranslationPairs.filter((pair) => pair.pattern),
].sort((left, right) => right.source.length - left.source.length);

const resolveSystemLocale = (): SupportedMobileLocale =>
  resolveSupportedLocale(Intl.DateTimeFormat().resolvedOptions().locale);

const applyTemplateTranslations = (value: string, pairs: TranslationPair[]) => {
  for (const pair of pairs) {
    const match = pair.pattern?.exec(value);
    if (!match) {
      continue;
    }
    return (pair.placeholders ?? []).reduce(
      (translated, placeholder, index) => translated.replace(`{{${placeholder}}}`, match[index + 1] ?? ""),
      pair.target,
    );
  }
  return null;
};

export const translateMobileText = (value: string, locale: SupportedMobileLocale) => {
  if (locale === "zh-TW" || !/[\u3400-\u9fff]/.test(value)) {
    return value;
  }
  if (locale === "ja") {
    const exact = mobileOnlyJapanese.get(value) ?? exactJapaneseTranslations.get(value);
    if (exact) return exact;
    return applyTemplateTranslations(value, japaneseTemplateTranslations) ?? value;
  }
  if (locale === "pl") {
    const exact = mobileOnlyPolish.get(value) ?? exactPolishTranslations.get(value);
    if (exact) return exact;
    return applyTemplateTranslations(value, polishTemplateTranslations) ?? value;
  }
  const exact = mobileOnlyTranslations.get(value) ?? exactEnglishTranslations.get(value);
  if (exact) {
    return exact;
  }
  return applyTemplateTranslations(value, englishTemplateTranslations) ?? value;
};

let currentResolvedMobileLocale: SupportedMobileLocale = resolveSystemLocale();
export const translateCurrentMobileText = (value: string) => translateMobileText(value, currentResolvedMobileLocale);

/** Maps a known English server sync error to its zh-TW source text so the localized components translate it. */
export const toMobileSyncErrorSourceText = (message: string | null) => {
  const key = message ? getMemoSaveErrorReasonKey(null, message) : null;
  return (key && zhStrings.get(key)) || message;
};

export const localizeUntitledMemoTitle = (
  title: string | null | undefined,
  locale: SupportedMobileLocale,
) => {
  const trimmed = title?.trim() ?? "";
  if (trimmed && trimmed !== DEFAULT_MEMO_TITLE) {
    return trimmed;
  }
  return translateMobileText(DEFAULT_MEMO_TITLE, locale);
};

export const localizeMissingNotebookName = (locale: SupportedMobileLocale) => {
  if (locale === "en-US") return "Uncategorized";
  if (locale === "ja") return "未分類";
  if (locale === "pl") return "Nieprzypisane";
  return "未分類";
};

const MobileLocaleContext = createContext<MobileLocaleContextValue>({
  preference: "system",
  resolvedLocale: resolveSystemLocale(),
  setPreference: () => undefined,
  translate: (value) => value,
});

export const MobileLocaleProvider = ({ children }: { children: ReactNode }) => {
  const [preference, setPreferenceState] = useState<MobileLocalePreference>("system");

  useEffect(() => {
    let active = true;
    void readMobileLocalePreference().then((storedPreference) => {
      if (active) {
        setPreferenceState(storedPreference);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const resolvedLocale = preference === "system" ? resolveSystemLocale() : preference;
  currentResolvedMobileLocale = resolvedLocale;
  const value = useMemo<MobileLocaleContextValue>(
    () => ({
      preference,
      resolvedLocale,
      setPreference: (nextPreference) => {
        setPreferenceState(nextPreference);
        void writeMobileLocalePreference(nextPreference);
      },
      translate: (text) => translateMobileText(text, resolvedLocale),
    }),
    [preference, resolvedLocale]
  );

  return <MobileLocaleContext.Provider value={value}>{children}</MobileLocaleContext.Provider>;
};

export const useMobileLocale = () => useContext(MobileLocaleContext);
