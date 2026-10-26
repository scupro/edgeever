export type InfographicSampleCategory =
  | "sequence"
  | "compare"
  | "list"
  | "quadrant"
  | "hierarchy"
  | "relation"
  | "chart";

export type InfographicSample = {
  id: string;
  category: InfographicSampleCategory;
  template: string;
  titleZh: string;
  titleEn: string;
  titleJa?: string;
  descZh: string;
  descEn: string;
  descJa?: string;
  syntaxZh: string;
  syntaxEn: string;
};

export const INFOGRAPHIC_SAMPLE_CATEGORIES: Array<{
  id: InfographicSampleCategory;
  key: string;
  labelZh: string;
  labelEn: string;
  labelJa: string;
}> = [
  { id: "sequence", key: "sequenceCategory", labelZh: "順序 / 流程", labelEn: "Sequence", labelJa: "順序・工程" },
  { id: "compare", key: "comparisonCategory", labelZh: "對比 / SWOT", labelEn: "Comparison", labelJa: "比較・SWOT" },
  { id: "list", key: "listCategory", labelZh: "列表 / 金字塔", labelEn: "List", labelJa: "リスト" },
  { id: "quadrant", key: "quadrantCategory", labelZh: "四象限矩陣", labelEn: "Quadrant", labelJa: "四象限" },
  { id: "hierarchy", key: "hierarchyCategory", labelZh: "層級 / 腦圖", labelEn: "Hierarchy", labelJa: "階層・マインドマップ" },
  { id: "relation", key: "relationCategory", labelZh: "關係拓撲", labelEn: "Relation", labelJa: "関係ネットワーク" },
  { id: "chart", key: "chartCategory", labelZh: "統計圖表", labelEn: "Chart", labelJa: "チャート" },
];

export const INFOGRAPHIC_SAMPLES: InfographicSample[] = [
  // 1. sequence
  {
    id: "sequence-steps",
    category: "sequence",
    template: "sequence-steps-simple",
    titleZh: "產品研發全週期流程",
    titleEn: "Product Development Lifecycle",
    titleJa: "製品開発ライフサイクル",
    descZh: "從需求分析到上線釋出的標準敏捷研發流程",
    descEn: "Standard agile workflow from discovery to deployment",
    descJa: "要件定義からリリースまでの標準アジャイル開発フロー",
    syntaxZh: `infographic sequence-steps-simple
data
  title 產品研發全週期流程
  desc 從需求調研到交付上線的關鍵階段
  sequences
    - label 需求分析
      desc 收集使用者反饋與商業目標規劃
    - label 原型設計
      desc 互動介面與使用者體驗方案輸出
    - label 敏捷研發
      desc 前後端核心功能模組編碼實現
    - label 質量驗證
      desc 自動化測試與全鏈路迴歸演練
    - label 釋出上線
      desc 灰度放量與生產環境監控護航`,
    syntaxEn: `infographic sequence-steps-simple
data
  title Product Development Lifecycle
  desc Key stages from discovery to production launch
  sequences
    - label Discovery & Specs
      desc Gather user feedback and define key requirements
    - label UI & Prototype
      desc Design user flows and high-fidelity mockups
    - label Agile Sprint
      desc Full-stack engineering and feature implementation
    - label Quality Assurance
      desc Automated tests, regression audits, and performance checks
    - label Production Release
      desc Phased rollout and real-time observability`,
  },
  {
    id: "sequence-timeline",
    category: "sequence",
    template: "sequence-timeline-done-list",
    titleZh: "企業發展關鍵里程碑",
    titleEn: "Company Milestones Timeline",
    titleJa: "企業の主要マイルストーン",
    descZh: "記錄團隊從創立到規模化的關鍵躍遷時刻",
    descEn: "Key turning points from inception to scale",
    descJa: "創業からスケール期までの重要マイルストーン",
    syntaxZh: `infographic sequence-timeline-done-list
data
  title 企業發展關鍵里程碑
  desc 記錄團隊從創立到規模化的關鍵躍遷
  sequences
    - label 2022 年初創成立
      desc 核心創始團隊組建，完成天使輪融資
    - label 2023 產品 1.0 釋出
      desc 突破首批 10,000 名種子活躍使用者
    - label 2024 商業化落地
      desc 上線企業級協同能力，實現自負盈虧
    - label 2025 全球化出海
      desc 佈局多語言與跨國合規部署架構`,
    syntaxEn: `infographic sequence-timeline-done-list
data
  title Company Milestones Timeline
  desc Key turning points from inception to scale
  sequences
    - label 2022 Founding
      desc Core team assembled and seed round completed
    - label 2023 Product 1.0
      desc Surpassed first 10,000 active users
    - label 2024 Monetization
      desc Enterprise collaboration launched with break-even revenue
    - label 2025 Global Expansion
      desc Multi-region compliance and localized deployments`,
  },
  {
    id: "sequence-roadmap",
    category: "sequence",
    template: "sequence-roadmap-vertical-simple",
    titleZh: "技術架構演進路線圖",
    titleEn: "Architecture Evolution Roadmap",
    titleJa: "技術アーキテクチャのロードマップ",
    descZh: "基礎設施升級與雲原生轉型的演進路徑",
    descEn: "Infrastructure modernization and cloud-native journey",
    descJa: "インフラ刷新とクラウドネイティブ化の歩み",
    syntaxZh: `infographic sequence-roadmap-vertical-simple
data
  title 技術架構演進路線圖
  desc 基礎設施升級與雲原生轉型的演進路徑
  sequences
    - label 階段一：單體解耦
      desc 拆分核心資料模型，建立統一領域服務介面
    - label 階段二：容器編排
      desc 全面接入 Kubernetes，實現宣告式部署與排程
    - label 階段三：服務網格
      desc 引入 Istio 網格，實現精細化流量治理與可觀測性
    - label 階段四：智慧運維
      desc 結合大模型與日誌度量，落地自愈式巡檢告警`,
    syntaxEn: `infographic sequence-roadmap-vertical-simple
data
  title Architecture Evolution Roadmap
  desc Infrastructure modernization and cloud-native journey
  sequences
    - label Phase 1: Modular Monolith
      desc Decouple core domain models and define clean contracts
    - label Phase 2: Containerization
      desc Adopt Kubernetes for declarative deployments and scaling
    - label Phase 3: Service Mesh
      desc Introduce Istio for traffic control and fine-grained telemetry
    - label Phase 4: AIOps Automation
      desc Autonomous anomaly detection and self-healing alerts`,
  },

  // 2. compare
  {
    id: "compare-vs",
    category: "compare",
    template: "compare-binary-horizontal-compact-card-vs",
    titleZh: "雲原生與傳統部署對比",
    titleEn: "Cloud-Native vs Traditional Hosting",
    titleJa: "クラウドネイティブと従来運用の比較",
    descZh: "架構靈活性與運維成本的深度權衡分析",
    descEn: "Architectural agility and infrastructure cost trade-offs",
    descJa: "拡張性と運用コストの包括的な比較分析",
    syntaxZh: `infographic compare-binary-horizontal-compact-card-vs
data
  title 雲原生與傳統部署對比
  desc 架構靈活性與運維成本的全面權衡
  compares
    - label 傳統物理部署
      desc 依賴固定機房資產與人工維護
      children
        - label 彈性擴充套件
          desc 擴容週期通常需要數週甚至數月
        - label 資源利用率
          desc 峰谷波動大，伺服器平均閒置率高
        - label 運維複雜度
          desc 人工巡檢部署，故障恢復時間較長
    - label 雲原生架構
      desc 容器化編排與按需彈性擴縮容
      children
        - label 彈性擴充套件
          desc 秒級自動伸縮，輕鬆應對突發流量
        - label 資源利用率
          desc 多租戶動態排程，整體成本最佳化 40%
        - label 運維複雜度
          desc CI/CD 自動化流水線與自愈式監控`,
    syntaxEn: `infographic compare-binary-horizontal-compact-card-vs
data
  title Cloud-Native vs Traditional Hosting
  desc Architectural agility and infrastructure cost trade-offs
  compares
    - label Traditional Dedicated Server
      desc Fixed on-premise hardware and manual maintenance
      children
        - label Scalability
          desc Provisioning new hardware takes weeks or months
        - label Resource Utilization
          desc Peak-provisioned servers sit idle most of the day
        - label Operational Overhead
          desc Manual patching and slower disaster recovery
    - label Cloud-Native Platform
      desc Containerized orchestration with on-demand autoscaling
      children
        - label Scalability
          desc Sub-second auto-scaling handles traffic spikes seamlessly
        - label Resource Utilization
          desc Dynamic multi-tenant scheduling cuts infrastructure cost 40%
        - label Operational Overhead
          desc Automated CI/CD pipelines and self-healing nodes`,
  },
  {
    id: "compare-swot",
    category: "compare",
    template: "compare-swot",
    titleZh: "產品戰略 SWOT 分析",
    titleEn: "Strategic SWOT Analysis",
    titleJa: "製品戦略の SWOT 分析",
    descZh: "全面審視內部優劣勢與外部市場機遇威脅",
    descEn: "Internal strengths/weaknesses and external market opportunities/threats",
    descJa: "内部の強み・弱みと外部の機会・脅威の網羅分析",
    syntaxZh: `infographic compare-swot
data
  title 產品戰略 SWOT 分析
  desc 全面審視內部優劣勢與外部市場環境
  compares
    - label 優勢 (Strengths)
      children
        - label 核心專利技術壁壘
          desc 擁有業內領先的離線協同與加密演算法
        - label 敏捷響應能力
          desc 團隊扁平，兩週一次穩定迭代演進
    - label 劣勢 (Weaknesses)
      children
        - label 品牌知名度有限
          desc 市場拓展初期，整體認知度仍在積累
        - label 移動端覆蓋剛起步
          desc 部分跨平臺高階互動仍在完善中
    - label 機會 (Opportunities)
      children
        - label 遠端與混合辦公普及
          desc 全球知識管理協同工具需求持續增長
        - label AI Agent 生態蓬勃
          desc 與大模型協同工作流帶來全新爆發點
    - label 威脅 (Threats)
      children
        - label 頭部大廠生態擠壓
          desc 巨頭免費捆綁分發帶來的競爭壓力
        - label 資料合規監管趨嚴
          desc 全球各地區合規成本與審查風險上升`,
    syntaxEn: `infographic compare-swot
data
  title Strategic SWOT Analysis
  desc Internal strengths/weaknesses and external market environment
  compares
    - label Strengths
      children
        - label Proprietary Tech
          desc Industry-leading offline-first sync algorithms
        - label Rapid Execution
          desc Flat engineering team with bi-weekly stable releases
    - label Weaknesses
      children
        - label Brand Awareness
          desc Early stage market presence still expanding
        - label Mobile Parity
          desc Advanced cross-platform interactions still maturing
    - label Opportunities
      children
        - label Remote Collaboration
          desc Global demand for lightweight self-hosted knowledge bases
        - label AI Agent Ecosystem
          desc Model Context Protocol unlocks novel assistant workflows
    - label Threats
      children
        - label Incumbent Bundling
          desc Big-tech suites offering free bundled alternatives
        - label Compliance Complexity
          desc Stricter multi-region data residency and audits`,
  },
  {
    id: "compare-arrow",
    category: "compare",
    template: "compare-binary-horizontal-simple-arrow",
    titleZh: "工程體系重構演進",
    titleEn: "Engineering Workflow Evolution",
    titleJa: "エンジニアリング体系の進化",
    descZh: "從傳統手工操作升級為現代高度自動化流程",
    descEn: "Transition from manual operations to modern automated workflows",
    descJa: "手動オペレーションから自動化パイプラインへの進化",
    syntaxZh: `infographic compare-binary-horizontal-simple-arrow
data
  title 工程體系重構演進
  desc 從傳統手工操作升級為現代高度自動化流程
  compares
    - label 過去：手工碎片化
      desc 依賴人工執行指令碼與零散文件傳遞
      children
        - label 交付節奏
          desc 每月一次集中釋出，風險積聚
        - label 質量門檻
          desc 依賴人工點工測試，漏測率高
    - label 現在：持續自動化
      desc 程式碼提交即觸發完整驗證流水線
      children
        - label 交付節奏
          desc 每日主幹整合，隨時可釋出生產
        - label 質量門檻
          desc 90% 自動化測試覆蓋與分支保護`,
    syntaxEn: `infographic compare-binary-horizontal-simple-arrow
data
  title Engineering Workflow Evolution
  desc Transition from manual tasks to fully automated pipelines
  compares
    - label Legacy: Manual & Fragmented
      desc Ad-hoc scripts and tribal knowledge
      children
        - label Release Cadence
          desc Monthly batch releases with accumulated risk
        - label Quality Gate
          desc Manual QA passes with high escape rates
    - label Modern: Continuous & Automated
      desc Git push triggers end-to-end verification
      children
        - label Release Cadence
          desc Trunk-based development deployable anytime
        - label Quality Gate
          desc 90% test coverage with automated branch protection`,
  },

  // 3. list
  {
    id: "list-grid",
    category: "list",
    template: "list-grid-simple",
    titleZh: "團隊高效協同五大原則",
    titleEn: "Team Collaboration Principles",
    titleJa: "チーム協調の 5 大原則",
    descZh: "打造透明、自驅、可預測的高效工程文化",
    descEn: "Fostering a transparent, autonomous, and predictable culture",
    descJa: "自律的で予測可能な高効率エンジニアリング文化",
    syntaxZh: `infographic list-grid-simple
data
  title 團隊高效協同五大原則
  desc 打造透明、自驅、可預測的工程文化
  lists
    - label 非同步優先
      desc 完整記錄決策上下文，減少打斷式即時會議
    - label 文件即程式碼
      desc 核心架構與規範以 Markdown 納管審查
    - label 小步快跑
      desc 頻繁合併短生命週期分支，降低整合風險
    - label 自動化驗證
      desc 單元測試與端到端迴歸門禁攔截潛在缺陷
    - label 結果導向
      desc 聚焦交付價值與使用者體驗，避免形式主義`,
    syntaxEn: `infographic list-grid-simple
data
  title Team Collaboration Principles
  desc Fostering a transparent, autonomous, and predictable culture
  lists
    - label Async First
      desc Document decisions clearly to minimize disruptive meetings
    - label Docs as Code
      desc Core architecture and standards reviewed in Markdown
    - label Small Iterations
      desc Merge short-lived branches frequently to derisk integration
    - label Automated Verification
      desc Strict unit and integration gates catch regressions early
    - label Value Focused
      desc Prioritize user outcome and polish over bureaucracy`,
  },
  {
    id: "list-pyramid",
    category: "list",
    template: "list-pyramid-compact-card",
    titleZh: "DIKW 知識層級金字塔",
    titleEn: "DIKW Knowledge Hierarchy",
    titleJa: "DIKW ピラミッドモデル",
    descZh: "從原始事實到深刻見解的認知躍升模型",
    descEn: "Cognitive progression from raw facts to actionable wisdom",
    descJa: "データから知恵への認知の階層的ステップ",
    syntaxZh: `infographic list-pyramid-compact-card
data
  title DIKW 知識層級金字塔
  desc 從原始事實到深刻見解的認知躍升模型
  lists
    - label 智慧 (Wisdom)
      desc 洞察未來趨勢與深層本質的決策力
    - label 知識 (Knowledge)
      desc 經驗積累、思維模型與實踐方法論
    - label 信息 (Information)
      desc 結構化整理、具備上下文的資料集合
    - label 資料 (Data)
      desc 未經加工的原始事實與客觀記錄`,
    syntaxEn: `infographic list-pyramid-compact-card
data
  title DIKW Knowledge Hierarchy
  desc Cognitive progression from raw facts to actionable wisdom
  lists
    - label Wisdom
      desc Foresight, strategic clarity, and principled judgment
    - label Knowledge
      desc Contextual understanding, mental models, and expertise
    - label Information
      desc Structured, organized, and relational data points
    - label Data
      desc Objective facts, signals, and raw observations`,
  },

  // 4. quadrant
  {
    id: "quadrant-matrix",
    category: "quadrant",
    template: "compare-quadrant-quarter-simple-card",
    titleZh: "時間管理四象限法則",
    titleEn: "Eisenhower Priority Matrix",
    titleJa: "時間管理のマトリクス",
    descZh: "按重要性與緊迫性科學分配精力與優先順序",
    descEn: "Allocate focus and bandwidth by importance and urgency",
    descJa: "重要度と緊急度で優先順位を整理する枠組み",
    syntaxZh: `infographic compare-quadrant-quarter-simple-card
data
  title 時間管理四象限法則
  desc 按重要性與緊急性科學規劃工作重心
  compares
    - label 第一象限：重要且緊急
      desc 危機突發事件、緊急生產事故與臨近截期的核心交付
    - label 第二象限：重要不緊急
      desc 長期戰略規劃、技術重構、深度學習與身心健康建設
    - label 第三象限：緊急不重要
      desc 突發臨時打斷、次要瑣事與非必要的即時溝通
    - label 第四象限：不重要不緊急
      desc 無效社交閒聊、過度刷屏消遣與低價值重複勞動`,
    syntaxEn: `infographic compare-quadrant-quarter-simple-card
data
  title Eisenhower Priority Matrix
  desc Allocate focus and bandwidth by importance and urgency
  compares
    - label Q1: Urgent & Important
      desc Production crises, hard deadlines, and pressing issues
    - label Q2: Not Urgent but Important
      desc Strategic planning, refactoring, learning, and self-care
    - label Q3: Urgent but Not Important
      desc Unplanned interruptions, trivial requests, and busywork
    - label Q4: Not Urgent & Not Important
      desc Distractions, mindless browsing, and low-value tasks`,
  },

  // 5. hierarchy
  {
    id: "hierarchy-mindmap",
    category: "hierarchy",
    template: "hierarchy-mindmap-branch-gradient-lined-palette",
    titleZh: "現代 Web 全棧技術體系",
    titleEn: "Modern Web Architecture",
    titleJa: "モダン Web フルスタック体系",
    descZh: "現代化 Web 應用各層級核心元件與選型參考",
    descEn: "Core technical components of modern web applications",
    descJa: "モダン Web アプリケーションの要素と技術選定",
    syntaxZh: `infographic hierarchy-mindmap-branch-gradient-lined-palette
data
  title 現代 Web 全棧技術體系
  desc 現代化 Web 應用各層級核心選型
  root
    label 全棧技術體系
    children
      - label 前端執行時
        desc React / Vite 響應式互動
      - label 服務端邏輯
        desc Hono / Cloudflare Workers
      - label 儲存與快取
        desc D1 SQLite / R2 物件儲存
      - label 智慧體協同
        desc Model Context Protocol`,
    syntaxEn: `infographic hierarchy-mindmap-branch-gradient-lined-palette
data
  title Modern Web Architecture
  desc Core technical components of modern web applications
  root
    label Full-Stack Stack
    children
      - label Frontend Layer
        desc React & Vite reactive interfaces
      - label Backend Services
        desc Hono on edge serverless runtime
      - label Storage Layer
        desc D1 SQLite & R2 object storage
      - label AI Synergy
        desc Model Context Protocol tools`,
  },

  // 6. relation
  {
    id: "relation-network",
    category: "relation",
    template: "relation-network-simple-circle-node",
    titleZh: "分散式服務拓撲網路",
    titleEn: "Distributed Microservice Mesh",
    titleJa: "分散サービス・トポロジー",
    descZh: "微服務間呼叫關係與資料流動鏈路視覺化",
    descEn: "Invocations and data pipelines between core services",
    descJa: "マイクロサービス間の連携とデータフロー",
    syntaxZh: `infographic relation-network-simple-circle-node
data
  title 分散式服務拓撲網路
  desc API 閘道器與後端核心微服務呼叫鏈路
  nodes
    - id gateway
      label 統一 API 閘道器
      desc 流量排程與鑑權中心
    - id auth
      label 統一認證服務
      desc JWT 校驗與權限模型
    - id note
      label 筆記核心服務
      desc 內容版本控制與後設資料
    - id sync
      label 同步引擎服務
      desc 離線遊標與協同合併
  relations
    - from gateway
      to auth
    - from gateway
      to note
    - from note
      to sync`,
    syntaxEn: `infographic relation-network-simple-circle-node
data
  title Distributed Microservice Mesh
  desc Invocations and data pipelines between core services
  nodes
    - id gateway
      label API Gateway
      desc Ingress routing and TLS termination
    - id auth
      label Auth Service
      desc Token validation and RBAC enforcement
    - id note
      label Note Core
      desc Content revision engine and SQLite storage
    - id sync
      label Sync Engine
      desc Offline cursors and conflict resolution
  relations
    - from gateway
      to auth
    - from gateway
      to note
    - from note
      to sync`,
  },

  // 7. chart
  {
    id: "chart-donut",
    category: "chart",
    template: "chart-pie-donut-plain-text",
    titleZh: "產品使用者來源構成佔比",
    titleEn: "User Acquisition Breakdown",
    titleJa: "ユーザー獲得チャネル比率",
    descZh: "各渠道活躍新使用者的佔比構成分佈",
    descEn: "Share of new active users across primary channels",
    descJa: "新規アクティブユーザーの獲得チャネル内訳",
    syntaxZh: `infographic chart-pie-donut-plain-text
data
  title 產品使用者來源構成佔比
  desc 季度新增活躍使用者的核心來源渠道構成
  values
    - label 開源社群口碑
      value 45
    - label 搜索引擎自然流量
      value 25
    - label 技術部落格與媒體
      value 18
    - label 線下沙龍與推薦
      value 12`,
    syntaxEn: `infographic chart-pie-donut-plain-text
data
  title User Acquisition Breakdown
  desc Share of new active users across primary channels
  values
    - label Open Source Word-of-Mouth
      value 45
    - label Organic Search
      value 25
    - label Tech Blogs & Social
      value 18
    - label Developer Events
      value 12`,
  },
  {
    id: "chart-column",
    category: "chart",
    template: "chart-column-simple",
    titleZh: "季度特性交付速率對比",
    titleEn: "Quarterly Feature Delivery",
    titleJa: "四半期ごとの機能リリース速度",
    descZh: "近四個季度研發團隊完成的核心特性數量",
    descEn: "Number of major customer-facing capabilities shipped",
    descJa: "過去 4 四半期に提供した主要機能の推移",
    syntaxZh: `infographic chart-column-simple
data
  title 季度特性交付速率對比
  desc 近四個季度研發團隊交付的核心業務特性統計
  values
    - label Q1 季度
      value 18
    - label Q2 季度
      value 26
    - label Q3 季度
      value 35
    - label Q4 季度
      value 42`,
    syntaxEn: `infographic chart-column-simple
data
  title Quarterly Feature Delivery
  desc Number of major customer-facing capabilities shipped
  values
    - label Q1
      value 18
    - label Q2
      value 26
    - label Q3
      value 35
    - label Q4
      value 42`,
  },
];

export function getSampleSyntax(sample: InfographicSample, lang?: string): string {
  if (lang && lang.toLowerCase().startsWith("zh")) return sample.syntaxZh;
  return sample.syntaxEn;
}

export function getSampleTitle(sample: InfographicSample, lang?: string): string {
  if (lang && lang.toLowerCase().startsWith("zh")) return sample.titleZh;
  if (lang && lang.toLowerCase().startsWith("ja")) return sample.titleJa ?? sample.titleEn;
  return sample.titleEn;
}

export function getSampleDesc(sample: InfographicSample, lang?: string): string {
  if (lang && lang.toLowerCase().startsWith("zh")) return sample.descZh;
  if (lang && lang.toLowerCase().startsWith("ja")) return sample.descJa ?? sample.descEn;
  return sample.descEn;
}
