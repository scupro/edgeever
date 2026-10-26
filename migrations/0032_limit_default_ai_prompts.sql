PRAGMA foreign_keys = ON;

-- Retire the old system catalog completely. Rows created by users have no
-- seed_key and are unaffected, while edited legacy presets also leave the
-- catalog instead of lingering as unexpected custom prompts.
DELETE FROM ai_prompt_templates
WHERE seed_key IN (
  'extract-key-points', 'extract-todos', 'rewrite-proofread',
  'fix-spelling-grammar', 'make-shorter', 'make-longer',
  'simplify-language', 'change-tone', 'continue-writing'
);

INSERT OR IGNORE INTO ai_prompt_templates (
  id, workspace_id, seed_key, action, parameter_kind, result_mode,
  name, description, instruction,
  name_customized, description_customized, instruction_customized,
  created_at, updated_at
)
SELECT
  id || '_aiprompt_make-shorter', id, 'make-shorter', 'make-shorter', 'none', 'both',
  '精煉表達', '刪去重複與冗餘，讓表達更簡潔有力',
  '精煉內容，刪除重複、空話和不必要的修飾，合並可以合併的句子，使表達簡潔、清晰、有力。保留所有關鍵事實、觀點與原意，不要新增新資訊。保持原語言與有用的 Markdown 格式。只返回精煉後的內容。',
  0, 0, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM workspaces;

INSERT OR IGNORE INTO ai_prompt_templates (
  id, workspace_id, seed_key, action, parameter_kind, result_mode,
  name, description, instruction,
  name_customized, description_customized, instruction_customized,
  created_at, updated_at
)
SELECT
  id || '_aiprompt_rewrite-proofread', id, 'rewrite-proofread', 'rewrite-proofread', 'none', 'both',
  '轉為小紅書風格', '改寫成自然、有吸引力的小紅書筆記',
  '將內容改寫成適合小紅書釋出的筆記：生成吸引人的標題，使用自然、有親和力的口吻、短段落和清晰層次，可適量加入貼合語義的 Emoji，並在結尾給出 3–8 個相關話題標籤。保留原文的關鍵事實與觀點，不誇大效果，不編造經歷、資料或結論。只返回可直接釋出的內容。',
  0, 0, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM workspaces;

INSERT OR IGNORE INTO ai_prompt_templates (
  id, workspace_id, seed_key, action, parameter_kind, result_mode,
  name, description, instruction,
  name_customized, description_customized, instruction_customized,
  created_at, updated_at
)
SELECT
  id || '_aiprompt_simplify-language', id, 'simplify-language', 'simplify-language', 'none', 'both',
  '轉為推特風格', '改寫成簡潔、有觀點的推文或推文串',
  '將內容改寫成適合推特釋出的文字：開頭直接抓住重點，表達簡潔、有觀點、易讀。內容較短時輸出一條推文；無法在一條內保留關鍵資訊時，輸出帶序號的精簡推文串。只在確有幫助時使用少量標籤。保留原文事實與立場，不製造噱頭或編造資訊。只返回可直接釋出的內容。',
  0, 0, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM workspaces;
