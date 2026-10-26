# EdgeEver 官方網站

本目錄是 **EdgeEver** monorepo 內的官方網站應用，位於 `apps/site`。

> **EdgeEver：基於 Cloudflare 自託管的免費開源『印象筆記』，原生支援 AI Agent 接入。**
>
> 核心專案倉庫：[GitHub - tianma-if/edgeever](https://github.com/tianma-if/edgeever)
> 
> 官方網站地址：[https://edgeever.org](https://edgeever.org) (演示環境：[https://demo.edgeever.org](https://demo.edgeever.org))

---

## 技術棧

本官網基於以下技術構建：
- **框架**：[Astro v5](https://astro.build/) (靜態站點生成)
- **樣式**：[Tailwind CSS v4](https://tailwindcss.com/)
- **內容管理**：Astro Content Collections (使用 Markdown 編寫指南與日誌)

## 開發與構建

### 1. 安裝依賴

在倉庫根目錄安裝依賴：

```bash
bun install
```

### 2. 啟動開發伺服器

```bash
bun run dev:site
```

### 3. 構建靜態站點

```bash
bun run build:site
```

構建產物將輸出在 `apps/site/dist/` 目錄中。

### 4. 本機預覽構建產物

```bash
bun run preview:site
```

## 目錄結構

- `src/pages/`：官網主要頁面（首頁、聯絡我們、開發日誌）。
- `src/components/`：可複用的 UI 與區塊元件。
- `src/content/blog/`：儲存與專案相關的技術指南和更新日誌（Markdown 格式）。
- `public/`：存放靜態圖片、圖示與 Robots.txt。
