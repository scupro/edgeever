-- Repair only the exact, untouched installation seed. SQL does not interpret \n.
-- Update the memo first so existing sync triggers announce the content change.
-- Both statements re-check the old content; replaying this migration is a no-op.
UPDATE memos
SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = 'memo_welcome'
  AND id IN (SELECT memo_id FROM memo_contents WHERE memo_id = 'memo_welcome'
  AND revision = 0
  AND content_hash = 'b456f3d15f168a4e3456f3a5f157ad54a84688e7176d2ee5f277bb305871f2be'
  AND content_json = '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"歡迎來到 EdgeEver"}]},{"type":"paragraph","content":[{"type":"text","text":"這是第一條 EdgeEver 筆記，三欄、邊緣、Agent-ready。"}]},{"type":"paragraph","content":[{"type":"text","text":"接下來可以建立筆記本、寫筆記、搜尋內容，並把多條筆記合併成一條新的長期筆記。"}]}]}'
  AND content_markdown = '## 歡迎來到 EdgeEver\n\n這是第一條 EdgeEver 筆記，三欄、邊緣、Agent-ready。\n\n接下來可以建立筆記本、寫筆記、搜尋內容，並把多條筆記合併成一條新的長期筆記。'
  AND content_text = '歡迎來到 EdgeEver 這是第一條 EdgeEver 筆記，三欄、邊緣、Agent-ready。 接下來可以建立筆記本、寫筆記、搜尋內容，並把多條筆記合併成一條新的長期筆記。'
  AND NOT EXISTS (SELECT 1 FROM memo_revisions WHERE memo_id = 'memo_welcome')
  AND EXISTS (
    SELECT 1 FROM memos
    WHERE id = 'memo_welcome' AND workspace_id = 'ws_default'
      AND title = '歡迎來到 EdgeEver'
      AND created_by = 'system' AND updated_by = 'system' AND is_deleted = 0
  ));

UPDATE memo_contents
SET content_markdown = replace(content_markdown, '\n', char(10)),
    content_hash = '17d3490cd74684b79199e30a918e23231d29d8363736148987b34179e97c16fe',
    revision = revision + 1,
    updated_at = (SELECT updated_at FROM memos WHERE id = 'memo_welcome')
WHERE memo_id = 'memo_welcome'
  AND revision = 0
  AND content_hash = 'b456f3d15f168a4e3456f3a5f157ad54a84688e7176d2ee5f277bb305871f2be'
  AND content_json = '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"歡迎來到 EdgeEver"}]},{"type":"paragraph","content":[{"type":"text","text":"這是第一條 EdgeEver 筆記，三欄、邊緣、Agent-ready。"}]},{"type":"paragraph","content":[{"type":"text","text":"接下來可以建立筆記本、寫筆記、搜尋內容，並把多條筆記合併成一條新的長期筆記。"}]}]}'
  AND content_markdown = '## 歡迎來到 EdgeEver\n\n這是第一條 EdgeEver 筆記，三欄、邊緣、Agent-ready。\n\n接下來可以建立筆記本、寫筆記、搜尋內容，並把多條筆記合併成一條新的長期筆記。'
  AND content_text = '歡迎來到 EdgeEver 這是第一條 EdgeEver 筆記，三欄、邊緣、Agent-ready。 接下來可以建立筆記本、寫筆記、搜尋內容，並把多條筆記合併成一條新的長期筆記。'
  AND NOT EXISTS (SELECT 1 FROM memo_revisions WHERE memo_id = 'memo_welcome')
  AND EXISTS (
    SELECT 1 FROM memos
    WHERE id = 'memo_welcome' AND workspace_id = 'ws_default'
      AND title = '歡迎來到 EdgeEver'
      AND created_by = 'system' AND updated_by = 'system' AND is_deleted = 0
  );
