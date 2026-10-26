PRAGMA foreign_keys = ON;

-- Remove the untouched legacy project-weekly seed. If a user edited it, keep
-- it as an ordinary custom template alongside the new starter templates.
DELETE FROM memo_templates
WHERE id = workspace_id || '_template_project_weekly'
  AND name = '專案週報模板'
  AND description = '每週同步專案進展、風險與下一步計劃'
  AND title = '專案週報｜第 {{周次}} 周'
  AND updated_at = created_at;

-- Existing workspaces have no persisted locale preference, so migrate them
-- with the historical Simplified Chinese catalog. New workspaces use the
-- request language in workspace-provisioning.ts.
WITH seed_catalog AS (
  SELECT
    json_extract(value, '$.key') AS seed_key,
    json_extract(value, '$.name') AS name,
    json_extract(value, '$.description') AS description,
    json_extract(value, '$.contentMarkdown') AS content_markdown,
    json_extract(value, '$.tags') AS tags_json
  FROM json_each('[
    {"key":"quick-note","name":"靈感速記","description":"快速捕捉閃念、臨時靈感、資料連結與即刻行動。","contentMarkdown":"## 💡 閃念記錄\n\n- \n\n## 📌 背景與補充說明\n\n\n\n## 🚀 下一步動作\n\n- [ ] ","tags":["template","quick-note"]},
    {"key":"meeting","name":"會議紀要","description":"結構化記錄議題背景、核心結論與帶負責人的待辦事項。","contentMarkdown":"# 📝 會議紀要\n\n- **時間**：\n- **主持人/記錄人**：\n- **參會人**：\n\n---\n\n## 🎯 會議目標\n\n- \n\n## 💬 核心討論與決策\n\n1. **[議題 1]**\n   - 討論要點：\n   - ✅ **決議**：\n\n2. **[議題 2]**\n   - 討論要點：\n   - ✅ **決議**：\n\n## 📋 待辦事項 (Action Items)\n\n- [ ] **[負責人]** 任務描述 (截止日期：MM-DD)\n- [ ] **[負責人]** 任務描述 (截止日期：MM-DD)\n","tags":["template","meeting"]},
    {"key":"weekly-review","name":"週報與進展覆盤","description":"梳理本週核心產出、風險卡點與下週關鍵優先順序。","contentMarkdown":"# 🗓️ 工作週報\n\n## 🌟 本週核心進展 (Highlights)\n\n- [x] **[專案/功能]** 完成情況與成果說明\n- [x] **[專案/功能]** 完成情況與成果說明\n\n## 🚧 卡點與風險 (Blockers & Risks)\n\n- ⚠️ **阻塞項**：原因及所需支援\n\n## 🎯 下週優先順序 (Next Week Priorities)\n\n- [ ] \n- [ ] \n- [ ] \n\n## 💡 總結與思考\n\n- \n","tags":["template","weekly-review"]},
    {"key":"reading","name":"深度閱讀卡片","description":"提煉核心觀點、精妙摘錄、個人理解與關聯知識卡片。","contentMarkdown":"# 📖 深度閱讀卡片\n\n- **書名/文章**：\n- **作者/來源**：\n- **推薦指數**：⭐⭐⭐⭐⭐\n\n---\n\n## 💡 一句話總結 (Key Takeaway)\n\n> \n\n## ✍️ 核心觀點與金句摘錄\n\n> [摘錄內容]\n> —— *原書/原文*\n\n## 🧠 我的理解與延伸思考\n\n- \n\n## 🔗 關聯知識與行動\n\n- [ ] **落地實踐**：\n","tags":["template","reading"]},
    {"key":"okr","name":"目標與任務拆解","description":"明確 OKR 目標、關鍵結果、里程碑與具體執行清單。","contentMarkdown":"# 🎯 目標拆解\n\n- **週期**：\n- **負責人**：\n\n---\n\n## 📌 目標 (Objective)\n\n> \n\n## 📈 關鍵結果 (Key Results)\n\n- **KR 1**：期望指標 -> 當前進度\n- **KR 2**：期望指標 -> 當前進度\n\n## 🗓️ 里程碑節點 (Milestones)\n\n- [ ] **階段一 (日期)**：完成標的\n- [ ] **階段二 (日期)**：完成標的\n\n## 📋 執行任務清單\n\n- [ ] \n- [ ] \n","tags":["template","okr"]},
    {"key":"post-mortem","name":"問題排查與覆盤","description":"記錄故障現象、根因分析 (5 Whys) 與防範機制。","contentMarkdown":"# 🔍 問題排查與覆盤 (Post-mortem)\n\n- **發生時間**：\n- **影響範圍**：\n- **處理狀態**：已解決 / 處理中\n\n---\n\n## 🚨 故障現象與影響\n\n\n\n## 🛠️ 排查過程與解決方案\n\n1. \n2. \n\n## 🔬 根因分析 (Root Cause / 5 Whys)\n\n- **根本原因**：\n\n## 🛡️ 預防措施 (Action Items)\n\n- [ ] **[短期規避]** \n- [ ] **[長期最佳化]** \n","tags":["template","post-mortem"]}
  ]')
)
INSERT OR IGNORE INTO memo_templates (
  id,
  workspace_id,
  name,
  description,
  title,
  content_json,
  content_markdown,
  tags_json
)
SELECT
  workspaces.id || '_template_' || seed_catalog.seed_key,
  workspaces.id,
  seed_catalog.name,
  seed_catalog.description,
  seed_catalog.name,
  '{"type":"doc","content":[]}',
  seed_catalog.content_markdown,
  seed_catalog.tags_json
FROM workspaces
CROSS JOIN seed_catalog;
