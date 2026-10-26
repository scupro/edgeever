const svg = (width: number, height: number, label: string) => 'data:image/svg+xml,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#e4ede7"/><rect width="100%" height="20" fill="#cf4238"/><rect y="${height - 20}" width="100%" height="20" fill="#2d63bc"/><text x="20" y="60" font-family="sans-serif" font-size="28">${label}</text></svg>`);
export const landscape = svg(1600, 320, 'Landscape / full frame');
export const portrait = svg(320, 1200, 'Portrait');
export const longCode = `const endpoint = "https://example.com/${'very-long-path-'.repeat(24)}";\n\tconst result = { message: "保留縮排與全部程式碼內容", ready: true };\nconsole.log(result); // END_CODE`;
const headings = ['專案', '說明', '負責人', '進度', '更新時間', '備註'];
const values = ['圖文匯出', '完整保留每個欄位，不擠成逐字豎排', 'EdgeEver', '驗證中', '2026-10-18', 'END_TABLE'];
const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
export const complexBodyHtml = `<h2>圖文與畫廊</h2><figure><img src="${landscape}" style="width:1600px;height:100px;object-fit:cover"><figcaption>橫圖上下色條均應完整可見</figcaption></figure>
<div data-edgeever-image-gallery="true"><div class="edgeever-image-node" style="height:120px;overflow:hidden"><img src="${portrait}" style="height:100%;object-fit:cover"></div><div class="edgeever-image-node"><img src="${landscape}"></div></div>
<h2>六列表格</h2><div class="tableWrapper" style="width:1800px;overflow:auto"><table style="min-width:1800px"><colgroup>${headings.map(() => '<col style="width:300px">').join('')}</colgroup><tbody><tr>${headings.map(h => `<th colwidth="300">${h}</th>`).join('')}</tr>${[1, 2].map(n => `<tr>${values.map((v, i) => `<td style="min-width:300px">${escape(v)}${i === 0 ? n : ''}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
<h2>合併單元格</h2><table><tbody><tr><th colspan="2">保留合併關係</th><th>狀態</th></tr><tr><td>左</td><td>右</td><td>END_MERGED</td></tr></tbody></table>
<h2>長程式碼</h2><pre><code><span style="white-space:pre">${escape(longCode)}</span></code></pre>
<h2>巢狀列表與引用</h2><ol><li><p>第一層</p><ul><li><p>第二層</p><ol><li><p>第三層完整內容</p><ul><li>第四層 END_LIST</li></ul></li></ol></li></ul></li><li><p>第二項，編號應延續。</p></li></ol>
<blockquote><h3>引用標題</h3><p>引用第一段。</p><blockquote><p>巢狀引用。</p><p>第二段 END_QUOTE</p></blockquote><p>回到外層引用。</p></blockquote><p>END_CONTENT</p>`;

const text = (value: string) => ({ type: 'text', text: value });
const p = (value: string) => ({ type: 'paragraph', content: [text(value)] });
const heading = (value: string) => ({ type: 'heading', attrs: { level: 2 }, content: [text(value)] });
export const complexDocument = { type: 'doc', content: [
  heading('圖文與畫廊'),
  { type: 'image', attrs: { src: landscape, alt: '橫圖上下色條均應完整可見', width: '100%' } },
  { type: 'edgeeverImageGallery', attrs: { layout: '2' }, content: [portrait, landscape].map(src => ({ type: 'image', attrs: { src, width: '100%' } })) },
  heading('六列表格'),
  { type: 'table', content: [{ type: 'tableRow', content: headings.map(label => ({ type: 'tableHeader', attrs: { colwidth: [300] }, content: [p(label)] })) },
    ...[1, 2].map(n => ({ type: 'tableRow', content: values.map((value, i) => ({ type: 'tableCell', attrs: { colwidth: [300] }, content: [p(value + (i === 0 ? n : ''))] })) }))] },
  heading('長程式碼'), { type: 'codeBlock', attrs: { language: 'javascript' }, content: [text(longCode)] },
  heading('巢狀列表與引用'),
  { type: 'orderedList', content: [{ type: 'listItem', content: [p('第一層'), { type: 'bulletList', content: [{ type: 'listItem', content: [p('第二層'), { type: 'orderedList', content: [{ type: 'listItem', content: [p('第三層 END_LIST')] }] }] }] }] }, { type: 'listItem', content: [p('第二項，編號應延續。')] }] },
  { type: 'blockquote', content: [p('引用第一段。'), { type: 'blockquote', content: [p('巢狀引用。'), p('第二段 END_QUOTE')] }, p('回到外層引用。')] },
  p('END_CONTENT'),
] };
