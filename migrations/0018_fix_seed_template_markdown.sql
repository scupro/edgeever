PRAGMA foreign_keys = ON;

-- SQLite string literals do not interpret backslash-n as a line break.
UPDATE memo_templates
SET content_markdown = '## 本週進展' || char(10) || char(10) || '- ' || char(10) || char(10) ||
  '## 關鍵成果' || char(10) || char(10) || '- ' || char(10) || char(10) ||
  '## 風險與阻塞' || char(10) || char(10) || '- ' || char(10) || char(10) ||
  '## 下週計劃' || char(10) || char(10) || '- [ ] ' || char(10) || char(10) ||
  '## 需要協助' || char(10) || char(10) || '- '
WHERE name = '專案週報模板'
  AND description = '每週同步專案進展、風險與下一步計劃';
