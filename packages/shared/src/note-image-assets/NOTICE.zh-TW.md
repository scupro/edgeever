# 筆記圖片字型與紋理

卡片使用阿里巴巴普惠體 3.0 Regular（阿里巴巴／漢儀）、MiSans Regular（小米／漢儀）、思源宋體 CN SemiBold（Adobe）、匯文明朝體（天王帝廷）、Long Cang（LongCang 專案作者）及 Geist Mono（Vercel）。

WOFF2 字型分片保持公開參考資源的原始位元組，各目錄的 `SOURCE.css` 保留原版權後設資料及 Unicode 範圍。客戶端僅內建 Geist Mono 和共用的 Noto Sans SC 回退字型；其他模板分片按需從固定倉庫版本下載並快取到本機，應用只請求卡片文字需要的分片。下載失敗或過慢時使用本機字型，不改寫已儲存的字型選項，也不修改字型輪廓。備忘錄卡片使用 MiSans 字型。

來源和宣告：

- 阿里巴巴：https://www.alibabafonts.com/ ；原宣告 https://www.yuque.com/yiguang-wkqc2/puhuiti/nus9wiinq4aeiegy ；附來源說明的宣告副本儲存在 `puhui/LICENSE.md`。
- MiSans：https://hyperos.mi.com/font/ ；協議儲存在 `misans/LICENSE.pdf`。
- 思源宋體：https://github.com/adobe-fonts/source-han-serif ；SIL OFL 協議儲存在 `song/LICENSE.txt`。
- 匯文明朝體：作者介紹 https://zhuanlan.zhihu.com/p/344103391 ；原字型的 Public Domain 後設資料儲存在 `mincho/SOURCE.css`。
- Long Cang：https://github.com/googlefonts/longcang ；協議儲存在 `longcang/OFL.txt`。
- Geist Mono：https://github.com/google/fonts/tree/main/ofl/geistmono ；協議儲存在 `geist/OFL.txt`。
- 字型分片參考來源：https://fireflycard.shushiai.com/font/ ，目錄依次為 Alibaba-PuHuiTi-Regular、misansRegular、sourceHanSerifSemiBold、huiwenmingchao、longCang。
- 兩層紙張紋理：https://fireflycard.shushiai.com/_nuxt/abrazine-back.Cn8TMtqS.png 及 https://fireflycard.shushiai.com/_nuxt/write-text.BDxN5rcD.png 。使用參考紙張資源，不是生成的噪點。

分發應用資源時應保留這些宣告。字型及參考品牌的權屬屬於各自權利人。
