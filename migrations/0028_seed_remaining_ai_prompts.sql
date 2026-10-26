PRAGMA foreign_keys = ON;

-- Seed any default prompts added after 0027 (translate / fix-spelling-grammar / change-tone).
-- Safe for workspaces that already have the earlier seeds.

INSERT OR IGNORE INTO ai_prompt_templates (
  id, workspace_id, name, description, instruction, created_at, updated_at
)
SELECT
  id || '_aiprompt_translate',
  id,
  '翻譯',
  '翻譯為指定目標語言，保留結構與格式',
  '將完整筆記翻譯成使用者指定的目標語言。保留原意、Markdown 結構、連結與程式碼塊。只返回譯文，不要評論。',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM workspaces;

INSERT OR IGNORE INTO ai_prompt_templates (
  id, workspace_id, name, description, instruction, created_at, updated_at
)
SELECT
  id || '_aiprompt_fix-spelling-grammar',
  id,
  '修正錯別字與語法',
  '只修正錯別字、語法與標點',
  '只修正拼寫、語法與標點。不要改變語氣、結構或含義。保持原語言與 Markdown 格式。只返回修正後的內容。',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM workspaces;

INSERT OR IGNORE INTO ai_prompt_templates (
  id, workspace_id, name, description, instruction, created_at, updated_at
)
SELECT
  id || '_aiprompt_change-tone',
  id,
  '改變語氣',
  '按指定語氣重寫，不改變含義',
  '按使用者指定的語氣重寫內容，不改變原意。保持原語言與有用的 Markdown 格式。只返回改寫後的內容。',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM workspaces;
