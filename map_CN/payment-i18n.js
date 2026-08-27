// ============================================================
// MyCard Map｜payment-i18n.js（2026-07-22 政策收回：支付方式名只留 繁/簡/英）
// - 功能：疊在 payment-catalog.js 之上，依 method id 提供顯示名稱查詢。
//   完全不改動 payment-catalog.js，僅新增查詢層。
// - 老闆政策（2026-07-22 拍板，收回 W3 的 8 語系 native 翻譯）：
//     zh-TW → 繁中名
//     zh-HK → 繁中名（＝zh-TW，港澳沿用繁體）
//     zh-CN → 簡中名
//     其餘任何語系（en / id / th / ja / en-MY / 未知）一律 → 英文名
//   理由：老闆只信中英，怕 native 翻譯不準，故連泰文 PromptPay、日文全家等
//   在地名一律收回改吐英文。
// - 權威來源：163 筆 method id → { zh, en, cn } 三欄權威表，逐筆人工核對
//   （繁≠簡者已用 OpenCC 轉換），零翻譯猜測，直接採用。
// - 載入順序：需在 payment-catalog.js 之後、nation-map-app.js 之前載入
//   （原生 <script>，非 module，本檔整檔 IIFE 包裹，不留裸頂層變數）。
// - 使用方式（對外簽名維持不變，呼叫端不用改）：
//     window.NationMap.paymentName(id, locale, fallback)
//     → 查表；查無 id 時回傳呼叫端給的 fallback（沒 fallback 就回 id）。
// ============================================================
(function () {
  'use strict';

  // ------------------------------------------------------------
  // 權威表（163 筆）：id → { zh: 繁中名, en: 英文名, cn: 簡中名 }
  // 這是唯一資料來源，不在本檔內做任何機械翻譯／組字／推測。
  // ------------------------------------------------------------
  var PAY_I18N = {
    visa: { zh: 'Visa', en: 'Visa', cn: 'Visa' },
    mastercard: { zh: '萬事達', en: 'Mastercard', cn: '万事达' },
    jcb: { zh: 'JCB', en: 'JCB', cn: 'JCB' },
    union_pay: { zh: '銀聯', en: 'UnionPay', cn: '银联' },
    paypal_card: { zh: 'PayPal', en: 'PayPal', cn: 'PayPal' },
    _placeholder_credit_card_1: { zh: '填名字', en: '英文名稱', cn: '填名字' },
    _placeholder_credit_card_2: { zh: '填名字', en: '英文名稱', cn: '填名字' },
    line_pay: { zh: 'LINE Pay', en: 'LINE Pay', cn: 'LINE Pay' },
    jko_pay: { zh: '街口支付', en: 'JKOPay', cn: '街口支付' },
    taiwan_pay: { zh: 'TWQR', en: 'TWQR', cn: 'TWQR' },
    easy_wallet: { zh: '悠遊付', en: 'Easy Wallet', cn: '悠游付' },
    apple_pay: { zh: 'Apple Pay', en: 'Apple Pay', cn: 'Apple Pay' },
    google_pay: { zh: 'Google Pay', en: 'Google Pay', cn: 'Google Pay' },
    samsung_pay: { zh: 'Samsung Pay', en: 'Samsung Pay', cn: 'Samsung Pay' },
    paypal: { zh: 'PayPal', en: 'PayPal', cn: 'PayPal' },
    alipay: { zh: '支付寶', en: 'Alipay', cn: '支付宝' },
    wechat_pay: { zh: '微信支付', en: 'WeChat Pay', cn: '微信支付' },
    alipayhk: { zh: '支付寶香港', en: 'AlipayHK', cn: '支付宝香港' },
    payme: { zh: 'PayMe', en: 'PayMe', cn: 'PayMe' },
    octopus: { zh: '八達通', en: 'Octopus Online Payment', cn: '八达通' },
    ovo: { zh: 'OVO', en: 'OVo', cn: 'OVO' },
    gopay: { zh: 'GO Pay', en: 'GO Pay', cn: 'GO Pay' },
    dana: { zh: 'DANA', en: 'DANA', cn: 'DANA' },
    linkaja: { zh: 'LinkAja', en: 'LinkAja', cn: 'LinkAja' },
    doku: { zh: 'Doku Wallet', en: 'Doku Wallet', cn: 'Doku Wallet' },
    grab_pay: { zh: 'GrabPay', en: 'GrabPay', cn: 'GrabPay' },
    shopee_pay: { zh: 'ShopeePay', en: 'ShopeePay', cn: 'ShopeePay' },
    touchgo_ewallet: { zh: 'Touch\'n Go eWallet', en: 'Touch\'n Go eWallet', cn: 'Touch\'n Go eWallet' },
    boost_my: { zh: 'Boost', en: 'Boost', cn: 'Boost' },
    paynow: { zh: 'PayNow', en: 'PayNow', cn: 'PayNow' },
    so_cash: { zh: 'SoCash', en: 'SoCash', cn: 'SoCash' },
    _placeholder_ewallet_1: { zh: '填名字', en: '英文名稱', cn: '填名字' },
    _placeholder_ewallet_2: { zh: '填名字', en: '英文名稱', cn: '填名字' },
    pxpay_plus: { zh: '全支付', en: 'PXPay Plus', cn: '全支付' },
    pi_app: { zh: 'Pi 拍錢包', en: 'Pi APP', cn: 'Pi 拍钱包' },
    plus_pay: { zh: '全盈+PAY', en: 'PlusPay', cn: '全盈+PAY' },
    ez_pay: { zh: 'ezPay簡單付', en: 'ezPay', cn: 'ezPay简单付' },
    i_pass_money: { zh: 'iPASS MONEY', en: 'iPASS MONEY', cn: 'iPASS MONEY' },
    icash_pay: { zh: 'icash Pay', en: 'icash Pay', cn: 'icash Pay' },
    qris: { zh: 'QRIS', en: 'QRIS', cn: 'QRIS' },
    sakuku: { zh: 'Sakuku', en: 'Sakuku', cn: 'Sakuku' },
    bitcoin_ethereum_tether: { zh: 'Bitcoin/Ethereum/Tether', en: 'Bitcoin/Ethereum/Tether', cn: 'Bitcoin/Ethereum/Tether' },
    coins_ph: { zh: 'Coins.ph', en: 'Coins.ph', cn: 'Coins.ph' },
    gcash: { zh: 'Gcash', en: 'Gcash', cn: 'Gcash' },
    moneygment: { zh: 'Moneygment', en: 'Moneygment', cn: 'Moneygment' },
    paymaya: { zh: 'Paymaya', en: 'Paymaya', cn: 'Paymaya' },
    rabbit_line_pay_th: { zh: 'LINE Pay', en: 'LINE Pay', cn: 'LINE Pay' },
    truemoney: { zh: 'TrueMoney', en: 'TrueMoney', cn: 'TrueMoney' },
    nine_pay: { zh: '9Pay', en: '9Pay', cn: '9Pay' },
    hncb_webatm: { zh: '華南銀行', en: 'HNCB WebATM', cn: '华南银行' },
    ctbc_webatm: { zh: '中國信託', en: 'CTBC WebATM', cn: '中国信托' },
    e_sun_webatm: { zh: '玉山銀行', en: 'E.SUN WebATM', cn: '玉山银行' },
    taishin_webatm: { zh: '台新銀行', en: 'Taishin WebATM', cn: '台新银行' },
    tfb_webatm: { zh: '台北富邦', en: 'TFB WebATM', cn: '台北富邦' },
    land_bank_webatm: { zh: '土地銀行', en: 'Land Bank WebATM', cn: '土地银行' },
    scsb_webatm: { zh: '上海銀行', en: 'SCSB WebATM', cn: '上海银行' },
    bo_t_webatm: { zh: '台灣銀行', en: 'BoT WebATM', cn: '台湾银行' },
    mega_icbc_webatm: { zh: '兆豐銀行', en: 'Mega ICBC WebATM', cn: '兆丰银行' },
    first_webatm: { zh: '第一銀行', en: 'First WebATM', cn: '第一银行' },
    chb_webatm: { zh: '彰化銀行', en: 'CHB WebATM', cn: '彰化银行' },
    postal_webatm: { zh: '中華郵政', en: 'POSTAL WebATM', cn: '中华邮政' },
    tcb_webatm: { zh: '合作金庫', en: 'TCB WebATM', cn: '合作金库' },
    icbc_atm_cn: { zh: '工商銀行', en: 'ICBC WebATM', cn: '工商银行' },
    abc_atm_cn: { zh: '農業銀行', en: 'ABC WebATM', cn: '农业银行' },
    ccb_atm_cn: { zh: '建設銀行', en: 'CCB WebATM', cn: '建设银行' },
    boc_atm_cn: { zh: '中國銀行', en: 'BOC WebATM', cn: '中国银行' },
    hsb_webatm_hk: { zh: '恒生銀行', en: 'HSB WebATM', cn: '恒生银行' },
    fps: { zh: '轉數快', en: 'FPS', cn: '转数快' },
    hsbc_webatm: { zh: '上海滙豐銀行', en: 'HSBC WebATM', cn: '上海汇丰银行' },
    bca: { zh: 'Bank Central Asia', en: 'Bank Central Asia', cn: 'Bank Central Asia' },
    bni: { zh: 'Bank Negara Indonesia', en: 'Bank Negara Indonesia', cn: 'Bank Negara Indonesia' },
    permata_bank: { zh: 'Permata Bank', en: 'Permata Bank', cn: 'Permata Bank' },
    cimb_clicks: { zh: 'CIMB Clicks', en: 'CIMB Clicks', cn: 'CIMB Clicks' },
    mandiri: { zh: 'Mandiri', en: 'Mandiri', cn: 'Mandiri' },
    bri: { zh: 'Bank-Rakyat-Indonesia', en: 'Bank-Rakyat-Indonesia', cn: 'Bank-Rakyat-Indonesia' },
    bdo_network_bank: { zh: 'BDO 銀行', en: 'BDO Bank', cn: 'BDO 银行' },
    bank_of_commerce: { zh: 'Commerce 銀行', en: 'Bank of Commerce', cn: 'Commerce 银行' },
    bpi: { zh: 'BPI 銀行', en: 'BPI Online Bank', cn: 'BPI 银行' },
    landbank: { zh: 'Landbank 銀行', en: 'Landbank', cn: 'Landbank 银行' },
    chinabank: { zh: 'Chinabank 線上銀行', en: 'Chinabank', cn: 'Chinabank 线上银行' },
    rcbc: { zh: 'RCBC 銀行', en: 'RCBC Bank', cn: 'RCBC 银行' },
    pnb: { zh: 'PNB 菲律賓國家銀行', en: 'PNB Bank', cn: 'PNB 菲律宾国家银行' },
    maybank: { zh: 'Maybank 馬來亞銀行', en: 'Maybank', cn: 'Maybank 马来亚银行' },
    security_bank: { zh: 'Security Bank 保安銀行', en: 'Security Bank', cn: 'Security Bank 保安银行' },
    unionbank: { zh: 'UnionBank 聯合銀行', en: 'UnionBank', cn: 'UnionBank 联合银行' },
    ucpb: { zh: 'UCPB 國民聯合銀行', en: 'UCPB Bank', cn: 'UCPB 国民联合银行' },
    aub: { zh: 'AUB 菲律賓聯合銀行', en: 'AUB Bank', cn: 'AUB 菲律宾联合银行' },
    psbank: { zh: 'PSBank 菲律賓儲蓄銀行', en: 'PS Bank', cn: 'PSBank 菲律宾储蓄银行' },
    robinsons_bank: { zh: 'Robinsons Bank 羅賓森銀行', en: 'Robinsons Bank', cn: 'Robinsons Bank 罗宾森银行' },
    dbs: { zh: 'DBS 星展銀行', en: 'DBS Bank', cn: 'DBS 星展银行' },
    ocbc: { zh: 'OCBC 華僑銀行', en: 'OCBC Bank', cn: 'OCBC 华侨银行' },
    uob: { zh: 'UOB 大華銀行', en: 'UOB Bank', cn: 'UOB 大华银行' },
    standard_chartered: { zh: '渣打銀行', en: 'Standard Chartered Bank', cn: '渣打银行' },
    metrobank: { zh: 'Metrobank 大都會銀行', en: 'Metrobank', cn: 'Metrobank 大都会银行' },
    _dup_Metrobank_2: { zh: 'Metrobank 大都會銀行', en: 'Metrobank', cn: 'Metrobank 大都会银行' },
    _dup_Metrobank_3: { zh: 'Metrobank 大都會銀行', en: 'Metrobank', cn: 'Metrobank 大都会银行' },
    _placeholder_bank_transfer_1: { zh: '填名字', en: '英文名稱', cn: '填名字' },
    cn_bank_transfer: { zh: '大陸地區網銀支付', en: 'CN Bank Transfer', cn: '大陆地区网银支付' },
    aub_online_cash_payment: { zh: 'AUB OnlineCash Payment', en: 'AUB OnlineCash Payment', cn: 'AUB OnlineCash Payment' },
    metrobank_otc_ph: { zh: 'Metrobank OTC', en: 'Metrobank OTC', cn: 'Metrobank OTC' },
    robinson_s_bank_otc: { zh: 'Robinson\'s Bank OTC', en: 'Robinson\'s Bank OTC', cn: 'Robinson\'s Bank OTC' },
    robinson_s_online: { zh: 'Robinson\'s Online', en: 'Robinson\'s Online', cn: 'Robinson\'s Online' },
    fast: { zh: 'FAST', en: 'FAST', cn: 'FAST' },
    bangkok_bank: { zh: 'Bangkok bank', en: 'Bangkok bank', cn: 'Bangkok bank' },
    k_plus: { zh: 'K-PLUS', en: 'K-PLUS', cn: 'K-PLUS' },
    krung_thai_bank: { zh: 'Krung Thai bank', en: 'Krung Thai bank', cn: 'Krung Thai bank' },
    krungsri_bank: { zh: 'Krungsri Bank', en: 'Krungsri Bank', cn: 'Krungsri Bank' },
    prompt_pay: { zh: 'PromptPay', en: 'PromptPay', cn: 'PromptPay' },
    qrpayment: { zh: 'QRpayment', en: 'QRpayment', cn: 'QRpayment' },
    siam_commercial_bank: { zh: 'Siam Commercial Bank', en: 'Siam Commercial Bank', cn: 'Siam Commercial Bank' },
    thanachart_bank: { zh: 'Thanachart bank', en: 'Thanachart bank', cn: 'Thanachart bank' },
    bank_transfer_brazil: { zh: '銀行轉帳 (Brazil)', en: 'Bank Transfer (Brazil)', cn: '银行转帐 (Brazil)' },
    bank_transfer_colombia: { zh: '銀行轉帳 (Colombia)', en: 'Bank Transfer (Colombia)', cn: '银行转帐 (Colombia)' },
    bank_transfer_chile: { zh: '銀行轉帳 (Chile)', en: 'Bank Transfer (Chile)', cn: '银行转帐 (Chile)' },
    bank_transfer_peru: { zh: '銀行轉帳 (Peru)', en: 'Bank Transfer (Peru)', cn: '银行转帐 (Peru)' },
    fpx: { zh: 'FPX', en: 'FPX', cn: 'FPX' },
    atm_card_vietnam: { zh: 'ATM 卡 (Vietnam)', en: 'ATM Card (Vietnam)', cn: 'ATM 卡 (Vietnam)' },
    bank_transfer_vietnam: { zh: '銀行轉帳 (Vietnam)', en: 'Bank Transfer (Vietnam)', cn: '银行转帐 (Vietnam)' },
    cht_mb: { zh: '中華電信', en: 'Chunghwa Telecom', cn: '中华电信' },
    fet_mb: { zh: '遠傳電信', en: 'FarEasTone', cn: '远传电信' },
    twm_mb: { zh: '台灣大哥大', en: 'TaiwanMobile', cn: '台湾大哥大' },
    _placeholder_carrier_billing_1: { zh: '填名字', en: '英文名稱', cn: '填名字' },
    _placeholder_carrier_billing_2: { zh: '填名字', en: '英文名稱', cn: '填名字' },
    _placeholder_carrier_billing_3: { zh: '填名字', en: '英文名稱', cn: '填名字' },
    _placeholder_carrier_billing_4: { zh: '填名字', en: '英文名稱', cn: '填名字' },
    _placeholder_carrier_billing_5: { zh: '填名字', en: '英文名稱', cn: '填名字' },
    indosat: { zh: 'Indosat', en: 'Indosat', cn: 'Indosat' },
    three: { zh: 'Three', en: 'Three', cn: 'Three' },
    xl: { zh: 'XL', en: 'XL', cn: 'XL' },
    seven_eleven_tw: { zh: '7-11 統一超商', en: '7-ELEVEN', cn: '7-11 统一超商' },
    family_mart_tw: { zh: '全家便利商店', en: 'FamilyMart', cn: '全家便利商店' },
    hi_life_tw: { zh: '萊爾富便利商店', en: 'HiLIFE', cn: '莱尔富便利商店' },
    ok_mart_tw: { zh: 'OK 超商', en: 'OKMart', cn: 'OK 超商' },
    alfamart: { zh: 'Alfa Group', en: 'Alfa Group', cn: 'Alfa Group' },
    indomaret: { zh: 'Indomaret', en: 'Indomaret', cn: 'Indomaret' },
    _placeholder_cash_store_1: { zh: '填名字', en: '英文名稱', cn: '填名字' },
    _placeholder_cash_store_2: { zh: '填名字', en: '英文名稱', cn: '填名字' },
    _placeholder_cash_store_3: { zh: '填名字', en: '英文名稱', cn: '填名字' },
    _placeholder_cash_store_4: { zh: '填名字', en: '英文名稱', cn: '填名字' },
    unnamed_tw_7: { zh: 'OK即時儲', en: 'OK即時儲', cn: 'OK即时储' },
    seven_eleven_ph: { zh: '7-ELEVEN', en: '7-ELEVEN', cn: '7-ELEVEN' },
    cebuana_bills_paymen: { zh: 'Cebuana Bills Paymen', en: 'Cebuana Bills Paymen', cn: 'Cebuana Bills Paymen' },
    ec_pay: { zh: 'EC Pay', en: 'EC Pay', cn: 'EC Pay' },
    m_lhuillier: { zh: 'M.Lhuillier', en: 'M.Lhuillier', cn: 'M.Lhuillier' },
    palawan_pawnshop: { zh: 'PalawanPawnshop', en: 'PalawanPawnshop', cn: 'PalawanPawnshop' },
    rd_pawnshop: { zh: 'RD Pawnshop', en: 'RD Pawnshop', cn: 'RD Pawnshop' },
    robinsons_dept_store: { zh: 'Robinsons Dept Store', en: 'Robinsons Dept Store', cn: 'Robinsons Dept Store' },
    sm_retail: { zh: 'SM Retail', en: 'SM Retail', cn: 'SM Retail' },
    bigc: { zh: 'BIGC', en: 'BIGC', cn: 'BIGC' },
    cenpay: { zh: 'Cenpay', en: 'Cenpay', cn: 'Cenpay' },
    over_the_counter_brazil: { zh: '實體商店繳費 (Brazil)', en: 'Over the Counter (Brazil)', cn: '实体商店缴费 (Brazil)' },
    over_the_counter_colombia: { zh: '實體商店繳費 (Colombia)', en: 'Over the Counter (Colombia)', cn: '实体商店缴费 (Colombia)' },
    over_the_counter_chile: { zh: '實體商店繳費 (Chile)', en: 'Over the Counter (Chile)', cn: '实体商店缴费 (Chile)' },
    over_the_counter_mexico: { zh: '實體商店繳費 (Mexico)', en: 'Over the Counter (Mexico)', cn: '实体商店缴费 (Mexico)' },
    over_the_counter_peru: { zh: '實體商店繳費 (Peru)', en: 'Over the Counter (Peru)', cn: '实体商店缴费 (Peru)' },
    over_the_counter_uruguay: { zh: '實體商店繳費 (Uruguay)', en: 'Over the Counter (Uruguay)', cn: '实体商店缴费 (Uruguay)' },
    zingala: { zh: '銀角零卡', en: 'Zingala', cn: '银角零卡' },
    _placeholder_bnpl_1: { zh: '填名字', en: '英文名稱', cn: '填名字' },
    _placeholder_bnpl_2: { zh: '填名字', en: '英文名稱', cn: '填名字' },
    _placeholder_bnpl_3: { zh: '填名字', en: '英文名稱', cn: '填名字' },
    _placeholder_bnpl_4: { zh: '填名字', en: '英文名稱', cn: '填名字' },
    _placeholder_bnpl_5: { zh: '填名字', en: '英文名稱', cn: '填名字' },
    aftee: { zh: 'AFTEE', en: 'AFTEE', cn: 'AFTEE' }
  };

  // ------------------------------------------------------------
  // 查詢 helper：window.NationMap.paymentName(id, locale, fallback)
  // - 查表；查無 id 時回傳呼叫端提供的 fallback（通常是 catalog 的
  //   name_zh／name_en），不在本檔內腦補資料。
  // - locale 對應規則（老闆 2026-07-22 政策）：
  //     zh-TW / zh-HK → zh（繁中，港澳沿用繁體）
  //     zh-CN         → cn（簡中）
  //     其餘任何值（en / id / th / ja / en-MY / 未知）→ en（英文）
  // ------------------------------------------------------------
  function paymentName(id, locale, fallback) {
    var entry = PAY_I18N[id];
    if (!entry) {
      return fallback !== undefined ? fallback : id;
    }
    var loc = typeof locale === 'string' ? locale.toLowerCase() : '';
    if (loc === 'zh-tw' || loc === 'zh-hk') {
      return entry.zh;
    }
    if (loc === 'zh-cn') {
      return entry.cn;
    }
    return entry.en;
  }

  // 對外保留 window.PAYMENT_I18N 符號，結構改為 {id:{zh,en,cn}}，
  // 指向同一份權威表（單一資料來源，不複製）。
  window.PAYMENT_I18N = PAY_I18N;

  // 掛在 window.NationMap 命名空間（map-i18n.js 等其他檔案也會掛這個
  // namespace，故用 || 防覆蓋，不直接整包指派新物件）。
  window.NationMap = window.NationMap || {};
  window.NationMap.paymentName = paymentName;
})();
