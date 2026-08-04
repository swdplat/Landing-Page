// ============================================================
// MyCard Map｜country-style.js（W1：國家外觀可控系統）
// - 功能：定義 window.COUNTRY_STYLE，供 nation-map-app.js 的 applyCountryStyles()
//   讀取，決定地圖上每個國家 SVG 圖形要套用哪一種外觀。
// - Key：ISO 3166-1 alpha-2（與 country-info.js / country-payments.js 同一套 key）。
// - 刪除影響：地圖回到單一石墨灰底色（_default），互動/手勢不受影響。
// ------------------------------------------------------------
// 四種樣式模式（一個國家只會命中其中一種，seed 優先序：fill > pattern > gradient）：
//
// 1) 純色：
//      "TW": { fill: "#4d7089" }
//
// 2) 程式產生圖樣 - 條紋 stripes（範例，v1 預設不啟用任何國家）：
//      "XX": { pattern: { type: "stripes", colors: ["#3b586d", "#1f2f3b"], width: 6, angle: 45 } }
//
// 3) 程式產生圖樣 - 網點 dots（範例，v1 預設不啟用）：
//      "XX": { pattern: { type: "dots", bg: "#3b586d", dot: "#e2e8f0", size: 2, gap: 8 } }
//
// 4) 貼圖平鋪 image（範例，v1 預設不啟用；href 需為同源路徑，CSP img-src 'self' data:）：
//      "XX": { pattern: { type: "image", href: "./assest/country-icon/xx_tile.png", tile: 32 } }
//
// 5) 漸層 gradient（範例，v1 預設不啟用）：
//      "XX": {
//        gradient: {
//          type: "linear",
//          stops: [
//            { offset: "0%",   color: "#3b586d" },
//            { offset: "100%", color: "#1f2f3b" }
//          ],
//          angle: 45
//        }
//      }
//
// `_groups`：先展開套用群組樣式，再套逐國定義覆蓋（同 key 出現在兩處時，逐國定義贏）：
//      _groups: {
//        east_asia: { iso2: ["TW", "HK", "CN", "MO"], fill: "#49687e" }
//      }
//
// 套用規則（實作見 nation-map-app.js applyCountryStyles()）：
//   1. 先掃 `_groups`，把群組樣式展開到每個成員 iso2（群組宣告順序＝展開順序）
//   2. 再掃逐國 key（跳過 `_default` / `_groups`），覆蓋掉群組展開的結果
//   3. 沒中任何規則的國家 → 由 applyCountryStyles() 先把 `_default.fill` inline 套到
//      #viewport 內所有圖形當基礎底色，再由 group/逐國 specific 覆蓋；故 `_default.fill`
//      是「空區域預設色」的唯一控制點，改這一個值即可改變所有未命中規則區域的顏色。
//      CSS `#viewport path/polygon/polyline` 的 fill 僅作 JS 執行前的暫時底色，
//      應與 `_default.fill` 同值以免載入瞬間閃色。
//   4. `hover` 欄位保留給未來「per-country hover 差異化」使用，v1 未消費此欄位——
//      目前 hover/active 高亮一律走 nation-map-style.css 的全域 filter:brightness 方案，
//      任何填色模式（純色/圖樣/漸層）視覺行為一致。
// ============================================================

window.COUNTRY_STYLE = {
  // 空區域（未列出、未命中群組的國家）的預設色唯一控制點。
  // applyCountryStyles() 會把此 fill inline 套到 #viewport 內所有圖形當基礎底色。
  // 值須與 nation-map-style.css 的 #viewport 暫時底色同值（#2d3748）以免載入閃色。
  _default: { fill: '#95a7c1', hover: null },

  // 三大重點地區的群組底色（低飽和、與 accent 藍 #3b82f6 可明顯區分）
  // 逐國定義（下方）以群組色為基礎做明度微調，讓同區內的相鄰國家仍有層次可辨。
  _groups: {
    east_asia: {
      // 冷藍灰系：TW HK CN MO
      iso2: ['TW', 'HK', 'CN', 'MO'],
      fill: '#95a7c1'
    },
    southeast_asia: {
      // 青綠灰系：ID MY PH SG TH VN
      iso2: ['ID', 'MY', 'PH', 'SG', 'TH', 'VN'],
      fill: '#98b1c1'
    },
    americas: {
      // 暖棕灰系：US BR CO CL MX PE UY
      iso2: ['US', 'BR', 'CO', 'CL', 'MX', 'PE', 'UY'],
      fill: '#98a4c1'
    }
  },

  // ---- 東亞：冷藍灰系（同色相，明度分層）----
  TW: { fill: '#6e8cb8' }, 
  HK: { fill: '#7598c7' },
  CN: { fill: '#839dc1' },
  MO: { fill: '#7397c7' },

  // ---- 東南亞：青綠灰系 ----
  ID: { fill: '#7aa4a6' },
  MY: { fill: '#86a6b3' },
  PH: { fill: '#8eafb3' },
  SG: { fill: '#628ea6' },
  TH: { fill: '#8dafbf' },
  VN: { fill: '#8da6b3' },

  // ---- 美洲：暖棕灰系 ----
  US: { fill: '#8c8fba' },
  BR: { fill: '#8695ba' },
  CO: { fill: '#8d97c1' },
  CL: { fill: '#919ab8' },
  MX: { fill: '#9597ba' },
  PE: { fill: '#8c8fb3' },
  UY: { fill: '#9398c1' }
};
