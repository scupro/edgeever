# EdgeEver 場景與實操指南

整理 EdgeEver 在日常工作、學習和知識管理中的核心場景與操作工作流。

## 目錄

### 核心工作區與沉浸創作
- [1. 經典三欄工作區與沉浸排版寫作](#1-經典三欄工作區與沉浸排版寫作)

### 全渠道內容採集與剪藏
- [2. 微信聊天記錄歸檔與整理](#2-微信聊天記錄歸檔與整理)
- [3. 手機端剪藏微信公眾號文章](#3-手機端剪藏微信公眾號文章)
- [4. 移動端圖片分享轉存筆記](#4-移動端圖片分享轉存筆記)
- [5. 小紅書圖文筆記剪藏](#5-小紅書圖文筆記剪藏)
- [6. X (Twitter) 推文與引用剪藏](#6-x-twitter-推文與引用剪藏)
- [7. 知乎回答與文章剪藏](#7-知乎回答與文章剪藏)
- [8. Reddit 討論帖剪藏](#8-reddit-討論帖剪藏)
- [9. GitHub 倉庫後設資料剪藏](#9-github-倉庫後設資料剪藏)

### AI 增強與多維資料組織
- [10. AI 對話生成思維導圖、流程圖與架構圖](#10-ai-對話生成思維導圖流程圖與架構圖)
- [11. AI 生成結構化資訊圖（時間線、對比矩陣、象限圖等）](#11-ai-生成結構化資訊圖時間線對比矩陣象限圖等)
- [12. AI 對話構建多維表格](#12-ai-對話構建多維表格)
- [13. 多維表格生成公開收集表單](#13-多維表格生成公開收集表單)
- [14. 連線本機 Agent (ACP) 實現筆記協同](#14-連線本機-agent-acp-實現筆記協同)

### 排版與多渠道分發
- [15. 筆記匯出多主題長圖與程式碼卡片](#15-筆記匯出多主題長圖與程式碼卡片)
- [16. 筆記製作社交媒體海報與封面](#16-筆記製作社交媒體海報與封面)
- [17. 複製筆記至微信公眾號排版](#17-複製筆記至微信公眾號排版)

### 開放生態與外掛擴充套件
- [18. 開放外掛 API 與自定義外掛開發](#18-開放外掛-api-與自定義外掛開發)

---

## 核心工作區與沉浸創作

### 1. 經典三欄工作區與沉浸排版寫作

EdgeEver 採用「目錄樹 · 筆記列表 · 編輯區」三欄佈局：

- **專注模式**：側邊欄支援拖拽調寬與摺疊，隨時切換全屏專注寫作。
- **混合編輯**：主編輯區支援所見即所得（WYSIWYG）與 Markdown 語法混寫。

| 三欄工作區佈局 |
:---:
| ![EdgeEver 經典三欄工作區與沉浸排版編輯效果](assets/best-practices/original-image/class-three-pane/image.png) |

---

## 全渠道內容採集與剪藏

### 2. 微信聊天記錄歸檔與整理

在微信中多選對話點選「合併轉發」，在「轉發到其他應用」中選擇 **EdgeEver**，自動轉換為結構化筆記。

- **格式解析**：解析發言人、時間軸、微信表情與超連結。
- **資源轉存**：圖片內嵌展示，檔案與音影片（如 `.xlsx`、`.pdf`、`.mp4`）轉為附件並支援全文檢索。

| 1. 微信合併轉發至 EdgeEver | 2. 結構化筆記預覽 |
| :---: | :---: |
| ![微信轉發到其他應用選擇 EdgeEver](assets/best-practices/original-image/wechat-chat-message-import/select-export.png) | ![EdgeEver 匯入後的微信聊天記錄筆記效果](assets/best-practices/original-image/wechat-chat-message-import/import-as-note.png) |

---

### 3. 手機端剪藏微信公眾號文章

在微信中閱讀文章時，點選右上角選單選擇「用 EdgeEver 開啟」即可完成剪藏。

- 提取標題、正文結構與配圖，轉換為清晰的 Markdown 筆記。

| 1. 選擇「用 EdgeEver 開啟」 | 2. 內容提取中 | 3. 剪藏生成的 Markdown 筆記 |
| :---: | :---: | :---: |
| ![微信文章分享選單選擇用EdgeEver開啟](assets/best-practices/original-image/app-share/wechat-article/share-enter.jpg) | ![EdgeEver正在剪藏文章提取中](assets/best-practices/original-image/app-share/wechat-article/sharing.jpg) | ![生成排版工整的微信文章筆記](assets/best-practices/original-image/app-share/wechat-article/in-note.jpg) |

---

### 4. 移動端圖片分享轉存筆記

在任意手機應用中透過系統分享面板選擇 **EdgeEver**，後臺自動上傳原圖並建立以「分享的圖片」為標題的筆記。

| 1. 分享圖片 | 2. 選擇 EdgeEver | 3. 生成圖片筆記 |
| :---: | :---: | :---: |
| ![社媒App點選圖片分享](assets/best-practices/original-image/app-share/socia-image/share-enter.jpg) | ![系統分享面板選擇EdgeEver](assets/best-practices/original-image/app-share/socia-image/sharing.jpg) | ![自動生成筆記並上傳圖片](assets/best-practices/original-image/app-share/socia-image/share-in-note.jpg) |

---

### 5. 小紅書圖文筆記剪藏

使用 EdgeEver Web Clipper 外掛在小紅書筆記頁面右鍵點選「儲存筆記到 EdgeEver」。

- 提取標題、話題標籤、正文、釋出時間與原文連結。
- 多圖內容自動排版為多欄畫廊。

| 1. 右鍵選單剪藏 | 2. 多欄畫廊筆記效果 |
| :---: | :---: |
| ![右鍵儲存小紅書筆記到 EdgeEver](assets/best-practices/original-image/web-clipper/xiaohongshu/xiaohongshu.png) | ![EdgeEver 剪藏後的小紅書筆記多欄畫廊效果](assets/best-practices/original-image/web-clipper/xiaohongshu/xiaohongshu-in-note.png) |

---

### 6. X (Twitter) 推文與引用剪藏

使用 EdgeEver Web Clipper 外掛在推文上右鍵點選「儲存推文到 EdgeEver」。

- 提取作者、推文正文、外鏈、引用推文（Quote Tweet）及附帶圖集。
- 自動渲染為多欄畫廊排版。

| 1. 右鍵儲存推文 | 2. 包含引用與圖集的筆記效果 |
| :---: | :---: |
| ![右鍵儲存推文到 EdgeEver](assets/best-practices/original-image/web-clipper/twitter/twitter.png) | ![EdgeEver 剪藏後的 X 推文筆記效果](assets/best-practices/original-image/web-clipper/twitter/twitter-in-note.png) |

---

### 7. 知乎回答與文章剪藏

在知乎目標回答或文章處右鍵點選「儲存回答/文章到 EdgeEver」。

- 解析問題標題、作者、正文、釋出時間與原始連結，生成問答結構筆記。

| 1. 右鍵儲存回答/文章 | 2. 問答結構筆記預覽 |
| :---: | :---: |
| ![右鍵儲存知乎回答到 EdgeEver](assets/best-practices/original-image/web-clipper/zhihu/zhihu.png) | ![EdgeEver 剪藏後的知乎回答筆記效果](assets/best-practices/original-image/web-clipper/zhihu/zhihu-in-note.png) |

---

### 8. Reddit 討論帖剪藏

在 Reddit 帖子處右鍵點選「儲存所選內容到 EdgeEver」。

- 捕獲帖子標題、所屬版塊（Subreddit，如 `r/AskReddit`）、作者、時間戳及連結，保留社群後設資料。

| 1. 右鍵儲存帖子 | 2. 包含社群後設資料的筆記預覽 |
| :---: | :---: |
| ![右鍵儲存 Reddit 帖子到 EdgeEver](assets/best-practices/reddit-clip-menu.png) | ![EdgeEver 剪藏後的 Reddit 帖子筆記效果](assets/best-practices/reddit-clipped-note.png) |

---

### 9. GitHub 倉庫後設資料剪藏

在 GitHub 倉庫頁面右鍵點選「儲存倉庫資訊到 EdgeEver」。

- 提取倉庫名稱（Owner/Repo）、簡介、官方主頁、程式語言、許可證與話題標籤，生成技術卡片。

| 1. 右鍵儲存倉庫資訊 | 2. 結構化倉庫卡片預覽 |
| :---: | :---: |
| ![右鍵儲存 GitHub 倉庫資訊到 EdgeEver](assets/best-practices/github-clip-menu.png) | ![EdgeEver 剪藏後的 GitHub 倉庫卡片筆記](assets/best-practices/github-clipped-note.png) |

---

## AI 增強與多維資料組織

### 10. AI 對話生成思維導圖、流程圖與架構圖

在 AI 伴隨助手（或連線的本機 Agent）中輸入自然語言指令（如“幫我生成一個關於大語言模型的思維導圖 / 流程圖 / 架構圖”），在筆記內直接生成可互動圖表。

- 支援節點拖拽編輯、自動佈局、條件分支與系統拓撲展示。

| 1. 互動式思維導圖 | 2. 標準流程圖 | 3. 系統架構圖 |
| :---: | :---: | :---: |
| ![AI對話生成可編輯思維導圖](assets/best-practices/ai-diagram-mindmap.png) | ![AI對話生成可編輯流程圖](assets/best-practices/ai-diagram-flowchart.png) | ![AI對話生成可編輯系統架構圖](assets/best-practices/ai-diagram-architecture.png) |

---

### 11. AI 生成結構化資訊圖（時間線、對比矩陣、象限圖等）

利用內建模板庫，在 AI 助手對話中描述要呈現的主題與重點，快速生成結構化視覺筆記。

- 涵蓋時間線、對比矩陣、四象限、層級圖等模板。
- 支援對話微調內容，或直接匯出為向量圖。

| 1. 資訊圖模板庫 | 2. 時間線資訊圖生成效果 |
| :---: | :---: |
| ![EdgeEver資訊圖示例與模板庫](assets/best-practices/ai-infographic-templates.png) | ![AI生成位元組跳動發展歷程時間線資訊圖](assets/best-practices/ai-infographic-generated.png) |

---

### 12. AI 對話構建多維表格

在 AI 助手中傳送自然語言指令（如“生成自媒體選題庫”或“生成員工資訊登記表”），自動搭建多維資料表。

- 自動配置單選標籤、文字、日期、連結等欄位型別。
- 自動填充初始示例資料，支援檢視切換、篩選排序與 CSV 匯出。

| 1. 選題庫多維表格 | 2. 員工資訊多維表格 |
| :---: | :---: |
| ![AI生成自媒體選題庫多維表格](assets/best-practices/original-image/database-note/database-hot-select.png) | ![AI生成員工資訊登記多維表格](assets/best-practices/original-image/database-note/database-employee-register.png) |

---

### 13. 多維表格生成公開收集表單

在多維表格頂部點選「表單收集」，將當前資料錶轉為公開線上表單。

- 填寫者無需登入即可透過瀏覽器提交。
- 提交的資料實時同步寫入對應多維表格。

| 1. 開啟「表單收集」 | 2. 線上表單填報頁面 |
| :---: | :---: |
| ![多維表格頂部點選表單收集按鈕](assets/best-practices/original-image/database-note/database-form-create.png) | ![對外公開的線上表單填報介面](assets/best-practices/original-image/database-note/database-form-online.png) |

---

### 14. 連線本機 Agent (ACP) 實現筆記協同

EdgeEver 支援 **ACP (Agent Client Protocol)** 協議，允許桌面端連線本機執行的各類 AI Agent（如 Codex、Claude Code、DeepSeek Harness、Antigravity 等）。

- **本機授權**：授予本機 Agent 當前帳號筆記的安全讀寫權限。
- **伴隨對話**：在筆記右側欄直接協同，執行程式碼推理、長文總結與知識庫檢索。

| 1. 設定中心連線本機 Agent (ACP) | 2. 筆記側邊欄協同互動 |
| :---: | :---: |
| ![設定中心連線本機 Agent (ACP) 列表](assets/best-practices/original-image/acp/acp-support-list.png) | ![右側 AI 伴隨助手與本機 Agent 協同問答](assets/best-practices/original-image/acp/acp-support-list-dialog.png) |

---

## 排版與多渠道分發

### 15. 筆記匯出多主題長圖與程式碼卡片

使用「分享為圖片」功能，將筆記排版為高解析度長圖或卡片。

- **多款卡片樣式**：內建 8 款卡片主題（透明質感、金句、書摘、備忘錄等），支援字型與版式微調，一鍵匯出高畫質長圖或複製至剪貼簿。
- **技術程式碼卡片**：專屬程式碼主題內建 macOS 視窗控制元件、行號與等寬程式碼排版。

| 1. 「透明」等多款卡片主題預覽 | 2. 字型風格與排版微調 |
| :---: | :---: |
| ![EdgeEver 分享為圖片透明主題卡片預覽](assets/best-practices/original-image/note-export-image/clear-theme.png) | ![EdgeEver 分享為圖片字型與主題排版調整](assets/best-practices/original-image/note-export-image/code-theme.png) |

---

### 16. 筆記製作社交媒體海報與封面

在筆記操作選單中選擇「製作海報」（或透過「新建 → 海報」），將筆記標題與要點匯入海報設計工作臺。

- 提供 40+ 款設計模板，支援小紅書 3:4、朋友圈 1:1 及橫版等畫幅。
- 畫布中可自由調整排版、配色與裝飾元素，支援匯出高解析度圖片。

| 海報設計工作臺與模板庫 |
:---:
| ![EdgeEver 海報設計工作臺與豐富設計模板](assets/best-practices/original-image/poster/ai-generate-poster.png) |

---

### 17. 複製筆記至微信公眾號排版

在筆記選單中選擇「複製到公眾號 / 部落格」，將筆記轉換為內聯 CSS 樣式的富文字。

- 貼上至微信公眾號後臺，完整保留表格、引用塊、程式碼塊、列表及字型樣式。

| 1. 複製到公眾號 / 部落格 | 2. 公眾號後臺編輯器貼上效果 |
| :---: | :---: |
| ![EdgeEver 筆記選單點選複製到公眾號](assets/best-practices/original-image/wechat-article-copy-to/right-menu.png) | ![微信公眾號後臺貼上後的排版效果](assets/best-practices/original-image/wechat-article-copy-to/show-in-wechat-editor.png) |

---

## 開放生態與外掛擴充套件

### 18. 開放外掛 API 與自定義外掛開發

EdgeEver 內建外掛擴充套件管理，支援透過 GitHub 倉庫或 Manifest 地址一鍵安裝，配置在 Web 與桌面端跨裝置隔離同步。

- **核心 API 能力**：提供檔案雙向讀寫、自定義 DOM 面板/嵌入塊、統一設定、隔離儲存以及呼叫工作區已配置的 AI 模型。
- **官方開源參考正規化**：
  - **待辦任務 ([EdgeEver Tasks](https://github.com/scupro/edgeever-tasks))**：跨筆記自動彙總 Markdown 待辦，支援狀態過濾與一鍵定位跳轉。
  - **AI RSS 訂閱助手 ([EdgeEver AI RSS](https://github.com/scupro/edgeever-ai-rss))**：抓取訂閱源並結合 AI 生成分類每日簡報。
- 更多規範與指南詳見 [EdgeEver 外掛開發指南](plugin-development.zh-TW.md)。

| 1. 外掛與主題管理中心 | 2. 官方 AI RSS 外掛生成的日報筆記效果 |
| :---: | :---: |
| ![EdgeEver 外掛市場與官方外掛管理](assets/best-practices/original-image/plugin/official-in.png) | ![EdgeEver AI RSS 外掛自動生成的結構化日報筆記](assets/best-practices/original-image/plugin/ai-daily.png) |
