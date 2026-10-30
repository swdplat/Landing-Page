# CHANGELOG

紀錄每一版的差異,3.1.8 起的版本管理開始於此。

---

## 3.1.17 — 2026-07-31（無國旗版 / W2 前導）

**主題**:把地圖跳轉列與資訊卡的「國家國旗」全部拆除,先產出一版「無國旗版本」。
**基礎版本**:3.1.16(3.1.16 原封保留為對照版,未封存、未覆蓋)。
**改動範圍**:`nation-map-app.js` **only**;CSS / HTML / 資料檔零變動。**手勢/縮放/transform/i18n 核心零變動**。

### 背景與定位
這是 W2「視覺識別改版」的前導交付。W2 完整規劃(拔國旗→換 17 國代表圖樣→輪廓⇄圖樣模式切換→hover 圓形 reveal)卡在等 17 張外部 PNG 素材(現 2/17)。老闆裁示先給一版「純無國旗」的過渡版:只拆國旗、不建輪廓/圖樣系統(留待素材到齊做 W2)。

### 改動(全在 `nation-map-app.js`)
1. **跳轉列按鈕拔旗**(`renderRegionGrid`):移除 `flagWrap`(`span.region-flag`)與 `flagImg` 的建立、append、及 `setFlagByIso2(flagImg, iso2)` 呼叫。按鈕只剩國名(`span.region-name`)。
2. **資訊卡拔旗盒**(`showInfo` 的 `infoBody` 模板):刪除 `<div class="flag-box"><img id="flagImg" …></div>` 整行,保留 `currency-box`。
3. **資訊卡不再抓 flagImg**:刪除 `document.getElementById('flagImg')` 與其 `setFlagByIso2` 呼叫。**保留 `const code` 賦值行**——它被下方 `renderPayments(code, …)` 沿用,誤刪會 `ReferenceError`(施工時抓到並修正)。

### 刻意保留(非遺漏)
- `setFlagByIso2()` 函式與 `FLAG_BASE` 常數**定義保留**(現無呼叫端、死碼但無害),供 W2 接代表圖樣沿用。
- `assest/national-flag/`、`assest/country-icon/`(含既有 2 張 PNG 相關素材)全部保留不刪。
- `country-payments.js` 的 `map-flag-Places`(控制「哪些國家顯示」,非國旗圖)未動。
- CSS 的 `.region-flag` / `.flag-box` 死規則保留(選不到元素、無害),版面靠既有 flex 自然收合。

### 驗證(node --check + Playwright 實機)
- `node --check` 七檔全過;全檔搜尋確認國旗引用只剩 `setFlagByIso2` 定義本體、呼叫端零殘留。
- `diff -rq` 對 3.1.16:僅 `nation-map-app.js` 一檔差異,範圍乾淨。
- Playwright 桌機(1440)+手機(390):跳轉列 17 顆按鈕只剩國名、無空洞、排列整齊;資訊卡(桌機浮動 / 手機 dock)無國旗盒空洞、幣別自然收合;console 零 `national-flag` 請求(旗幟載入碼確實移除),僅剩既有 4 個付款圖 .svg 404 噪音(ez_pay/easy_wallet/taiwan_pay/zingala,非本輪、既有債)+favicon。截圖存 `_規劃資料收集_20260717/W2-無國旗版-驗收截圖/`。

---

## 3.1.16 — 2026-07-22（W3 八語系）

**主題**:把已建好的 i18n 資料層接進 UI，並對外開放「網頁語系接口」。
**基礎版本**:3.1.15
**改動範圍**:`index.html`(載入序 + `data-i18n` 標記)、`nation-map-app.js`(接線 + 接口);新增 `map-i18n.js`、`payment-i18n.js`。**手勢/縮放/transform 核心零變動**。

### 八語系
`zh-TW / en / id / zh-HK / en-MY / zh-CN / th / ja`。UI 字串字典在 `map-i18n.js`(zh-TW/en/id/th/ja/zh-CN 完整,zh-HK/en-MY 為 delta 覆寫式、本輪留空即忠實反映「與基底無差異」)。支付方式名稱字典在 `payment-i18n.js`(142 筆 = 品牌免翻 109 + 官方在地名 19 + 泛稱組合 14)。

### 新增檔案與載入序
- 新增 `map-i18n.js`(對外 `window.t(key, fallback)` 與 `window.NationMap.{getLocale,setLocale,getSupportedLocales}`)、`payment-i18n.js`(對外 `window.PAYMENT_I18N`、`window.NationMap.paymentName(id, locale, fallback)`)。
- `index.html` 載入序調整為:**`map-i18n.js`(最前,window.t 要最早就緒) → `country-info.js` → `payment-catalog.js` → `payment-i18n.js` → `country-payments.js` → `country-style.js` → `nation-map-app.js`**。

### UI 接線(`nation-map-app.js`)
- 硬字串改走 `tr('ui.*', 原字串)`:`ui.unnamedRegion`(未命名地區)、`ui.countryInfo`(infoPanel aria)、`ui.hintMobile`、模式鈕 `ui.modeList`/`ui.modeIcon`、`ui.supportedPayments`、空狀態 `ui.emptyTitle`/`ui.emptySub`、`ui.payModeLabel`。`index.html` 靜態字串以 `data-i18n` / `data-i18n-aria-label` 標記,由 `applyStaticI18n()` 掃描套用。
- 支付方式顯示名(chip 名稱、tooltip、aria-label)改走 `window.NationMap.paymentName(id, 當前locale, catalog name_zh/name_en)`。
- **國名／幣名改用 `Intl.DisplayNames` 依當前 locale 動態出**。**HK/MO 的 region 與幣名一律 `style:'short'`**(long 會輸出「中國香港特別行政區」塞爆 UI;實測 short 得「香港/澳門」「港元/澳門元」)。整段 try/catch,且對「格式正確但無對應」的 code(Intl 原樣回傳 code、不丟例外)判為未解析 → **fallback 回 `COUNTRY_INFO` 的 zhName/currencyName**,絕不白屏。國旗清單(`renderRegionGrid`)按鈕名同樣走 Intl。

### 網頁語系接口(掛 `window.NationMap`)
- **`setLocale(locale)`**:委派 map-i18n 內部版換 locale 後**即時重渲染、不重載頁面** — 重跑 `applyStaticI18n()` + 提示列 + `renderRegionGrid` + (若資訊卡開啟中)以記住的當前顯示國重呼 `showInfo`(國名/幣名/支付名/模式鈕全部依新 locale 重繪);同步更新 `<html lang>`。
- **`getLocale()`** 回生效 locale;切換時於 `document` 派 `CustomEvent('nationmap:localechange', { detail:{ locale } })`。
- 初始 locale 優先序:**`window.NATION_MAP_CONFIG.locale`(最高) → `<html lang>` → `navigator` → `zh-TW`**(map-i18n 解析,app 啟動時尊重)。
- 全域符號嚴格只多出 `window.NationMap` / `window.t` / `window.PAYMENT_I18N`;app 內 i18n helper 一律 `const` 箭頭,classic script 下不外洩。

### 驗證(headless,無視覺截圖 — 視覺驗收留待獨立 Playwright 階段)
- `node --check` 七檔全過。
- DOM stub + vm 程式化驗五條接口 20/20 PASS:① setLocale 後靜態 UI/aria/支付名/國名幣名依 locale 換且未重載 ② getLocale 回生效 locale ③ localechange 事件 detail.locale 正確 ④ `NATION_MAP_CONFIG.locale` 載入前設定→初始即該語系且優先序最高 ⑤ 全域只多 `NationMap`/`t`/`PAYMENT_I18N`、helper 零洩漏。
- Intl 實測:HK long「中國香港特別行政區」vs short「香港」;MO short「澳門/澳門元」;無效 code / 空幣別走 fallback。

---

## 3.1.15 — 2026-07-06

**主題**:修復手機／平板 RWD 回歸(3.1.11 namespace 腳本遺漏的 @media 覆寫區塊)
**基礎版本**:3.1.14
**改動範圍**:`nation-map-style.css` only;**JS 與 HTML 零變動**

### 背景

老闆測 RWD 時發現手機版地圖塌成細條。追查確認:3.1.11「加 `.mc-map` namespace」的腳本把主體規則加了 `.mc-map` 前綴,但**遺漏了多個 @media 覆寫區塊**,使這些覆寫規則 specificity 低於已加前綴的 base 規則而失效。JS 手勢核心(桌機 pointer / 手機 touch 分流、pinch、dragThreshold、isGestureActive)**完全未被動到**——這是純 CSS specificity 回歸。

### 根因與修正(全部只補 `.mc-map` 前綴,不改任何數值)

1. **關鍵 — 手機地圖塌陷(152px)**:`.app-main` 被錯寫成 `.mc-map .app-main`(後代選擇器,多一個空格)。但 `<main class="app-main mc-map">` 是同一元素掛兩 class,後代選擇器選不到自己 → 手機 `.app-main { height:100svh }` 從未生效 → `.map-frame { height:100% }` 無滿版父層 → 退回 `aspect-ratio:1920/800` → 塌成 152px。**修正**:`.mc-map .app-main` → `.mc-map.app-main`(複合選擇器,base + 手機 @media 共 2 處)。

2. **手機提示列撐滿(816px)**:`@media(≤899)` 的 `.map-hint` / `.map-toolbar` / `.map-tool-btn` 為 bare 選擇器,被 base `.mc-map .map-hint`(bottom:16、無 top)壓過,只剩 override 的 `top:12` 生效 → hint 被 top+bottom 上下釘死。**修正**:補 `.mc-map ` 前綴。

3. **平板資訊卡 clamp 失效**:`@media(600–1023)` 的 `.info-float { width:clamp(280,30vw,360) }` 為 bare → 被 base `.mc-map .info-float` 壓過。**修正**:補前綴。

4. **其餘同源 bare 覆寫**:手機 info-float 進場 transform ×2、reduced-motion ×1、method-chip:hover ×2、`#mapSvg` cursor ×2 一併補齊,namespace 徹底一致。

### 驗證(Playwright 實測,對齊 3.1.8 基準)

| 斷點 | 地圖框 | 資訊卡 | Hint | 欄數 |
|---|---|---|---|---|
| 手機 390×844 | 345×846 滿版(修前 **152**) | 底部 dock h323 | 頂部 30px pill(修前 **816**) | 2 |
| 平板 768×1024 | 723×1026 滿版 | clamp 280px(修前失效) | — | 3 |
| 桌機 1440×900 | 1387×579 比例正確 | 靠左 dock | 右下 pill | 4 |

### 版本收納(2026-07-06)

3.1.7~3.1.14 已各自壓成獨立 zip 收進專案根目錄 `_封存版本/`,主線只保留本版(3.1.15)。CLAUDE.md 已更新指向 3.1.15。

### Part 2:金流資料對帳(以「資料付費廠簡易版20260706.xlsx」為準)

以新付費廠表雙向對帳 17 國金流:

- **Check A(17 外顯示金流)**:全清。`map-flag-Places:true` 正好 17 國,無任何 17 外國家有非空 methods。
- **Check B(表上有、地圖沒有)真實缺漏 → 已補**:
  - MY 加 `fpx`(大馬網銀,原 bank_transfer 整類空)
  - VN 加 `atm_card_vietnam` + `bank_transfer_vietnam`(原 bank_transfer 整類空)
  - 三者為 catalog 新增(命名對齊 Americas 泛稱 `bank_transfer_brazil`);**SVG 待補**,resolveIcon 先 fallback。
- **SG 資料異味 → 已修**:
  - 移除誤植的 `metrobank`(菲律賓大都會銀行,SG 不該有;PH 仍保留)
  - 合併重複的 `uob` 與 `united_overseas_bank`(同一家 UOB),保留 `uob`、刪除孤兒 catalog 項 `united_overseas_bank`
- **維持現況(依老闆裁示)**:US 保留全球卡(新表無 US 資料但仍列 17);PH 同銀行變體維持 2026-06 去重(BDO/BPI/PNB 各留單一代表);JP/IN 在表上但被 17 規則排除,地圖正確不顯示。
- 驗證:`node --check` 通過、無 dangling catalog 引用、無新孤兒。
- **待辦**:補 3 個 SVG → `assest/payments/vendor/bank_transfer/{fpx,atm_card_vietnam,bank_transfer_vietnam}.svg`;如需同步舊查詢面板 `國家金流總表.xlsx`,跑 `_build/build_xlsx.py`。

### Part 3:圖標可辨識性(2026-07-06)

- **新增 3 個方形 SVG**:`fpx` / `atm_card_vietnam` / `bank_transfer_vietnam`(48×48,補齊 Part 2 新方式;FPX 官方 logo 無公開可抓,做成品牌藍方形徽章,有官方檔可替換)。
- **method-chip img 加 `object-fit: contain`**:原本無 object-fit → 預設 `fill` 把非方形 logo **拉扁變形**;改 contain 後等比縮小、不失真。實測 PH 圖標模式各 logo 皆不變形,大幅改善「無法辨識」。**此步不動任何 logo 本體,零商標風險。**
- **圖標盤查**:17 國用到 142 個 icon → 嚴重非方形 **51**、輕微 13、缺檔 3(`qris`/`sakuku`/`fast`)、壞圖 2(`k_plus` 354×5、`fet_mb` 30×4)。清單見根目錄 `圖標盤查_非方形_20260706.xlsx`。
- **重做原則(老闆定)**:**不自行重繪品牌 logo**(避免商標爭議);僅換廠商官方方形素材,或無官方方形時用中性分類 glyph 佔位。
- **泛稱類已方形化(我方,13 個)**:Americas 的 `bank_transfer_{brazil,chile,colombia,peru}`、`over_the_counter_{brazil,colombia,mexico,peru,chile,uruguay}`、`cn_bank_transfer` 及 VN 兩個,改為中性方形 glyph(銀行/店面圖示);皆非品牌 logo,零 IP 風險。統計:嚴重非方形 52→44、OK 方形 74→85。
- **FPX**:官方 logo 檔已放入(114×56 橫式,contain 護住不變形)。
- **品牌類(⬜ 53 個)→ drop-in 清單**:這些是廠商官方商標素材,正確來源為廠商 brand kit,由設計/廠商提供官方方形檔後放到指定路徑即可。清單見根目錄 `圖標盤查_非方形_20260706.xlsx`(含狀態/路徑/尺寸);最優先為 3 缺檔(qris/sakuku/fast)與 2 壞圖(k_plus/fet_mb)。

### 回滾方式

如有問題,刪 3.1.15、從 `_封存版本/地圖重製3.1.14.zip` 解壓還原(但 3.1.14 手機 RWD 仍為壞的)。

---

## 3.1.14 — 2026-06-12

**主題**:Tier 3 剩餘安全項目(CSS pretty-print 延後)
**基礎版本**:3.1.13
**改動範圍**:`nation-map-style.css`(增量改動)+ `nation-map-app.js`(ripple 觸發)

### Pretty-print 延後說明

本版原本計畫加 CSS pretty-print,但腳本實作後造成視覺崩壞(layout 全失效)。CSS engine `node --check` 與 brace 計數雖通過,實際瀏覽器 parse 時某些 declaration 被斷錯。因此 CSS 還原為 3.1.13 的「擠成一行但功能 OK」版本,只增量加 Tier 3 改動。pretty-print 留到後續版本用更穩健的 formatter(例如 prettier / css-beautify)再做。

#### Part 2:Tier 3 剩餘安全項目

1. ~~**Tier 3【項目 3】點擊國家 ripple 漣漪**~~ — 已撤回
   - 原計畫:紫色圓圈 scale 0 → 14,JS 計算落點 append div
   - 撤回理由:用戶 review 認為 ripple 視覺不夠科技、gimmicky;且 active-region pulse 已提供足夠回饋
   - CSS 與 JS 區段都已清除

2. **Tier 3【項目 9】Typography 6 級 token 化**(配合 3.1.10 既有 `--type-*` token)
   - `.name-card .zh-title` 20px → `var(--type-headline)` + `letter-spacing -0.015em` + `line-height 1.15`
   - `.name-card .en-sub` 13px → `var(--type-caption)` + `letter-spacing 0.02em`(英文正向 tracking)
   - `.payments-card .cat-title` 加 `var(--type-body)` + `font-weight 700`
   - `.payments-card .cat-sub` 12px → `var(--type-micro)`
   - `.region-title` 34px → `var(--type-display)` + `letter-spacing -0.015em`

3. **跳過的 Tier 3 項目**(理由):
   - #1 17 國色彩編碼:PM 警告政治分區誤讀
   - #2 SVG 載入優化:需 build pipeline
   - #5 Easter egg:user 未要求
   - #8 Lighthouse CI:需 CI pipeline
   - #10 region-section paper seam border-image:近似 3.1.12 刪除的裝飾,避免再次「設計不一致」

### 共識禁區(已遵守)

- ❌ 不在 SVG path 加 filter
- ❌ 不在 `.map-frame` 用全螢幕 backdrop-filter
- ❌ 不動 `.info-float` 內部 layout
- ❌ body 不掛 `.nation-map` class
- ❌ will-change 條件式啟用(ripple-fx 600ms 內存在,結束移除)
- ❌ hover 包 `@media (hover: hover)`
- ❌ 所有動畫包 `prefers-reduced-motion` 安全網

### 回滾方式

如有問題,刪 3.1.14 用 3.1.13。3.1.13 完整保留。

---

## 3.1.13 — 2026-06-12

**主題**:按鈕光暈改紫(`#b541f3`)+ Tier 3 安全項目
**基礎版本**:3.1.12
**改動範圍**:`nation-map-style.css` + `nation-map-app.js`(focus-mode toggle)

### 改動

1. **新增 `--glow: #b541f3` 與 `--glow-rgb: 181, 65, 243` token**(在 `.mc-map { ... }` 內)
2. **新增 `--focus-ring` 統一光暈 token**(取代 5 處重複 focus-visible 定義)
3. **按鈕 hover / focus 全部光暈藍 → 紫**:
   - `.region-btn:hover` box-shadow `rgba(37,99,235,0.12)` → `rgba(var(--glow-rgb),0.18)`
   - `.region-btn:hover` border-color `--accent-2` → `--glow`
   - `.method-chip:hover` box-shadow + border-color → 紫
   - `.skip-link` 光暈 → 紫
   - `mcmap-hintPulse` keyframe box-shadow → 紫
   - 所有 focus-visible(`*` / `.region-btn` / `.map-tool-btn` / `.method-chip` / `.icon-btn` / `.mode-toggle .opt`)統一用 `--focus-ring` token

4. **Tier 3【項目 6】focus-visible 統一玻璃光暈 token**:
   - `--focus-ring: 0 0 0 2px var(--surface), 0 0 0 4px var(--glow), 0 0 0 8px rgba(var(--glow-rgb), 0.18)`
   - 三層光暈(白底 + 紫主環 + 紫淡光暈),box-shadow 取代 outline 對圓角友善

5. **Tier 3【項目 7】vignette 焦點暈影**:
   - `.mc-map .map-frame::after` radial-gradient 邊緣變暗
   - JS 端在 showInfo() 加 `.focus-mode`,closeInfo / Esc / 空白 click 移除
   - 資訊卡開啟時周圍變暗 18%,讓視線自然聚焦中心被點國家
   - 配合 `--ease-soft` 0.42s 過渡

6. **Tier 3【項目 4】mode-toggle 切換 chip morphing**:
   - `.payments-card.icon-only .method-chip` 加 padding / gap transition 0.32s `--ease-atlas`
   - list ↔ icon 模式切換時 chip 視覺尺寸滑順過渡

7. **空狀態進一步精簡**(延續 3.1.12 修正):
   - 移除信封 SVG icon 與 mailto 連結
   - 只保留標題「正在積極爭取中」+ 簡述「此區域支付方式即將上線」
   - 同步從 CSS 刪掉未使用的 `.empty-icon` / `.empty-cta` 規則

### 不變(active-region 國家高亮保留藍色)

active-region 的 keyframes(`mcmap-highlightBreath` / `mcmap-regionPulse`)與 fill 維持藍色 `rgba(59, 130, 246, ...)`。理由:active-region 是「地圖國家點擊高亮」,不是「按鈕光暈」,維持品牌色(地圖識別)較合理。如要也改紫,告知即可。

### 共識禁區(已遵守)

- ❌ 不在 SVG path 加 filter
- ❌ 不在 `.map-frame` 用全螢幕 backdrop-filter(vignette 用 radial-gradient overlay 解決)
- ❌ 不動 .info-float 內部 layout
- ❌ body 不掛 .nation-map class(token 在 `.mc-map { }`)
- ❌ will-change 條件式啟用
- ❌ hover 包 `@media (hover: hover)`
- ❌ 所有動畫包 prefers-reduced-motion 安全網

### 回滾方式

如有問題,刪 3.1.13 用 3.1.12。3.1.12/11/10/9/8 完整保留。

---

## 3.1.12 — 2026-06-12

**主題**:修兩處設計不一致(與其他頁面區域對齊)
**基礎版本**:3.1.11
**改動範圍**:`nation-map-style.css` only;**JS 與 HTML 零變動**

### 動機

User review 後指出兩處與其他頁面設計語言不一致:
1. 空狀態卡(無金流地區資訊面板)使用 dashed border + 藍色 icon + 加粗藍色 mailto,看起來「太表單感」,與其他 .card 的淺色 frosted glass 風格脫節
2. 「其他地區」標題下的 48px 藍漸層短線是孤立裝飾,其他標題都沒有對應元素

### 改動

1. **`.payments-empty` 空狀態卡**(原 3.1.10 Tier 2 項目 8)
   - ❌ 移除:dashed border、淡漸層底
   - 🎨 icon:`var(--accent-base)` 藍 + opacity 0.7 → `var(--muted)` 灰 + opacity 0.55,尺寸 40px → 32px
   - 🎨 title:font-weight 700 → 600(與其他卡片標題層級一致)
   - 🎨 mailto cta:加粗藍底色連結 → 細灰 underline 連結(text-decoration-thickness 1px, underline-offset 3px),hover 變深而非變藍

2. **`.region-title::after`**(原 3.1.9 Tier 1 項目 9)
   - ❌ 完整移除:48px 藍漸層短線
   - 同步移除 `position: relative` 與 `padding-bottom: 14px`

### 結果

| 項目 | 改動前 | 改動後 |
|---|---|---|
| `.payments-empty` | 表單感(dashed + 藍 icon + 藍 CTA) | 簡潔(灰 icon + 灰 underline link) |
| `.region-title::after` | 存在 | 移除 |

### 回滾方式

如不滿意此版,刪 3.1.12 用 3.1.11。3.1.11/10/9/8 完整保留。

### 後續預備

- 3.1.13 可選:CSS pretty-print 把 3.1.11 namespace 化後擠成一行的 CSS 重新格式化
- 3.1.13 可選:Tier 3 部分項目(若仍要繼續推進視覺/效能)

---

## 3.1.11 — 2026-06-12

**主題**:整合安全強化(namespace wrapper `.mc-map`)
**基礎版本**:3.1.10
**改動範圍**:`nation-map-style.css` + `index.html` 1 處;**JS 零變動**

### 動機

3.1.10 之前所有 CSS 規則為全域(`:root` token、`@keyframes` 命名、通用 class `.btn` / `.card` / `.kbd` / `.opt` 等),整合到 host 頁面會撞名/污染。本版用 namespace wrapper 將所有規則隔離在 `.mc-map` 作用域內。

### 改動

1. **`:root` → `.mc-map`** — 49 個 design token(`--ocean-*` / `--ink-*` / `--accent-*` / `--elev-*` / `--sp-*` / `--type-*` 等)搬進 `.mc-map`
2. **所有 selector 加 `.mc-map ` prefix** — ~210 處(`.info-float` → `.mc-map .info-float`,`#mapSvg` → `.mc-map #mapSvg`,`@media`/`@supports` 內部同步)
3. **`@keyframes` 改名加 `mcmap-` 前綴** — `regionPulse` → `mcmap-regionPulse` 等 3 個,動畫屬性引用同步更新
4. **`index.html <main>` 加 `class="mc-map"`** — 整個地圖區的 wrapper
5. **skip-link 移到 `<main>` 內** — 確保 skip-link 在 .mc-map descendant 範圍內

### 例外處理(故意不加 prefix)

- `body.nation-map` / `html.nm-scroll-lock` / `body.nm-scroll-lock` 已自帶 scope,不重複包
- `@keyframes` 內部 `0%` / `50%` / `from` / `to` 不是 selector,不加 prefix
- 純註解區塊不被當 selector

### 結果

| 項目 | 改動前 | 改動後 |
|---|---:|---:|
| `:root` 全域變數 | 49 個 | **0** |
| 全域 `@keyframes` 原名 | 3 個 | **0**(全部 `mcmap-` 前綴) |
| 通用 class 全域(`.btn` / `.card` / `.kbd` 等) | 19 個 | **0** |
| `.mc-map` prefix selector | 0 | ~210 個 |

### 整合方式(給其他人)

整包複製到 host 專案,**host 頁面 wrapper 元素加 `class="mc-map"`** 即可(例如 `<div class="mc-map">...</div>`)。CSS 自動 scope,token 不污染,keyframe 不撞名。

### 回滾方式

如有問題,刪 3.1.11 用 3.1.10。3.1.10 / 3.1.9 / 3.1.8 完整保留。

### 已知細節

- CSS 行數從 1701 → 1213(換行被腳本擠掉,功能 100% 等效;若要 pretty-print 可下一版加)
- 4 個 .js 檔與 3.1.10 byte-identical

---

## 3.1.10 — 2026-06-12

**主題**:Tier 2 互動敘事 + Design Token 系統化
**基礎版本**:3.1.9
**改動範圍**:`nation-map-style.css` + `nation-map-app.js`(輕量 JS 改動,功能 zero break)

### 設計方向(延伸 3.1.9)

3.1.9 完成「視覺基礎升級」,3.1.10 進入「互動敘事 + Token 系統化」,為深色模式 / 主題切換鋪路。

### 10 項精煉

1. **Design Token 系統化** — `:root` 全域 token(Ocean / Ink / Accent / 5 級 elevation / 8pt spacing / atlas-ease / 6 級 typography)。舊 `var(--accent)` 等變數透過 mapping 維持向後相容。
2. **active-region 一次性 pulse** — `.just-activated` class + keyframe,JS 端在 classList.add 後 setTimeout 900ms 移除
3. **首屏 3 階段載入敘事** — `.map-frame.is-booting` 三階段(地圖淡入 → 海洋光暈 → 台灣呼吸)
4. **map-hint 鍵帽圖示 + 首次無修飾鍵滾輪 pulse** — `<kbd>⌘</kbd> + <kbd>滾輪</kbd>`,wheel 無 ctrlKey 時提示
5. **info-float 進場改善** — `.is-opening` 條件 will-change,animationend 移除
6. **region-section IntersectionObserver stagger 進場** — `.in-view` 觸發 :nth-child stagger(30ms 一張)
7. **method-tooltip 玻璃化 + 彈跳曲線** — gradient bg + backdrop-filter + spring 曲線
8. **空狀態品牌承諾卡** — `.payments-empty` 升級為信封 icon + 「正在積極爭取中 / 歡迎來信洽詢」
9. **skip-link 玻璃化 + slide-in** — gradient + 光暈 + spring slide
10. **拖曳中 `.is-panning` 工具列淡化** — toolbar opacity 0.4,讓使用者專注地圖

### 共識禁區(已遵守)

- ❌ 不在 SVG path 加 filter
- ❌ 不在 .map-frame 用全螢幕 backdrop-filter
- ❌ 不動 .info-float 內部 layout
- ❌ body 不掛 .nation-map class(token 寫在 :root)
- ❌ will-change 只在 .gesture-lock / .is-opening 條件啟用
- ❌ 所有 hover 包 @media (hover: hover)
- ❌ 所有動畫包 prefers-reduced-motion 安全網

### 升級路線(預備)

- **3.1.11** Tier 3:選擇性 — Lighthouse CI + 載入優化 + Easter egg(60-80h)

### 回滾方式

如有問題,刪 3.1.10 用 3.1.9 即可,3.1.9 / 3.1.8 完整保留。

---

## 3.1.9 — 2026-06-12

**主題**:Tier 1 視覺精煉(CSS-only,Atlas 紙本 + 玻璃精緻感)
**基礎版本**:3.1.8
**改動範圍**:`nation-map-style.css` only(零 JS 變更,可單獨回滾)

### 設計方向(6 位專家共識)

把「乾淨可讀」基調升級為「現代 atlas 紙本 + 精緻玻璃」:
- **海洋紙本化**:純白 → 米白漸層 + 極淡 noise 紙紋
- **國家石墨灰**:深黑 → #2d3748 + 0.3px 白色細描邊勾勒國界
- **互動克制但明確**:hover 微浮起、點擊用 stroke 雙線(避開 SVG filter 效能陷阱)
- **動畫節奏統一**:cubic-bezier(0.2, 0.8, 0.2, 1) atlas-ease
- **glass 限定小面積**(.info-float / .map-tool-btn / .method-tooltip),避免全螢幕 blur 拖效能

### 10 項精煉(全 CSS,可獨立部署)

1. **海洋紙本化** — `.map-frame` linear+radial gradient + `::before` noise 紙紋(行動裝置自動關閉)
2. **國家石墨灰 + 細白描邊** — `#viewport path/polygon/polyline` 取代 SVG default 黑
3. **國家 hover 預覽態** — `@media (pointer: fine)` 桌機限定,避免 iOS sticky hover
4. **active-region stroke 雙線** — 取代 `filter: drop-shadow`(避免中階 Android 掉 15-25 FPS)
5. **info-float frosted 升級** — gradient background + spring 進場曲線 + `@supports` 降階
6. **map-tool-btn 玻璃化 + hover 升降** — backdrop-filter + translateY -1px
7. **region-btn 浮起 + flag scale** — 只在 `@media (hover: hover)` 啟用
8. **method-chip hover 微互動** — 全員共識,輕量 hover feedback
9. **region-title accent underline** — `::after` 漸層裝飾
10. **legacy .hint 刪除 + will-change 條件化** — 純效能優化,零視覺差異

### 共識禁區(已遵守)

- ❌ 不在 SVG path 加 `filter: drop-shadow`(效能殺手)
- ❌ 不在 `.map-frame` 用大半徑 backdrop-filter
- ❌ 不動 .info-float 內部 layout
- ❌ body 不掛 `.nation-map` class
- ❌ 不長期掛 will-change
- ❌ hover 必須包 `@media (hover: hover)`
- ❌ 不忘 prefers-reduced-motion 安全網
- ❌ 不動 visually-hidden a11y 規則

### 升級路線(預備)

- **3.1.10** Tier 2:Design Token 系統化 + 互動敘事(18-22h,含少量 JS)
- **3.1.11** Tier 3:選擇性 — Lighthouse CI + 載入優化 + Easter egg(60-80h)

### 回滾方式

如有問題,直接用 3.1.8 取代 3.1.9 即可,因為 3.1.8 維持為基準完整保留。

---

## 3.1.8 — 2026-06-12(本日早些時候)

**主題**:資料與安全性大整理(17 國 scope-down + snake_case 命名重整 + 同銀行 dedup + B2 SVG 抓取)

### 主要變更

- **P0/P1 安全與 A11y 補強**:CSP / viewport-fit / skip-link / h1 / aria-label / role / ISO2_REGION_PARENT 白名單 / setFlagByIso2 小寫優先 / mapFrame click 過濾 / Esc 關閉 / Mac ⌘ 偵測 / iOS gesturestart preventDefault
- **資料修復**:Saint Martin key 拆 Sint Maarten;payment-catalog 19 placeholder 唯一化 + 6 處錯字
- **17 國 scope-down**:232 國 `map-flag-Places` 改 false + methods 清空,17 國保留
- **snake_case 重整**:76 個 catalog id rename + 81 個 B 類新增 + subscription 類啟用
- **B2 SVG 抓取**:76 個 SVG 從 Wikipedia/Wikimedia/官方下載(94% 成功率)
- **使用者 logo 整合**:22 個既有 SVG 升級高品質版(含 PayPal)
- **同銀行 dedup**:9 cluster / 16 個變體下架(BCA VA / BNI VA / BDO 5 變體 等)

### 17 國最終覆蓋

| 國家 | 方式數 |
|---|---:|
| TW | 41 |
| PH | 38(dedup 後) |
| ID | 24(dedup 後) |
| TH | 17 |
| SG | 16 |
| HK | 12 |
| CN | 8 |
| MY | 8 |
| BR / CO / CL / PE | 各 6 |
| MX / UY / VN | 各 5 |
| MO / US | 各 4 |
