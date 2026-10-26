import { prepareJikeWebDetail } from "./jike-web-test-state.mjs";
import { readJikeWebStateInPage } from "./src/jike-web-state.ts";
import { runInNewContext } from "node:vm";
import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { createDocument } from "@mixmark-io/domino";
import { readArticle } from "./src/article-clip.ts";
import { readJike as readJikeSource, jikeExpandButton } from "./src/jike-clip.ts";
import { readDouban, doubanCommentTarget } from "./src/douban-clip.ts";
import { isPlatformClip, platformTarget, socialPlatform } from "./src/platform-clip.ts";
import { markdownToDoc } from "../../packages/shared/src/content.ts";

const detailState=(doc,pageUrl,id)=>runInNewContext(`(${readJikeWebStateInPage.toString()})(id)`,{document:doc,location:{href:pageUrl},URL,id});
const readJike=(doc,url,target=platformTarget(url),state)=>readJikeSource(doc,url,target,state ?? (url.includes('/u/') ? detailState(doc,url,target?.id) : undefined));

const urls = {
  wechat:"https://mp.weixin.qq.com/s/TC-ONpL3PGklsD0yhtcuBQ",sspai:"https://sspai.com/post/92653",juejin:"https://juejin.cn/post/6972051526416072717",
  jike:"https://m.okjike.com/originalPosts/66ac89b0314f5cced41012d3","jike-grid":"https://m.okjike.com/originalPosts/6715e824d9dc81724c2ec74d","jike-long":"https://m.okjike.com/originalPosts/64c9dd9a2edae6abdc610605",
  "douban-book":"https://book.douban.com/review/16093028/","douban-movie":"https://movie.douban.com/review/17798662/","douban-music":"https://music.douban.com/review/17855287/","douban-note":"https://www.douban.com/note/814698224/",
};
const fixture=(name)=>{
 const doc=createDocument(readFileSync(new URL(`./fixtures/platforms/${name}.html`,import.meta.url),"utf8"));
 if(name==='jike-web-detail'||name==='jike-web-grid')prepareJikeWebDetail(doc,name==='jike-web-grid'?'6715e824d9dc81724c2ec74d':undefined);
 return doc;
};
const read=(name,doc=fixture(name))=>name.startsWith("jike") ? readJike(doc,urls[name]) : name.startsWith("douban") ? readDouban(doc,platformTarget(urls[name]),urls[name]) : readArticle(doc,urls[name],"公眾號");

test("article URLs normalize aliases and tracking, retaining only WeChat query identity/signature",()=>{
  for (const url of Object.values(urls)) expect(platformTarget(url+"?from=share#comments")?.url).toBe(url);
  const long="https://mp.weixin.qq.com/s?__biz=MzA%3D%3D&mid=123&idx=1&sn=abc&scene=21&pass_ticket=unused";
  expect(platformTarget(long)).toEqual({platform:"wechat",id:"MzA==/123/1",url:"https://mp.weixin.qq.com/s?__biz=MzA%3D%3D&mid=123&idx=1&sn=abc"});
  expect(platformTarget(long.replace("&sn=abc", ""))?.platform).toBe("wechat");
  expect(platformTarget(long+"&mid=456")).toBeNull();
  expect(platformTarget(urls.jike.replace("m.okjike.com/originalPosts", "web.okjike.com/originalPost"))?.url).toBe(urls.jike);
  for (const url of [urls.wechat.replace("mp.weixin.qq.com","mp.weixin.qq.com.evil.test"),urls.sspai+"/extra",urls.juejin.replace("https:","http:"),urls["douban-book"].replace("https://","https://u:p@"),"https://mp.weixin.qq.com/","https://sspai.com/","https://juejin.cn/","https://web.okjike.com/"]) expect(platformTarget(url)).toBeNull();
});

for(const [name,author,images] of [["wechat","陳雲亮",21],["sspai","北鴞",9],["juejin","小和山的菜鳥們",2],["jike","汐箋",1],["jike-grid","彗星咻咻咻",9],["jike-long","泛函",1],["douban-book","完顏打骨折",6],["douban-movie","希音",2],["douban-note","孩子氣概",6],["douban-music",null,3]]) {
  test(`${name}: real DOM retains own text/author/images and satisfies the save contract`,()=>{
    const result=read(name); expect(result.ok).toBe(true);
    if(author) expect(result.clip.author).toBe(author);
    expect([...result.clip.markdown.matchAll(/!\[/g)]).toHaveLength(images);
    expect(isPlatformClip(result.clip,platformTarget(urls[name]))).toBe(true);
    expect(result.clip.markdown).not.toMatch(/javascript:|<script|寫留言|收集各項錯誤|檢查檢視/);
  });
}

test("WeChat keeps its account, author, declared cover and lazy image URLs while excluding share/reward controls",()=>{
  const result=read("wechat");
  expect(result.clip.markdown).toContain("公眾號: 大資料架構之道");
  expect(result.clip.markdown).toContain("選擇模型進行對話");
  expect(result.clip.markdown).toContain("https://mmbiz.qpic.cn/");
  expect(result.clip.markdown).not.toContain("喜歡作者");
  expect(result.clip.markdown).not.toContain("wx_lazy=1");
  expect(result.clip.publishedAt).toEqual({value:"2025-02-22T23:02:00",precision:"datetime"});
});

test("Sspai retains its update as a quote with displayed time, bold title and complete body after the original article",()=>{
  const doc=fixture("sspai"),original=doc.body.outerHTML,result=read("sspai",doc);
  expect(result.ok).toBe(true);
  expect(result.clip.markdown).toContain("> 以下內容於 10:00更新\n>\n> **中國大陸推出睡眠呼吸暫停跡象提示功能**\n>\n> 2026 年 10 月 14 日，Apple 在中國大陸正式推出 Apple Watch 睡眠呼吸暫停跡象提示功能，文章根據相關資訊更新並重推。");
  expect(result.clip.markdown.indexOf("> **中國大陸推出")).toBeGreaterThan(result.clip.markdown.indexOf("手腕上的「心率檢測」靠譜嗎"));
  expect(result.clip.markdown.match(/中國大陸推出睡眠呼吸暫停跡象提示功能/g)).toHaveLength(1);
  expect(result.clip.publishedAt).toEqual({value:"2024-10-10",precision:"date"});
  expect(result.clip.markdown).not.toContain("42位派友已充電");
  expect(doc.body.outerHTML).toBe(original);
});

test("Sspai update blocks stay scoped and ordered, keeping rich content while omitting hidden or missing metadata",()=>{
  const doc=fixture("sspai"),updates=doc.querySelector('.update__details__wrapper');
  const later=doc.querySelector('.update-details-item').cloneNode(true);later.id='update-1';
  later.querySelector('.update-title').textContent='後續更正';
  later.querySelector('.update-date').textContent='以下內容於 昨天 18:30更新';
  later.querySelector('.update-body').innerHTML='<p>補充說明 <a href="https://example.test/source">官方來源</a></p><pre><code class="language-js">const corrected = true;</code></pre><img data-src="https://example.test/update.png">';
  later.insertAdjacentHTML('beforeend','<button>不應儲存的互動控制元件</button><p>不應儲存的推薦資訊</p>');updates.appendChild(later);
  const unrelated=later.cloneNode(true);unrelated.querySelector('.update-body').textContent='其他區域的同名更新';doc.body.appendChild(unrelated);
  const result=read('sspai',doc);expect(result.ok).toBe(true);
  expect(result.clip.markdown.indexOf('> **後續更正**')).toBeGreaterThan(result.clip.markdown.indexOf('> **中國大陸推出'));
  for(const text of ['以下內容於 昨天 18:30更新','[官方來源](https://example.test/source)','> ```js\n> const corrected = true;','> ![](https://example.test/update.png)']) expect(result.clip.markdown).toContain(text);
  for(const text of ['不應儲存的互動控制元件','不應儲存的推薦資訊','其他區域的同名更新']) expect(result.clip.markdown).not.toContain(text);
  expect(result.clip.markdown.match(/!\[/g)).toHaveLength(10);
  later.querySelector('.update-title').remove();later.querySelector('.update-date').setAttribute('hidden','');
  const optional=read('sspai',doc);expect(optional.ok).toBe(true);expect(optional.clip.markdown).toContain('補充說明');expect(optional.clip.markdown).not.toContain('昨天 18:30');
  updates.setAttribute('style','display:none');
  const hidden=read('sspai',doc);expect(hidden.ok).toBe(true);expect(hidden.clip.markdown).not.toContain('2026 年 10 月 14 日');expect(hidden.clip.markdown).not.toContain('補充說明');
});

test("Sspai authors remain within the selected article, retaining coauthors and optional absence",()=>{
  const doc=fixture("sspai"),article=doc.querySelector("article.normal-article"),own=article.querySelector('.article__header__author');
  const outside=own.cloneNode(true);outside.querySelectorAll('.ss__user__nickname > span').forEach(node=>node.textContent='OTHER ARTICLE AUTHOR');doc.body.insertBefore(outside,article);
  const coauthor=own.cloneNode(true);coauthor.querySelectorAll('.ss__user__nickname > span').forEach(node=>node.textContent='合著者');own.after(coauthor);
  const hidden=own.cloneNode(true);hidden.querySelectorAll('.ss__user__nickname > span').forEach(node=>node.textContent='HIDDEN AUTHOR');hidden.style.display='none';own.after(hidden);
  const result=read('sspai',doc);expect(result.ok).toBe(true);expect(result.clip.author).toBe('北鴞, 合著者');
  expect(result.clip.publishedAt).toEqual({value:'2024-10-10',precision:'date'});
  Array.from(article.querySelectorAll('.article__header__author')).forEach(node=>node.remove());
  const optional=read('sspai',doc);expect(optional.ok).toBe(true);expect(optional.clip.author).toBeUndefined();
});

test("WeChat removes the article's own follow banner, decorative dividers, ad widgets and trailing recommendation",()=>{
  const doc=fixture("wechat"),original=doc.body.outerHTML,result=read("wechat",doc);
  expect(result.ok).toBe(true);
  for(const noise of ["點選上方藍字","關於我們","分割線","現階段的AI沒有推理能力","DRPKCGMAPjK","iaic5Jv7oDhWHr79"]) expect(result.clip.markdown).not.toContain(noise);
  for(const text of ["什麼是Deepseek V3","model='deepseek-reasoner'","點選右上角","選擇模型進行對話","至此，可以體驗由華為雲昇騰AI晶片提供的滿血版DeepSeek R1"]) expect(result.clip.markdown).toContain(text);
  for(const model of ["DeepSeek-R1-671B-32K","DeepSeek-V3-671B-32K","DeepSeek-R1-671B-8K","DeepSeek-V3-671B-8K","DeepSeek-V3-671B-4K","DeepSeek-R1-671B-4K"]) expect(result.clip.markdown).toContain(model);
  const clean=fixture("wechat");clean.querySelector("mp-common-cpsad").innerHTML='<p>廣告短劇：立即觀看</p><img src="https://example.test/ad-cover.png">';
  expect(read("wechat",clean).clip.markdown).not.toContain("廣告短劇");expect(read("wechat",clean).clip.markdown).not.toContain("ad-cover.png");
  expect(doc.body.outerHTML).toBe(original);
});

test("WeChat keeps tutorial actions, quoted follow wording, meaningful GIFs and inline article references",()=>{
  const doc=fixture("wechat"),body=doc.querySelector("#js_content");
  body.innerHTML='<p>教程示例：點選上方藍字是常見的關注話術。</p><blockquote><p>點選上方藍字，關注我們</p></blockquote><pre><code>點選上方藍字，關於我們</code></pre><p>點選右上角“註冊”，按要求填寫即可。</p><p><img class="__bg_gif" alt="模型推理過程" data-src="https://example.test/reasoning.gif"></p><p>參見 <a href="https://mp.weixin.qq.com/s/reference">相關教程</a>，繼續下面的步驟。</p><section><a href="https://mp.weixin.qq.com/s/inline"><span class="h5_image_link"><img src="https://example.test/inline.png"></span>文章引用</a></section><p>正文在引用之後繼續。</p><p><a href="https://example.test/conclusion">結論來源</a></p>';
  const result=read("wechat",doc);expect(result.ok).toBe(true);
  for(const text of ["點選上方藍字是常見的關注話術","關注我們","關於我們","點選右上角","reasoning.gif","[相關教程]","文章引用","inline.png","正文在引用之後繼續","[結論來源]"]) expect(result.clip.markdown).toContain(text);
});

test("WeChat restores the real article's styled sections and nested step headings without changing its title",()=>{
  const doc=fixture("wechat"),original=doc.body.outerHTML,result=read("wechat",doc);
  expect(result.ok).toBe(true);
  expect(result.clip.title).toBe("華為雲DeepSeek-R1&V3滿血版體驗：10分鐘讓你輕鬆掌握AI大模型應用技巧！");
  expect(result.clip.markdown.match(/^#{2,6} .+$/gm).map(line=>line.replace(/\s+/g,' '))).toEqual([
    "## 什麼是Deepseek V3","## 什麼是DeepSeek R1","## 華為雲ModelAart Studio（MaaS）",
    "### 第一步：註冊華為雲賬號","### 第二步：領取免費tokens","### 第三步：安裝cherry studio","### 第四步：配置並使用cherry studio",
  ]);
  expect(result.clip.markdown.match(/!\[/g)).toHaveLength(21);
  expect(doc.body.outerHTML).toBe(original);
});

test("WeChat keeps bold prose, ordinary numbered actions, quotes, code and captions out of inferred headings",()=>{
  const doc=fixture("wechat"),body=doc.querySelector("#js_content");
  body.innerHTML='<p style="font-size:14px">這是一段說明正文。它用於解釋下面的操作和普通排版，包含足夠的實際內容。</p><p style="font-size:14px"><strong>這是一段完整加粗的正文。</strong></p><p style="font-size:14px"><span style="font-size:24px">首</span>字放大，其餘還是正文。</p><p style="font-size:16px">這一段字號略大，但仍是正文說明。</p><p>1.點選新增模型</p><p>第一步：完成註冊，再繼續操作。</p><p>第二步：檢查輸入，然後確認。</p><blockquote><p style="font-size:24px">引用中的排版</p></blockquote><pre><code>第一步：程式碼示例</code></pre><figure><figcaption><p style="font-size:24px">圖片說明</p></figcaption></figure><h4>原有四級標題</h4>';
  const result=read("wechat",doc);expect(result.ok).toBe(true);
  expect(result.clip.markdown.match(/^#{1,6} .+$/gm)).toEqual(['#### 原有四級標題']);
  expect(result.clip.markdown).toContain('**這是一段完整加粗的正文。**');
  for(const text of ['1.點選新增模型','第一步：完成註冊','第二步：檢查輸入','引用中的排版','第一步：程式碼示例','圖片說明']) expect(result.clip.markdown).toContain(text);
});

test("WeChat preserves distinct typography levels and leaves a lone step label as prose",()=>{
  const doc=fixture("wechat"),body=doc.querySelector("#js_content");
  body.innerHTML='<p style="font-size:14px">這裡是文章正文，說明各個章節的內容與操作，普通段落保持原樣。</p><p style="font-size:24px">主要章節</p><p style="font-size:15pt">章節下的主題</p><p>第一步：只有一條的操作說明</p><h4>已有小節</h4>';
  const result=read("wechat",doc);expect(result.ok).toBe(true);
  expect(result.clip.markdown.match(/^#{1,6} .+$/gm)).toEqual(['## 主要章節','### 章節下的主題','#### 已有小節']);
  expect(result.clip.markdown).toContain('\n\n第一步：只有一條的操作說明');
});

test("optional article metadata does not reject readable content; hidden metadata remains absent",()=>{
  for(const name of ["wechat","sspai","juejin"]) {
    const doc=fixture(name); for(const n of Array.from(doc.querySelectorAll('meta,link,#js_name,#js_author_name,.article__header__author,.author-info-block'))) n.remove();
    expect(read(name,doc).ok).toBe(true);
  }
  const doc=fixture("wechat");doc.querySelector("#js_author_name").setAttribute("hidden","");
  expect(read("wechat",doc).clip.author).toBeUndefined();
});

test("Juejin code language, indentation and literal fence content survive UI cleanup",()=>{
  const result=read("juejin");
  expect(result.clip.markdown).toContain("```javascript\nlet readFile = (path, callBack) => {");
  expect(result.clip.markdown).toContain("  setTimeout(function () {");
  expect(result.clip.markdown).not.toContain("複製程式碼");
  expect(result.clip.publishedAt).toEqual({value:"2021-06-10T06:41:24.000Z",precision:"datetime"});
});

test("Juejin's comparison table retains every header, row, cell and inline link in the editor document",()=>{
  const source=fixture('juejin'),result=read('juejin',source);
  expect(result.ok).toBe(true);
  const tables=markdownToDoc(result.clip.markdown).content.filter(node=>node.type==='table');
  expect(tables).toHaveLength(1);
  const text=node=>node.text || (node.content || []).map(text).join('');
  expect(tables[0].content.map(row=>row.content.map(text))).toEqual(Array.from(source.querySelector('table').rows).map(row=>Array.from(row.cells).map(cell=>cell.textContent.trim())));
  expect(tables[0].content[0].content.map(cell=>cell.type)).toEqual(['tableHeader','tableHeader','tableHeader']);
  expect(JSON.stringify(tables[0])).toContain(new URL(source.querySelector('table a').getAttribute('href')).href);
});

test("known article identity conflicts and hidden article bodies never become whole-page captures",()=>{
  for(const [name,selector] of [["wechat","#js_content"],["sspai",".article__main__content"],["juejin",".article-viewer"]]) {
    const doc=fixture(name);doc.querySelector(selector).setAttribute("hidden","");expect(read(name,doc)).toEqual({ok:false,reason:"unreadable"});
    const wrong=fixture(name); const declared=wrong.querySelector('link[rel="canonical"],meta[property="og:url"]');declared.setAttribute(declared.tagName==='META'?'content':'href',urls[name]+"/extra");expect(read(name,wrong)).toEqual({ok:false,reason:"changed"});
  }
});

test("Jike uses the public original picture URL, retaining nine ordered images and a complete long post",()=>{
  expect(read("jike").clip.markdown).toContain("/meta-keep-list/");
  expect(read("jike").clip.markdown).not.toContain("thumbnail/");
  const grid=read("jike-grid"); expect([...grid.clip.markdown.matchAll(/!\[/g)]).toHaveLength(9);
  const long=read("jike-long");expect(long.ok).toBe(true);expect(long.clip.markdown).toContain("《世界盡頭的咖啡館》和《斯坦福大學人生設計課》");
  expect(long.clip.markdown).not.toContain("?s=");
});

test("Jike missing media, truncated text or stale post metadata fail before saving",()=>{
  const doc=fixture("jike-grid");doc.querySelector(".image-item").remove();expect(read("jike-grid",doc)).toEqual({ok:false,reason:"incomplete"});
  const short=fixture("jike-long");short.querySelector(".text").textContent="我在即刻寫東西";expect(read("jike-long",short)).toEqual({ok:false,reason:"incomplete"});
  const wrong=fixture("jike");const state=wrong.querySelector("#__NEXT_DATA__"),data=JSON.parse(state.textContent);data.props.pageProps.post.id="6715e824d9dc81724c2ec74d";state.textContent=JSON.stringify(data);expect(read("jike",wrong)).toEqual({ok:false,reason:"changed"});
});

test("Douban reviews and diary exclude controls and do not label edit time as original publication",()=>{
  expect(read("douban-book").clip.markdown).not.toContain("來自豆瓣App");
  expect(read("douban-book").clip.markdown).not.toContain("有關鍵情節透露");
  expect(read("douban-book").clip.publishedAt).toBeUndefined();
  expect(read("douban-note").clip.publishedAt).toEqual({value:"2021-10-14T22:06:17",precision:"datetime"});
});

test("Douban book review retains its seven displayed paragraphs and all six image positions",()=>{
  const doc=fixture('douban-book'),original=doc.body.outerHTML,result=read('douban-book',doc);
  const text=node=>node.text || (node.content || []).map(text).join('');
  const expected=Array.from(doc.querySelectorAll('.review-content p')).flatMap(p=>p.textContent.split(/\n\s*\n/));
  const paragraphs=markdownToDoc(result.clip.markdown).content.filter(node=>node.type==='paragraph').map(text);
  expect(expected).toHaveLength(7);expect(paragraphs.slice(1)).toEqual(expected);
  expect(result.clip.markdown).toContain('\n\n在路上，我遇到了瓦爾澤');
  expect(result.clip.markdown).toContain('\n\n有人說，他寫的是西方的散文');
  expect(result.clip.markdown.match(/!\[/g)).toHaveLength(6);
  expect(result.clip.markdown.indexOf('p11097735.webp')).toBeGreaterThan(result.clip.markdown.indexOf('在路上'));
  expect(result.clip.markdown.indexOf('p11097735.webp')).toBeLessThan(result.clip.markdown.indexOf('《散步》是'));
  expect(doc.body.outerHTML).toBe(original);
});

test("Douban paragraph breaks preserve nested emphasis, links and literal code without splitting code's own blank lines",()=>{
  const doc=fixture('douban-book');
  doc.querySelector('.review-content').innerHTML='<p>首段<strong>加粗\n\n仍然加粗<a href="https://example.test/source">連結</a></strong>第二段\n\n末段<code>alpha\n\nbeta</code></p>';
  const result=read('douban-book',doc);
  expect(result.clip.markdown).toContain('首段**加粗**\n\n**仍然加粗[連結](https://example.test/source)**第二段\n\n末段');
  expect(result.clip.markdown).toContain('`alpha beta`');
});

test("Douban music review preserves each displayed single newline as a hard break",()=>{
  const doc=fixture('douban-music'),original=doc.body.outerHTML,result=read('douban-music',doc);
  const expected=doc.querySelector('.review-content p').textContent;
  const lines=expected.split(/\r?\n/);
  expect(lines.length).toBeGreaterThan(3);
  const text=node=>node.text || (node.content || []).map(child=>child.type==='hardBreak'?'\n':text(child)).join('');
  const paragraph=markdownToDoc(result.clip.markdown).content.find(node=>node.type==='paragraph' && text(node).startsWith(lines[0]));
  expect(text(paragraph)).toBe(lines.map(line=>line.trim()).join('\n'));
  expect(paragraph.content.filter(node=>node.type==='hardBreak')).toHaveLength(lines.length-1);
  expect(result.clip.markdown.match(/!\[/g)).toHaveLength(3);
  expect(doc.body.outerHTML).toBe(original);
});

test("Douban short comments bind to the chosen own permalink and do not capture neighbouring comments",()=>{
  const doc=fixture("douban-comments"),page="https://book.douban.com/subject/36864764/comments/",card=doc.querySelector(".comment-item");
  const target=doubanCommentTarget(card,page);expect(target.url).toBe("https://book.douban.com/comment/4237804504/");
  expect(platformTarget(page)).toBeNull();expect(socialPlatform(page)).toBe("douban");
  const result=readDouban(doc,target,page);expect(result.ok).toBe(true);expect(result.clip.title).toBe("散步 · 就緒雀");
  expect(result.clip.markdown).toContain("有很多沒必要寫的句子");expect(result.clip.markdown).not.toContain("翻譯的存在感太明顯了");
  card.querySelector('.comment-time').setAttribute('href','/comment/4259416906/');expect(doubanCommentTarget(card,page)).toBeNull();
});


test("Jike declared content cannot lose its entire text or links, and media cannot be replaced by duplicates",()=>{
  for(const mode of ["remove","hidden"]){const doc=fixture("jike-grid"),text=doc.querySelector('.text');if(mode==="remove")text.remove();else text.setAttribute('hidden','');expect(read("jike-grid",doc)).toEqual({ok:false,reason:"incomplete"});}
  const links=fixture("jike-long");for(const link of Array.from(links.querySelectorAll('.text a[href]')))link.remove();expect(read("jike-long",links)).toEqual({ok:false,reason:"incomplete"});
  const wrong=fixture("jike-long");wrong.querySelector('.text a[href]').setAttribute('href','https://m.okjike.com/originalPosts/6715e824d9dc81724c2ec74d');expect(read("jike-long",wrong)).toEqual({ok:false,reason:"incomplete"});
  const images=fixture("jike-grid"),first=images.querySelector('.image-item img').getAttribute('src');for(const img of Array.from(images.querySelectorAll('.image-item img')))img.setAttribute('src',first);expect(read("jike-grid",images)).toEqual({ok:false,reason:"incomplete"});
});

test("hidden visual date and rating fields are omitted while optional short-comment time does not gate text",()=>{
  const doc=fixture("douban-book");doc.querySelector('.main-meta').textContent='';const time=doc.createElement('span');time.setAttribute('content','2024-07-31');time.setAttribute('hidden','');time.textContent='2024-07-31 17:37:35';doc.querySelector('.main-meta').appendChild(time);
  const rating=doc.querySelector('.main-title-rating');rating.setAttribute('title','HIDDEN RATING');rating.setAttribute('hidden','');const result=read('douban-book',doc);expect(result.clip.publishedAt).toBeUndefined();expect(result.clip.markdown).not.toContain('HIDDEN RATING');
  for(const action of ['remove','href']){const list=fixture('douban-comments'),card=list.querySelector('.comment-item'),time=card.querySelector('.comment-time');if(action==='remove')time.remove();else time.removeAttribute('href');const target=doubanCommentTarget(card,'https://book.douban.com/subject/36864764/comments/');const saved=readDouban(list,target,'https://book.douban.com/subject/36864764/comments/');expect(saved.ok).toBe(true);expect(saved.clip.markdown).toContain('/subject/36864764/comments/#c-4237804504');}
});

const jikeFeedUrl='https://m.okjike.com/topics/63579abb6724cc583b9bba9a';
test('Jike topic feed binds each real card by its own author/text and keeps only that post',async()=>{
 const {jikeCardTarget}=await import('./src/jike-clip.ts');const d=fixture('jike-feed'),cards=Array.from(d.querySelectorAll('.post-item-li'));
 const first=jikeCardTarget(cards[0],jikeFeedUrl),second=jikeCardTarget(cards[1],jikeFeedUrl);
 expect(first.id).toBe('6aceee92141b85b292eb4e27');expect(second.id).toBe('6ace942f756bbb66581c3f96');
 const firstRead=readJike(d,jikeFeedUrl,first);expect(firstRead.ok).toBe(true);expect(firstRead.clip.markdown).toContain('42章經');expect(firstRead.clip.markdown).toContain('世界第一');expect(firstRead.clip.markdown).not.toContain('JimHuiHui');
 const r=readJike(d,jikeFeedUrl,second);expect(r.ok).toBe(true);expect(r.clip.author).toBe('JimHuiHui');expect(r.clip.markdown).toContain('護城河');expect(r.clip.markdown).not.toContain('Ambi');expect(r.clip.tags).toEqual(['web-clip','jike']);expect(r.clip.markdown.match(/!\[/g)).toHaveLength(1);
 const s=d.querySelector('script'),v=JSON.parse(s.textContent);v.props.pageProps.posts.reverse();s.textContent=JSON.stringify(v);
 expect(jikeCardTarget(cards[1],jikeFeedUrl)).toEqual(second);
 v.props.pageProps.posts.push({...v.props.pageProps.posts[0],id:'6715e824d9dc81724c2ec74d'});s.textContent=JSON.stringify(v);
 expect(jikeCardTarget(cards[1],jikeFeedUrl)).toBeNull();
});
test('Jike topic cards never derive a target from body references, changed authors or hidden content',async()=>{
 const {jikeCardTarget}=await import('./src/jike-clip.ts');
 for(const change of [card=>card.querySelector('.avatar').setAttribute('href','/users/other'),card=>card.querySelector('.avatar').setAttribute('href','https://unrelated.example'+card.querySelector('.avatar').getAttribute('href')),card=>card.querySelector('.text').textContent='Different post',card=>card.style.display='none',card=>card.querySelector('.image-item').remove()]) {
  const d=fixture('jike-feed'),card=d.querySelectorAll('.post-item-li')[1];change(card);expect(jikeCardTarget(card,jikeFeedUrl)).toBeNull();
 }
});
test('the compiled Jike pointer listener marks only the card under the context-menu event',async()=>{
 const {createWindow}=await import('@mixmark-io/domino'),{runInNewContext}=await import('node:vm'),{bundleTestScripts}=await import('./bundle-test-scripts.mjs');
 const w=createWindow(readFileSync(new URL('./fixtures/platforms/jike-feed.html',import.meta.url),'utf8'),jikeFeedUrl);
 runInNewContext(bundleTestScripts(['social-target'])[0],{document:w.document,location:w.location,URL,Element:w.Element,Node:w.Node});
 const cards=w.document.querySelectorAll('.post-item-li'),event=w.document.createEvent('Event');event.initEvent('contextmenu',true,true);cards[1].querySelector('.text').dispatchEvent(event);
 expect(w.document.querySelectorAll('[data-edgeever-social-target]')).toHaveLength(1);expect(cards[1].getAttribute('data-edgeever-social-target')).toBe('https://m.okjike.com/originalPosts/6ace942f756bbb66581c3f96');
 cards[0].querySelector('.text').dispatchEvent(event);expect(cards[1].hasAttribute('data-edgeever-social-target')).toBe(false);
});

test('article metadata retains source date precision and normalized own headlines',async()=>{
 const {mediumContent}=await import('./src/medium-content.ts'),{substackContent}=await import('./src/substack-content.ts');
 const medium=fixture('medium-article');medium.querySelector('script').remove();expect(mediumContent(medium,'https://scottbatson.dev/what-should-programmers-do-while-the-ai-writes-code-a2ce2e6de88e').publishedAt).toEqual({value:'2026-08-31',precision:'date'});
 const d=fixture('substack-article'),s=d.querySelector('script'),v=JSON.parse(s.textContent);v.headline='The  Dot and the Swarm';d.querySelector('h1').textContent=v.headline;s.textContent=JSON.stringify(v);
 expect(substackContent(d,'https://www.oneusefulthing.org/p/the-dot-and-the-swarm').author).toBe('Ethan Mollick');
});
test('Substack image cleanup preserves captions and ordinary or labelled links without changing the source',async()=>{
 const {substackContent}=await import('./src/substack-content.ts'),{platformHtmlMarkdown}=await import('./src/platform-clip.ts');
 const d=fixture('substack-article'),body=d.querySelector('.body.markup'),url='https://www.oneusefulthing.org/p/the-dot-and-the-swarm';
 body.innerHTML='<p>Before <a href="https://example.test/source">source</a></p><figure><a class="image-link image2" href="https://example.test/full.png"><div><picture><img src="https://example.test/preview.png" alt="Chart"></picture></div></a><figcaption>Chart caption</figcaption></figure><p><a class="image-link" href="https://example.test/book"><img src="https://example.test/book.png">Read the book</a></p><p><a class="image-link" href="https://example.test/more">More reading</a></p><p><a href="https://example.test/other"><img src="https://example.test/other.png" alt="Other"></a></p><p>After</p>';
 const before=d.documentElement.outerHTML,article=substackContent(d,url),markdown=platformHtmlMarkdown(article.body,url),nodes=[];
 const walk=node=>{nodes.push(node);(node.content || []).forEach(walk);};walk(markdownToDoc(markdown));
 expect(nodes.filter(node=>node.type==='image').map(node=>node.attrs.src)).toEqual(['https://example.test/preview.png','https://example.test/book.png','https://example.test/other.png']);
 const text=nodes.filter(node=>node.type==='text').map(node=>node.text).join('');
 expect(text).toContain('Before sourceChart captionRead the bookMore reading');expect(text).toContain('After');expect(text).not.toContain('full.png');
 for(const [label,href] of [['source','source'],['Read the book','book'],['More reading','more']]) expect(nodes.some(node=>node.text===label && node.marks?.some(mark=>mark.type==='link' && mark.attrs.href===`https://example.test/${href}`))).toBe(true);
 expect(markdown).toContain('[![Other](https://example.test/other.png)](https://example.test/other)');
 expect(d.documentElement.outerHTML).toBe(before);
});

test('only a visible real Substack paywall blocks whole-article extraction',async()=>{
 const {substackContent}=await import('./src/substack-content.ts'),{substackPaywall}=await import('./src/article-platform.ts'),d=fixture('substack-paywall'),url='https://www.lennysnewsletter.com/p/how-to-build-ai-product-sense';
 expect(substackPaywall(d)).toBe(true);expect(substackContent(d,url)).toBeNull();d.querySelector('.paywall').style.display='none';expect(substackPaywall(d)).toBe(false);expect(substackContent(d,url)).not.toBeNull();
});

test('Substack paywall text follows descendant visibility in the serialized probe',async()=>{
 const {substackContent}=await import('./src/substack-content.ts'),{substackPaywall}=await import('./src/article-platform.ts');
 const url='https://www.lennysnewsletter.com/p/how-to-build-ai-product-sense';
 for(const wrapper of ['hidden','aria-hidden="true"','style="display:none"','style="visibility:hidden"']) {
  const d=fixture('substack-paywall'),gate=d.querySelector('.paywall');gate.innerHTML=`<div ${wrapper}>${gate.innerHTML}</div>`;
  expect(substackPaywall(d)).toBe(false);expect(substackContent(d,url)).not.toBeNull();
 }
 const d=fixture('substack-paywall'),gate=d.querySelector('.paywall');
 gate.style.visibility='hidden';gate.innerHTML=`<div style="visibility:visible">${gate.innerHTML}</div>`;
 expect(substackPaywall(d)).toBe(true);expect(substackContent(d,url)).toBeNull();
 // executeScript serializes the probe without its module's closure.
 const {runInNewContext}=await import('node:vm');
 expect(runInNewContext(`(${substackPaywall.toString()})(document)`,{document:d})).toBe(true);
});

test('Jike clickable image controls retain every confirmed original image',()=>{
 for(const tag of ['div','button','img']) {
  const d=fixture('jike-grid');
  for(const node of Array.from(d.querySelectorAll('.image-item'))) {
   node.setAttribute('role','button');
   if(tag==='button') {const button=d.createElement('button');node.replaceWith(button);button.appendChild(node);}
   if(tag==='img') node.querySelector('img').setAttribute('role','button');
  }
  const r=read('jike-grid',d);
  expect(r.ok).toBe(true);expect(r.clip.markdown.match(/!\[/g)).toHaveLength(9);
  const originals=JSON.parse(d.querySelector('#__NEXT_DATA__').textContent).props.pageProps.post.pictures.map(p=>p.picUrl);
  for(const url of originals) expect(r.clip.markdown).toContain(url);
 }
});

test('article metadata retains a visible relative publication value when no machine date exists',async()=>{
 const {mediumContent}=await import('./src/medium-content.ts'),d=fixture('medium-article');d.querySelector('script').remove();d.querySelector('[data-testid="storyPublishDate"]').textContent='2 days ago';
 expect(mediumContent(d,'https://scottbatson.dev/what-should-programmers-do-while-the-ai-writes-code-a2ce2e6de88e').publishedAt).toEqual({value:'2 days ago',precision:'relative'});
});

const jikeWebUrl='https://web.okjike.com/u/5e6497e7-a69f-422b-af6e-baf0fc07b512/post/64c9dd9a2edae6abdc610605';
test('signed-in Jike Web detail keeps its full body, mention text and preview cover without avatars/comments',()=>{
 const d=fixture('jike-web-detail');const r=readJike(d,jikeWebUrl);
 expect(platformTarget(jikeWebUrl)).toEqual(platformTarget(urls['jike-long']));
 expect(r.ok).toBe(true);expect(r.clip.author).toBe('泛函');expect(r.clip.publishedAt).toEqual({value:'2023-08-02',precision:'date'});
 expect(r.clip.markdown).toContain('《世界盡頭的咖啡館》和《斯坦福大學人生設計課》');
 expect(r.clip.markdown).toContain('凌空小魚兒');expect(r.clip.markdown).not.toContain('Do not capture comments');
 expect(r.clip.markdown.match(/!\[/g)).toHaveLength(1);expect(r.clip.markdown).not.toContain('!120x120');
 expect(r.clip.markdown).toContain('https://m.okjike.com/originalPosts/61ed0f92c7f0e70011d194c0');
 expect(r.clip.markdown).not.toContain('?s=');
});
for(const invalid of ['wrong-author','ambiguous-card','hidden-card','missing-body','wrong-post'])test(`signed-in Jike Web refuses ${invalid}`,()=>{
 const d=fixture('jike-web-detail'),card=d.querySelector('[class*="_postCard_"]');
 if(invalid==='wrong-author')for(const a of card.querySelectorAll('header a'))a.setAttribute('href','/u/other-user');
 if(invalid==='ambiguous-card')card.parentElement.appendChild(card.cloneNode(true));
 if(invalid==='hidden-card')card.setAttribute('hidden','');
 if(invalid==='missing-body')card.querySelector('[class*="_contentWrapper_"]').remove();
 const target=invalid==='wrong-post'?platformTarget(urls['jike-grid']):platformTarget(jikeWebUrl);
 expect(readJike(d,jikeWebUrl,target)).toEqual({ok:false,reason:'unreadable'});
});

test('signed-in Jike Web gallery keeps all nine viewer-original images in order',()=>{
 const d=fixture('jike-web-grid'),url='https://web.okjike.com/u/af47ed7e-38d4-4798-acd6-04e3cc8d131c/post/6715e824d9dc81724c2ec74d';
 const expected=[...d.querySelectorAll('img[data-mode="grid-item"]')].map(i=>i.getAttribute('src').split('?')[0]);
 const r=readJike(d,url);expect(r.ok).toBe(true);expect(r.clip.author).toBe('彗星咻咻咻');expect(r.clip.publishedAt).toEqual({value:'2024-10-21',precision:'date'});
 expect(r.clip.markdown).not.toContain('Neighbor post');expect([...r.clip.markdown.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map(m=>m[1])).toEqual(expected);
});

test('Jike Web preview headers cannot impersonate the route author',()=>{
 const d=fixture('jike-web-detail'),card=d.querySelector('[class*="_postCard_"]');
 card.querySelector('header a').setAttribute('href','/u/other-user');
 const nested=d.createElement('header');nested.innerHTML='<a href="/u/5e6497e7-a69f-422b-af6e-baf0fc07b512">泛函</a>';
 card.querySelector('[class*="_contentWrapper_"]').appendChild(nested);
 expect(readJike(d,jikeWebUrl)).toEqual({ok:false,reason:'unreadable'});
});

for(const hidden of ['hidden','aria-hidden','display']) {
 const hide=node=>hidden==='display'?node.setAttribute('style','display:none'):node.setAttribute(hidden,hidden==='aria-hidden'?'true':'');
 test(`Jike Web ignores ${hidden} identity links`,()=>{
  const d=fixture('jike-web-detail'),link=d.querySelector('header a');
  const visible=link.cloneNode(true);visible.setAttribute('href','/u/other-user');
  link.parentElement.appendChild(visible);hide(link);
  expect(readJike(d,jikeWebUrl)).toEqual({ok:false,reason:'unreadable'});
 });
 test(`Jike Web omits ${hidden} metadata and expansion controls`,()=>{
  const d=fixture('jike-web-detail'),header=d.querySelector('header'),link=header.querySelector('a');
  const stale=link.cloneNode(true);stale.textContent='Hidden author';hide(stale);link.parentElement.insertBefore(stale,link);
  hide(header.querySelector('[class*="_descContainer_"]'));
  const button=d.createElement('button');button.textContent='展開全文';hide(button);
  d.querySelector('[class*="_contentWrapper_"]').appendChild(button);
  expect(jikeExpandButton(d,d.querySelector('[class*="_postCard_"]'))).toBeNull();
  const r=readJike(d,jikeWebUrl);expect(r.ok).toBe(true);
  expect(r.clip.author).toBe('泛函');expect(r.clip.publishedAt).toBeUndefined();
  expect(r.clip.markdown).toContain('《斯坦福大學人生設計課》');
 });
}

const jikeWebFeedUrl='https://web.okjike.com/following';
const jikeWebPosts=JSON.parse(readFileSync(new URL('./fixtures/platforms/jike-web-feed.posts.json',import.meta.url),'utf8'));
const webFeed=async(name="jike-web-feed",pageUrl=jikeWebFeedUrl)=>{
 const {readJikeWebStateInPage}=await import('./src/jike-web-state.ts');
 const {runInNewContext}=await import('node:vm');const d=fixture(name),posts=JSON.parse(readFileSync(new URL(`./fixtures/platforms/${name}.posts.json`,import.meta.url),'utf8'));
 const cards=[...d.querySelectorAll('[data-clickable-feedback]')].filter(c=>c.querySelector('header')&&c.querySelector('[class*="_contentWrapper_"]'));
 cards.forEach((card,i)=>card.__reactProps$fixture={children:{props:{data:structuredClone(posts[i])}}});
 const state=id=>runInNewContext(`(${readJikeWebStateInPage.toString()})(id)`,{document:d,location:{href:pageUrl},URL,id});
 return{d,cards,state};
};

test('Jike Web feed reads the selected current host props without Fiber/alternate or body permalinks',async()=>{
 const {d,cards,state}=await webFeed();cards[0].setAttribute('data-edgeever-jike-selected','');
 cards[0].__reactFiber$fixture={memoizedProps:{data:jikeWebPosts[1]},alternate:{memoizedProps:{data:jikeWebPosts[1]}}};
 const s=state();expect(s.post.id).toBe(jikeWebPosts[0].id);expect(Object.keys(s.post.user)).toEqual(['username']);
 expect(Object.keys(s.post)).not.toContain('readTrackInfo');expect(s.post.id).not.toBe('6ad1c239141b85b29238482b');
 const target=platformTarget('https://m.okjike.com/originalPosts/'+s.post.id);
 expect(readJike(d,jikeWebFeedUrl,target,s)).toEqual({ok:false,reason:'incomplete'});
 cards[0].querySelector('[class*="_expandButton_"]').remove();
 const r=readJike(d,jikeWebFeedUrl,target,s);expect(r.ok).toBe(true);expect(r.clip.author).toBe('即刻資訊臺');
 expect(r.clip.markdown).toContain('感謝以上即友的創作與分享');expect(r.clip.markdown).not.toContain('2026年10月16日');
 expect(r.clip.markdown).not.toContain('收起');expect(r.clip.markdown).not.toContain('檢視更多');
 const parsed=markdownToDoc(r.clip.markdown),links=[];let text='';
 const visit=n=>{if(n.type==='text'){text+=n.text;if(n.marks?.some(m=>m.type==='link'))links.push(n.text)}for(const c of n.content||[])visit(c)};visit(parsed);
 expect(links).toContain('牛村木木山');expect(links).toContain('一覺醒來發生了什麼');expect(text).not.toContain('](https://');
});

for(const failure of ['missing-props','ambiguous-post','unsupported-type','hidden-card','recycled-id','changed-author','changed-body'])test(`Jike Web feed ${failure} refuses stale or unbound content`,async()=>{
 const{d,cards,state}=await webFeed(),id=jikeWebPosts[0].id,target=platformTarget('https://m.okjike.com/originalPosts/'+id);cards[0].setAttribute('data-edgeever-jike-selected','');expect(state().post.id).toBe(id);
 cards[0].querySelector('[class*="_expandButton_"]').remove();
 if(failure==='missing-props')delete cards[0].__reactProps$fixture;
 if(failure==='ambiguous-post')cards[0].__reactProps$fixture.children=[{props:{data:jikeWebPosts[0]}},{props:{data:jikeWebPosts[1]}}];
 if(failure==='unsupported-type')cards[0].__reactProps$fixture.children.props.data.type='REPOST';
 if(failure==='hidden-card')cards[0].setAttribute('hidden','');
 if(failure==='recycled-id')cards[0].__reactProps$fixture.children.props.data.id='6715e824d9dc81724c2ec74d';
 if(failure==='changed-author')cards[0].querySelector('header a[href]').setAttribute('href','/u/other');
 if(failure==='changed-body')cards[0].querySelector('[class^="_content_93yof_"]').textContent='A different post';
 const s=state(id);
 if(['changed-author','changed-body'].includes(failure))expect(readJike(d,jikeWebFeedUrl,target,s).ok).toBe(false);
 else expect(s).toBeNull();
});

test('Jike Web feed current props track a recycled card even when its DOM marker and content remain unchanged',async()=>{
 const{cards,state}=await webFeed(),id=jikeWebPosts[0].id;cards[0].setAttribute('data-edgeever-jike-selected','');expect(state().post.id).toBe(id);
 cards[0].__reactProps$fixture.children.props.data={...jikeWebPosts[0],id:'6715e824d9dc81724c2ec74d'};
 expect(cards[0].getAttribute('data-edgeever-jike-id')).toBe(id);expect(state(id)).toBeNull();
 expect(state().post.id).toBe('6715e824d9dc81724c2ec74d');
});

test('the Jike Web pointer listener selects one own card without guessing identity from body links',async()=>{
 const{createWindow}=await import('@mixmark-io/domino'),{runInNewContext}=await import('node:vm'),{bundleTestScripts}=await import('./bundle-test-scripts.mjs');
 const w=createWindow(readFileSync(new URL('./fixtures/platforms/jike-web-feed.html',import.meta.url),'utf8'),jikeWebFeedUrl);
 runInNewContext(bundleTestScripts(['social-target'])[0],{document:w.document,location:w.location,URL,Element:w.Element,Node:w.Node});
 const cards=[...w.document.querySelectorAll('[data-clickable-feedback]')].filter(c=>c.querySelector('header')&&c.querySelector('[class*="_contentWrapper_"]'));const event=w.document.createEvent('Event');event.initEvent('contextmenu',true,true);
 cards[0].querySelector('[class*="_contentWrapper_"]').dispatchEvent(event);expect(cards[0].hasAttribute('data-edgeever-jike-selected')).toBe(true);expect(w.document.querySelectorAll('[data-edgeever-social-target]')).toHaveLength(0);
 cards[1].querySelector('[class*="_contentWrapper_"]').dispatchEvent(event);expect(cards[0].hasAttribute('data-edgeever-jike-selected')).toBe(false);expect(cards[1].hasAttribute('data-edgeever-jike-selected')).toBe(true);
});

for(const mismatch of [false,true])test(`Jike Web single-image feed verifies gallery identity before using the declared original (mismatch=${mismatch})`,async()=>{
 const url='https://web.okjike.com/topic/63579abb6724cc583b9bba9a/square',{d,cards,state}=await webFeed('jike-web-feed-image',url);cards[0].setAttribute('data-edgeever-jike-selected','');const s=state(),target=platformTarget('https://m.okjike.com/originalPosts/'+s.post.id);
 if(mismatch)cards[0].querySelector('img[data-anonymous-gallery="true"]').setAttribute('src','https://cdnv2.ruguoapp.com/other.png?imageMogr2/thumbnail/400x');
 const r=readJike(d,url,target,s);
 if(mismatch)expect(r).toEqual({ok:false,reason:'incomplete'});
 else{expect(r.ok).toBe(true);expect(r.clip.markdown).toContain(s.post.pictures[0].picUrl);expect(r.clip.markdown.match(/!\[/g)).toHaveLength(1);expect(r.clip.markdown).toContain('開啟一個新的時代');}
});

test('Medium in-story preview keeps its label, destination and visible CSS cover in document order',async()=>{
 const {mediumContent}=await import('./src/medium-content.ts'),{platformHtmlMarkdown}=await import('./src/platform-clip.ts');
 const d=createDocument('<meta property="og:site_name" content="Medium"><article><h1 data-selectable-paragraph>Story</h1><p data-selectable-paragraph>Before preview.</p><a href="https://example.test/writer"><div><h2>Writer profile</h2><h3>Description of writing</h3><p>example.test</p></div><div style="background-image:url(https://example.test/cover.png)"></div></a><a href="https://example.test/hidden" style="display:none"><h2>Hidden card</h2><div style="background-image:url(https://example.test/hidden.png)"></div></a><p data-selectable-paragraph>After preview.</p></article><a href="https://example.test/outside"><h2>Outside recommendation</h2></a>');
 const before=d.documentElement.outerHTML,r=mediumContent(d,'https://medium.com/@writer/story-abcdef123456'),md=platformHtmlMarkdown(r.body,'https://medium.com/@writer/story-abcdef123456'),doc=markdownToDoc(md),nodes=[];const walk=n=>{nodes.push(n);(n.content||[]).forEach(walk)};walk(doc);
 const text=nodes.filter(n=>n.type==='text').map(n=>n.text).join('');expect(text).toContain('Before preview.Writer profile Description of writing example.testAfter preview.');expect(text).not.toContain('Hidden card');expect(text).not.toContain('Outside recommendation');expect(nodes.some(n=>n.marks?.some(m=>m.type==='link'&&m.attrs.href==='https://example.test/writer'))).toBe(true);expect(nodes.filter(n=>n.type==='image').map(n=>n.attrs.src)).toEqual(['https://example.test/cover.png']);expect(d.documentElement.outerHTML).toBe(before);
});

for (const wrapping of ['image-role','container-role','container-button']) test(`Jike Web keeps gallery media with ${wrapping} semantics`,()=>{
 const d=fixture('jike-web-grid'),url='https://web.okjike.com/u/af47ed7e-38d4-4798-acd6-04e3cc8d131c/post/6715e824d9dc81724c2ec74d';
 const images=[...d.querySelectorAll('img[data-mode="grid-item"]')],expected=images.map(i=>i.getAttribute('src').split('?')[0]);
 if(wrapping==='image-role')images[0].setAttribute('role','button');
 else {const wrapper=d.createElement(wrapping==='container-button'?'button':'div');wrapper.setAttribute('role','button');images[0].replaceWith(wrapper);wrapper.appendChild(images[0]);}
 const before=d.body.innerHTML,r=readJike(d,url);expect(r.ok).toBe(true);expect([...r.clip.markdown.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map(m=>m[1])).toEqual(expected);expect(d.body.innerHTML).toBe(before);
});

test('Medium keeps explicitly visible descendants of a hidden story block and additional body h1',async()=>{
 const {mediumContent}=await import('./src/medium-content.ts');
 const d=createDocument('<meta property="og:site_name" content="Medium"><article><h1 data-selectable-paragraph>Story title</h1><p data-selectable-paragraph style="visibility:hidden">Hidden prefix<span style="visibility:visible">Visible body</span></p><h1 data-selectable-paragraph>Body heading</h1><p data-selectable-paragraph style="display:none">Hidden whole block</p></article>');
 const before=d.body.innerHTML,r=mediumContent(d,'https://medium.com/@writer/story-abcdef123456');expect(r?.body.textContent).toContain('Visible body');expect(r.body.textContent).toContain('Body heading');expect(r.body.textContent).not.toContain('Hidden prefix');expect(r.body.textContent).not.toContain('Hidden whole block');expect(r.body.textContent).not.toContain('Story title');expect(d.body.innerHTML).toBe(before);
});

test('Jike Web retains visible body text and media restored inside a hidden wrapper',()=>{
 const d=fixture('jike-web-detail'),body=d.querySelector('[class*="_contentWrapper_"]');body.style.visibility='hidden';
 body.querySelector('[class^="_content_"]').style.visibility='visible';for(const img of Array.from(body.querySelectorAll('img')))img.style.visibility='visible';
 const before=d.body.innerHTML,r=readJike(d,jikeWebUrl);expect(r.ok).toBe(true);expect(r.clip.markdown).toContain('《斯坦福大學人生設計課》');expect(r.clip.markdown.match(/!\[/g)).toHaveLength(1);expect(d.body.innerHTML).toBe(before);
});

test('Medium live-style code keeps br newlines and matching declared syntax language without reading hidden text',async()=>{
 const {mediumContent}=await import('./src/medium-content.ts'),{platformHtmlMarkdown}=await import('./src/platform-clip.ts');
 const state={a:{__typename:'Paragraph',type:'PRE',name:'code1',text:'const x = 1;\n\nconsole.log(x);',codeBlockMetadata:{lang:'javascript'}},b:{__typename:'Paragraph',type:'PRE',name:'code2',text:'Hidden replacement',codeBlockMetadata:{lang:'python'}}};
 const d=createDocument('<meta property="og:site_name" content="Medium"><article><h1 data-selectable-paragraph>Story</h1><pre><span id="code1" data-selectable-paragraph><span class="hljs-keyword">const</span> x = 1;<br><br>console.log(x);</span></pre><pre><span id="code2" data-selectable-paragraph>Visible code</span></pre><pre style="display:none"><span data-selectable-paragraph>Hidden code</span></pre></article>');
 const script=d.createElement('script');script.textContent='window.__APOLLO_STATE__ = '+JSON.stringify(state)+';';d.body.appendChild(script);
 const before=d.documentElement.outerHTML,md=platformHtmlMarkdown(mediumContent(d,'https://medium.com/@writer/story-abcdef123456').body,'https://medium.com/@writer/story-abcdef123456');
 expect(md).toContain('```javascript\nconst x = 1;\n\nconsole.log(x);\n```');expect(md).toContain('```\nVisible code\n```');expect(md).not.toContain('python');expect(md).not.toContain('Hidden');expect(d.documentElement.outerHTML).toBe(before);
});

test('Medium nested quote code and pre paragraph identity preserve language and line breaks',async()=>{
 const {mediumContent}=await import('./src/medium-content.ts'),{platformHtmlMarkdown}=await import('./src/platform-clip.ts');
 const code='const x = 1;\n\nconsole.log(x);',state={a:{__typename:'Paragraph',type:'PRE',name:'nested',text:code,codeBlockMetadata:{lang:'javascript'}},b:{__typename:'Paragraph',type:'PRE',name:'root',text:'print(1)\nprint(2)',codeBlockMetadata:{lang:'python'}}};
 const d=createDocument('<meta property="og:site_name" content="Medium"><article><h1 data-selectable-paragraph>Story</h1><blockquote><p data-selectable-paragraph>Example:</p><pre><span data-selectable-paragraph id="nested">const x = 1;<br><br>console.log(x);</span></pre></blockquote><pre data-selectable-paragraph id="root">print(1)<br>print(2)</pre></article>');
 const script=d.createElement('script');script.textContent='window.__APOLLO_STATE__ = '+JSON.stringify(state)+';';d.body.appendChild(script);
 const before=d.documentElement.outerHTML,r=mediumContent(d,'https://medium.com/@writer/story-abcdef123456'),blocks=Array.from(r.body.querySelectorAll('pre'));
 expect(blocks.map(n=>n.textContent)).toEqual([code,'print(1)\nprint(2)']);expect(blocks.map(n=>n.className)).toEqual(['language-javascript','language-python']);expect(d.documentElement.outerHTML).toBe(before);
 const saved=[];const walk=n=>{if(n.type==='codeBlock')saved.push(n);for(const child of n.content||[])walk(child)};walk(markdownToDoc(platformHtmlMarkdown(r.body,'https://medium.com/@writer/story-abcdef123456')));expect(saved.map(n=>({language:n.attrs.language,text:n.content.map(c=>c.text).join('')}))).toEqual([{language:'javascript',text:code},{language:'python',text:'print(1)\nprint(2)'}]);
});

for(const invalid of ['old-post','missing-props','stale-marker'])test(`Jike Web detail rejects ${invalid} identity under a same-author new route`,()=>{
 const d=fixture('jike-web-detail'),card=d.querySelector('[class*="_postCard_"]'),url=jikeWebUrl.replace('64c9dd9a2edae6abdc610605','6715e824d9dc81724c2ec74d');
 if(invalid==='missing-props')delete card.__reactProps$fixture;
 if(invalid==='stale-marker')card.setAttribute('data-edgeever-jike-id','6715e824d9dc81724c2ec74d');
 expect(detailState(d,url,'6715e824d9dc81724c2ec74d')).toBeNull();
 expect(readJike(d,url)).toEqual({ok:false,reason:'changed'});
});

test('Jike Web mobile mentions already containing @ match the same public post text',()=>{
 const d=fixture('jike-web-detail');
 for(const mention of d.querySelectorAll('[class*="_mentionUser_"]'))mention.textContent='@'+mention.textContent.trim();
 const r=readJike(d,jikeWebUrl);expect(r.ok).toBe(true);expect(r.clip.markdown).toContain('凌空小魚兒');expect(r.clip.markdown).not.toContain('@@');
});
