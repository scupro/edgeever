import { jaSiteCopy, jaSiteTagline } from "./i18n-ja";
import { plSiteCopy, plSiteTagline } from "./i18n-pl";

export const siteLocales = ["zh-TW", "en-US", "ja", "pl"] as const;
export type SiteLocale = (typeof siteLocales)[number];

export const defaultSiteLocale: SiteLocale = "zh-TW";
export const unmatchedSiteLocale: SiteLocale = "en-US";
export const siteLocaleStorageKey = "edgeever.site.locale";
export const siteLocaleDataAttribute = "data-edgeever-site-locale";

export const siteLocalePrefixes: Record<SiteLocale, string> = {
  "zh-TW": "",
  "en-US": "/en",
  ja: "/ja",
  pl: "/pl",
};

export const siteLocaleLabels: Record<SiteLocale, string> = {
  "zh-TW": "繁體中文",
  "en-US": "English",
  ja: "日本語",
  pl: "Polski",
};

export const siteTaglines = {
  "zh-TW": "AI 原生知識庫與印象筆記 / Obsidian 替代方案，支援多端瞬時同步與原生 MCP。Cloudflare 免費託管或 Docker 自託管",
  "en-US": "AI-native knowledge base & Evernote/Obsidian alternative with instant sync & native MCP. Free on Cloudflare or self-hosted via Docker.",
  ja: jaSiteTagline,
  pl: plSiteTagline,
} as const satisfies Record<SiteLocale, string>;

const localePrefixPattern = /^\/(en|ja|pl)(?=\/|$)/;

export const stripSiteLocalePrefix = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return normalizedPath.replace(localePrefixPattern, "") || "/";
};

export const matchSiteLocale = (locale: string | null | undefined): SiteLocale | null => {
  if (!locale) {
    return null;
  }

  const normalized = locale.trim().replaceAll("_", "-").toLowerCase();

  if (normalized === "zh" || normalized.startsWith("zh-")) {
    return "zh-TW";
  }

  if (normalized === "en" || normalized.startsWith("en-")) {
    return "en-US";
  }

  if (normalized === "ja" || normalized.startsWith("ja-")) {
    return "ja";
  }

  if (normalized === "pl" || normalized.startsWith("pl-")) {
    return "pl";
  }

  return null;
};

export const getSiteLocale = (pathname: string): SiteLocale => {
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    return "en-US";
  }

  if (pathname === "/ja" || pathname.startsWith("/ja/")) {
    return "ja";
  }

  if (pathname === "/pl" || pathname.startsWith("/pl/")) {
    return "pl";
  }

  return "zh-TW";
};

export const getLocalizedPath = (locale: SiteLocale, path: string) => {
  const barePath = stripSiteLocalePrefix(path);
  const prefix = siteLocalePrefixes[locale];

  if (!prefix) {
    return barePath;
  }

  return barePath === "/" ? `${prefix}/` : `${prefix}${barePath}`;
};

export const isExplicitSiteLocalePath = (pathname: string) => localePrefixPattern.test(pathname);

export const siteCopy = {
  "zh-TW": {
    layout: {
      defaultDescription:
        "EdgeEver 是開源、原生支援 AI 的自託管筆記與知識庫工作區。保留經典三欄高效體驗，支援 ACP 本機 Agent 深度協同、AI 伴侶側邊欄、視覺化圖表筆記與多端同步，覆蓋 macOS、Windows、Linux、iOS、Android 與瀏覽器剪藏，支援在 Cloudflare 免費額度內執行或使用 Docker 一鍵自託管。",
      defaultTitle: `EdgeEver - ${siteTaglines["zh-TW"]}`,
      imageAlt: "EdgeEver 筆記應用截圖",
      ogLocale: "zh_TW",
    },
    nav: {
      homeAria: "EdgeEver 首頁",
      features: "功能特性",
      guides: "使用指南",
      deploy: "部署",
      cloudflareDeploy: "Cloudflare 部署",
      dockerDeploy: "Docker 部署",
      selfHostedAlternative: "印象筆記替代",
      migration: "從印象筆記遷移",
      evernoteMigration: "從印象筆記遷移",
      memosMigration: "從 Memos 遷移",
      notionMigration: "從 Notion 遷移",
      flomoMigration: "從 Flomo 遷移",
      advancedPlay: "搭配AI Agent的玩法",
      blog: "部落格",
      backToBlog: "返回部落格",
      contact: "聯絡我們",
      privacy: "隱私政策",
      demo: "線上演示",
      language: "語言",
      languageMenu: "切換語言",
      tagAll: "全部",
      tagMigration: "遷移教程",
      tagMcp: "AI 協同 (MCP)",
      tagSelfHosted: "部署自託管",
      openSource: "開源",
    },
    hero: {
      slogan: siteTaglines["zh-TW"],
      popHighlight: "經典三欄現代化知識庫 · 原生 AI 協同 · 全平臺客戶端覆蓋",
      demo: "線上演示",
      agentInstall: "一鍵 AI 部署",
      getApps: "獲取客戶端：",
      clipper: "剪藏外掛",
      windows: "Windows",
      linux: "Linux",
      imageAlt: "EdgeEver product preview",
      badgeText: "💡 全平臺覆蓋：macOS、Windows、Linux、iOS、Android、剪藏外掛 · 原生 MCP / ACP 協同 · Cloudflare 免費額度 & Docker 一鍵安裝",
    },
    bento: {
      eyebrow: "WHY EDGEEVER",
      heading: "重新定義自託管知識工作區",
      subheading: "告別商業筆記的臃腫廣告、裝置限制與昂貴訂閱。每一個設計細節，都旨在打造流暢、開放、隱私可控且原生支援 AI 的第二大腦。",
      card1: {
        badge: "經典重現",
        title: "經典三欄與專注模式，熟悉更輕快",
        desc: "保留經典高效的三欄工作區體驗（目錄樹 · 筆記列表 · 編輯寫作）。支援富文字與 Markdown 原始碼雙檢視自由切換、無限層級巢狀、全屏專注模式與明暗自定義 CSS 樣式預設。",
        subBadge: "雙檢視 / 專注模式 / 自定義 CSS",
        treeTitle: "筆記本目錄",
        folder1: "01_工作收件箱",
        folder2: "02_靈感與草稿",
        folder3: "03_歸檔筆記",
        folder4: "↳ 2026_閱讀精選",
        listTitle: "筆記 (18)",
        note1Title: "EdgeEver 核心架構設計",
        note1Sub: "基於 Cloudflare Worker / Docker 與 SQLite...",
        note2Title: "本機 ACP Agent 接入",
        note2Sub: "Codex / Antigravity 本機協同...",
        editorTitle: "EdgeEver 核心架構設計",
        editorBody: "EdgeEver 將經典的 3 欄工作區、原生 AI Agent 聯動與自由部署架構完美結合。",
        editorSaveTag: "已自動儲存至 SQLite",
      },
      card2: {
        badge: "AI 原生",
        title: "伴侶側邊欄與本機 ACP 協同",
        desc: "常駐伴侶側邊欄支援多會話與選區即時提煉；桌面端透過 ACP 協議直連本機 Agent（Codex、Antigravity、Claude Code 等）；內建 Remote MCP 支援外部助手遠端讀寫。",
        subBadge: "ACP + Remote MCP",
        mockupStatus: "ACP 本機 Agent & 伴侶側邊欄就緒",
        mockupCmd: "> 智慧分析選中文字並擴寫思維導圖",
        mockupResult: "已提煉核心論點，並在筆記中生成結構化思維導圖分支。",
      },
      card3: {
        badge: "自由部署",
        title: "Cloudflare 免費額度，或一鍵 Docker 自託管",
        desc: "個人使用通常可執行在 Cloudflare 免費額度內（約 15 萬筆記 + 5 萬圖片）；也可一鍵指令碼部署至 VPS、NAS 或家庭伺服器，儲存按需擴充套件。",
        subBadge: "Cloudflare Native / Docker",
        price: "¥0",
        unit: "/ 月",
        sub: "Cloudflare 免費額度內執行",
        metric: "150,000+",
        metricSub: "免費筆記容量 (可Docker擴充套件)",
      },
      card4: {
        badge: "創作利器",
        title: "視覺化圖表筆記與公眾號一鍵排版",
        desc: "筆記內原生繪製思維導圖、流程圖與架構圖，支援 AI 一句話生成與自動佈局；Markdown 一鍵轉換為帶內聯樣式的公眾號精美排版，原生渲染 Mermaid 與數學公式。",
        subBadge: "思維導圖 / 流程圖 / 微信排版",
        srcTag: "視覺化圖表 / 公眾號排版",
        actionBtn: "AI 一鍵生成與排版",
        previewTitle: "# 思維導圖、流程圖與公眾號排版",
        previewBody: "結構化圖表全端同步與向量匯出，富文字一鍵複製至微信公眾號後臺或 Substack。",
      },
      card5: {
        badge: "全端主權",
        title: "全平臺客戶端覆蓋與無損 ZIP 歸檔",
        desc: "覆蓋 macOS、Windows、Linux、原生 iOS（SwiftUI）、Android 及全功能剪藏外掛；基於標準 SQLite 與無損 ZIP 匯出，資料完全自主掌控。",
        subBadge: "全平臺客戶端 + ZIP",
        archiveTitle: "edgeever-backup.zip",
        archiveSub: "包含 Markdown、Front Matter、附件與歷史版本",
      },
    },
    marquee: {
      title: "全平臺客戶端覆蓋、自由部署與 AI 智腦生態",
      subtitle: "從 macOS、原生 iOS、Android 客戶端，到 Docker 一鍵自託管、微信公眾號排版與 Remote MCP 協同",
      items: [
        {
          tag: "macOS 桌面端",
          title: "Electron + Rust + SQLite",
          desc: "本機 SQLite 映象，支援 ACP 本機 Agent、專注模式與離線秒開",
          icon: "bx:bxl-apple",
          color: "from-emerald-500/10 to-teal-500/5",
        },
        {
          tag: "iOS 原生 App",
          title: "SwiftUI 原生架構",
          desc: "已上架 App Store，支援微信文章剪藏、撤銷重做與離線 SQLite 同步",
          icon: "bx:bx-mobile",
          color: "from-teal-500/10 to-emerald-500/5",
        },
        {
          tag: "Android App",
          title: "Google Play & 簽名 APK",
          desc: "已上架 Google Play，支援本機離線編輯、撤銷重做與微信文章剪藏",
          icon: "bx:bxl-android",
          color: "from-green-500/10 to-emerald-500/5",
        },
        {
          tag: "剪藏外掛",
          title: "Chrome、Edge 與 Firefox",
          desc: "商店全上架，支援網頁全文、右鍵圖片、X 推文與選中文字剪藏",
          icon: "bx:bx-extension",
          color: "from-emerald-600/10 to-green-500/5",
        },
        {
          tag: "視覺化圖表",
          title: "思維導圖、流程圖與架構圖",
          desc: "筆記內原生繪製與自動佈局，支援 AI 一句話生成與向量匯出",
          icon: "bx:bx-sitemap",
          color: "from-teal-500/10 to-emerald-500/5",
        },
        {
          tag: "本機 ACP 協同",
          title: "直連本機 AI Agent",
          desc: "桌面端透過 ACP 直連 Codex、Antigravity、Claude Code、WorkBuddy、DeepSeek",
          icon: "bx:bxs-bot",
          color: "from-green-500/10 to-emerald-500/5",
        },
        {
          tag: "AI 伴侶側邊欄",
          title: "常駐側邊欄與劃詞提煉",
          desc: "多會話隨時切換，支援選區一鍵解釋、翻譯、語法校對與智慧潤色",
          icon: "bx:bxs-brain",
          color: "from-emerald-500/10 to-teal-500/5",
        },
        {
          tag: "Docker 部署",
          title: "VPS & NAS 一鍵安裝",
          desc: "單行 curl 指令碼極速啟動，儲存按需擴充套件，支援本機與 S3 相容物件儲存",
          icon: "bx:bxl-docker",
          color: "from-teal-600/10 to-emerald-600/5",
        },
        {
          tag: "創作者排版",
          title: "公眾號一鍵美化與自定義 CSS",
          desc: "公眾號一鍵排版複製，支援單篇筆記字號行高與明暗 CSS 預設預覽",
          icon: "bx:bx-copy",
          color: "from-emerald-500/10 to-teal-500/5",
        },
        {
          tag: "資料主權",
          title: "無損 ZIP 離線歸檔",
          desc: "標準 SQLite 儲存，完整打包匯出 Markdown、附件與歷史版本",
          icon: "bx:bx-archive",
          color: "from-green-600/10 to-teal-500/5",
        },
      ],
    },
    features: {
      heading: "重新定義個人筆記體驗",
      items: [
        {
          title: "自由選擇部署方式：Cloudflare Serverless 與 Docker",
          summary: "同一套現代應用，既可免費執行於 Cloudflare Serverless，也可透過 Docker 一鍵部署到 VPS、NAS 或家庭伺服器。",
          points: [
            "Cloudflare 免費額度自託管：無需購買雲伺服器與維護 SSL 證書，個人使用通常可容納約 15 萬條短筆記和 5 萬張圖片。",
            "Docker 一鍵指令碼部署：單行 curl 命令極速啟動，儲存按需隨心擴充套件，輕鬆承載百萬級筆記與海量附件。",
            "資料安全盡在掌握：無論選擇哪種部署形態，所有資料均儲存在您自己的帳號或私有裝置中，安全無憂。",
          ],
        },
        {
          title: "雙協議 AI 協同：AI 伴侶側邊欄、本機 ACP Agent 與 Remote MCP",
          summary: "內建 REST API、Remote MCP endpoint 與桌面端 ACP 協議，常駐伴侶側邊欄讓 AI 真正成為個人知識庫的智慧副駕駛。",
          points: [
            "桌面端 ACP 直連本機 Agent：直接呼叫本機執行的 Codex、Antigravity、Claude Code、WorkBuddy、DeepSeek Harness 等，零延遲深度協同。",
            "常駐 AI 伴侶側邊欄：多會話隨時切換，支援對筆記全文或選區進行一鍵總結、解釋、翻譯、語法校對與續寫潤色。",
            "內建 Remote MCP endpoint：直接授權外部 AI 助手安全讀取、生成與整理筆記，無縫打通外部知識生態。",
            "接入自己的 AI 模型：無縫配置 OpenAI、Anthropic Claude、Google Gemini、DeepSeek 及自定義相容端點。",
          ],
        },
        {
          title: "經典三欄佈局、專注模式與外觀定製",
          summary: "保留經典高效的三欄工作區（目錄樹 · 筆記列表 · 編輯寫作），兼顧流暢富文字寫作、Markdown 原始碼與個性化外觀。",
          points: [
            "支援無限級巢狀筆記本，適合長期沉澱與結構化分類的大型個人知識庫。",
            "桌面端一鍵開啟全屏專注模式，筆記本拖拽排序，筆記支援多選批次移動與合併。",
            "支援單篇筆記字號、行高與調色盤獨立設定，支援明暗模式自定義 CSS 預設與一覽同屏預覽。",
          ],
        },
        {
          title: "視覺化圖表筆記與創作者排版",
          summary: "筆記內原生支援思維導圖、流程圖與架構圖，配合微信公眾號一鍵排版、Mermaid 與數學公式，創作圖文更自如。",
          points: [
            "視覺化圖表筆記：筆記內原生繪製思維導圖、流程圖與架構圖，支援 AI 一句話生成與自動佈局，支援向量匯出。",
            "微信公眾號一鍵排版複製：將 Markdown 瞬間轉換為帶優雅內聯樣式的公眾號格式，直接貼上釋出。",
            "Mermaid 與 KaTeX 原生渲染：在筆記中流暢繪製架構圖、時序圖與數學公式，檢視切換時保留原始碼。",
            "PDF 預覽與通用附件：支援直觀預覽 PDF 檔案，並可輕鬆插入 Office、壓縮包及多媒體附件。",
          ],
        },
        {
          title: "全平臺客戶端與多端同步",
          summary: "覆蓋 macOS、Windows、iOS、Android、瀏覽器剪藏外掛與 Web/PWA，擺脫商業軟體的裝置數限制。",
          points: [
            "不限裝置登入數：自建專屬 API，徹底打碎商業筆記“免費版僅限 2 臺裝置”的枷鎖。",
            "macOS 桌面端：基於 Electron + Rust sidecar + SQLite，兼顧極致本機效能、ACP 本機協同與離線編輯同步。",
            "Windows x64：提供本機 SQLite、資源管理器右鍵“傳送到 EdgeEver”與自動更新。",
            "移動原生端：iOS 原生 SwiftUI App（已上架 App Store）與 Android App（Google Play / APK），支援撤銷重做與微信文章剪藏。",
            "全能瀏覽器剪藏：Chrome、Microsoft Edge 與 Firefox 全上架，支援網頁全文、右鍵圖片、X 推文與選中文字剪藏。",
          ],
        },
        {
          title: "資料開放、多帳號空間與無損遷移",
          summary: "基於標準 SQLite 儲存，單實例支援多帳號隔離，並提供無損 ZIP 打包歸檔與多平臺一鍵遷入。",
          points: [
            "多帳號隔離空間：單實例支援建立多個獨立成員帳號，筆記本、筆記、附件與 MCP Token 相互隔離。",
            "無損 ZIP 打包匯出：一鍵打包包含 Markdown、Front Matter、巢狀目錄及附件的完整檔案，支援跨實例還原。",
            "極簡搬家遷移：內建印象筆記（Evernote ENEX）、Memos、Notion、Flomo 等平臺的平滑遷移工具與指南。",
            "前端智慧圖片壓縮：瀏覽器端靜默壓縮大圖（精簡 50%-90% 體積），載入更輕快、儲存更省心。",
          ],
        },
      ],
    },
    guides: {
      eyebrow: "EdgeEver Guides",
      heading: "從部署、遷移到 AI Agent 玩法",
      description: "快速上手 EdgeEver 的核心路徑：自由部署專屬實例、無縫遷移舊筆記，並透過 MCP 接入 AI 助手構建第二大腦。",
      items: [
        {
          title: "選擇 EdgeEver 部署方式",
          summary: "讓 AI Agent 輔助或手動完成 Cloudflare 部署，也可使用單行指令碼在 VPS/NAS 上 Docker 自託管。",
          href: "/blog/ai-agent-deploy-cloudflare",
          cta: "檢視部署指南",
        },
        {
          title: "從印象筆記遷移",
          summary: "透過 EdgeEver MCP、evernote-backup 和 ENEX 匯入指令碼，把舊筆記庫遷移到自託管實例。",
          href: "/blog/evernote-migration-guide",
          cta: "檢視遷移指南",
        },
        {
          title: "AI Agent 進階玩法",
          summary: "用 MCP 讀取真實筆記，生成知識地圖、標籤建議和個人資料整理工作流。",
          href: "/guides/advanced-play",
          cta: "檢視玩法",
        },
      ],
    },
  },
  "en-US": {
    layout: {
      defaultDescription:
        "EdgeEver is an open-source, AI-native knowledge base and modern notes workspace. Enjoy a classic three-pane productivity workflow (Tree View · Note List · Editor) across macOS, Windows, Linux, iOS, Android, and Web Clipper, with native ACP local agent synergy, companion sidebar, and visual diagram notes, running within Cloudflare's free tier or on Docker.",
      defaultTitle: `EdgeEver - ${siteTaglines["en-US"]}`,
      imageAlt: "EdgeEver notes app screenshot",
      ogLocale: "en_US",
    },
    nav: {
      homeAria: "EdgeEver home",
      features: "Features",
      guides: "Guides",
      deploy: "Deploy",
      cloudflareDeploy: "Cloudflare",
      dockerDeploy: "Docker",
      selfHostedAlternative: "Evernote alternative",
      migration: "Migrate from Evernote",
      evernoteMigration: "Migrate from Evernote",
      memosMigration: "Migrate from Memos",
      notionMigration: "Migrate from Notion",
      flomoMigration: "Migrate from Flomo",
      advancedPlay: "AI Agent plays",
      blog: "Blog",
      backToBlog: "Back to blog",
      contact: "Contact",
      privacy: "Privacy",
      demo: "Demo",
      language: "Language",
      languageMenu: "Change language",
      tagAll: "All",
      tagMigration: "Migration",
      tagMcp: "AI & MCP",
      tagSelfHosted: "Deployment",
      openSource: "Open Source",
    },
    hero: {
      slogan: siteTaglines["en-US"],
      popHighlight: "Classic Three-Pane AI Workspace · Native AI Synergy · Multi-Platform Apps",
      demo: "Live demo",
      agentInstall: "Deploy with AI",
      getApps: "Get Apps:",
      clipper: "Clipper",
      windows: "Windows",
      linux: "Linux",
      imageAlt: "EdgeEver product preview",
      badgeText: "💡 All Platforms: macOS, Windows, Linux, iOS, Android, Web Clipper · Native MCP & ACP Synergy · Cloudflare Free Tier & Docker",
    },
    bento: {
      eyebrow: "WHY EDGEEVER",
      heading: "Rebuilt for Self-Hosted Knowledge & AI Workflows",
      subheading: "Say goodbye to ads, device caps, and expensive subscriptions. Every detail is crafted for a fast, open, and private second brain.",
      card1: {
        badge: "Classic UI",
        title: "Classic Three-Pane Layout, Faster & Lighter",
        desc: "Preserves the classic three-pane productivity workflow (Tree View · Note List · Editor). Switch freely between rich text and Markdown source, with unlimited nesting depth, focus mode, and light/dark custom CSS presets.",
        subBadge: "Dual View / Focus Mode / Custom CSS",
        treeTitle: "Notebooks",
        folder1: "01_Work_Inbox",
        folder2: "02_Ideas_Drafts",
        folder3: "03_Archive_Notes",
        folder4: "↳ 2026_Reading",
        listTitle: "Notes (18)",
        note1Title: "EdgeEver Architecture",
        note1Sub: "Cloudflare Workers / Docker & SQLite...",
        note2Title: "Local ACP Agent Connection",
        note2Sub: "Codex / Antigravity local synergy...",
        editorTitle: "EdgeEver Architecture",
        editorBody: "EdgeEver combines the classic 3-pane layout with AI Agent synergy and flexible deployment options.",
        editorSaveTag: "Auto-saved to SQLite",
      },
      card2: {
        badge: "AI Native",
        title: "Companion Sidebar & Local ACP Synergy",
        desc: "The persistent companion sidebar supports multi-chat threads and instant text selection actions. Desktop connects directly to local coding agents via ACP (Codex, Antigravity, Claude Code, WorkBuddy), while Remote MCP allows external agents to read and organize notes.",
        subBadge: "ACP + Remote MCP",
        mockupStatus: "ACP Local Agent & Sidebar Ready",
        mockupCmd: "> Analyze selected text & expand mind map",
        mockupResult: "Core insights extracted. Structured mind map branches created in the note.",
      },
      card3: {
        badge: "Flexible Deploy",
        title: "Cloudflare Free Tier, or 1-Line Docker Deploy",
        desc: "Personal use typically fits within Cloudflare's free tier (about 150k notes & 50k images), or deploy with Docker on your VPS, NAS, or private server and scale storage as needed.",
        subBadge: "Cloudflare Native / Docker",
        price: "$0",
        unit: "/ mo",
        sub: "Within Cloudflare's Free Tier",
        metric: "150,000+",
        metricSub: "Free Note Capacity (Scalable with Docker)",
      },
      card4: {
        badge: "Creator Tools",
        title: "Visual Diagram Notes & One-Click Styled Copy",
        desc: "Create native mind maps, flowcharts, and architecture diagrams directly in notes with one-prompt AI generation and auto-layout. One-click Markdown conversion to styled HTML for Substack, Medium, or WeChat, plus native Mermaid & LaTeX.",
        subBadge: "Diagrams / Flowcharts / Styled Copy",
        srcTag: "Visual Diagrams / Styled Copy",
        actionBtn: "Generate & Copy",
        previewTitle: "# Mind Maps, Flowcharts & Styled Copy",
        previewBody: "Structured diagrams sync across devices with vector export; rich text pastes cleanly into Substack or newsletter editors.",
      },
      card5: {
        badge: "Data Sovereignty",
        title: "Apps Across Platforms & Lossless ZIP Backup",
        desc: "Available on macOS, Windows, Linux, native iOS (SwiftUI), Android, and full-featured Web Clipper. Lossless ZIP export and standard SQLite ensure total ownership.",
        subBadge: "Multi-Platform + ZIP",
        archiveTitle: "edgeever-backup.zip",
        archiveSub: "Markdown + Attachments + Revision History",
      },
    },
    marquee: {
      title: "Apps Across Platforms, Flexible Deploy & AI Synergy",
      subtitle: "From macOS, native iOS & Android apps to Docker self-hosting, styled creator copying, and Remote MCP collaboration.",
      items: [
        {
          tag: "macOS Desktop",
          title: "Electron + Rust + SQLite",
          desc: "Local SQLite mirror with ACP local agent support, focus mode & instant offline capture",
          icon: "bx:bxl-apple",
          color: "from-emerald-500/10 to-teal-500/5",
        },
        {
          tag: "iOS Native App",
          title: "Native SwiftUI Architecture",
          desc: "Published on App Store with share-sheet clipping, undo/redo & offline SQLite sync",
          icon: "bx:bx-mobile",
          color: "from-teal-500/10 to-emerald-500/5",
        },
        {
          tag: "Android App",
          title: "Google Play & Signed APK",
          desc: "Available on Google Play with offline editing, undo/redo & share-sheet clipping",
          icon: "bx:bxl-android",
          color: "from-green-500/10 to-emerald-500/5",
        },
        {
          tag: "Web Clipper",
          title: "Chrome, Edge & Firefox",
          desc: "Published on all stores: clip full pages, right-click images, X posts & selections",
          icon: "bx:bx-extension",
          color: "from-emerald-600/10 to-green-500/5",
        },
        {
          tag: "Visual Diagrams",
          title: "Mind Maps, Flowcharts & Architectures",
          desc: "Native diagramming in notes with auto-layout, 1-prompt AI generation & vector export",
          icon: "bx:bx-sitemap",
          color: "from-teal-500/10 to-emerald-500/5",
        },
        {
          tag: "Local ACP Synergy",
          title: "Direct Local Agent Connection",
          desc: "Desktop connects directly via ACP to Codex, Antigravity, Claude Code, WorkBuddy, DeepSeek",
          icon: "bx:bxs-bot",
          color: "from-green-500/10 to-emerald-500/5",
        },
        {
          tag: "Companion Sidebar",
          title: "Persistent Sidebar & Text Selection Actions",
          desc: "Multi-chat switching with instant explain, translate, proofread & rewrite for selections",
          icon: "bx:bxs-brain",
          color: "from-emerald-500/10 to-teal-500/5",
        },
        {
          tag: "Docker Deploy",
          title: "VPS & NAS 1-Line Install",
          desc: "Fast curl deployment with scalable storage, supporting local disks and S3 buckets",
          icon: "bx:bxl-docker",
          color: "from-teal-600/10 to-emerald-600/5",
        },
        {
          tag: "Creator Styling",
          title: "Styled Copy & Custom Note CSS",
          desc: "One-click styled copy for newsletters; customize font size, line height & light/dark CSS",
          icon: "bx:bx-copy",
          color: "from-emerald-500/10 to-teal-500/5",
        },
        {
          tag: "Data Sovereignty",
          title: "Lossless ZIP Archive",
          desc: "Standard SQLite with lossless export of Markdown, attachments & revision history",
          icon: "bx:bx-archive",
          color: "from-green-600/10 to-teal-500/5",
        },
      ],
    },
    features: {
      heading: "A personal notes workspace rebuilt for self-hosting",
      items: [
        {
          title: "Flexible Deployment: Cloudflare Serverless & Docker",
          summary: "The same modern application runs seamlessly on Cloudflare Serverless or on a VPS, NAS, or home server via Docker.",
          points: [
            "Cloudflare Free-Tier Self-Hosting: No VPS rental or SSL certificates required. Personal use typically supports about 150k notes and 50k images.",
            "1-Line Docker Deployment: Quick deployment with a single curl command, scaling easily to millions of notes and large files.",
            "Complete Data Privacy: Regardless of deployment method, all your data lives strictly within your own account or private hardware.",
          ],
        },
        {
          title: "Dual AI Synergy: Companion Sidebar, Local ACP Agents & Remote MCP",
          summary: "Built-in REST API, Remote MCP endpoint, and desktop ACP protocol turn AI into a true copilot for your knowledge base.",
          points: [
            "Desktop ACP Local Agent Connection: Connect directly to local agents such as Codex, Antigravity, Claude Code, WorkBuddy, DeepSeek Harness with zero latency.",
            "Persistent AI Companion Sidebar: Switch between multiple chat threads and instantly explain, translate, proofread, and polish selected text.",
            "Built-in Remote MCP Endpoint: Authorize external AI assistants to safely read, create, and organize notes across your workflows.",
            "Connect Your Own AI Models: Support for OpenAI, Anthropic Claude, Google Gemini, DeepSeek, and custom compatible endpoints.",
          ],
        },
        {
          title: "Classic Three-Pane Workflow, Focus Mode & Appearance",
          summary: "Preserves the classic three-pane productivity workflow (Tree View · Note List · Editor) while supporting rich text, Markdown source, and custom appearance presets.",
          points: [
            "Unlimited nested notebooks for long-term personal knowledge bases.",
            "Full-screen focus mode on desktop, drag-and-drop notebook reordering, and multi-note batch move or merge.",
            "Independent font size, line height, and palette settings with light/dark custom CSS presets and side-by-side preview.",
          ],
        },
        {
          title: "Visual Diagram Notes & Creator Tools",
          summary: "Native mind maps, flowcharts, and architecture diagrams inside notes, combined with styled rich copy, Mermaid, and math formulas.",
          points: [
            "Visual Diagram Notes: Create mind maps, flowcharts, and architecture diagrams natively with one-prompt AI generation and vector export.",
            "One-Click Styled Copy: Instantly converts Markdown into styled HTML with inline CSS for Substack, Medium, or newsletters.",
            "Native Mermaid & KaTeX: Render architecture diagrams, flowcharts, and mathematical equations with editable source code.",
            "PDF Preview & Universal Attachments: Preview PDF documents inline, and attach Office files, archives, and multimedia easily.",
          ],
        },
        {
          title: "Apps Across Platforms & Multi-Device Sync",
          summary: "Available across macOS, Windows, iOS, Android, browser Web Clipper, and Web/PWA, freeing you from commercial device caps.",
          points: [
            "Unlimited Devices: Self-hosted API eliminates commercial restrictions like the '2-device login limit'.",
            "macOS Desktop App: Electron + Rust sidecar + SQLite for blazing fast local performance, ACP synergy, and offline sync.",
            "Windows x64: Local SQLite, Explorer right-click 'Send to EdgeEver', and automatic updates.",
            "Mobile Native Apps: Native SwiftUI iOS App (on App Store) and Android App (on Google Play & GitHub APK) with undo/redo and WeChat clipping.",
            "Web Clipper Extension: Official extensions on Chrome, Edge, and Firefox for full articles, right-click images, X posts, and selections.",
          ],
        },
        {
          title: "Open Data, Multi-Account Isolation & Lossless Migration",
          summary: "Standard SQLite storage, multi-account isolation per instance, lossless ZIP archives, and easy migration tools.",
          points: [
            "Multi-Account Workspaces: Single instance supports multiple isolated user spaces for family or small teams.",
            "Lossless ZIP Backup: One-click export including Markdown, Front Matter, nested notebooks, attachments, and revision history.",
            "Seamless Migration: Built-in migration scripts and guides for Evernote (ENEX), Memos, Notion, and Flomo.",
            "Client-Side Image Compression: Compresses images before upload (50%-90% size reduction) for faster loading and storage savings.",
          ],
        },
      ],
    },
    guides: {
      eyebrow: "EdgeEver Guides",
      heading: "Deploy, migrate, and put AI agents to work",
      description: "The fastest paths into EdgeEver: deploy your own instance, move an existing Evernote archive, then connect MCP-powered AI workflows.",
      items: [
        {
          title: "Choose how to deploy EdgeEver",
          summary: "Use an AI Agent or manual setup for Cloudflare, or run a one-line Docker installer on a VPS or NAS.",
          href: "/blog/ai-agent-deploy-cloudflare",
          cta: "Read deployment guide",
        },
        {
          title: "Migrate from Evernote",
          summary: "Use EdgeEver MCP, evernote-backup, and the ENEX import script to migrate an old notes library into your self-hosted instance.",
          href: "/blog/evernote-migration-guide",
          cta: "Read migration guide",
        },
        {
          title: "AI Agent advanced play",
          summary: "Turn real notes into knowledge maps, tag cleanup plans, and higher-level personal knowledge workflows through MCP.",
          href: "/guides/advanced-play",
          cta: "Explore workflows",
        },
      ],
    },
  },
  ja: jaSiteCopy,
  pl: plSiteCopy,
} as const;
