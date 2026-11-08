import { markdownToDoc } from "@edgeever/shared";
import { Fragment, Slice } from "@tiptap/pm/model";
import type { EditorView } from "@tiptap/pm/view";

/**
 * Pasting a plain-text link to external media used to insert the literal
 * markdown (`[音訊](https://host/a.mp3)`) or the raw tag
 * (`<audio src="https://host/a.mp3">`) as text, because nothing in the editor
 * parsed pasted plain text as Markdown.
 *
 * Only pastes that actually reference external media are converted, so ordinary
 * prose is never re-parsed as Markdown.
 */
const MEDIA_LINK_PATTERN = /\]\(\s*https?:\/\/[^\s)]+\.(?:aac|flac|m4a|m4v|mov|mp3|mp4|oga|ogg|ogv|opus|wav|webm)(?:[?#][^\s)]*)?\s*\)/i;
const HTML_MEDIA_TAG_PATTERN = /<(?:audio|video)\b[^>]*?\bsrc\s*=\s*["']https?:\/\/[^"']+["']/i;
const BARE_MEDIA_URL_PATTERN = /(?:^|\s)https?:\/\/[^\s]*\.(?:aac|flac|m4a|m4v|mov|mp3|mp4|oga|ogg|ogv|opus|wav|webm)(?:[?#][^\s]*)?/i;

export const containsExternalMediaMarkup = (text: string) =>
  MEDIA_LINK_PATTERN.test(text)
  || HTML_MEDIA_TAG_PATTERN.test(text)
  || BARE_MEDIA_URL_PATTERN.test(text);

/**
 * Converts pasted plain text that references external media into document
 * nodes, so `[label](*.mp3)` / `<audio src>` reach the shared parser (and thus
 * the audio/video players) instead of being inserted verbatim.
 */
export const insertExternalMediaPaste = (view: EditorView, text: string): boolean => {
  if (!containsExternalMediaMarkup(text)) {
    return false;
  }

  const doc = markdownToDoc(text);
  if (doc.content.length === 0) {
    return false;
  }

  const nodes = doc.content.map((node) => view.state.schema.nodeFromJSON(node));
  const slice = Slice.maxOpen(Fragment.from(nodes));
  view.dispatch(view.state.tr.replaceSelection(slice).scrollIntoView());
  return true;
};