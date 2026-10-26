PRAGMA foreign_keys = ON;

-- Prompt execution behavior is explicit so editable prompt text is never interpreted from its id.
-- Per-field customization flags let untouched factory prompts be localized at read time.
ALTER TABLE ai_prompt_templates ADD COLUMN seed_key TEXT;
ALTER TABLE ai_prompt_templates ADD COLUMN action TEXT NOT NULL DEFAULT 'custom'
  CHECK (action IN (
    'summarize', 'extract-key-points', 'extract-todos', 'rewrite-proofread',
    'translate', 'improve-writing', 'fix-spelling-grammar', 'make-shorter',
    'make-longer', 'simplify-language', 'change-tone', 'continue-writing', 'custom'
  ));
ALTER TABLE ai_prompt_templates ADD COLUMN parameter_kind TEXT NOT NULL DEFAULT 'none'
  CHECK (parameter_kind IN ('none', 'target-language', 'tone'));
ALTER TABLE ai_prompt_templates ADD COLUMN result_mode TEXT NOT NULL DEFAULT 'both'
  CHECK (result_mode IN ('append', 'replace', 'both'));
ALTER TABLE ai_prompt_templates ADD COLUMN name_customized INTEGER NOT NULL DEFAULT 1
  CHECK (name_customized IN (0, 1));
ALTER TABLE ai_prompt_templates ADD COLUMN description_customized INTEGER NOT NULL DEFAULT 1
  CHECK (description_customized IN (0, 1));
ALTER TABLE ai_prompt_templates ADD COLUMN instruction_customized INTEGER NOT NULL DEFAULT 1
  CHECK (instruction_customized IN (0, 1));

UPDATE ai_prompt_templates
SET
  seed_key = substr(id, length(workspace_id) + 11),
  action = substr(id, length(workspace_id) + 11),
  parameter_kind = CASE substr(id, length(workspace_id) + 11)
    WHEN 'translate' THEN 'target-language'
    WHEN 'change-tone' THEN 'tone'
    ELSE 'none'
  END,
  result_mode = CASE substr(id, length(workspace_id) + 11)
    WHEN 'summarize' THEN 'append'
    WHEN 'extract-key-points' THEN 'append'
    WHEN 'extract-todos' THEN 'append'
    WHEN 'continue-writing' THEN 'append'
    ELSE 'both'
  END,
  name_customized = CASE WHEN
    (substr(id, length(workspace_id) + 11) = 'summarize' AND name = '總結') OR
    (substr(id, length(workspace_id) + 11) = 'extract-key-points' AND name = '提煉要點') OR
    (substr(id, length(workspace_id) + 11) = 'extract-todos' AND name = '提取待辦') OR
    (substr(id, length(workspace_id) + 11) = 'rewrite-proofread' AND name = '改寫與校對') OR
    (substr(id, length(workspace_id) + 11) = 'translate' AND name = '翻譯') OR
    (substr(id, length(workspace_id) + 11) = 'improve-writing' AND name = '改進表達') OR
    (substr(id, length(workspace_id) + 11) = 'fix-spelling-grammar' AND name = '修正錯別字與語法') OR
    (substr(id, length(workspace_id) + 11) = 'make-shorter' AND name = '縮短內容') OR
    (substr(id, length(workspace_id) + 11) = 'make-longer' AND name = '擴寫內容') OR
    (substr(id, length(workspace_id) + 11) = 'simplify-language' AND name = '簡化表達') OR
    (substr(id, length(workspace_id) + 11) = 'change-tone' AND name = '改變語氣') OR
    (substr(id, length(workspace_id) + 11) = 'continue-writing' AND name = '繼續寫作')
    THEN 0 ELSE 1 END,
  description_customized = CASE WHEN
    (substr(id, length(workspace_id) + 11) = 'summarize' AND description = '壓縮全文，提煉主題、結論與可執行結果') OR
    (substr(id, length(workspace_id) + 11) = 'extract-key-points' AND description = '提取最重要觀點，輸出簡潔要點列表') OR
    (substr(id, length(workspace_id) + 11) = 'extract-todos' AND description = '識別可執行任務，生成任務清單') OR
    (substr(id, length(workspace_id) + 11) = 'rewrite-proofread' AND description = '潤色全文並校對語法、標點與結構') OR
    (substr(id, length(workspace_id) + 11) = 'translate' AND description = '翻譯為指定目標語言，保留結構與格式') OR
    (substr(id, length(workspace_id) + 11) = 'improve-writing' AND description = '提升表達清晰度與流暢度') OR
    (substr(id, length(workspace_id) + 11) = 'fix-spelling-grammar' AND description = '只修正錯別字、語法與標點') OR
    (substr(id, length(workspace_id) + 11) = 'make-shorter' AND description = '刪減冗餘，保留關鍵事實') OR
    (substr(id, length(workspace_id) + 11) = 'make-longer' AND description = '在不編造事實的前提下擴寫說明') OR
    (substr(id, length(workspace_id) + 11) = 'simplify-language' AND description = '用更通俗易懂的語言改寫') OR
    (substr(id, length(workspace_id) + 11) = 'change-tone' AND description = '按指定語氣重寫，不改變含義') OR
    (substr(id, length(workspace_id) + 11) = 'continue-writing' AND description = '從筆記末尾自然續寫')
    THEN 0 ELSE 1 END,
  instruction_customized = CASE WHEN
    (substr(id, length(workspace_id) + 11) = 'summarize' AND instruction = '對筆記做真正的精簡總結，不要逐句改寫或複述原文。提煉中心主題、主要觀點、關鍵結論與可執行結果。去掉重複、修辭、舉例和次要細節，除非它們對理解結論必不可少。較長筆記用 3–7 條簡潔 Markdown 要點；短筆記用 1–3 句即可。不要大段照搬原文，也不要新增原文沒有的資訊。保持筆記原語言，只返回總結內容。') OR
    (substr(id, length(workspace_id) + 11) = 'extract-key-points' AND instruction = '提取筆記中最重要的要點，用簡潔的 Markdown 列表輸出。保持原語言，不要新增原文沒有的資訊。') OR
    (substr(id, length(workspace_id) + 11) = 'extract-todos' AND instruction = '從筆記中提取明確或隱含的待辦事項，用 Markdown 任務列表（- [ ]）輸出。保持原語言，不要編造任務。若沒有可執行事項，用原文語言簡短說明。') OR
    (substr(id, length(workspace_id) + 11) = 'rewrite-proofread' AND instruction = '改寫並校對整篇筆記。修正拼寫、語法、標點、清晰度與結構，不改變原意。保持原語言與 Markdown 格式，只返回修訂後的完整內容。') OR
    (substr(id, length(workspace_id) + 11) = 'translate' AND instruction = '將完整筆記翻譯成使用者指定的目標語言。保留原意、Markdown 結構、連結與程式碼塊。只返回譯文，不要評論。') OR
    (substr(id, length(workspace_id) + 11) = 'improve-writing' AND instruction = '改進文字的清晰度、流暢度與用詞，不改變原意。保持原語言與有用的 Markdown 格式，只返回改進後的內容。') OR
    (substr(id, length(workspace_id) + 11) = 'fix-spelling-grammar' AND instruction = '只修正拼寫、語法與標點。不要改變語氣、結構或含義。保持原語言與 Markdown 格式。只返回修正後的內容。') OR
    (substr(id, length(workspace_id) + 11) = 'make-shorter' AND instruction = '把內容改寫得更簡潔。去掉重複與廢話，保留每一個重要事實。保持原語言與有用的 Markdown 格式，只返回縮短後的內容。') OR
    (substr(id, length(workspace_id) + 11) = 'make-longer' AND instruction = '擴寫內容，補充有用的說明與更順暢的過渡，但不要編造事實。保持原語言與有用的 Markdown 格式，只返回擴寫後的內容。') OR
    (substr(id, length(workspace_id) + 11) = 'simplify-language' AND instruction = '用清晰、平實、更好懂的語言改寫內容。保持原意、原語言與有用的 Markdown 格式，只返回簡化後的內容。') OR
    (substr(id, length(workspace_id) + 11) = 'change-tone' AND instruction = '按使用者指定的語氣重寫內容，不改變原意。保持原語言與有用的 Markdown 格式。只返回改寫後的內容。') OR
    (substr(id, length(workspace_id) + 11) = 'continue-writing' AND instruction = '從筆記結束處自然續寫。只返回新增續寫內容，不要重複原文。保持原語言與 Markdown 風格。')
    THEN 0 ELSE 1 END
WHERE id = workspace_id || '_aiprompt_' || substr(id, length(workspace_id) + 11)
  AND substr(id, length(workspace_id) + 11) IN (
    'summarize', 'extract-key-points', 'extract-todos', 'rewrite-proofread',
    'translate', 'improve-writing', 'fix-spelling-grammar', 'make-shorter',
    'make-longer', 'simplify-language', 'change-tone', 'continue-writing'
  );

CREATE UNIQUE INDEX idx_ai_prompt_templates_workspace_seed
  ON ai_prompt_templates(workspace_id, seed_key)
  WHERE seed_key IS NOT NULL;
