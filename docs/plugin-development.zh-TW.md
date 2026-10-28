# EdgeEver 外掛開發指南

[English](plugin-development.md)

EdgeEver 提供客戶端外掛與無程式碼主題擴充套件能力。使用者可從官方市場、公開 GitHub 倉庫或 Manifest 地址安裝擴充套件。已安裝擴充套件隨當前工作區在 Web 與桌面端之間同步，在應用開啟期間執行；Android 原生端暫不執行外掛。

> [!NOTE]
> **安全模型**：客戶端外掛採用受信任程式碼模型（類似 Obsidian）。啟用外掛即代表信任其在客戶端 JavaScript 環境中執行並呼叫外掛 API。清單中的能力宣告（Permissions）用於向使用者披露外掛涉及的功能範圍，不構成強制安全沙箱。主題包為純宣告式 JSON，不執行任何 JavaScript。 `networkHosts` 同樣只是用途宣告，不限制外掛程式碼的網路訪問。桌面外掛還可以透過客戶端橋訪問登入憑據、本機資料及 Agent 能力。

---

## 目錄

- [外掛清單（Manifest）](#外掛清單manifest)
  - [欄位說明](#欄位說明)
  - [可用權限標識](#可用權限標識)
- [外掛入口與生命週期](#外掛入口與生命週期)
- [API 參考](#api-參考)
  - [API 名稱空間速查](#api-名稱空間速查)
  - [1. 筆記與筆記本（Notes & Notebooks）](#1-筆記與筆記本notes--notebooks)
  - [2. 模板管理（Templates）](#2-模板管理templates)
  - [3. 資源附件（Resources）](#3-資源附件resources)
  - [4. 編輯器互動（Editor & Embeds）](#4-編輯器互動editor--embeds)
  - [5. 全域性命令（Commands）](#5-全域性命令commands)
  - [6. 宿主介面與通知（UI & Notices）](#6-宿主介面與通知ui--notices)
  - [7. 自定義面板（Panels）](#7-自定義面板panels)
  - [8. 統一設定（Settings）](#8-統一設定settings)
  - [9. 資料儲存與安全憑據（Storage & Secrets）](#9-資料儲存與安全憑據storage--secrets)
  - [10. 網路請求（Network）](#10-網路請求network)
  - [11. 定時任務（Schedules，僅桌面端）](#11-定時任務schedules僅桌面端)
  - [12. 事件監聽（Events）](#12-事件監聽events)
  - [13. 人工智慧（AI）](#13-人工智慧ai)
- [主題擴充套件（Theme Manifest）](#主題擴充套件theme-manifest)
- [打包、分發與本機開發](#打包分發與本機開發)
  - [打包規範](#打包規範)
  - [GitHub 分發](#github-分發)
  - [本機測試與除錯](#本機測試與除錯)

---

## 外掛清單（Manifest）

每個外掛必須在根目錄提供 `manifest.json`：

```json
{
  "type": "plugin",
  "id": "com.example.recent-notes",
  "name": "Recent Notes",
  "version": "1.0.0",
  "apiVersion": "2",
  "settingsUi": "host",
  "description": "檢視最近更新的筆記。",
  "locales": {
    "zh-TW": {
      "name": "最近筆記",
      "description": "檢視最近更新的筆記。"
    }
  },
  "entry": "./main.js",
  "platforms": ["web", "desktop"],
  "permissions": ["notes:read", "editor:read", "ui:commands", "ui:notices", "ui:panels"]
}
```

### 欄位說明

| 欄位 | 型別 | 必填 | 說明 |
| :--- | :--- | :---: | :--- |
| `type` | `"plugin"` | 是 | 固定為 `"plugin"`。 |
| `id` | `string` | 是 | 外掛全域性唯一標識，推薦反向域名格式（如 `com.example.plugin`）。 |
| `name` | `string` | 是 | 外掛預設名稱。 |
| `version` | `string` | 是 | 符合 SemVer 的版本號（如 `1.0.0`）。 |
| `apiVersion` | `"2"` | 是 | 外掛 API 版本，當前固定為 `"2"`。 |
| `settingsUi` | `"host"` | 是 | 設定介面渲染方式，當前固定為 `"host"`（由宿主統一渲染）。 |
| `entry` | `string` | 是 | 入口指令碼路徑，GitHub 分發時固定為 `./main.js`。 |
| `description` | `string` | 否 | 外掛預設描述。 |
| `locales` | `object` | 否 | 多語言本地化後設資料，以 BCP 47 語言標籤為鍵（如 `zh-TW`, `en-US`），覆蓋 `name` 與 `description`。 |
| `platforms` | `string[]` | 否 | 支援的平臺，可選 `"web"`、`"desktop"`。 |
| `permissions` | `string[]` | 否 | 能力宣告列表，用於安裝與更新時向使用者披露。 |
| `settings` | `object` | 否 | 宿主渲染的配置項 Schema（詳見下文）。 |

### 可用權限標識

宣告權限用於在安裝和更新介面向使用者透明披露功能：
- **筆記與內容**：`notes:read`, `notes:write`, `notes:delete`, `templates:read`, `templates:write`, `metadata:read`, `metadata:write`, `resources:read`, `resources:write`
- **編輯器**：`editor:read`, `editor:write`
- **介面互動**：`ui:commands`, `ui:navigation`, `ui:notices`, `ui:panels`, `ui:embeds`
- **儲存與系統**：`storage`, `secrets`, `network`, `network:public`, `schedules`
- **AI 能力**：`ai:generate`

---

## 外掛入口與生命週期

外掛入口檔案（`main.js`）需匯出一個包含 `activate` 生命週期的預設物件：

```js
export default {
  activate(context) {
    // 註冊命令
    const disposeCommand = context.commands.register({
      id: "hello-world",
      title: "Say Hello",
      run() {
        context.ui.showNotice("Hello from EdgeEver Plugin!");
      }
    });

    // 返回清理函式（外掛停用時執行）
    return () => {
      disposeCommand();
    };
  }
};
```

TypeScript 專案可使用 `@edgeever/plugin-api` 提供的輔助工具：

```ts
import { definePlugin } from "@edgeever/plugin-api";

export default definePlugin({
  activate(context) {
    return context.commands.register({
      id: "hello-world",
      title: "Say Hello",
      run: () => context.ui.showNotice("Hello!")
    });
  }
});
```

> [!TIP]
> 註冊命令、面板、事件等介面均會返回清理函式；外掛停用時，宿主也會自動回收其註冊的命令與監聽器。

---

## API 參考

### API 名稱空間速查

外掛上下文物件（`context`）提供以下能力介面：

| 名稱空間 | 對應權限（披露用） | 核心方法 | 職責說明 |
| :--- | :--- | :--- | :--- |
| **`context.notes`** | `notes:read`<br>`notes:write`<br>`notes:delete` | `query()`, `queryContent()`, `get()`, `create()`, `update()`, `editMarkdown()`, `delete()`, `move()`, `pin()`, `restore()`, `revisions` | 筆記查詢、正文讀取、樂觀併發編輯與版本管理 |
| **`context.diagrams`** | `notes:read`<br>`notes:write` | `get()`, `edit()` | 讀取圖表語義結構與佈局，批次編輯節點和連線 |
| **`context.tables`** | `notes:read`<br>`notes:write` | `get()`, `edit()` | 讀取完整表格，批次編輯欄位、記錄和單元格 |
| **`context.posters`** | `notes:read`<br>`notes:write` | `capabilities()`, `get()`, `edit()` | 海報元素、圖層、分組、樣式與畫布編輯 |
| **`context.infographics`** | `notes:read`<br>`notes:write` | `capabilities()`, `get()`, `edit()` | 資訊圖巢狀資料項、模板與主題編輯 |
| **`context.notebooks`** | `metadata:read`<br>`metadata:write` | `list()`, `create()`, `update()`, `delete()` | 筆記本樹狀層級維護與增刪改查 |
| **`context.tags`** | `metadata:read`<br>`metadata:write` | `list()`, `rename()`, `delete()` | 標籤全域性查詢、重新命名與刪除 |
| **`context.templates`** | `templates:read`<br>`templates:write` | `list()`, `create()`, `update()`, `delete()`, `use()` | 模板增刪改查及一鍵套用建立筆記 |
| **`context.resources`** | `resources:read`<br>`resources:write` | `list()`, `read()`, `upload()`, `update()`, `rename()`, `delete()` | 筆記圖片及檔案附件上傳、下載、修改與管理 |
| **`context.editor`** | `editor:read`<br>`editor:write`<br>`ui:embeds` | `getSelection()`, `replaceSelection()`, `insertAtCursor()`, `getDocument()`, `editMarkdown()`, `insertEmbed()`, `embeds.register()` | 活動編輯器互動、實時檔案修改與自定義塊級 Embed |
| **`context.ui`** | `ui:navigation`<br>`ui:notices`<br>`ui:panels` | `showNotice()`, `openNote()`, `panels.register()`, `panels.open()` | 宿主全域性提示、筆記精準跳轉與自定義 DOM 面板 |
| **`context.commands`** | `ui:commands` | `register()` | 註冊全域性或編輯器命令（命令面板、工具欄快捷選單） |
| **`context.settings`** | *(無)* | `get()`, `set()`, `remove()` | 讀取與修改外掛自身的宿主統一配置項 |
| **`context.storage`** | `storage` | `get()`, `set()`, `remove()` | 本機輕量鍵值儲存（遊標、偏好快取，按外掛與工作區隔離） |
| **`context.secrets`** | `secrets` | `get()`, `set()`, `remove()` | 本機加密的安全憑據儲存（API Key、Token 等敏感資料） |
| **`context.network`** | `network`<br>`network:public` | `fetch(url, options)` | 網路請求（標準請求或跨域免憑據公開只讀） |
| **`context.schedules`** | `schedules` | `upsert()`, `list()`, `remove()` | 桌面端持久化定時任務排程（應用開啟期間執行） |
| **`context.events`** | *(無)* | `on(event, handler)` | 訂閱工作區筆記、標籤、模板及同步完成事件 |
| **`context.ai`** | `ai:generate` | `status()`, `generate()`, `transcribeResource()`, `transcribeMedia()` | 呼叫工作區配置的 AI 模型生成文字或轉錄音影片媒體 |

---

### 1. 筆記與筆記本（Notes & Notebooks）

#### 查詢筆記

```ts
// 1. 查詢輕量摘要列表（用於列表、側邊欄等，每頁最多 200 條）
const result = await context.notes.query({
  notebookId: "optional-notebook-id",
  text: "關鍵詞",
  tags: ["todo"],
  sort: "updated-desc", // "updated-desc" | "created-desc" | "title-asc" | "title-desc"
  limit: 50,
  offset: 0
});
// 返回 { notes: PluginNoteSummary[], totalCount: number, nextOffset: number | null }

// 2. 查詢包含完整 Markdown 內容的筆記（用於 Linter、索引掃描等）
const fullNotes = await context.notes.queryContent({
  tags: ["task"],
  limit: 20
});
```

#### 增刪改查

```ts
// 獲取單篇筆記詳情
const note = await context.notes.get(noteId);

// 建立筆記
const newNote = await context.notes.create({
  notebookId: "target-notebook-id",
  title: "新筆記",
  contentMarkdown: "# 標題\n正文內容",
  tags: ["tag1"]
});

// 更新整篇筆記
await context.notes.update(noteId, {
  title: "更新後的標題",
  contentMarkdown: "新的正文",
  tags: ["updated"]
});

// 區域性併發安全編輯（基於 revision 與 contentHash 進行樂觀鎖校驗）
await context.notes.editMarkdown(noteId, {
  expectedRevision: note.revision,
  expectedContentHash: note.contentHash,
  edits: [
    { from: 0, to: 0, insert: "> 插入頂部引用\n\n" } // UTF-16 偏移量，半開區間 [from, to)
  ]
});

// 移動、置頂與刪除
await context.notes.move([noteId], targetNotebookId);
await context.notes.pin([noteId], true);
await context.notes.delete(noteId, { permanent: false }); // 移入回收站
await context.notes.restore(noteId); // 從回收站恢復

// 歷史版本
const revisions = await context.notes.revisions.list(noteId);
await context.notes.revisions.restore(noteId, revisionId);
```

#### 筆記本與標籤

```ts
// 筆記本
const notebooks = await context.notebooks.list();
const nb = await context.notebooks.create({ name: "新建筆記本", parentId: null });
await context.notebooks.update(nb.id, { name: "新名稱" });
await context.notebooks.delete(nb.id);

// 標籤
const tags = await context.tags.list();
await context.tags.rename("old-tag", "new-tag");
await context.tags.delete("unused-tag");
```

---

#### 特殊筆記的讀取與細項編輯

`notes.query()` / `queryContent()` / `get()` 返回 `kind`（`text`、`mind-map`、`flowchart`、`architecture`、`table`、`poster`、`infographic` 或 `video`）；完整筆記還包含獨立副本 `contentJson`。特殊筆記的完整持久化載荷也保留在 `contentMarkdown` 中，讀取這些欄位不會修改筆記。

圖表、表格、海報和資訊圖必須先呼叫專用 `get()`，再以返回的 `note.revision`、`note.contentHash` 和 `editToken` 呼叫 `edit()`。快照令牌還會檢測尚未同步、雲端版本號未遞增的本機內容變化。批次操作全部驗證成功後才寫入一次；`dryRun: true` 返回預覽結構，不儲存，不產生筆記變更事件。預覽返回的 `note` 和 `editToken` 仍對應儲存前的基線。

```ts
const snapshot = await context.diagrams.get(noteId, { includeLayout: true });
const result = await context.diagrams.edit(noteId, {
  expectedRevision: snapshot.note.revision,
  expectedContentHash: snapshot.note.contentHash,
  expectedEditToken: snapshot.editToken,
  reflow: "preserve",
  operations: [{ op: "update_node", nodeId: "root", changes: { label: "Updated" } }],
});

const table = await context.tables.get(tableNoteId);
await context.tables.edit(tableNoteId, {
  expectedRevision: table.note.revision,
  expectedContentHash: table.note.contentHash,
  expectedEditToken: table.editToken,
  operations: [
    { op: "update_record", recordId: "row-1", cells: { "field-1": "Updated" } },
    { op: "add_record", recordId: "row-2", cells: { "field-1": "New" } },
  ],
});
```

- 圖表操作：`add_node`、`update_node`、`remove_node`、`add_edge`、`update_edge`、`remove_edge`。每批 1–100 項；刪除包含子節點的節點須顯式設定 `cascade: true`。預設保留已有佈局；`reflow: "all"` 重新佈局，主題與結構保持不變。
- 表格操作：`add_field`、`update_field`、`remove_field`、`add_record`、`update_record`、`remove_record`，每批 1–100 項。單元格以欄位 ID 為鍵；附件寫入使用資源 ID 陣列，宿主核驗其屬於當前筆記並補全後設資料。新增記錄可以指定唯一 `recordId`，省略則自動生成。
- 欄位型別轉換、刪欄位等操作影響已有非空單元格時，先用 `dryRun` 檢視 `changedCellCount` / `removedAttachmentCount`，確認後顯式傳入 `allowDataChanges: true`。記錄刪除仍會直接執行，須由外掛自身提供適當的互動。
- 海報支援 `edits: [{ id, patch }]` 和 `operations`：`add`、`remove`、`duplicate`、`reorder`、`group`、`ungroup`、`align`、`lock`、`apply_template`。先處理元素屬性修改，再依序執行操作，最後調整畫布/平臺尺寸。陣列順序由底層到頂層；可編輯欄位、平臺和字型見 `posters.capabilities()`。鎖定元素不能直接修改或刪除，須先顯式解鎖。`apply_template` 會替換全部元素，只有使用者要求替換版式時才呼叫。圖片必須屬於當前筆記；修改後清除舊預覽引用，但不生成新預覽圖片。
- 資訊圖支援 `set_data` / `remove_data` / `insert_data` 操作巢狀資料，路徑是欄位名與陣列下標組成的陣列；陣列插入使用獨立 `index`。每批 1–100 項。`set_template` / `set_theme` 顯式修改模板/主題，名稱見 `infographics.capabilities()`。普通資料編輯保留模板、主題覆蓋、畫布配置和會話歷史；筆記標題保持不變，若需要同步標題請另用 `notes.update()`。使用現有 AntV 解析器校驗；資料段可能重新格式化，但解析後的未指定資料與樣式必須保持一致。不能無損回讀的值（如不受支援的陣列或多行標量）會丟擲 `INVALID_STRUCTURED_EDIT`，不會截斷或靜默丟棄。主題修改只更換主題名，保留顯式顏色等覆蓋項。

```ts
const poster = await context.posters.get(posterNoteId);
await context.posters.edit(posterNoteId, {
  expectedRevision: poster.note.revision,
  expectedContentHash: poster.note.contentHash,
  expectedEditToken: poster.editToken,
  edits: [{ id: "heading", patch: { text: "Updated", fill: "#16A06E" } }],
});

const infographic = await context.infographics.get(infographicNoteId);
await context.infographics.edit(infographicNoteId, {
  expectedRevision: infographic.note.revision,
  expectedContentHash: infographic.note.contentHash,
  expectedEditToken: infographic.editToken,
  operations: [{ op: "set_data", path: ["lists", 0, "label"], value: "Updated" }],
});
```

**相容性與錯誤**：`notes.update()` 修改標題/標籤會保留原始正文；對特殊筆記傳入 `contentMarkdown`，或用 `notes.editMarkdown()`、編輯器 Markdown/嵌入寫入介面操作特殊正文，會丟擲 `STRUCTURED_NOTE_REQUIRED`。通用 Markdown 建立/寫入也拒絕特殊筆記標記。已有外掛須按 `kind` 選擇介面。型別不符為 `NOTE_TYPE_MISMATCH`；非法批次操作為 `INVALID_STRUCTURED_EDIT`；需確認欄位資料變化為 `TABLE_DATA_CHANGES_REQUIRED`；快照過期或編輯器有未儲存內容為 `NOTE_CONFLICT`，須先儲存並重新讀取。專用寫入沿用宿主倉庫的同步、歷史版本與重新整理機制，離線返回並不表示雲端已同步成功。

外掛儲存還會在本機倉庫事務內檢查內容快照，防止多個視窗在宿主校驗後互相覆蓋；未解決的同步衝突會拒絕後續外掛寫入，並保留衝突佇列的草稿與診斷。桌面外掛儲存使用專用原生介面，將正文、歷史快照和同步入隊一起提交；不支援該介面的舊宿主會丟擲 `HOST_UPGRADE_REQUIRED`，不會回退到無保護寫入。原有普通編輯器儲存行為保持不變。伺服器歷史版本沿用現有五分鐘快照規則，不保證每次外掛寫入都產生獨立雲端版本。

維護者可在構建 sidecar 後執行 `bun run test:plugin-sync`，驗證隔離的 Web IndexedDB → 本機 API/SQLite → 原生 sidecar → Web 往返、離線持久化、重啟與衝突恢復。`test:desktop:sidecar` 已包含此驗證。設定 `EDGE_EVER_LEGACY_SIDECAR_PATH` 和可選的 `EDGE_EVER_LEGACY_MIGRATIONS_PATH` 可額外驗證舊原生服務建立的資料升級到當前構建；所有原生程式只訪問臨時測試目錄，不啟動已安裝的桌面應用，不讀取真實賬戶資料。該驗證覆蓋當前主機的原生服務，不替代其他平臺的實機與應用內驗收。


### 2. 模板管理（Templates）

操作工作區內的公共模板或一鍵套用模板建立新筆記：

```ts
// 查詢所有可用模板
const templates = await context.templates.list();

// 建立模板（可直接提供內容，或基於已有 noteId 生成）
const template = await context.templates.create({
  name: "會議紀要",
  description: "日常專案例會模板",
  contentMarkdown: "## 參會人員\n\n## 議題\n\n## 待辦行動項\n",
  tags: ["meeting"]
});

// 更新模板
await context.templates.update(template.id, {
  name: "週會紀要",
  description: "每週團隊例會"
});

// 套用模板在指定筆記本下建立新筆記
const note = await context.templates.use(template.id, targetNotebookId);

// 刪除模板
await context.templates.delete(template.id);
```

---

### 3. 資源附件（Resources）

操作關聯到筆記的媒體或檔案附件：

```ts
// 獲取筆記關聯的所有附件
const resources = await context.resources.list(noteId);

// 讀取附件 Blob
const blob = await context.resources.read(resourceId);

// 上傳新附件
const uploaded = await context.resources.upload(noteId, file);

// 樂觀併發更新附件內容（單檔案上限 100 MiB）
await context.resources.update(resourceId, {
  file: newFile,
  expectedContentHash: currentResource.contentHash
});

// 重新命名與刪除
await context.resources.rename(resourceId, "document.pdf");
await context.resources.delete(resourceId);
```

---

### 4. 編輯器互動（Editor & Embeds）

用於在使用者處於編輯狀態時操作當前檔案：

```ts
// 選區讀取與替換
const selection = await context.editor.getSelection();
if (selection && !selection.empty) {
  await context.editor.replaceSelection(selection.text.toUpperCase());
}

// 在當前遊標處插入內容
await context.editor.insertAtCursor("- [ ] 新建任務\n");

// 實時編輯當前正在編輯的檔案（不會丟失未儲存的內容）
const doc = await context.editor.getDocument();
if (doc) {
  await context.editor.editMarkdown([
    { from: 0, to: 0, insert: "<!-- 外掛插入字首 -->\n" }
  ]);
}
```

#### 自定義塊級 Embed

外掛可註冊自定義塊級渲染器並插入到檔案中（儲存為通用的 `edgeever-plugin-embed` 塊）：

```ts
// 1. 註冊 Embed 渲染器
context.editor.embeds.register({
  type: "my-diagram",
  async mount(container, embed) {
    const data = embed.data;
    container.innerHTML = `<div>圖表預覽: ${data.title}</div>`;
    return () => container.replaceChildren(); // 解除安裝清理
  }
});

// 2. 向檔案中插入 Embed
await context.editor.insertEmbed({
  type: "my-diagram",
  title: "架構圖",
  data: { mode: "preview", version: 1 } // JSON 相容物件，上限 64 KiB
});
```

---

### 5. 全域性命令（Commands）

```ts
context.commands.register({
  id: "quick-action",
  title: "快速操作",
  listed: true, // 是否在市場卡片中展示，預設為 true；上下文命令建議設為 false
  menu: true,   // 是否在桌面端快捷選單中展示，預設為 true
  async run() {
    context.ui.showNotice("操作執行成功");
  }
});
```

---

### 6. 宿主介面與通知（UI & Notices）

```ts
// 宿主全域性輕提示
context.ui.showNotice("操作執行成功");

// 開啟指定筆記並可選跳轉至指定搜尋關鍵詞
await context.ui.openNote(noteId, { search: "關鍵定位詞" });
```

---

### 7. 自定義面板（Panels）

外掛可以註冊全屏或對話方塊形態的原生 DOM 面板：

```ts
context.ui.panels.register({
  id: "task-dashboard",
  title: "任務儀表盤",
  purpose: "dashboard", // "workflow" | "dashboard" | "preview" | "onboarding"
  presentation: "dialog", // "dialog" | "fullscreen"
  mount(container, { shell, requestClose, state }) {
    // 1. 使用宿主標準 Shell 控制元件（頁頭、搜尋欄、分段切換等）
    shell.set({
      header: {
        title: "任務管理",
        description: "檢視待辦與進行中的任務",
        actions: [{ id: "refresh", label: "重新整理" }]
      },
      toolbar: [
        {
          type: "tabs",
          key: "filter",
          value: "all",
          options: [{ value: "all", label: "全部" }, { value: "done", label: "已完成" }]
        },
        { type: "search", key: "q", placeholder: "搜尋任務" }
      ],
      onAction(actionId) { /* 處理按鈕點選 */ },
      onChange(key, value) { /* 處理篩選變更 */ }
    });

    // 2. 渲染外掛自定義 DOM 內容
    const content = document.createElement("div");
    content.textContent = "內容區域";
    container.append(content);

    return () => content.remove(); // 解除安裝清理
  },
  beforeClose() {
    // 關閉防丟失保護：返回 true 允許關閉，false 阻止，或返回提示配置由宿主彈窗確認
    return true;
  }
});

// 開啟面板
await context.ui.panels.open("task-dashboard", { state: { initialTab: "all" } });
```

---

### 8. 統一設定（Settings）

EdgeEver 由宿主統一渲染外掛設定介面。在 `manifest.json` 中宣告配置欄位，無需手寫設定頁 UI：

```json
{
  "settings": {
    "fields": [
      { "key": "endpoint", "type": "text", "label": "API 地址", "required": true },
      { "key": "token", "type": "secret", "label": "API Token", "required": true },
      { "key": "autoSync", "type": "boolean", "label": "自動同步", "default": true },
      {
        "key": "mode",
        "type": "select",
        "label": "同步模式",
        "default": "fast",
        "options": [
          { "value": "fast", "label": "快速" },
          { "value": "full", "label": "完整" }
        ]
      }
    ]
  }
}
```

#### 讀取與監聽設定

```ts
// 讀取設定值
const endpoint = await context.settings.get<string>("endpoint");
const token = await context.settings.get<string>("token");

// 監聽當前外掛設定變更
context.events.on("settings.changed", async ({ key }) => {
  if (key === "autoSync") {
    const autoSync = await context.settings.get<boolean>("autoSync");
    // 更新邏輯
  }
});
```

> [!NOTE]
> `type: "secret"` 欄位會經過本機加密儲存，不會明文回顯在表單中。設定僅儲存在當前裝置，不跨端同步。

---

### 9. 資料儲存與安全憑據（Storage & Secrets）

用於外掛自身的資料持久化（按工作區與外掛 ID 隔離儲存在當前裝置）：

```ts
// 普通鍵值儲存（適合遊標、偏好快取）
await context.storage.set("last_sync_time", Date.now());
const lastSync = await context.storage.get<number>("last_sync_time");
await context.storage.remove("last_sync_time");

// 安全憑據儲存（敏感 Token、金鑰等，採用本機加密儲存）
await context.secrets.set("api_key", "sk-xxx");
const apiKey = await context.secrets.get("api_key");
await context.secrets.remove("api_key");
```

---

### 10. 網路請求（Network）

```ts
// 1. 標準請求（支援任意 HTTP/HTTPS 請求，受宿主環境 CORS 策略約束）
const response = await context.network.fetch("https://api.example.com/data", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query: "example" })
});
const data = await response.json();

// 2. 公開只讀請求（無憑據讀取跨域公開 RSS/API，僅支援 443 埠 HTTPS GET/HEAD）
const publicRes = await context.network.fetch("https://example.org/feed.xml", {
  transport: "public",
  headers: { Accept: "application/rss+xml" }
});
const xml = await publicRes.text();
```

---

### 11. 定時任務（Schedules，僅桌面端）

桌面端外掛可註冊定時計劃執行已註冊的命令（在 EdgeEver 開啟期間執行）：

```ts
// 註冊命令
context.commands.register({
  id: "sync-feed",
  title: "同步訂閱",
  run: async () => { /* 耗時同步任務 */ }
});

// 配置定時計劃（以 key 為唯一標識，啟用時重複呼叫自動冪等更新）
await context.schedules.upsert({
  key: "hourly-sync",
  name: "每小時同步訂閱",
  commandId: "sync-feed",
  cronExpression: "0 * * * *",
  missedRunPolicy: "run-once" // 錯過的執行補跑一次 ("run-once" | "skip")
});

// 管理計劃
const schedules = await context.schedules.list();
await context.schedules.remove("hourly-sync");
```

---

### 12. 事件監聽（Events）

訂閱工作區的資料變更事件：

```ts
// 監聽筆記事件
context.events.on("note.created", ({ note }) => console.log("新建筆記", note.id));
context.events.on("note.updated", ({ note }) => console.log("筆記更新", note.id));
context.events.on("note.deleted", ({ noteId }) => console.log("筆記刪除", noteId));

// 監聽其他變更
context.events.on("tag.changed", () => { /* 標籤更新 */ });
context.events.on("workspace.synced", () => { /* 工作區同步完成 */ });
```

---

### 13. 人工智慧（AI）

呼叫使用者當前工作區已配置的 AI 模型生成文字或轉錄媒體（憑據由宿主安全保管，外掛無需知曉使用者 API Key）：

```ts
// 1. 檢查 AI 狀態與當前配置模型
const status = await context.ai.status();
// { configured: boolean, modelName?: string }

if (status.configured) {
  // 2. 文字生成
  const result = await context.ai.generate({
    system: "你是一個專業的文字潤色助手。",
    prompt: "請最佳化以下段落：...",
    maxOutputTokens: 2000,
    signal: abortController.signal
  });
  console.log("生成結果:", result.text);

  // 3. 轉錄筆記內已上傳的音影片附件
  const transcript = await context.ai.transcribeResource(noteId, resourceId);
  // { text: string, resourceId: string, filename: string }

  // 4. 轉錄外掛持有的獨立媒體 Blob / File（無需先上傳為筆記附件）
  const ownMedia = new File([audioBytes], "recording.mp3", { type: "audio/mpeg" });
  const mediaTranscript = await context.ai.transcribeMedia(ownMedia, {
    signal: abortController.signal
  });
  console.log("音訊轉錄:", mediaTranscript.text);
}
```

---

## 主題擴充套件（Theme Manifest）

主題為純無程式碼擴充套件，僅需一個 `manifest.json`：

```json
{
  "type": "theme",
  "id": "com.example.theme",
  "name": "Nord Emerald",
  "version": "1.0.0",
  "themeApiVersion": "1",
  "modes": ["light", "dark"],
  "light": {
    "color.background": "#f8fafc",
    "color.surface": "#ffffff",
    "color.text": "#0f172a",
    "color.accent": "#16a06e"
  },
  "dark": {
    "color.background": "#0f172a",
    "color.surface": "#1e293b",
    "color.text": "#f8fafc",
    "color.accent": "#4ade80"
  }
}
```

支援的 Token 包括：
- 顏色：`color.background`, `color.surface`, `color.surfaceMuted`, `color.text`, `color.textMuted`, `color.border`, `color.accent`, `color.accentForeground`, `color.success`, `color.warning`, `color.danger`（格式必須為 `#RRGGBB` 或 `#RRGGBBAA`）
- 排版與尺寸：`font.body`, `font.mono`, `font.size`, `lineHeight.body`, `radius.medium`, `density.scale`, `editor.contentWidth`

---

## 打包、分發與本機開發

### 打包規範

外掛分發產物必須為免相對依賴的單個 Bundle 檔案：
- `manifest.json`：外掛清單
- `main.js`：打包後的單檔案指令碼（上限 5 MB）
- `styles.css`：可選樣式表（上限 1 MB）

若使用 `@edgeever/plugin-api`，請在構建時將其內聯打入 `main.js`。

### GitHub 分發

1. 將包含最新 `manifest.json` 的倉庫釋出在 GitHub（公開倉庫）。
2. 建立 GitHub Release，Release Tag 匹配 Manifest 版本（如 `1.0.0` 或 `v1.0.0`）。
3. 在 Release 資產中上傳 `manifest.json`、`main.js` 和可選的 `styles.css`。
4. 使用者可在 EdgeEver 的「外掛市場」頁面直接輸入倉庫地址安裝：
   ```text
   https://github.com/owner/edgeever-plugin
   ```

### 本機測試與除錯

開發 EdgeEver 時，可直接在外掛市場中輸入本機 Manifest 地址進行除錯：
- `/extensions/recent-notes/manifest.json`（官方示例外掛）
- `/extensions/nord-emerald/manifest.json`（官方示例主題）

提交至官方已驗證市場請參閱 [官方外掛市場上架政策](plugin-marketplace-policy.zh-TW.md)。
