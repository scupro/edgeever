# Firefox Add-ons Submission

## Listing

- Name: EdgeEver Web Clipper
- Summary: Save webpages, selections, images, and Hacker News posts to your self-hosted EdgeEver instance.
- Category: Bookmarks
- Homepage: https://dogbro.store
- Support: https://github.com/scupro/edgeever/issues
- Privacy policy: https://dogbro.store/en/privacy

## Description

EdgeEver Web Clipper saves the current webpage, selected text, a right-clicked image, an X post, a Reddit post, a Xiaohongshu note, a Zhihu answer or article, or a GitHub repository's address and description directly to the self-hosted EdgeEver instance you configure.

- Extract readable article content, or right-click selected text and save that passage only.
- Right-click an image and save that image file as a new note. From Google Search, the note records Google Search and the keyword.
- On X, right-click the post text and save the full post, including text behind Show more, plus photos already shown.
- On Xiaohongshu, right-click the note text and save the title, text, and photos. Comments are left out.
- On Zhihu, right-click the answer or article text and save the title, author, text, and photos. Comments are left out. On a feed or question page, the item under the pointer is saved.
- On Reddit, right-click a post and save its title, author, community, text, links, and images. Comments are left out.
- On a GitHub repository page or code tree, right-click the page background, the description, or the README text and save the repository address and description.
- On Hacker News post detail pages, save the title, author, original time, points at capture, linked page and main-post text. Comments are left out.
- On a YouTube or Bilibili watch page, save that video as a note.
- These commands stay on the top-level right-click menu.
- Convert captured HTML to Markdown locally.
- Choose a default EdgeEver notebook.
- Send content directly to your instance without an EdgeEver-operated relay.
- No advertising, analytics, tracking, or telemetry.

Before using the extension, enter your EdgeEver instance URL and API token in the extension settings. The extension reads and sends page content only after you choose a clip or save command, including **Save Reddit post to EdgeEver**.

## Data collection and transmission

- `authenticationInfo`: the API token is sent only to the EdgeEver instance configured by the user.
- `browsingActivity`: the current page URL is included in the note created by the user.
- `websiteContent`: the selected text, extracted article body, image file, or video page the user chooses is included in the note created by the user.

The project maintainers do not receive or retain this data. Instance settings are stored in the browser's local extension storage. Page content goes only to the EdgeEver instance the user configured. When the token includes `ai:generate` and the workspace has a default model, that instance sends the caption text to the configured model provider. The extension does not send the page or its audio to any other third party.

## Reviewer notes

1. Open the extension settings.
2. Enter the provided review EdgeEver instance URL and API token.
3. Choose **Test connection**, select a notebook, and save.
4. Open a normal HTTP or HTTPS webpage.
5. Open the extension, choose **Clip current page**, and verify that the success message appears.
6. On a normal webpage, select a passage, right-click it, choose **Save selection to EdgeEver**, and verify the note contains that passage and the page link.
7. On a normal webpage, right-click an image, choose **Save image to EdgeEver**, and verify the new note contains the image.
8. Open one X post page, right-click the post text (not a photo), choose **Save post to EdgeEver**, and verify the note contains the post text and the post link.
9. Open one GitHub repository page, right-click the description or README text, choose **Save repository info to EdgeEver**, and verify the note contains the repository address and description.
10. Open one Xiaohongshu note, right-click the note text (not a photo), choose **Save note to EdgeEver**, and verify the note contains the title, text, and source link.
11. Open one Zhihu answer or article, right-click the text (not a photo), choose **Save answer or article to EdgeEver**, and verify the note contains the title, text, and source link.
12. Open one Reddit post, right-click the post text, choose **Save Reddit post to EdgeEver**, and verify the note contains the title, author, community, and source link without comments.
13. Verify the created notes in the review EdgeEver instance.
14. Open a Hacker News post detail page and choose **Save Hacker News post to EdgeEver** or **Clip current page**. Verify the main post and source are saved without comments; a selected passage takes priority for the toolbar action.
15. On a YouTube or Bilibili watch page, right-click the page and choose **Save video note to EdgeEver**. The new menu runs only after that click. Lives and other unsupported pages show a message and create no note.

Restricted browser pages, extension stores, built-in PDF viewers, and other privileged pages cannot be captured.

## Reproducible build

Requirements:

- Bun 1.3.14 or later
- Node.js 20 or later, required by `web-ext`

Commands:

```sh
bun install --frozen-lockfile
bun run test:extension
bun run build:extension:firefox
bun run lint:extension:firefox
```

The reviewable source is the repository source before Vite bundling. Third-party packages are installed from the npm registry through the committed Bun lockfile.

## 中文商店說明

EdgeEver 網頁剪藏外掛可將當前網頁、選中的文字、右鍵選中的圖片、X 上的一條推文、Reddit 上的一條帖子、小紅書上的一篇筆記，或知乎上的一篇回答或文章直接儲存到使用者配置的自託管 EdgeEver 實例。

- 提取適合閱讀的文章正文。選中文字後右鍵，只儲存這一段。
- 在圖片上右鍵，把圖片檔案存成一條新筆記。從 Google 搜尋儲存時，筆記記錄“Google 搜尋”和關鍵詞。
- 在 X 上右鍵推文正文。長文會先展開“顯示更多”，再儲存全文和已經顯示的圖片。
- 在小紅書筆記正文上右鍵，儲存標題、正文和圖片。評論不會寫入。
- 在知乎回答或文章正文上右鍵，儲存標題、作者、正文和圖片。評論不會寫入。首頁和問題頁儲存的是指標下的那一篇。
- 在 Reddit 帖子正文上右鍵，儲存標題、作者、社群、正文、連結和圖片，不寫入評論。
- 在 Hacker News 主帖詳情頁儲存標題、作者、原始時間、剪藏時的分數、外部連結和主帖正文，不寫入評論。
- 可以把 YouTube 或嗶哩嗶哩播放頁儲存為影片筆記。
- 這些命令直接出現在右鍵選單的第一級。
- 在瀏覽器本地將 HTML 轉換為 Markdown。
- 可選擇預設 EdgeEver 筆記本。
- 資料直接傳送到使用者自己的實例，不經過 EdgeEver 中轉服務。
- 不包含廣告、分析、追蹤或遙測。

使用前，請在外掛設定中填寫 EdgeEver 實例地址和 API Token。外掛只會在使用者選擇剪藏或儲存命令（包括“儲存 Reddit 帖子到 EdgeEver”）後讀取併傳送網頁內容。
