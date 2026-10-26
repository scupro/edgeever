PRAGMA foreign_keys = ON;

-- Five starter templates cover the most common workflows. Remove only the
-- untouched post-mortem preset; edited copies remain ordinary user templates.
DELETE FROM memo_templates
WHERE id = workspace_id || '_template_post-mortem'
  AND name = '問題排查與覆盤'
  AND description = '記錄故障現象、根因分析 (5 Whys) 與防範機制。'
  AND title = '問題排查與覆盤'
  AND updated_at = created_at;
