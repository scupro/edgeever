PRAGMA foreign_keys = ON;

-- Replace the original oversized demo template with a compact, reusable example.
DELETE FROM memo_templates
WHERE name = '產品週報模板'
  AND description = '用於每週產品進展記錄';

DELETE FROM memo_templates
WHERE name = '專案週報模板'
  AND description = '每週同步專案進展、風險與下一步計劃';

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
  id || '_template_project_weekly',
  id,
  '專案週報模板',
  '每週同步專案進展、風險與下一步計劃',
  '專案週報｜第 {{周次}} 周',
  '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"本週進展"}]},{"type":"paragraph"},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"關鍵成果"}]},{"type":"paragraph"},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"風險與阻塞"}]},{"type":"paragraph"},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"下週計劃"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph"}]}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"需要協助"}]},{"type":"paragraph"}]}',
  '## 本週進展\n\n- \n\n## 關鍵成果\n\n- \n\n## 風險與阻塞\n\n- \n\n## 下週計劃\n\n- [ ] \n\n## 需要協助\n\n- ',
  '["專案管理","週報"]'
FROM workspaces;
