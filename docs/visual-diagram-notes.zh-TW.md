# 視覺化圖表筆記設計說明

EdgeEver 有兩條圖形筆記路徑：思維導圖、流程圖和架構圖使用 `DiagramDocument`；資訊圖使用 AntV Infographic 語法。兩者獨立儲存，不自動互轉。

## 圖形筆記

`DiagramDocument` 是可編輯圖形的事實來源，儲存節點、連線、必要佈局和語義，而非 X6 檢視狀態。`kind` 區分 `mind-map`、`flowchart`、`architecture`；`schemaVersion` 管理格式演進。架構圖的系統邊界和連線型別、思維導圖的層級關係也儲存在文件中。

Web 和桌面端用 AntV X6 編輯；Android 和公開分享用同一份 IR 只讀繪製。持久化 Markdown 的 `edgeever-diagram-v1` 註釋儲存 Base64URL 編碼的 IR，正文中的 Mermaid 圖表用於外部閱讀及 IR 解析失敗時降級，不是編輯畫布。普通筆記內的 Mermaid 程式碼塊屬於獨立功能。

Web 和桌面端的思維導圖可在畫布與 Markdown 大綱間切換。根主題使用 `#` 標題，分支使用巢狀的 `-` 列表，每級縮排兩個空格。Enter 續寫列表，Tab / Shift+Tab 調整層級，也相容貼上已有的純縮排大綱。空列表項不會成為導圖節點，非空子項會接到最近的非空上級；兩種檢視編輯同一份 `DiagramDocument`，不會把 Mermaid 正文當成可編輯原始檔。大綱需要一個非空根主題；無效層級不會寫回導圖，一次刪除大量主題須確認。已有節點和連線在往返切換時保留身份及後設資料，層級變化會重新排版。

解析與校驗見 [`diagram.ts`](../packages/shared/src/diagram.ts)，語義圖編譯及佈局見 [`diagram-layout.ts`](../packages/shared/src/diagram-layout.ts)，跨端只讀繪製見 [`diagram-view.ts`](../packages/shared/src/diagram-view.ts)。原生 App 在能安全讀寫同一 IR 前保持只讀。

## 資訊圖

資訊圖是獨立筆記型別，以 AntV Infographic 的宣告式語法為原始檔；模板、主題和資料直接寫在該語法中。`InfographicDocument` 用 `edgeever-infographic-v1` 註釋儲存它，EdgeEver 不再複製一套同義的通用 IR。兩種筆記由各自的解析器處理。

若將來要用 Infographic 展示圖形筆記，需要顯式的 `DiagramDocument → Infographic` 轉換，並說明無法保留的佈局或互動資訊；在驗證雙向對映前，不遷移既有筆記。

## AI 與 MCP

圖形筆記的 AI / MCP 輸入是不含座標的語義圖，由服務端校驗並生成佈局。`create_diagram_memo` 建立圖形筆記，`get_diagram` 讀取語義圖，`update_diagram` 用增量操作修改，並透過 `expectedRevision` 防止覆蓋；預設 `reflow=preserve`，只有明確要求整圖重排時才用 `reflow=all`。通用 `update_memo` 不直接覆蓋圖形筆記內容。

資訊圖的 AI 選擇 AntV 模板並生成對應資料，人工可在畫布上微調文字。兩條路徑都保留各自的事實來源，不把渲染結果當作持久化文件。
