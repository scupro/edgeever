PRAGMA foreign_keys = ON;

-- Replace Xiaohongshu / Twitter starters with extract-todos and continue-writing.
-- Untouched and edited presets both leave the catalog so they do not linger as
-- unexpected custom prompts. User-created prompts have no seed_key and are kept.
DELETE FROM ai_prompt_templates
WHERE seed_key IN ('rewrite-proofread', 'simplify-language');

INSERT OR IGNORE INTO ai_prompt_templates (
  id, workspace_id, seed_key, action, parameter_kind, result_mode,
  name, description, instruction,
  name_customized, description_customized, instruction_customized,
  created_at, updated_at
)
SELECT
  id || '_aiprompt_extract-todos', id, 'extract-todos', 'extract-todos', 'none', 'append',
  '提取待辦', '識別可執行任務，生成任務清單',
  '從筆記中提取明確或隱含的可執行任務，用 Markdown 任務列表（- [ ]）輸出。保持原語言，不要編造任務。若沒有可執行事項，用原文語言簡短說明。',
  0, 0, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM workspaces;

INSERT OR IGNORE INTO ai_prompt_templates (
  id, workspace_id, seed_key, action, parameter_kind, result_mode,
  name, description, instruction,
  name_customized, description_customized, instruction_customized,
  created_at, updated_at
)
SELECT
  id || '_aiprompt_continue-writing', id, 'continue-writing', 'continue-writing', 'none', 'append',
  '繼續寫作', '從筆記末尾自然續寫',
  '從筆記結束處自然續寫。只返回新增續寫內容，不要重複原文。保持原語言與 Markdown 風格。',
  0, 0, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM workspaces;
