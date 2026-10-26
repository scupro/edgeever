import { expect, test, type Locator, type Page } from "@playwright/test";

const selectEditorText = async (page: Page, editor: Locator, text: string) => {
  const selected = await editor.evaluate((element, needle) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const value = node.textContent ?? "";
      const start = value.indexOf(needle);
      if (start >= 0) {
        const range = document.createRange();
        range.setStart(node, start);
        range.setEnd(node, start + needle.length);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        element.dispatchEvent(new Event("selectionchange", { bubbles: true }));
        element.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
        return selection?.toString() ?? "";
      }
      node = walker.nextNode();
    }
    return "";
  }, text);

  expect(selected).toBe(text);
  await expect(page.getByRole("button", { name: "用 AI 處理" })).toBeVisible();
};

const mockAiReplacement = async (page: Page, replacement: string) => {
  await page.route("**/api/v1/ai/generate", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/event-stream; charset=utf-8",
      body: [
        `data: ${JSON.stringify({ type: "start" })}`,
        `data: ${JSON.stringify({ type: "text-delta", text: replacement })}`,
        `data: ${JSON.stringify({ type: "finish", finishReason: "stop" })}`,
        "",
      ].join("\n\n"),
    });
  });
};

const openMemo = async (page: Page, memoId: string, notebookName: string) => {
  await page.goto("/");
  await page.getByRole("button", { name: new RegExp(notebookName) }).click();
  await page.locator(`[data-memo-id="${memoId}"]`).locator("button").first().click();
  return page.locator(".ProseMirror[contenteditable='true']");
};

const applyAiReplacement = async (page: Page) => {
  await page.getByRole("button", { name: "用 AI 處理" }).click();
  const dialog = page.getByRole("dialog", { name: "AI 筆記助手" });
  await expect(dialog.getByText("生成結果", { exact: true })).toBeVisible();
  await expect(dialog.getByText("AI 輸出會先作為草稿展示，只有你主動操作後才會修改筆記。", { exact: true })).toHaveCount(0);
  await expect(dialog.getByText("AI 草稿", { exact: true })).toHaveCount(0);
  await dialog.getByRole("button", { name: "生成", exact: true }).click();
  await expect(dialog.getByRole("button", { name: "接受並替換選中內容" })).toBeEnabled();
  await dialog.getByRole("button", { name: "接受並替換選中內容" }).click();
  await expect(dialog).toBeHidden();
};

test.describe("AI selected-text replacement", () => {
  let notebookId: string;
  let notebookName: string;
  const createdMemoIds: string[] = [];

  test.beforeAll(async ({ request }) => {
    const response = await request.get("/api/v1/notebooks");
    expect(response.ok()).toBe(true);
    const body = await response.json() as { notebooks: Array<{ id: string; name: string }> };
    notebookId = body.notebooks[0]?.id;
    notebookName = body.notebooks[0]?.name;
    expect(notebookId).toBeTruthy();
    expect(notebookName).toBeTruthy();
  });

  test.afterEach(async ({ request }) => {
    while (createdMemoIds.length) {
      const memoId = createdMemoIds.pop();
      if (!memoId) continue;
      await request.delete(`/api/v1/memos/${memoId}`);
      await request.delete(`/api/v1/memos/${memoId}?permanent=1`);
    }
  });

  const createMemo = async (page: Page, title: string, contentMarkdown: string) => {
    const response = await page.request.post("/api/v1/memos", {
      data: { notebookId, title, contentMarkdown },
    });
    expect(response.status()).toBe(201);
    const memo = (await response.json() as { memo: { id: string } }).memo;
    createdMemoIds.push(memo.id);
    return memo;
  };

  test("keeps list-like replacement text inside its surrounding paragraph", async ({ page }) => {
    const marker = `ai-inline-replace-${Date.now()}`;
    const content = "入口放在筆記欄中，1. - 校對先預覽結果，再進行寫入。";
    const memo = await createMemo(page, marker, content);
    await mockAiReplacement(page, "\n1. - 校對\n");

    const editor = await openMemo(page, memo.id, notebookName);
    await expect(editor).toHaveText(content);
    await selectEditorText(page, editor, "1. - 校對");
    await applyAiReplacement(page);

    await expect(editor.locator(":scope > p")).toHaveCount(1);
    await expect(editor.locator(":scope > p")).toHaveText(content);
    await expect(editor.locator("ol, ul")).toHaveCount(0);
  });

  test("keeps a whole selected list item in its original list", async ({ page }) => {
    const marker = `ai-list-replace-${Date.now()}`;
    const content = [
      "入口放在選中文字選單和筆記欄中，",
      "",
      "1. - 校對",
      "",
      "先預覽結果，再進行寫入。",
    ].join("\n");
    const memo = await createMemo(page, marker, content);
    await mockAiReplacement(page, "\n- 已校對\n");

    const editor = await openMemo(page, memo.id, notebookName);
    await selectEditorText(page, editor, "- 校對");
    await page.getByRole("button", { name: "用 AI 處理" }).click();
    const dialog = page.getByRole("dialog", { name: "AI 筆記助手" });
    await expect(dialog.getByText("- 校對", { exact: true })).toBeVisible();
    await expect(dialog.getByText("1. - 校對", { exact: true })).toHaveCount(0);
    await dialog.getByRole("button", { name: "生成", exact: true }).click();
    await expect(dialog.getByRole("button", { name: "接受並替換選中內容" })).toBeEnabled();
    await dialog.getByRole("button", { name: "接受並替換選中內容" }).click();
    await expect(dialog).toBeHidden();

    await expect(editor.locator(":scope > p")).toHaveCount(2);
    await expect(editor.locator(":scope > ol")).toHaveCount(1);
    await expect(editor.locator(":scope > ol > li > p")).toHaveText("- 已校對");
    await expect(editor.locator("ol ol, ol ul")).toHaveCount(0);
    await expect(editor.locator(":scope > p").first()).toHaveText("入口放在選中文字選單和筆記欄中，");
    await expect(editor.locator(":scope > p").last()).toHaveText("先預覽結果，再進行寫入。");
  });

  test("does not split a paragraph when a rewrite returns multiple blocks", async ({ page }) => {
    const marker = `ai-multiblock-replace-${Date.now()}`;
    const content = "入口放在筆記欄中，線上模式下先預覽結果，再進行寫入。";
    const memo = await createMemo(page, marker, content);
    await mockAiReplacement(page, "最佳化後的第一部分\n\n最佳化後的第二部分");

    const editor = await openMemo(page, memo.id, notebookName);
    await selectEditorText(page, editor, "線上模式下");
    await applyAiReplacement(page);

    await expect(editor.locator(":scope > p")).toHaveCount(1);
    await expect(editor.locator(":scope > p")).toHaveText(
      "入口放在筆記欄中，最佳化後的第一部分 最佳化後的第二部分先預覽結果，再進行寫入。",
    );
  });
});
