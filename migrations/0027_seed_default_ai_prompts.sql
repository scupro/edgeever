PRAGMA foreign_keys = ON;

-- Seed each workspace with editable starter prompts (not locked "system" prompts).
-- IDs are deterministic per workspace so the insert is safe to re-run.

INSERT OR IGNORE INTO ai_prompt_templates (
  id, workspace_id, name, description, instruction, created_at, updated_at
)
SELECT
  id || '_aiprompt_summarize',
  id,
  '總結',
  '壓縮全文，提煉主題、結論與可執行結果',
  '對筆記做真正的精簡總結，不要逐句改寫或複述原文。提煉中心主題、主要觀點、關鍵結論與可執行結果。去掉重複、修辭、舉例和次要細節，除非它們對理解結論必不可少。較長筆記用 3–7 條簡潔 Markdown 要點；短筆記用 1–3 句即可。不要大段照搬原文，也不要新增原文沒有的資訊。保持筆記原語言，只返回總結內容。',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM workspaces;

INSERT OR IGNORE INTO ai_prompt_templates (
  id, workspace_id, name, description, instruction, created_at, updated_at
)
SELECT
  id || '_aiprompt_extract-key-points',
  id,
  '提煉要點',
  '提取最重要觀點，輸出簡潔要點列表',
  '提取筆記中最重要的要點，用簡潔的 Markdown 列表輸出。保持原語言，不要新增原文沒有的資訊。',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM workspaces;

INSERT OR IGNORE INTO ai_prompt_templates (
  id, workspace_id, name, description, instruction, created_at, updated_at
)
SELECT
  id || '_aiprompt_extract-todos',
  id,
  '提取待辦',
  '識別可執行任務，生成任務清單',
  '從筆記中提取明確或隱含的待辦事項，用 Markdown 任務列表（- [ ]）輸出。保持原語言，不要編造任務。若沒有可執行事項，用原文語言簡短說明。',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM workspaces;

INSERT OR IGNORE INTO ai_prompt_templates (
  id, workspace_id, name, description, instruction, created_at, updated_at
)
SELECT
  id || '_aiprompt_rewrite-proofread',
  id,
  '改寫與校對',
  '潤色全文並校對語法、標點與結構',
  '改寫並校對整篇筆記。修正拼寫、語法、標點、清晰度與結構，不改變原意。保持原語言與 Markdown 格式，只返回修訂後的完整內容。',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM workspaces;

INSERT OR IGNORE INTO ai_prompt_templates (
  id, workspace_id, name, description, instruction, created_at, updated_at
)
SELECT
  id || '_aiprompt_improve-writing',
  id,
  '改進表達',
  '提升表達清晰度與流暢度',
  '改進文字的清晰度、流暢度與用詞，不改變原意。保持原語言與有用的 Markdown 格式，只返回改進後的內容。',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM workspaces;

INSERT OR IGNORE INTO ai_prompt_templates (
  id, workspace_id, name, description, instruction, created_at, updated_at
)
SELECT
  id || '_aiprompt_make-shorter',
  id,
  '縮短內容',
  '刪減冗餘，保留關鍵事實',
  '把內容改寫得更簡潔。去掉重複與廢話，保留每一個重要事實。保持原語言與有用的 Markdown 格式，只返回縮短後的內容。',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM workspaces;

INSERT OR IGNORE INTO ai_prompt_templates (
  id, workspace_id, name, description, instruction, created_at, updated_at
)
SELECT
  id || '_aiprompt_make-longer',
  id,
  '擴寫內容',
  '在不編造事實的前提下擴寫說明',
  '擴寫內容，補充有用的說明與更順暢的過渡，但不要編造事實。保持原語言與有用的 Markdown 格式，只返回擴寫後的內容。',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM workspaces;

INSERT OR IGNORE INTO ai_prompt_templates (
  id, workspace_id, name, description, instruction, created_at, updated_at
)
SELECT
  id || '_aiprompt_simplify-language',
  id,
  '簡化表達',
  '用更通俗易懂的語言改寫',
  '用清晰、平實、更好懂的語言改寫內容。保持原意、原語言與有用的 Markdown 格式，只返回簡化後的內容。',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM workspaces;

INSERT OR IGNORE INTO ai_prompt_templates (
  id, workspace_id, name, description, instruction, created_at, updated_at
)
SELECT
  id || '_aiprompt_continue-writing',
  id,
  '繼續寫作',
  '從筆記末尾自然續寫',
  '從筆記結束處自然續寫。只返回新增續寫內容，不要重複原文。保持原語言與 Markdown 風格。',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM workspaces;
