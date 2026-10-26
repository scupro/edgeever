export const alternativePageCopy = {
  "zh-TW": {
    eyebrow: "自託管筆記",
    title: "自託管印象筆記替代方案：Cloudflare 或 Docker",
    description:
      "EdgeEver 是開源、原生支援 AI 的自託管筆記工作區。保留印象筆記式三欄佈局，可在 Cloudflare 免費額度內執行，或用同一套應用在 VPS、NAS、家庭伺服器上 Docker 部署。",
    lead: [
      "EdgeEver 面向長期使用印象筆記、只想要一個可靠、開放、可自己部署的個人知識庫的人。整棧開源，資料在你控制的 SQLite 裡，並提供 REST API、MCP 與 ENEX 遷移路徑。",
      "它不是又一個時間流動的碎片筆記，也不是本地 Markdown 倉庫。互動上接近經典三欄：筆記本樹、筆記列表、編輯區。",
    ],
    fitTitle: "適合誰",
    fit: [
      "習慣印象筆記三欄，而不是時間流動或純檔案倉庫。",
      "希望自託管，不想再為筆記 SaaS 和裝置數量付費。",
      "希望用 Cloudflare 免費額度，或一行命令在 VPS / NAS 上跑 Docker。",
      "希望把筆記交給 Claude Code、Codex、WorkBuddy 等 Agent，透過原生 MCP 與桌面端 ACP 協同讀寫。",
    ],
    notFitTitle: "不適合誰",
    notFit: [
      "如果預設需要 Joplin 那種端到端加密，EdgeEver 並不以 E2EE 為賣點；安全邊界是「實例由你託管」。",
      "如果需要 Notion 式資料庫和塊工作區，請繼續用 Notion 或同類工具。EdgeEver 是筆記工作區。",
      "如果只要本地資料夾、完全不要服務端，Obsidian 或純 Markdown 目錄可能更合適。",
    ],
    compareTitle: "和常見方案差在哪",
    compareIntro:
      "Joplin 是英文社群最常見的自託管印象筆記替代。EdgeEver 更接近經典三欄，並同時提供 Cloudflare 免費額度和 Docker。下表只寫倉庫和公開文件裡能核對的事實，不比較「誰全面更好」。",
    compareHeaders: ["", "託管", "佈局", "客戶端", "印象筆記匯入"],
    compareRows: [
      ["EdgeEver", "Cloudflare 免費額度或 Docker", "三欄筆記本", "macOS / Windows / Linux / iOS / Android / 剪藏", "已文件化的 ENEX + MCP 流程"],
      ["印象筆記", "廠商雲，不可自託管", "三欄筆記本", "全平臺", "—"],
      ["Joplin", "Joplin Server 或自選同步", "筆記本", "官方多端", "支援 ENEX"],
      ["Obsidian", "本地檔案；官方同步收費", "檔案倉庫", "全平臺", "社群方案"],
      ["Memos", "可自託管", "時間流動卡片", "偏 Web", "不是同一條遷移路徑"],
    ],
    pathsTitle: "接下來怎麼做",
    paths: [
      {
        title: "Cloudflare 自託管",
        summary: "推薦給不想維護伺服器的個人使用者。個人規模大約可放 15 萬條短筆記和 5 萬張圖片。",
        href: "/blog/ai-agent-deploy-cloudflare",
        cta: "查看 Cloudflare 部署",
      },
      {
        title: "Docker 自託管",
        summary: "同一套應用，用一行命令裝到 VPS、NAS 或家庭伺服器，儲存可按需擴充套件。",
        href: "/docker-deploy",
        cta: "查看 Docker 部署",
      },
      {
        title: "從印象筆記遷移",
        summary: "用 ENEX、evernote-backup 和 EdgeEver MCP 遷移筆記本樹、附件與時間戳。",
        href: "/blog/evernote-migration-guide",
        cta: "檢視遷移指南",
      },
      {
        title: "從 Notion 遷移",
        summary: "透過 Notion MCP 與 EdgeEver MCP，讓 AI 助手做雲對雲匯入。",
        href: "/blog/notion-migration-guide",
        cta: "檢視 Notion 遷移",
      },
    ],
    faqTitle: "常見問題",
    faqs: [
      {
        question: "什麼是自託管印象筆記替代方案？",
        answer:
          "指你可以自己部署、資料留在自己賬號或硬體上的筆記應用，互動上接近印象筆記的筆記本和三欄工作區。EdgeEver 按這個目標來做，並補上開源、MCP 與 Cloudflare / Docker 部署。",
      },
      {
        question: "可以用 Docker 跑嗎？",
        answer:
          "可以。官方提供一行安裝指令碼和完整 Docker 指南，支援 amd64 / arm64，以及本地儲存或 S3 相容物件儲存。Cloudflare 與 Docker 跑的是同一套應用。",
      },
      {
        question: "能匯入印象筆記嗎？",
        answer:
          "可以。文件化的流程使用 ENEX、evernote-backup 和 MCP 匯入指令碼，保留建立/修改時間與巢狀筆記本。匯入後請抽查帶圖片的筆記。",
      },
      {
        question: "Cloudflare 個人使用真的免費嗎？",
        answer:
          "可以執行在 Cloudflare 免費額度內，無需另買伺服器。額度會隨 Cloudflare 政策變化；超出後再升級或改用 Docker。",
      },
      {
        question: "有 iOS 和 Android 客戶端嗎？",
        answer:
          "有。Android 在 Google Play，iOS 在 App Store。iOS 目前需要非中國大陸 Apple ID。另有 Chrome / Edge / Firefox 剪藏擴充套件。",
      },
      {
        question: "EdgeEver 和印象筆記是什麼關係？",
        answer:
          "沒有關聯、沒有贊助。EdgeEver 只是開源替代方案，遷移指南只處理使用者自己擁有的資料。印象筆記和 Evernote 是其權利人的商標。",
      },
    ],
  },
  "en-US": {
    eyebrow: "Self-hosted notes",
    title: "A self-hosted Evernote alternative with Docker and Cloudflare",
    description:
      "EdgeEver is an open-source, AI-native notes workspace with the classic Evernote three-pane layout. Run it on Cloudflare's free tier, or install the same app with Docker on a VPS, NAS, or home server.",
    lead: [
      "EdgeEver is for people who still want a reliable, open, self-hosted personal knowledge base. The stack is open source. Notes live in SQLite you control, with a REST API, MCP, and a documented Evernote ENEX migration path.",
      "It is not a social timeline and not a folder of local Markdown files. The workspace stays close to classic Evernote: notebook tree, note list, editor.",
    ],
    fitTitle: "Who it is for",
    fit: [
      "You want Evernote-style notebooks, not a timeline or a file vault.",
      "You want to self-host instead of paying a notes SaaS or hitting device caps.",
      "You want Cloudflare's free tier, or a one-line Docker install on a VPS or NAS.",
      "You want coding agents such as Claude Code, Codex, or WorkBuddy to read and organize notes through native MCP & ACP.",
    ],
    notFitTitle: "Who it is not for",
    notFit: [
      "If you need default end-to-end encryption like Joplin, EdgeEver does not advertise E2EE. The boundary is that you host the instance.",
      "If you need Notion-style databases and block workspaces, stay on Notion or a Notion-like app. EdgeEver is a notes workspace.",
      "If you only want local files and no server, Obsidian or a Markdown folder may fit better.",
    ],
    compareTitle: "How it differs from common options",
    compareIntro:
      "Joplin is the usual self-hosted Evernote alternative in English search results. EdgeEver is closer to the classic three-pane notes app, and it ships both Cloudflare free-tier hosting and Docker. The table only records facts that can be checked in this repository or in those products' public docs. It is not a ranking of which tool is better overall.",
    compareHeaders: ["", "Hosting", "Layout", "Clients", "Evernote import"],
    compareRows: [
      ["EdgeEver", "Cloudflare free tier or Docker", "Three-pane notebooks", "macOS / Windows / Linux / iOS / Android / clipper", "Documented ENEX + MCP flow"],
      ["Evernote", "Vendor cloud, not self-hosted", "Three-pane notebooks", "All major platforms", "—"],
      ["Joplin", "Joplin Server or your sync target", "Notebooks", "Official apps", "ENEX supported"],
      ["Obsidian", "Local files; official sync is paid", "File vault", "All major platforms", "Community tools"],
      ["Memos", "Self-hostable", "Timeline cards", "Web-first", "Not this migration path"],
    ],
    pathsTitle: "What to do next",
    paths: [
      {
        title: "Self-host on Cloudflare",
        summary: "The default for personal use if you do not want to run a server. A personal library typically fits about 150,000 short notes and 50,000 images.",
        href: "/blog/ai-agent-deploy-cloudflare",
        cta: "Open the Cloudflare guide",
      },
      {
        title: "Self-host with Docker",
        summary: "The same application, installed with one command on a VPS, NAS, or home server. Storage scales with your disk or S3-compatible bucket.",
        href: "/docker-deploy",
        cta: "Open the Docker guide",
      },
      {
        title: "Migrate from Evernote",
        summary: "Use ENEX, evernote-backup, and EdgeEver MCP to keep notebook hierarchy, attachments, and timestamps.",
        href: "/blog/evernote-migration-guide",
        cta: "Open the Evernote guide",
      },
      {
        title: "Migrate from Notion",
        summary: "Use Notion MCP together with EdgeEver MCP and let an AI assistant copy pages across.",
        href: "/blog/notion-migration-guide",
        cta: "Open the Notion guide",
      },
    ],
    faqTitle: "FAQ",
    faqs: [
      {
        question: "What is a self-hosted Evernote alternative?",
        answer:
          "A notes app you deploy yourself, with data in your account or on your hardware, and a workflow close to Evernote notebooks and the three-pane workspace. EdgeEver is built for that, plus open source, MCP, and Cloudflare or Docker hosting.",
      },
      {
        question: "Can I run it with Docker?",
        answer:
          "Yes. There is a one-line installer and a full Docker guide for amd64 and arm64, with local files or S3-compatible object storage. Cloudflare and Docker run the same application.",
      },
      {
        question: "Can I import Evernote notes?",
        answer:
          "Yes. The documented flow uses ENEX, evernote-backup, and an MCP import script. It preserves created/updated timestamps and nested notebooks. Spot-check notes with images after import.",
      },
      {
        question: "Is Cloudflare actually free for personal use?",
        answer:
          "A personal deployment can run within Cloudflare's free quotas, with no extra server to rent. Quotas follow Cloudflare's current limits; move to a paid plan or Docker if you outgrow them.",
      },
      {
        question: "Are there iOS and Android apps?",
        answer:
          "Yes. Android is on Google Play and iOS is on the App Store. The iOS app currently requires an Apple ID from outside mainland China. Web Clipper extensions are on Chrome, Edge, and Firefox.",
      },
      {
        question: "Is EdgeEver affiliated with Evernote?",
        answer:
          "No. EdgeEver is an independent open-source alternative. Migration guides only cover data you already own. Evernote is a trademark of its respective owner.",
      },
    ],
  },
  ja: {
    eyebrow: "セルフホストのノート",
    title: "Docker と Cloudflare で動く、セルフホストの Evernote 代替",
    description:
      "EdgeEver はオープンソースで AI ネイティブなノート作業領域です。Evernote の三ペインを残し、Cloudflare 無料枠か、VPS / NAS / 自宅サーバーの Docker で同じアプリを動かせます。",
    lead: [
      "長く Evernote を使い、信頼できて開かれていて、自分で置ける個人知識ベースが欲しい人向けです。スタックはオープンソース。ノートは自分で制御する SQLite にあり、REST API、MCP、文書化された ENEX 移行があります。",
      "タイムライン型の断片ノートでも、ローカル Markdown フォルダでもありません。ノートブックツリー、ノート一覧、編集エリアという古典的な三ペインです。",
    ],
    fitTitle: "向いている人",
    fit: [
      "タイムラインやファイル倉庫ではなく、Evernote 型のノートブックが欲しい。",
      "ノート SaaS や端末数の課金をやめ、自分でホストしたい。",
      "Cloudflare 無料枠か、VPS / NAS への Docker 一行インストールが欲しい。",
      "Claude Code や Codex、WorkBuddy などの Agent に、ネイティブ MCP や ACP でノートを連携させたい。",
    ],
    notFitTitle: "向いていない人",
    notFit: [
      "Joplin のような既定のエンドツーエンド暗号が必要なら、EdgeEver は E2EE を売りにしていません。境界は「インスタンスを自分でホストする」ことです。",
      "Notion 型のデータベースとブロック作業領域が必要なら、Notion か同類を続けてください。EdgeEver はノート作業領域です。",
      "サーバーなしのローカルフォルダだけでよければ、Obsidian や Markdown ディレクトリの方が合うことがあります。",
    ],
    compareTitle: "よくある選択肢との違い",
    compareIntro:
      "英語圏の検索では Joplin が定番の自前 Evernote 代替です。EdgeEver は古典的な三ペインに近く、Cloudflare 無料枠と Docker の両方を出しています。表はリポジトリと公開ドキュメントで確認できる事実だけです。総合ランキングではありません。",
    compareHeaders: ["", "ホスト", "レイアウト", "クライアント", "Evernote 取り込み"],
    compareRows: [
      ["EdgeEver", "Cloudflare 無料枠または Docker", "三ペインのノートブック", "macOS / Windows / Linux / iOS / Android / Clipper", "文書化された ENEX + MCP"],
      ["Evernote", "ベンダークラウド、自前不可", "三ペインのノートブック", "主要プラットフォーム", "—"],
      ["Joplin", "Joplin Server または任意の同期", "ノートブック", "公式マルチ端", "ENEX 対応"],
      ["Obsidian", "ローカルファイル。公式同期は有料", "ファイル倉庫", "主要プラットフォーム", "コミュニティ手段"],
      ["Memos", "自前運用可", "タイムラインのカード", "Web 中心", "同じ移行経路ではない"],
    ],
    pathsTitle: "次にすること",
    paths: [
      {
        title: "Cloudflare で自前運用",
        summary: "サーバーを持ちたくない個人向け。個人規模なら短いノート約 15 万、画像約 5 万が目安。",
        href: "/blog/ai-agent-deploy-cloudflare",
        cta: "Cloudflare 導入を見る",
      },
      {
        title: "Docker で自前運用",
        summary: "同じアプリを、VPS、NAS、自宅サーバーへ一行で入れられます。保存先はディスクや S3 互換バケットで伸ばせます。",
        href: "/docker-deploy",
        cta: "Docker 導入を見る",
      },
      {
        title: "Evernote から移行",
        summary: "ENEX、evernote-backup、EdgeEver MCP で階層、添付、タイムスタンプを残します。",
        href: "/blog/evernote-migration-guide",
        cta: "Evernote ガイドを見る",
      },
      {
        title: "Notion から移行",
        summary: "Notion MCP と EdgeEver MCP を使い、AI アシスタントにページを渡します。",
        href: "/blog/notion-migration-guide",
        cta: "Notion ガイドを見る",
      },
    ],
    faqTitle: "よくある質問",
    faqs: [
      {
        question: "セルフホストの Evernote 代替とは何ですか？",
        answer:
          "自分で導入し、データは自分のアカウントか機材に置き、Evernote のノートブックと三ペインに近い作業領域を持つノートアプリです。EdgeEver はそのために作り、オープンソース、MCP、Cloudflare / Docker を足しています。",
      },
      {
        question: "Docker で動かせますか？",
        answer:
          "できます。一行インストーラと、amd64 / arm64、ローカル保存または S3 互換オブジェクトストレージの Docker ガイドがあります。Cloudflare と Docker は同じアプリです。",
      },
      {
        question: "Evernote を取り込めますか？",
        answer:
          "できます。文書化された流れは ENEX、evernote-backup、MCP 取り込みスクリプトです。作成・更新時刻と入れ子ノートブックを残します。画像付きノートは取り込み後に抜き取り確認してください。",
      },
      {
        question: "Cloudflare の個人利用は本当に無料ですか？",
        answer:
          "Cloudflare の無料枠内で動かせ、サーバーを別途借りる必要はありません。枠は Cloudflare の方針に従います。足りなくなったら有料プランか Docker へ移せます。",
      },
      {
        question: "iOS と Android アプリはありますか？",
        answer:
          "あります。Android は Google Play、iOS は App Store です。iOS は現時点で中国本土以外の Apple ID が必要です。Chrome / Edge / Firefox の Clipper もあります。",
      },
      {
        question: "EdgeEver と Evernote の関係は？",
        answer:
          "提携も後援もありません。EdgeEver は独立したオープンソースの代替です。移行ガイドは、すでに自分で持っているデータだけを扱います。Evernote は権利者の商標です。",
      },
    ],
  },
  pl: {
    eyebrow: "Samodzielnie hostowane notatki",
    title: "Samodzielnie hostowana alternatywa dla Evernote z Dockerem i Cloudflare",
    description:
      "EdgeEver to otwartoźródłowy, natywnie wspierający AI obszar roboczy do notatek z klasycznym trzypanelowym układem Evernote. Uruchom go w darmowym planie Cloudflare albo zainstaluj tę samą aplikację w Dockerze na VPS, NAS lub domowym serwerze.",
    lead: [
      "EdgeEver jest dla osób, które wciąż chcą niezawodnej, otwartej, samodzielnie hostowanej osobistej bazy wiedzy. Cały stos jest otwartoźródłowy. Notatki są przechowywane w kontrolowanej przez Ciebie bazie SQLite, z REST API, MCP i udokumentowaną ścieżką migracji ENEX z Evernote.",
      "To nie jest społecznościowa oś czasu ani folder lokalnych plików Markdown. Obszar roboczy pozostaje bliski klasycznemu Evernote: drzewo notatników, lista notatek, edytor.",
    ],
    fitTitle: "Dla kogo",
    fit: [
      "Chcesz notatników w stylu Evernote, a nie osi czasu czy magazynu plików.",
      "Chcesz hostować samodzielnie zamiast płacić za SaaS do notatek lub trafiać na limity urządzeń.",
      "Chcesz korzystać z darmowego planu Cloudflare albo zainstalować Dockera jedną linią na VPS lub NAS.",
      "Chcesz, by agenci programistyczni, tacy jak Claude Code, Codex czy WorkBuddy, czytali i porządkowali notatki przez natywne MCP i ACP.",
    ],
    notFitTitle: "Dla kogo nie",
    notFit: [
      "Jeśli potrzebujesz domyślnego szyfrowania end-to-end jak w Joplin – EdgeEver nie reklamuje E2EE. Granicą bezpieczeństwa jest to, że sam hostujesz instancję.",
      "Jeśli potrzebujesz baz danych i bloków w stylu Notion, zostań przy Notion lub podobnej aplikacji. EdgeEver to obszar roboczy do notatek.",
      "Jeśli chcesz tylko lokalnych plików bez serwera, lepiej sprawdzi się Obsidian lub folder z plikami Markdown.",
    ],
    compareTitle: "Czym różni się od popularnych opcji",
    compareIntro:
      "W anglojęzycznych wynikach wyszukiwania typową samodzielnie hostowaną alternatywą dla Evernote jest Joplin. EdgeEver jest bliższy klasycznej trzypanelowej aplikacji do notatek i oferuje zarówno hosting w darmowym planie Cloudflare, jak i Dockera. Tabela zawiera wyłącznie fakty, które można sprawdzić w tym repozytorium lub w publicznej dokumentacji tych produktów. Nie jest to ranking, które narzędzie jest ogólnie lepsze.",
    compareHeaders: ["", "Hosting", "Układ", "Klienty", "Import z Evernote"],
    compareRows: [
      ["EdgeEver", "Darmowy plan Cloudflare lub Docker", "Notatniki w trzech panelach", "macOS / Windows / Linux / iOS / Android / Clipper", "Udokumentowany proces ENEX + MCP"],
      ["Evernote", "Chmura dostawcy, bez samodzielnego hostingu", "Notatniki w trzech panelach", "Wszystkie główne platformy", "—"],
      ["Joplin", "Joplin Server lub wybrany cel synchronizacji", "Notatniki", "Oficjalne aplikacje", "Obsługa ENEX"],
      ["Obsidian", "Pliki lokalne; oficjalna synchronizacja jest płatna", "Magazyn plików", "Wszystkie główne platformy", "Narzędzia społeczności"],
      ["Memos", "Możliwy samodzielny hosting", "Karty na osi czasu", "Głównie web", "Nie ta ścieżka migracji"],
    ],
    pathsTitle: "Co dalej",
    paths: [
      {
        title: "Samodzielny hosting w Cloudflare",
        summary: "Domyślny wybór do użytku osobistego, jeśli nie chcesz utrzymywać serwera. Osobista biblioteka zwykle mieści ok. 150 000 krótkich notatek i 50 000 obrazów.",
        href: "/blog/ai-agent-deploy-cloudflare",
        cta: "Otwórz poradnik Cloudflare",
      },
      {
        title: "Samodzielny hosting z Dockerem",
        summary: "Ta sama aplikacja instalowana jednym poleceniem na VPS, NAS lub domowym serwerze. Magazyn rośnie razem z dyskiem lub zasobnikiem zgodnym z S3.",
        href: "/docker-deploy",
        cta: "Otwórz poradnik Dockera",
      },
      {
        title: "Migracja z Evernote",
        summary: "Użyj ENEX, evernote-backup i EdgeEver MCP, aby zachować hierarchię notatników, załączniki i znaczniki czasu.",
        href: "/blog/evernote-migration-guide",
        cta: "Otwórz poradnik Evernote",
      },
      {
        title: "Migracja z Notion",
        summary: "Użyj Notion MCP razem z EdgeEver MCP i pozwól asystentowi AI skopiować strony.",
        href: "/blog/notion-migration-guide",
        cta: "Otwórz poradnik Notion",
      },
    ],
    faqTitle: "Najczęstsze pytania",
    faqs: [
      {
        question: "Czym jest samodzielnie hostowana alternatywa dla Evernote?",
        answer:
          "To aplikacja do notatek, którą wdrażasz samodzielnie, z danymi na Twoim koncie lub sprzęcie i sposobem pracy bliskim notatnikom i trzypanelowemu obszarowi roboczemu Evernote. EdgeEver powstał właśnie w tym celu, a do tego jest otwartoźródłowy, obsługuje MCP i hosting w Cloudflare lub Dockerze.",
      },
      {
        question: "Czy mogę uruchomić go w Dockerze?",
        answer:
          "Tak. Dostępny jest instalator w jednej linii i pełny poradnik Dockera dla amd64 i arm64, z plikami lokalnymi lub magazynem obiektów zgodnym z S3. Cloudflare i Docker uruchamiają tę samą aplikację.",
      },
      {
        question: "Czy mogę zaimportować notatki z Evernote?",
        answer:
          "Tak. Udokumentowany proces wykorzystuje ENEX, evernote-backup i skrypt importu MCP. Zachowuje daty utworzenia i aktualizacji oraz zagnieżdżone notatniki. Po imporcie wyrywkowo sprawdź notatki z obrazami.",
      },
      {
        question: "Czy Cloudflare naprawdę jest darmowy do użytku osobistego?",
        answer:
          "Osobiste wdrożenie może działać w ramach darmowych limitów Cloudflare, bez wynajmowania dodatkowego serwera. Limity zależą od aktualnych zasad Cloudflare; jeśli przestaną wystarczać, przejdź na płatny plan lub Dockera.",
      },
      {
        question: "Czy są aplikacje na iOS i Androida?",
        answer:
          "Tak. Aplikacja na Androida jest w Google Play, a na iOS w App Store. Aplikacja na iOS wymaga obecnie Apple ID spoza Chin kontynentalnych. Rozszerzenia Web Clipper są dostępne dla Chrome, Edge i Firefox.",
      },
      {
        question: "Czy EdgeEver jest powiązany z Evernote?",
        answer:
          "Nie. EdgeEver to niezależna, otwartoźródłowa alternatywa. Poradniki migracji dotyczą wyłącznie danych, które już do Ciebie należą. Evernote jest znakiem towarowym swojego właściciela.",
      },
    ],
  },
} as const;
