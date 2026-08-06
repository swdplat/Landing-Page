// ============================================================
// MyCard Map｜map-i18n.js（W3 八語系 · WG-1a：i18n 引擎＋字典）
// - 功能：提供 window.t(key, fallback) 給 nation-map-app.js 既有的 tr() 轉接函式呼叫；
//         內含 8 語系字典（zh-TW / en / id / zh-HK / en-MY / zh-CN / th / ja）與 locale 判定。
// - 載入順序：必須排在 nation-map-app.js 之前（見專案 CLAUDE.md / index.html 載入序）；
//         本檔不依賴 country-info.js / payment-catalog.js / country-payments.js，可排最前。
// - 刪除影響：本檔缺席時，nation-map-app.js 的 tr(key, fallback) 會偵測不到 window.t，
//         自動退回呼叫端傳入的 fallback 字串，介面仍可運作、只是失去多語能力，不會壞版。
// - 本檔「只」對外暴露 window.t 與 window.NationMap 兩個入口，其餘一律封裝在 IIFE 內。
// - 本檔不做重渲染（locale 切換後由誰重繪畫面是 WG-3 的事），只負責「查字典」與「換 locale」。
// ============================================================
//
// [00] 支援語系清單 / fallback 鏈 / 預設語系
// [01] locale 正規化與解析（NATION_MAP_CONFIG → <html lang> → navigator → 預設）
// [02] 字典本體：BASE（各語系完整或待補字典）＋ DELTA（zh-HK / en-MY 覆寫式字典）
// [03] 字典合併與快取（base + delta）
// [04] 對外 API：window.t / window.NationMap
// ============================================================

(function () {
  'use strict';

  // === [00] 支援語系清單 / fallback 鏈 / 預設語系 ===
  // 8 語系 code 與命名依 B2-locale架構與Intl實測.md 定稿，與 <html lang> / Intl.DisplayNames 共用同一套 code。
  var SUPPORTED_LOCALES = ['zh-TW', 'en', 'id', 'zh-HK', 'en-MY', 'zh-CN', 'th', 'ja'];
  var DEFAULT_LOCALE = 'zh-TW';

  // fallback 鏈（高→低，不含自己）。硬約束：zh-CN 只能退 en，絕不可退回 zh-TW（簡繁字形不同，
  // 退繁體字典對簡中使用者是體驗倒退，見 B2 文件【1】章節理由）。
  var FALLBACK_CHAIN = {
    'zh-TW': ['en'],
    'zh-HK': ['zh-TW', 'en'],
    'zh-CN': ['en'],
    'en-MY': ['en'],
    'en': [],
    'id': ['en'],
    'th': ['en'],
    'ja': ['en']
  };

  // === [01] locale 正規化與解析 ===
  // 把瀏覽器/OS/外部整合頁面可能傳入的各種 BCP-47 寫法（zh-Hant-TW、zh-TW、en-US…）
  // 正規化到本專案支援的 8 個 locale code 之一；辨識不出來回傳 null，交由呼叫端 fallback。
  function normalizeLocale(raw) {
    if (!raw || typeof raw !== 'string') return null;
    var lower = raw.trim().toLowerCase();
    if (!lower) return null;

    // 1) 完全比對支援清單（不分大小寫），例如 'ZH-tw' → 'zh-TW'
    var i;
    for (i = 0; i < SUPPORTED_LOCALES.length; i++) {
      if (SUPPORTED_LOCALES[i].toLowerCase() === lower) return SUPPORTED_LOCALES[i];
    }

    // 2) zh 系列：zh-Hant-TW / zh-TW / zh-Hant → zh-TW；zh-Hant-HK / zh-HK → zh-HK；
    //    zh-Hans-CN / zh-CN / zh-Hans → zh-CN（CLDR 對照見 B2 文件【1】表格）
    if (lower.indexOf('zh') === 0) {
      if (lower.indexOf('hk') !== -1) return 'zh-HK';
      if (lower.indexOf('cn') !== -1 || lower.indexOf('hans') !== -1) return 'zh-CN';
      return 'zh-TW'; // 其餘 zh / zh-tw / zh-hant / zh-hant-tw... 一律視為繁中基底
    }

    // 3) en 系列：en-MY → en-MY；其餘 en-US / en-GB / en... → en
    if (lower.indexOf('en') === 0) {
      if (lower.indexOf('my') !== -1) return 'en-MY';
      return 'en';
    }

    // 4) 其餘單語系：id / th / ja 取語言 subtag 前綴比對（不需地區後綴）
    if (lower.indexOf('id') === 0) return 'id';
    if (lower.indexOf('th') === 0) return 'th';
    if (lower.indexOf('ja') === 0) return 'ja';

    return null; // 無法辨識（例如 ko、fr...），由 resolveLocale() 落到下一個候選或預設語系
  }

  // 優先序（高→低）：window.NATION_MAP_CONFIG.locale → <html lang> → navigator.language
  // → navigator.languages[] → DEFAULT_LOCALE。任何一層正規化成功即採用，不繼續往下比對。
  function resolveLocale() {
    var candidates = [];
    var cfg = (typeof window !== 'undefined' && window.NATION_MAP_CONFIG) || {};

    if (cfg.locale) candidates.push(cfg.locale);
    if (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang) {
      candidates.push(document.documentElement.lang);
    }
    if (typeof navigator !== 'undefined') {
      if (navigator.language) candidates.push(navigator.language);
      if (Array.isArray(navigator.languages)) candidates = candidates.concat(navigator.languages);
    }

    var i, normalized;
    for (i = 0; i < candidates.length; i++) {
      normalized = normalizeLocale(candidates[i]);
      if (normalized) return normalized;
    }
    return DEFAULT_LOCALE;
  }

  // === [02] 字典本體 ===
  // BASE：各語系「完整」字典（key 對應 D-UI字串8語初稿.md 的 16 條 UI 字串）。
  // 命名慣例：`ui.<camelCase 語意名>`，對應 D 檔 # 欄位序號見檔尾對照表（同時見完工回報卡）。
  var BASE = {};

  // ---- zh-TW（基底，繁體中文權威來源，對應 D 檔 #1-16） ----
  BASE['zh-TW'] = {
    'ui.skipToMap': '跳到地圖內容',
    'ui.pageTitle': 'MyCard 全球支付方式地圖',
    'ui.zoomIn': '放大',
    'ui.zoomOut': '縮小',
    'ui.resetView': '重置視圖',
    'ui.close': '關閉',
    'ui.countryInfo': '國家資訊',
    'ui.hintDesktop': '滾輪縮放、拖曳平移；點擊地區查看資訊',
    'ui.hintMobile': '雙指拖曳或縮放地圖；點擊地區查看資訊',
    'ui.modeList': '清單',
    'ui.modeIcon': '圖標',
    'ui.supportedPayments': '支援付款方式',
    'ui.otherRegions': '其他地區',
    // #14 行銷文案，D 檔標註「佔位，待官方定稿」——內容屬品牌語言，非工程/AI 可定稿範圍。
    'ui.regionDesc': '深耕遊戲領域多年，從遊戲推廣、多元支付到玩家服務，提供一站式服務。',
    // #15 alt 後綴：目前 nation-map-app.js 既有寫法為 `${zhName}${tr('ui.flagSuffix', ' 國旗')}`
    // （直接字串相接、fallback 內建前導空白）。此欄位值刻意「不」內建前導空白，交由 WG-3
    // 接線時依各語系書寫習慣決定要不要插空白（中日文語系通常不需要，見下方 ja 的「の国旗」）。
    'ui.flagSuffix': '國旗',
    'ui.unnamedRegion': '未命名地區',
    // ---- 補充：WG-3 接線時發現 D 檔未涵蓋的 6 條 UI 字串，中文原文取自 nation-map-app.js
    // 既有 tr(key, fallback) 呼叫端的 fallback 字串（權威來源），非本輪自編：
    //   ui.payModeLabel      ← nation-map-app.js:1564
    //   ui.emptyTitle        ← nation-map-app.js:1916
    //   ui.emptySub          ← nation-map-app.js:1917
    //   ui.hintHold          ← nation-map-app.js:1275
    //   ui.hintWheel         ← nation-map-app.js:1273
    //   ui.hintDesktopSuffix ← nation-map-app.js:1274
    // 桌機提示組字方式：holdWord + <kbd>Mod</kbd> + <kbd>hintWheel</kbd> + hintDesktopSuffix
    'ui.payModeLabel': '付款方式顯示模式',
    'ui.emptyTitle': '正在積極爭取中',
    'ui.emptySub': '此區域支付方式即將上線',
    'ui.hintHold': '按住',
    'ui.hintWheel': '滾輪',
    'ui.hintDesktopSuffix': '縮放、拖曳平移；點擊地區查看資訊',
    // ---- 補充：W3 收尾，補「支付類別標題」8 語系（碼審抓到的缺口）——
    // 對應 nation-map-app.js 呼叫 tr(`pay.category.${cat.id}`, cat.name_zh)，
    // 這 7 條的 zh-TW 值＝ payment-catalog.js PAYMENT_CATEGORIES 各 category 的 name_zh（權威來源）：
    'pay.category.credit_card': '信用卡',
    'pay.category.ewallet': '電子/行動支付',
    'pay.category.bank_transfer': '銀行轉帳',
    'pay.category.carrier_billing': '行動電話帳單付款',
    'pay.category.cash_store': '實體商店繳費',
    'pay.category.bnpl': '先買後付',
    'pay.category.subscription': '訂閱服務'
  };

  // ---- en（完整字典，對應 D 檔 #1-16） ----
  BASE['en'] = {
    'ui.skipToMap': 'Skip to map content',
    'ui.pageTitle': 'MyCard Global Payment Methods Map',
    'ui.zoomIn': 'Zoom in',
    'ui.zoomOut': 'Zoom out',
    'ui.resetView': 'Reset view',
    'ui.close': 'Close',
    'ui.countryInfo': 'Country / region info',
    'ui.hintDesktop': 'Scroll to zoom, drag to pan; click a region for details',
    'ui.hintMobile': 'Use two fingers to pan or zoom; tap a region for details',
    'ui.modeList': 'List',
    'ui.modeIcon': 'Icons',
    'ui.supportedPayments': 'Supported payment methods',
    'ui.otherRegions': 'Other regions',
    // 佔位，待官方定稿（品牌行銷文案）
    'ui.regionDesc': 'With years of expertise in gaming — from game promotion and diverse payment options to player services — we deliver a one-stop solution.',
    'ui.flagSuffix': 'flag',
    'ui.unnamedRegion': 'Unnamed region',
    // ---- 補充：同 zh-TW 段落註解，這 6 條為 WG-3 接線時新增，見上方位置對照 ----
    'ui.payModeLabel': 'Payment display mode',
    'ui.emptyTitle': 'Coming soon',
    'ui.emptySub': 'Payment methods for this region are on the way',
    'ui.hintHold': 'Hold',
    'ui.hintWheel': 'Wheel',
    'ui.hintDesktopSuffix': 'to zoom, drag to pan; click a region for details',
    // ---- 補充：W3 收尾，支付類別標題 7 條 ----
    'pay.category.credit_card': 'Credit Card',
    'pay.category.ewallet': 'Mobile Wallet',
    'pay.category.bank_transfer': 'Bank Transfer',
    'pay.category.carrier_billing': 'Mobile Phone',
    'pay.category.cash_store': 'Over the counter',
    'pay.category.bnpl': 'BNPL',
    'pay.category.subscription': 'Subscription service'
  };

  // ---- id（完整字典，對應 D 檔 #1-16；凱翻譯初稿，待母語者/官方在地團隊校對） ----
  BASE['id'] = {
    'ui.skipToMap': 'Lewati ke konten peta',
    'ui.pageTitle': 'Peta Metode Pembayaran Global MyCard',
    'ui.zoomIn': 'Perbesar',
    'ui.zoomOut': 'Perkecil',
    'ui.resetView': 'Atur ulang tampilan',
    'ui.close': 'Tutup',
    'ui.countryInfo': 'Info negara/wilayah',
    'ui.hintDesktop': 'Gulir untuk zoom, seret untuk geser; klik wilayah untuk info',
    'ui.hintMobile': 'Gunakan dua jari untuk geser/zoom; ketuk wilayah untuk info',
    'ui.modeList': 'Daftar',
    'ui.modeIcon': 'Ikon',
    'ui.supportedPayments': 'Metode pembayaran yang didukung',
    'ui.otherRegions': 'Wilayah lainnya',
    // 佔位，待官方定稿（品牌行銷文案）
    'ui.regionDesc': 'Dengan pengalaman bertahun-tahun di industri game, kami menyediakan layanan satu pintu — dari promosi game, beragam pembayaran, hingga layanan pemain.',
    'ui.flagSuffix': 'bendera',
    'ui.unnamedRegion': 'Wilayah tanpa nama',
    // ---- 補充：WG-3 新增 6 條，翻譯初稿，待母語者校對 ----
    'ui.payModeLabel': 'Mode tampilan pembayaran',
    'ui.emptyTitle': 'Segera hadir',
    'ui.emptySub': 'Metode pembayaran untuk wilayah ini akan segera tersedia',
    'ui.hintHold': 'Tahan',
    'ui.hintWheel': 'Gulir',
    'ui.hintDesktopSuffix': 'untuk zoom, seret untuk geser; klik wilayah untuk info',
    // ---- 補充：W3 收尾，支付類別標題 7 條，翻譯初稿，待母語者校對 ----
    'pay.category.credit_card': 'Kartu Kredit',
    'pay.category.ewallet': 'E-Wallet',
    'pay.category.bank_transfer': 'Transfer Bank',
    'pay.category.carrier_billing': 'Potong Pulsa',
    'pay.category.cash_store': 'Bayar via Minimarket',
    'pay.category.bnpl': 'Pay Later',
    'pay.category.subscription': 'Layanan Berlangganan'
  };

  // ---- th（完整字典，對應 D 檔 #1-16；凱翻譯初稿，待母語者/官方在地團隊校對） ----
  BASE['th'] = {
    'ui.skipToMap': 'ข้ามไปยังเนื้อหาแผนที่',
    'ui.pageTitle': 'แผนที่ช่องทางการชำระเงินทั่วโลกของ MyCard',
    'ui.zoomIn': 'ซูมเข้า',
    'ui.zoomOut': 'ซูมออก',
    'ui.resetView': 'รีเซ็ตมุมมอง',
    'ui.close': 'ปิด',
    'ui.countryInfo': 'ข้อมูลประเทศ/ภูมิภาค',
    'ui.hintDesktop': 'เลื่อนสกอลล์เพื่อซูม ลากเพื่อเลื่อน คลิกที่ภูมิภาคเพื่อดูข้อมูล',
    'ui.hintMobile': 'ใช้สองนิ้วลากหรือซูมแผนที่ แตะที่ภูมิภาคเพื่อดูข้อมูล',
    'ui.modeList': 'รายการ',
    'ui.modeIcon': 'ไอคอน',
    'ui.supportedPayments': 'ช่องทางการชำระเงินที่รองรับ',
    'ui.otherRegions': 'ภูมิภาคอื่น ๆ',
    // 佔位，待官方定稿（品牌行銷文案）
    'ui.regionDesc': 'ด้วยประสบการณ์หลายปีในวงการเกม เราให้บริการครบวงจร ตั้งแต่การโปรโมทเกม การชำระเงินหลากหลายช่องทาง ไปจนถึงบริการผู้เล่น',
    'ui.flagSuffix': 'ธง',
    'ui.unnamedRegion': 'ภูมิภาคที่ไม่มีชื่อ',
    // ---- 補充：WG-3 新增 6 條，翻譯初稿，待母語者校對 ----
    'ui.payModeLabel': 'โหมดแสดงวิธีการชำระเงิน',
    'ui.emptyTitle': 'เร็วๆ นี้',
    'ui.emptySub': 'ช่องทางการชำระเงินสำหรับภูมิภาคนี้กำลังจะมาเร็วๆ นี้',
    'ui.hintHold': 'กดค้าง',
    'ui.hintWheel': 'ล้อเลื่อน',
    'ui.hintDesktopSuffix': 'เพื่อซูม ลากเพื่อเลื่อน คลิกที่ภูมิภาคเพื่อดูข้อมูล',
    // ---- 補充：W3 收尾，支付類別標題 7 條，翻譯初稿，待母語者校對 ----
    'pay.category.credit_card': 'บัตรเครดิต',
    'pay.category.ewallet': 'Mobile Wallet',
    'pay.category.bank_transfer': 'การชำระเงินผ่านธนาคาร',
    'pay.category.carrier_billing': 'ชำระเงินผ่านโทรศัพท์มือถือ',
    'pay.category.cash_store': 'ชำระเงินผ่านเคาน์เตอร์เซอร์วิส',
    'pay.category.bnpl': 'ซื้อก่อนจ่ายทีหลัง',
    'pay.category.subscription': 'บริการสมัครสมาชิก'
  };

  // ---- ja（完整字典，對應 D 檔 #1-16；凱翻譯初稿，待母語者/官方在地團隊校對） ----
  BASE['ja'] = {
    'ui.skipToMap': '地図コンテンツへスキップ',
    'ui.pageTitle': 'MyCard グローバル決済方法マップ',
    'ui.zoomIn': '拡大',
    'ui.zoomOut': '縮小',
    'ui.resetView': 'ビューをリセット',
    'ui.close': '閉じる',
    'ui.countryInfo': '国・地域情報',
    'ui.hintDesktop': 'ホイールでズーム、ドラッグで移動。地域をクリックすると情報が表示されます',
    'ui.hintMobile': '2本指で移動・ズーム。地域をタップすると情報が表示されます',
    'ui.modeList': 'リスト',
    'ui.modeIcon': 'アイコン',
    'ui.supportedPayments': '対応決済方法',
    'ui.otherRegions': 'その他の地域',
    // 佔位，待官方定稿（品牌行銷文案）
    'ui.regionDesc': 'ゲーム分野で長年の実績。ゲームプロモーションから多様な決済、プレイヤーサービスまでワンストップで提供します。',
    // 日文語意上是「〜の国旗」的黏著後綴，直接接在國名後面不需要額外空白，
    // 例：`${zhName}${t('ui.flagSuffix')}` → 「台湾の国旗」。WG-3 接線時請留意這點與其他語系不同。
    'ui.flagSuffix': 'の国旗',
    'ui.unnamedRegion': '名称未設定の地域',
    // ---- 補充：WG-3 新增 6 條，翻譯初稿，待母語者校對 ----
    'ui.payModeLabel': '支払い方法の表示モード',
    'ui.emptyTitle': '近日公開',
    'ui.emptySub': 'このエリアの決済方法は近日対応予定です',
    'ui.hintHold': '長押し',
    'ui.hintWheel': 'ホイール',
    'ui.hintDesktopSuffix': 'でズーム、ドラッグで移動。地域をクリックすると情報が表示されます',
    // ---- 補充：W3 收尾，支付類別標題 7 條，翻譯初稿，待母語者校對 ----
    'pay.category.credit_card': 'クレジットカード',
    'pay.category.ewallet': '電子・モバイル決済',
    'pay.category.bank_transfer': '銀行振込',
    'pay.category.carrier_billing': 'キャリア決済',
    'pay.category.cash_store': '店頭支払い',
    'pay.category.bnpl': 'BNPL',
    'pay.category.subscription': 'サブスクリプション'
  };

  // ---- zh-CN（本輪不建：預留結構，由 WG-2 機械繁轉簡後回填，不得由本檔/本輪自行填入） ----
  // 刻意留空物件（而非整段省略 key），理由：
  //   1) SUPPORTED_LOCALES / FALLBACK_CHAIN 都已經把 'zh-CN' 視為一等公民語系，
  //      BASE['zh-CN'] 存在但空，可讓 getMergedDict('zh-CN') 回傳 {}，
  //      所有 key 查詢都會依 FALLBACK_CHAIN['zh-CN'] = ['en'] 直接退到英文（不會退繁體）。
  //   2) WG-2 只需要在此物件字面量內逐一貼上簡體字串，不需要改動任何 fallback 邏輯或本檔其他部分。
  // WG-2 施工位置 → 從下一行開始貼 16 條 key 的簡體字串（key 名稱需與 zh-TW 完全一致）：
  BASE['zh-CN'] = {
    'ui.skipToMap': '跳到地图内容',
    'ui.pageTitle': 'MyCard 全球支付方式地图',
    'ui.zoomIn': '放大',
    'ui.zoomOut': '缩小',
    'ui.resetView': '重置视图',
    'ui.close': '关闭',
    'ui.countryInfo': '国家资讯',
    'ui.hintDesktop': '滚轮缩放、拖曳平移；点击地区查看资讯',
    'ui.hintMobile': '双指拖曳或缩放地图；点击地区查看资讯',
    'ui.modeList': '清单',
    'ui.modeIcon': '图标',
    'ui.supportedPayments': '支援付款方式',
    'ui.otherRegions': '其他地区',
    // #14 行銷文案，機械繁轉簡，內容屬品牌語言，待業務整批定稿後回填（見 zh-TW 同條註解）。
    'ui.regionDesc': '深耕游戏领域多年，从游戏推广、多元支付到玩家服务，提供一站式服务。',
    'ui.flagSuffix': '国旗',
    'ui.unnamedRegion': '未命名地区',
    // ---- 補充：WG-3 新增 6 條，由 zh-TW 機械繁轉簡（只轉字形、不改用詞，比照 WG-2 邊界） ----
    'ui.payModeLabel': '付款方式显示模式',
    'ui.emptyTitle': '正在积极争取中',
    'ui.emptySub': '此区域支付方式即将上线',
    'ui.hintHold': '按住',
    'ui.hintWheel': '滚轮',
    'ui.hintDesktopSuffix': '缩放、拖曳平移；点击地区查看资讯',
    // ---- 補充：W3 收尾，支付類別標題 7 條，由 zh-TW 機械繁轉簡（只轉字形、不改用詞，比照 WG-2 邊界） ----
    'pay.category.credit_card': '信用卡',
    'pay.category.ewallet': '电子/移动支付',
    'pay.category.bank_transfer': '银行转账',
    'pay.category.carrier_billing': '移动电话账单支付',
    'pay.category.cash_store': '实体商店支付',
    'pay.category.bnpl': '先买后付',
    'pay.category.subscription': '订阅服务'
  };

  // DELTA：覆寫式字典，只放「與對應基底不同」的 key，其餘一律靠 FALLBACK_CHAIN 退回基底查詢。
  var DELTA = {};

  // ---- zh-HK（覆寫 zh-TW） ----
  // 依 D-UI字串8語初稿.md 逐條核對：這 16 條 UI 字串目前**沒有**任何一條需要與 zh-TW 不同
  // （包含 #12 supportedPayments，D 檔備忘欄建議「仍用書面語『支援付款方式』（沿用）」，
  //  不採口語粵語「支援嘅付款方式」）。因此本輪 delta 刻意留空——這不是漏做，而是忠實反映
  // 來源資料的結論。之後若有金流品牌名稱差異（如八達通、轉數快 FPS）或貨幣名稱差異
  // （B2 實測 HKD：zh-TW 顯示「港幣」、zh-HK 顯示「港元」），屬於別的 key 命名空間
  // （非本輪 16 條 ui.* 範圍），屆時比照下方格式加入即可，不需更動本檔其他邏輯：
  //   DELTA['zh-HK']['currency.hkd.name'] = '港元';
  DELTA['zh-HK'] = {};

  // ---- en-MY（覆寫 en） ----
  // B2 文件結論：en-MY 目前地名/貨幣顯示與 en 幾乎相同，僅在少數品牌/法遵用詞上才會不同；
  // 這 16 條 UI 字串本輪同樣沒有已知差異，delta 留空，日後有實際差異字串再補入。
  DELTA['en-MY'] = {};

  // === [03] 字典合併與快取 ===
  // 合併規則：merged = { ...BASE[locale], ...DELTA[locale] }（delta 優先覆蓋 base 同名 key）。
  // 個別 locale 只會被合併一次並快取，之後查詢直接讀快取，避免每次 window.t() 呼叫都重建物件。
  var dictCache = {};

  function getMergedDict(locale) {
    if (dictCache[locale]) return dictCache[locale];

    var base = BASE[locale] || {};
    var delta = DELTA[locale] || {};
    var merged = {};
    var key;

    for (key in base) {
      if (Object.prototype.hasOwnProperty.call(base, key)) merged[key] = base[key];
    }
    for (key in delta) {
      if (Object.prototype.hasOwnProperty.call(delta, key)) merged[key] = delta[key];
    }

    dictCache[locale] = merged;
    return merged;
  }

  // === [04] 對外 API ===
  var currentLocale = resolveLocale();

  // window.t(key, fallback)：nation-map-app.js 既有的 tr(key, fallback) 會呼叫本函式。
  // 查詢順序＝ [目前 locale, ...FALLBACK_CHAIN[目前 locale]]，逐層查合併字典，
  // 全部落空才回傳呼叫端傳入的 fallback（fallback 為 undefined/null 時回傳 key 本身，避免畫面空白）。
  window.t = function t(key, fallback) {
    var chain = [currentLocale].concat(FALLBACK_CHAIN[currentLocale] || []);
    var i, dict;

    for (i = 0; i < chain.length; i++) {
      dict = getMergedDict(chain[i]);
      if (dict && Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];
    }

    return (fallback !== undefined && fallback !== null) ? fallback : key;
  };

  // window.NationMap：內部語系控制的最小對外介面，供 WG-3（切 locale 後重渲染畫面）包裝使用。
  // 本檔刻意不做任何重渲染 —— setLocale() 只換「目前生效語系」，畫面更新是呼叫端的責任。
  window.NationMap = window.NationMap || {};

  window.NationMap.getLocale = function getLocale() {
    return currentLocale;
  };

  window.NationMap.getSupportedLocales = function getSupportedLocales() {
    return SUPPORTED_LOCALES.slice();
  };

  // setLocale(locale)：把任意寫法的 locale 字串正規化後套用為目前生效語系；
  // 辨識不出來（不在 8 語系清單內）時不變更現有 locale，並回傳目前仍生效的 locale 供呼叫端判斷是否成功。
  window.NationMap.setLocale = function setLocale(locale) {
    var normalized = normalizeLocale(locale);
    if (normalized) currentLocale = normalized;
    return currentLocale;
  };
})();
