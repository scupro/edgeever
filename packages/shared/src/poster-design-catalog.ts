// Metadata shared by the browser editor and AI discovery. Layout builds remain
// in the existing Qiaomu Design implementation (MIT).
export const POSTER_DESIGN_TEMPLATES = [
  {
    "id": "minimal",
    "zh": "簡約白",
    "en": "Minimal",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "wechat",
      "x"
    ],
    "zhUse": "乾淨剋制，適合觀點、讀書、知識類",
    "enUse": "Clean and restrained; opinions, reading, knowledge",
    "available": true
  },
  {
    "id": "editorial",
    "zh": "雜誌",
    "en": "Editorial",
    "fit": [
      "wechat",
      "x",
      "xhs",
      "xhs-square",
      "portrait",
      "square"
    ],
    "zhUse": "襯線大標題 + 細線，有質感，適合深度內容與公眾號",
    "enUse": "Serif headline with rules; essays and articles",
    "available": false
  },
  {
    "id": "bold",
    "zh": "醒目黃",
    "en": "Loud yellow",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide",
      "vertical"
    ],
    "zhUse": "高飽和純色 + 黑字，資訊流裡最搶眼",
    "enUse": "Saturated flat colour with black type; stops the scroll",
    "available": true
  },
  {
    "id": "dark",
    "zh": "深色科技",
    "en": "Dark tech",
    "fit": [
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide",
      "wechat",
      "x",
      "xhs",
      "xhs-square",
      "portrait",
      "square"
    ],
    "zhUse": "深底熒光點綴，適合 AI、程式設計、效率工具",
    "enUse": "Dark with a neon glow; AI, code, tools",
    "available": false
  },
  {
    "id": "poster",
    "zh": "大字報",
    "en": "Poster",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "vertical"
    ],
    "zhUse": "滿屏居中大字，情緒強，適合金句、避坑、警告",
    "enUse": "Full-bleed centred type; punchy statements",
    "available": true
  },
  {
    "id": "split",
    "zh": "左文右圖",
    "en": "Arch split",
    "fit": [
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide",
      "wechat",
      "x",
      "xhs",
      "xhs-square",
      "portrait",
      "square"
    ],
    "zhUse": "左文案右拱門：奶油底 + 橙色拱門窗 + 太陽圓 + 細線，右側放人像或產品最好看",
    "enUse": "Copy on the left, an orange arch window on the right for a portrait or product; cream paper, a sun disc and fine rules",
    "available": true
  },
  {
    "id": "sticker",
    "zh": "便籤",
    "en": "Sticky note",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square"
    ],
    "zhUse": "粉底便籤紙，生活感，適合種草、日常、分享",
    "enUse": "Pink backdrop, paper note; lifestyle posts",
    "available": false
  },
  {
    "id": "gradient",
    "zh": "漸變光感",
    "en": "Soft gradient",
    "fit": [
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide",
      "wechat",
      "x",
      "xhs",
      "xhs-square",
      "portrait",
      "square"
    ],
    "zhUse": "藍青漸變 + 白字，通用、穩、不出錯",
    "enUse": "Blue-cyan gradient with white type; safe and versatile",
    "available": false
  },
  {
    "id": "center",
    "zh": "居中標籤",
    "en": "Centered",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide"
    ],
    "zhUse": "細框居中，黃色高亮副標，通用百搭",
    "enUse": "Thin frame, centred, highlighted subtitle; all-purpose",
    "available": false
  },
  {
    "id": "checklist",
    "zh": "清單筆記",
    "en": "Checklist",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square"
    ],
    "zhUse": "標題 + 3~4 條要點，資訊密度高，小紅書乾貨首選",
    "enUse": "Headline plus 3–4 points; dense and useful",
    "available": false
  },
  {
    "id": "number",
    "zh": "數字乾貨",
    "en": "Big number",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "vertical",
      "youtube",
      "bilibili",
      "bilibili-43"
    ],
    "zhUse": "超大數字做鉤子（7 個技巧 / 3 步），點選率高的榜單體",
    "enUse": "A huge numeral as the hook; listicles",
    "available": true
  },
  {
    "id": "impact",
    "zh": "油管衝擊",
    "en": "Thumbnail punch",
    "fit": [
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide",
      "vertical"
    ],
    "zhUse": "深藍放射光 + 黃字黑描邊硬陰影 + 紅色角標，右側留主體位；短標題效果最好",
    "enUse": "Blue sunburst, yellow type with a black outline and hard shadow, a red arrow and burst badge; room for a subject on the right",
    "photo": true,
    "available": false
  },
  {
    "id": "compare",
    "zh": "對比",
    "en": "Versus",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide"
    ],
    "zhUse": "斜切分屏：左邊黯淡的“之前”，右邊鮮亮的“之後”，中間一枚 VS；副標題寫成「A | B」",
    "enUse": "A slanted split: dull “before” against vivid “after” with a VS burst; write the subtitle as “A | B”",
    "available": false
  },
  {
    "id": "neo",
    "zh": "新粗野",
    "en": "Neo-brutal",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide",
      "vertical"
    ],
    "zhUse": "黑粗框 + 硬陰影 + 熒光底，年輕、有趣、辨識度高",
    "enUse": "Thick black borders, hard shadows, bright backdrop",
    "available": true
  },
  {
    "id": "soft",
    "zh": "柔霧莫蘭迪",
    "en": "Soft haze",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "wechat",
      "x"
    ],
    "zhUse": "低飽和柔光，適合生活方式、情緒、穿搭、女性向",
    "enUse": "Muted haze; lifestyle, mood, fashion",
    "available": false
  },
  {
    "id": "swiss",
    "zh": "瑞士網格",
    "en": "Swiss grid",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "wechat",
      "x",
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide"
    ],
    "zhUse": "米白底 + 紅圓 + 極粗無襯線 + 網格細線，國際主義風格",
    "enUse": "Off-white, a red disc, ultra-bold sans and grid hairlines",
    "available": true
  },
  {
    "id": "acid",
    "zh": "酸性漸變",
    "en": "Acid mesh",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide",
      "vertical"
    ],
    "zhUse": "淺粉紫彌散光斑 + 顆粒 + 居中深紫大字 + 一枚閃光；潮流、音樂、AI 話題",
    "enUse": "Pastel mesh glows and grain, a centred deep-violet headline and one sparkle; trendy, music, AI",
    "available": true
  },
  {
    "id": "collage",
    "zh": "拼貼手賬",
    "en": "Paper collage",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "bilibili",
      "wechat"
    ],
    "zhUse": "牛皮紙 + 撕紙色塊 + 膠帶 + 貼紙，生活、手賬、種草",
    "enUse": "Kraft paper, torn colour blocks, tape and stickers; lifestyle and journaling",
    "available": true
  },
  {
    "id": "mega",
    "zh": "大字滿版",
    "en": "Mega type",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "vertical",
      "youtube"
    ],
    "zhUse": "標題放大到撐滿畫面，高飽和純色底，最強的資訊流衝擊力",
    "enUse": "The headline fills the artboard on a saturated colour; maximum scroll-stopping force",
    "available": true
  },
  {
    "id": "ticker",
    "zh": "跑馬燈",
    "en": "Ticker",
    "fit": [
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide",
      "xhs",
      "xhs-square",
      "portrait",
      "square"
    ],
    "zhUse": "奶黃底 + 斜向滾動字帶 + 硬陰影大字，B 站 / YouTube 的資訊流利器",
    "enUse": "Cream with diagonal ticker bands and hard-shadow type; built for video feeds",
    "available": false
  },
  {
    "id": "memo",
    "zh": "便籤筆記",
    "en": "Memo paper",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "wechat"
    ],
    "zhUse": "橫線筆記紙 + 紅色頁邊線 + 熒光筆劃重點，學習、筆記、乾貨",
    "enUse": "Ruled notebook paper with a margin line and a highlighter; study notes and tips",
    "available": true
  },
  {
    "id": "pop",
    "zh": "貼紙波普",
    "en": "Pop sticker",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide",
      "vertical"
    ],
    "zhUse": "明黃底 + 黑色粗標題 + 幾枚歪貼的粉、藍、綠色塊貼紙 + 白色膠囊副標題；年輕好玩，但不靠描邊、硬投影和爆炸星",
    "enUse": "Yellow, heavy black type, a few tilted pink, blue and green stickers and a white pill subtitle; playful without outlines, hard shadows or bursts",
    "available": true
  },
  {
    "id": "mag",
    "zh": "雜誌封面",
    "en": "Magazine",
    "fit": [
      "wechat",
      "x",
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "bilibili"
    ],
    "zhUse": "紙質底 + 襯線巨標題 + 巨型虛影期號 + 報頭細線，像一本真雜誌",
    "enUse": "Paper, a huge serif headline, a ghost issue numeral and masthead rules; a real magazine cover",
    "available": true
  },
  {
    "id": "print",
    "zh": "印刷海報",
    "en": "Print poster",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "wechat",
      "x",
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide"
    ],
    "zhUse": "黑 + 米白 + 一抹硃紅，裁切線、套準標、沿邊文字、條碼，歐洲字型海報的語彙",
    "enUse": "Black, paper and one vermilion; crop marks, registration target, edge text and barcode: the European typographic poster vocabulary",
    "available": true
  },
  {
    "id": "glass",
    "zh": "玻璃卡片",
    "en": "Glass card",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide",
      "wechat",
      "x"
    ],
    "zhUse": "粉藍彌散背景 + 大幅磨砂玻璃卡片 + 懸浮小膠囊，現代、產品、App 感",
    "enUse": "Pastel mesh background, a large frosted glass card and floating pills; modern, product, app",
    "available": true
  },
  {
    "id": "bento",
    "zh": "便當清單",
    "en": "Bento list",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "wechat"
    ],
    "zhUse": "深色標題卡 + 三張彩色要點卡拼成便當格，資訊密度高又好看",
    "enUse": "A dark headline card and three colour cards in a bento grid; dense and good looking",
    "available": true
  },
  {
    "id": "neon",
    "zh": "霓虹網格",
    "en": "Neon grid",
    "fit": [
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide",
      "wechat",
      "x",
      "xhs",
      "xhs-square",
      "portrait",
      "square"
    ],
    "zhUse": "深色透視網格 + 霓虹發光字 + 取景框角標，AI、程式設計、賽博",
    "enUse": "Dark perspective grid, neon glow type and viewfinder corners; AI, code, cyber",
    "available": false
  },
  {
    "id": "calm",
    "zh": "鬆弛留白",
    "en": "Calm paper",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "wechat",
      "x"
    ],
    "zhUse": "雲舞白紙 + 大號襯線標題 + 豎線與弧線 + 沿邊小字，剋制的“冷靜風”",
    "enUse": "Cloud-white paper, a large serif headline, a vertical rule, an arc and edge text; quiet and restrained",
    "available": true
  },
  {
    "id": "folio",
    "zh": "編輯大標題",
    "en": "Editorial headline",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "wechat",
      "x",
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide"
    ],
    "zhUse": "紙面編輯版式：頂部粗線 + 欄目名與期號、貼左黑體大標題、宋體導語、底部細線收邊；只有一個焦點，留白佔一半",
    "enUse": "An editorial page: a heavy top rule with section and issue, a flush-left heavy headline, a serif standfirst and a hairline foot; one focal point, half the page left empty",
    "available": true
  },
  {
    "id": "numeral",
    "zh": "單色大數字",
    "en": "Big numeral",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide",
      "wechat",
      "x"
    ],
    "zhUse": "一個巨型數字做鉤子 + 其下小標題；單一強調色，適合清單、教程、數字乾貨",
    "enUse": "One oversized numeral as the hook, a quiet headline beneath; a single accent colour for lists, tutorials and number posts",
    "available": true
  },
  {
    "id": "sage",
    "zh": "紙質卡片",
    "en": "Paper card",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "wechat",
      "x",
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide"
    ],
    "zhUse": "低飽和鼠尾草底 + 一張米白紙卡，標題落在卡片上；溫和、乾淨、有質感",
    "enUse": "A muted sage ground with one warm paper card carrying the headline; gentle, clean and tactile",
    "available": true
  },
  {
    "id": "seal",
    "zh": "書法印章",
    "en": "Ink & seal",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "wechat",
      "x",
      "vertical"
    ],
    "zhUse": "宣紙底 + 淡墨巨圓 + 大號襯線標題 + 紅印章；純中文短標題自動改豎排",
    "enUse": "Rice paper, a huge ink wash disc, a big serif headline and a red seal; short Chinese titles run vertically",
    "available": true
  },
  {
    "id": "quote",
    "zh": "金句海報",
    "en": "Quote poster",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "wechat",
      "x"
    ],
    "zhUse": "墨黑底 + 巨型金色引號 + 襯線金句，一句話撐滿一張海報",
    "enUse": "Ink black, a giant gold quotation mark and a serif statement; one line carries the poster",
    "available": false
  },
  {
    "id": "cinema",
    "zh": "電影感",
    "en": "Cinematic",
    "fit": [
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide",
      "wechat",
      "x"
    ],
    "zhUse": "青橙調光 + 鏡頭光暈 + 金色取景角 + 字距拉開的襯線片名，紀錄片、Vlog、深度內容",
    "enUse": "Teal-and-orange light, lens flare, gold viewfinder corners and a wide-tracked serif title; documentary and vlog",
    "photo": true,
    "available": false
  },
  {
    "id": "bili",
    "zh": "B 站知識區",
    "en": "Bilibili explainer",
    "fit": [
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "youtube",
      "wide",
      "vertical",
      "xhs",
      "xhs-square",
      "portrait",
      "square"
    ],
    "zhUse": "淺灰底 + B 站粉藍雙色 + 粉色分割槽標籤 + 黑色大標題 + 小電視畫框（螢幕是圖位）；知識區、科普、測評的乾淨資訊感",
    "enUse": "Light grey with Bilibili pink and blue, a section tag, a bold headline and a little-TV frame whose screen takes a picture; explainers and reviews",
    "available": true
  },
  {
    "id": "highlight",
    "zh": "熒遊標題",
    "en": "Highlighter",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide",
      "vertical",
      "wechat"
    ],
    "zhUse": "白紙黑字 + 每行標題下一道圓頭熒光筆（每行微微不同的傾斜），像在筆記上劃重點；乾貨、觀點、教程都穩",
    "enUse": "Black type on white with a round-ended highlighter stroke under every line, each at its own slight tilt; tips, opinions and tutorials",
    "available": true
  },
  {
    "id": "notes",
    "zh": "備忘錄",
    "en": "Notes app",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "wechat",
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide"
    ],
    "zhUse": "手機備忘錄截圖：黃色返回鍵 + 日期 + 黑色大標題 + 勾選清單（要點寫在 points 裡）；小紅書“截圖型”，親切可信",
    "enUse": "A phone notes screenshot: yellow back button, date, bold headline and a checklist from the points; personal and trustworthy",
    "available": true
  },
  {
    "id": "chat",
    "zh": "聊天截圖",
    "en": "Chat bubbles",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide",
      "vertical"
    ],
    "zhUse": "一問一答的聊天氣泡：副標題是提問，標題是回答；對話感強，適合問答、AI、情感、職場",
    "enUse": "A chat exchange: the subtitle asks, the headline answers; Q&A, AI, relationships and work",
    "available": true
  },
  {
    "id": "keyword",
    "zh": "一詞衝擊",
    "en": "Keyword punch",
    "fit": [
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide",
      "vertical",
      "xhs",
      "xhs-square",
      "portrait",
      "square"
    ],
    "zhUse": "縮圖式三詞標題：飽和藍底 + 超粗白字 + 一塊黃色關鍵詞標籤（副標題）+ 主體位上一枚淺色圓盤（有圖時主體站在上面）；不靠描邊和爆炸星也搶眼",
    "enUse": "A three-word thumbnail: saturated blue, heavy white type, one yellow keyword tag (the subtitle) and a pale disc where the subject stands; loud without outlines or bursts",
    "photo": true,
    "available": true
  },
  {
    "id": "riso",
    "zh": "孔版印刷",
    "en": "Risograph",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "wechat",
      "x",
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide"
    ],
    "zhUse": "再生紙 + 熒光粉與藍兩種專色疊印 + 輕微錯版 + 顆粒；獨立雜誌、展覽、文藝與潮流話題",
    "enUse": "Recycled paper, fluorescent pink and blue overprinting with slight misregistration and grain; zines, shows and culture",
    "available": true
  },
  {
    "id": "ticket",
    "zh": "票根",
    "en": "Ticket stub",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "wechat",
      "x",
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide"
    ],
    "zhUse": "一張帶缺口和齒孔的入場券：主券寫標題，存根放標籤與條碼；活動、課程、展覽、旅行",
    "enUse": "An admission ticket with notches and perforation: headline on the main part, label and barcode on the stub; events, courses, travel",
    "available": true
  },
  {
    "id": "window",
    "zh": "視窗教程",
    "en": "App window",
    "fit": [
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide",
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "wechat",
      "x"
    ],
    "zhUse": "柔和漸變底上一扇 macOS 風格視窗：紅黃綠三點 + 檔名標籤 + 視窗裡的大標題；教程、工具、程式設計、效率",
    "enUse": "A macOS-style window on a soft gradient: traffic lights, a file tab and the headline inside; tutorials, tools and code",
    "available": true
  },
  {
    "id": "newspaper",
    "zh": "報紙頭版",
    "en": "Front page",
    "fit": [
      "wechat",
      "x",
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide"
    ],
    "zhUse": "新聞紙 + 襯線報頭（標籤做報名）+ 雙線 + 期號欄 + 分欄灰條；把觀點做成“頭版頭條”，評論、深度、年度盤點",
    "enUse": "Newsprint, a serif masthead (the label), double rules, a dateline and greeked columns; opinion, analysis, annual reviews",
    "available": true
  },
  {
    "id": "polaroid",
    "zh": "拍立得",
    "en": "Polaroid",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide",
      "wechat"
    ],
    "zhUse": "一張貼著膠帶的拍立得相紙（相紙裡是圖位）+ 標籤寫在相紙下沿 + 旁邊大標題；旅行、Vlog、生活記錄",
    "enUse": "A taped instant photo (the print is a picture slot), the label on its lip and a big headline beside it; travel, vlogs, everyday life",
    "available": true
  },
  {
    "id": "stack",
    "zh": "疊字海報",
    "en": "Echo stack",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "vertical",
      "wechat",
      "x"
    ],
    "zhUse": "同一句標題上下重複、逐層變淡，中間一行是紅色實字；字型海報的節奏感，適合短標題、口號、金句",
    "enUse": "The headline repeated in fading layers around one solid red line; a rhythmic type poster for short titles and slogans",
    "available": true
  },
  {
    "id": "serial",
    "zh": "欄目頭圖",
    "en": "Column header",
    "fit": [
      "wechat",
      "x",
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide",
      "xhs",
      "xhs-square",
      "portrait",
      "square"
    ],
    "zhUse": "深綠欄目條（欄目名 + 大期號，標籤寫“週刊 12”）+ 標題；公眾號系列文章、週刊、播客的固定頭圖，轉發裁成方圖時標題仍在中間",
    "enUse": "A dark column band with the series name and a big issue number (label like “Weekly 12”) beside the headline; recurring newsletters and podcasts",
    "available": true
  },
  {
    "id": "regeng",
    "zh": "熱梗卡",
    "en": "Daily drop",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "wechat"
    ],
    "zhUse": "黑色話題條（#標籤#）+ 三層錯位描邊卡片裡的粗黑大字 + 左下“No.期號”；每日熱梗、資訊速遞、系列筆記，小紅書辨識度很高",
    "enUse": "A black hashtag bar, a heavy headline in a stack of three offset outlined cards and an issue number; daily drops, news and series notes",
    "available": true
  },
  {
    "id": "interview",
    "zh": "黑黃箭頭",
    "en": "Black & yellow",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide",
      "vertical"
    ],
    "zhUse": "黑底 + 黃色超粗標題 + 一條手繪大箭頭指向標題 + 白框英文標籤 + 角落笑臉；面試、考試、乾貨清單，強對比又不土",
    "enUse": "Black, a heavy yellow headline, one big hand-drawn arrow pointing at it, a boxed label and a corner smiley; interviews, exams and checklists",
    "available": true
  },
  {
    "id": "brush",
    "zh": "筆刷收藏",
    "en": "Brush highlight",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "wechat",
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide"
    ],
    "zhUse": "白底粗黑標題 + 最後一行壓一道綠色筆刷 + 歪貼的“建議收藏!”標籤 + 底部 ✓ 清單（points）；副業、避坑、乾貨，最像小紅書爆款筆記",
    "enUse": "Heavy black type on white, a green brush stroke under the last line, a tilted “save this” tag and a check row from the points; tips and side hustles",
    "available": true
  },
  {
    "id": "calendar",
    "zh": "日曆頁",
    "en": "Calendar page",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "wechat",
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide"
    ],
    "zhUse": "純藍底 + 一張帶裝訂環的白色日曆頁 + 頁裡的粗黑大字；每日一句、打卡、待辦、節日，乾淨有儀式感",
    "enUse": "Flat blue with a white calendar page and binding rings, a heavy headline on the page; daily lines, check-ins and to-dos",
    "available": true
  },
  {
    "id": "frame",
    "zh": "框線大字",
    "en": "Framed type",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "wechat",
      "x",
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide"
    ],
    "zhUse": "純色底 + 一圈細內框 + 撐滿框的超大標題 + 一角出血的太陽圓；招聘、開學、通知、活動，最簡單也最醒目",
    "enUse": "Flat colour, a thin inset frame, a headline that fills it and a sun disc bleeding off a corner; hiring, launches and notices",
    "available": true
  },
  {
    "id": "kicker",
    "zh": "粗細引題",
    "en": "Kicker headline",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "wechat",
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide"
    ],
    "zhUse": "淺灰底：副標題當細字引題寫在上面，標題粗黑放大 + 雙線膠囊標籤 + 底部“右滑檢視 ››››”；經驗、問答、職場，資訊感強",
    "enUse": "Light grey: the subtitle as a thin kicker above a heavy headline, a double-ring pill tag and a “swipe” cue; experience posts, Q&A, work",
    "available": true
  },
  {
    "id": "corner",
    "zh": "斜角色塊",
    "en": "Corner wedge",
    "fit": [
      "xhs",
      "xhs-square",
      "portrait",
      "square",
      "youtube",
      "bilibili",
      "bilibili-43",
      "bilibili-hd",
      "wide",
      "wechat"
    ],
    "zhUse": "白底 + 右下一大塊斜切薄荷色 + 左上粗黑大字 + 黑色膠囊副標題 + 一條彎箭頭；計劃、清單、自律、學習，清爽有節奏",
    "enUse": "White with a big mint wedge from the lower right, a heavy headline top left, a black pill subtitle and a curved arrow; plans, lists and study",
    "available": true
  }
];
export function posterDesignTemplate(id: string) {
  const template = POSTER_DESIGN_TEMPLATES.find(template => template.id === id);
  if (!template) throw new Error('Unknown poster design template');
  const { available: _available, ...descriptor } = template;
  return descriptor;
}

export const POSTER_TEMPLATE_SELECTION_INSTRUCTION = "Before create_poster_memo, call get_poster_capabilities and read templates and browserDesignTemplates. Match zhUse/enUse to the user's content, intended style and target format; fit lists recommended platform IDs for browser designs. Respect an explicitly requested template. Choose a basic style ID from templates for create_poster_memo.template; browserDesignTemplates IDs are only for request_poster_render.templateId, even when IDs overlap. For a new poster, you may apply a matching browser design during initial rendering: create the poster, read get_poster for expectedRevision, then request_poster_render with templateId. This requires an online desktop/Web workspace; report pending or failed rendering honestly. For an existing poster, apply a different template only when the user explicitly requests a template change. With sections, basic styles share the same grid/list content layout and differ mainly in palette; their headline-only typography descriptions do not determine the section layout.";
