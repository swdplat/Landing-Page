// 以 ISO 3166-1 alpha-2 為 key 呼叫
// (2026-06-12 dedup)17 重點地區 + snake_case 統一 + 同銀行多項去重
//   East Asia: TW HK CN MO
//   Southeast Asia: ID MY PH SG TH VN
//   Americas: US BR CO CL MX PE UY
// 其他地區仍保留條目以維持 SVG 點擊查詢,但 map-flag-Places: false 不在下方國旗顯示,且 methods 全空。
window.COUNTRY_PAYMENTS = {
  // ===== 重點顯示地區 =====
  "TW": { // 台灣
    "map-flag-Places": true,
    methods: {
      credit_card    : ["visa", "mastercard", "jcb", "paypal", "union_pay"],
      ewallet        : ["line_pay", "jko_pay", "taiwan_pay", "easy_wallet", "apple_pay", "google_pay", "pxpay_plus", "pi_app", "plus_pay", "ez_pay", "i_pass_money", "icash_pay"],
      bank_transfer  : ["hncb_webatm", "ctbc_webatm", "e_sun_webatm", "taishin_webatm", "tfb_webatm", "land_bank_webatm", "scsb_webatm", "bo_t_webatm", "mega_icbc_webatm", "first_webatm", "chb_webatm", "postal_webatm", "tcb_webatm"],
      carrier_billing: ["cht_mb", "fet_mb", "twm_mb"],
      cash_store     : ["seven_eleven_tw", "family_mart_tw", "hi_life_tw", "ok_mart_tw"],
      bnpl           : ["zingala", "aftee"],
    }
  },
  "HK": { // 香港
    "map-flag-Places": true,
    methods: {
      credit_card    : ["visa", "mastercard", "union_pay", "paypal_card"],
      ewallet        : ["alipayhk", "payme", "octopus", "alipay"],
      bank_transfer  : ["hsb_webatm_hk", "fps", "boc_atm_cn", "hsbc_webatm"],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "CN": { // 中國
    "map-flag-Places": true,
    methods: {
      credit_card    : ["union_pay"],
      ewallet        : ["alipay", "wechat_pay"],
      bank_transfer  : ["icbc_atm_cn", "abc_atm_cn", "ccb_atm_cn", "boc_atm_cn", "cn_bank_transfer"],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "MO": { // 澳門
    "map-flag-Places": true,
    methods: {
      credit_card    : ["visa", "mastercard", "union_pay", "paypal_card"],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "ID": { // 印尼
    "map-flag-Places": true,
    methods: {
      credit_card    : ["visa", "mastercard", "jcb", "paypal_card"],
      ewallet        : ["ovo", "gopay", "dana", "linkaja", "doku", "shopee_pay", "qris", "sakuku"],
      bank_transfer  : ["bca", "bni", "permata_bank", "cimb_clicks", "mandiri", "bri", "qris"],
      carrier_billing: ["indosat", "three", "xl"],
      cash_store     : ["alfamart", "indomaret"],
      bnpl           : [],
    }
  },
  "MY": { // 馬來西亞
    "map-flag-Places": true,
    methods: {
      credit_card    : ["visa", "mastercard", "jcb", "paypal_card"],
      ewallet        : ["grab_pay", "shopee_pay", "touchgo_ewallet", "boost_my"],
      bank_transfer  : ["fpx"],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "PH": { // 菲律賓
    "map-flag-Places": true,
    methods: {
      credit_card    : ["visa", "mastercard", "jcb", "paypal_card"],
      ewallet        : ["grab_pay", "shopee_pay", "bitcoin_ethereum_tether", "coins_ph", "gcash", "moneygment", "paymaya"],
      bank_transfer  : ["bdo_network_bank", "bank_of_commerce", "bpi", "landbank", "chinabank", "rcbc", "pnb", "maybank", "security_bank", "unionbank", "ucpb", "aub", "psbank", "robinsons_bank", "metrobank", "aub_online_cash_payment", "metrobank_otc_ph", "robinson_s_bank_otc", "robinson_s_online"],
      carrier_billing: [],
      cash_store     : ["seven_eleven_ph", "cebuana_bills_paymen", "ec_pay", "m_lhuillier", "palawan_pawnshop", "rd_pawnshop", "robinsons_dept_store", "sm_retail"],
      bnpl           : [],
    }
  },
  "SG": { // 新加坡
    "map-flag-Places": true,
    methods: {
      credit_card    : ["visa", "mastercard", "jcb", "paypal_card"],
      ewallet        : ["paynow", "so_cash", "grab_pay", "shopee_pay"],
      bank_transfer  : ["dbs", "ocbc", "uob", "standard_chartered", "fast"],
      carrier_billing: [],
      cash_store     : ["so_cash"],
      bnpl           : [],
    }
  },
  "TH": { // 泰國
    "map-flag-Places": true,
    methods: {
      credit_card    : ["visa", "mastercard", "jcb", "paypal_card"],
      ewallet        : ["shopee_pay", "rabbit_line_pay_th", "truemoney"],
      bank_transfer  : ["bangkok_bank", "k_plus", "krung_thai_bank", "krungsri_bank", "prompt_pay", "qrpayment", "siam_commercial_bank", "thanachart_bank"],
      carrier_billing: [],
      cash_store     : ["bigc", "cenpay"],
      bnpl           : [],
    }
  },
  "VN": { // 越南
    "map-flag-Places": true,
    methods: {
      credit_card    : ["visa", "mastercard", "jcb", "paypal_card"],
      ewallet        : ["nine_pay"],
      bank_transfer  : ["atm_card_vietnam", "bank_transfer_vietnam"],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "US": { // 美國
    "map-flag-Places": true,
    methods: {
      credit_card    : ["visa", "mastercard", "jcb", "paypal_card"],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "BR": { // 巴西
    "map-flag-Places": true,
    methods: {
      credit_card    : ["visa", "mastercard", "jcb", "paypal_card"],
      ewallet        : [],
      bank_transfer  : ["bank_transfer_brazil"],
      carrier_billing: [],
      cash_store     : ["over_the_counter_brazil"],
      bnpl           : [],
    }
  },
  "CO": { // 哥倫比亞
    "map-flag-Places": true,
    methods: {
      credit_card    : ["visa", "mastercard", "jcb", "paypal_card"],
      ewallet        : [],
      bank_transfer  : ["bank_transfer_colombia"],
      carrier_billing: [],
      cash_store     : ["over_the_counter_colombia"],
      bnpl           : [],
    }
  },
  "CL": { // 智利
    "map-flag-Places": true,
    methods: {
      credit_card    : ["visa", "mastercard", "jcb", "paypal_card"],
      ewallet        : [],
      bank_transfer  : ["bank_transfer_chile"],
      carrier_billing: [],
      cash_store     : ["over_the_counter_chile"],
      bnpl           : [],
    }
  },
  "MX": { // 墨西哥
    "map-flag-Places": true,
    methods: {
      credit_card    : ["visa", "mastercard", "jcb", "paypal_card"],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : ["over_the_counter_mexico"],
      bnpl           : [],
    }
  },
  "PE": { // 祕魯
    "map-flag-Places": true,
    methods: {
      credit_card    : ["visa", "mastercard", "jcb", "paypal_card"],
      ewallet        : [],
      bank_transfer  : ["bank_transfer_peru"],
      carrier_billing: [],
      cash_store     : ["over_the_counter_peru"],
      bnpl           : [],
    }
  },
  "UY": { // 烏拉圭
    "map-flag-Places": true,
    methods: {
      credit_card    : ["visa", "mastercard", "jcb", "paypal_card"],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : ["over_the_counter_uruguay"],
      bnpl           : [],
    }
  },

  // ===== 其他地區 =====
  "JP": { // 日本
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "KR": { // 南韓
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "UM": { // 
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "CR": { // 哥斯大黎加
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "SV": { // 薩爾瓦多
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "GT": { // 瓜地馬拉
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "PA": { // 巴拿馬
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "AR": { // 阿根廷
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "EC": { // 厄瓜多
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "IN": { // 印度
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "AD": { // 安道爾
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "AE": { // 阿拉伯聯合大公國
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "AF": { // 阿富汗
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "AG": { // 安地卡及巴布達
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "AI": { // 安圭拉
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "AL": { // 阿爾巴尼亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "AM": { // 亞美尼亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "AO": { // 安哥拉
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "AS": { // 美屬薩摩亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "AT": { // 奧地利
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "AU": { // 澳洲
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "AW": { // 阿魯巴
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "AX": { // 奧蘭群島
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "AZ": { // 亞塞拜然
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "BA": { // 波士尼亞與赫塞哥維納
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "BB": { // 巴貝多
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "BD": { // 孟加拉
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "BE": { // 比利時
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "BF": { // 布吉納法索
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "BG": { // 保加利亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "BH": { // 巴林
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "BI": { // 蒲隆地
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "BJ": { // 貝南
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "BL": { // 聖巴泰勒米
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "BN": { // 汶萊
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "BO": { // 玻利維亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "BM": { // 百慕達
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "BQ": { // 荷屬加勒比（博奈爾/聖尤斯特歇/薩巴）
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "BS": { // 巴哈馬
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "BT": { // 不丹
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "BV": { // 布威島
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "BW": { // 波札那
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "BY": { // 白俄羅斯
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "BZ": { // 貝里斯
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "CA": { // 加拿大
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "CC": { // 科科斯（基林）群島
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "CD": { // 剛果民主共和國
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "CF": { // 中非共和國
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "CG": { // 剛果共和國
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "CH": { // 瑞士
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "CI": { // 象牙海岸
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "CK": { // 庫克群島
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "CM": { // 喀麥隆
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "CU": { // 古巴
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "CV": { // 維德角
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "CW": { // 庫拉索
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "CX": { // 聖誕島
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "CY": { // 賽普勒斯
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "CZ": { // 捷克
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "DE": { // 德國
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "DJ": { // 吉布地
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "DK": { // 丹麥
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "DM": { // 多明尼克
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "DO": { // 多明尼加共和國
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "DZ": { // 阿爾及利亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "EG": { // 埃及
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "EE": { // 愛沙尼亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "EH": { // 西撒哈拉
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "ER": { // 厄利垂亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "ES": { // 西班牙
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "ET": { // 衣索比亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "FI": { // 芬蘭
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "FJ": { // 斐濟
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "FK": { // 福克蘭群島
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "FM": { // 密克羅尼西亞聯邦
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "FO": { // 法羅群島
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "FR": { // 法國
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "GA": { // 加彭
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "GB": { // 英國
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "GE": { // 喬治亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "GD": { // 格瑞那達
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "GF": { // 法屬圭亞那
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "GG": { // 根西島
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "GH": { // 迦納
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "GI": { // 直布羅陀
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "GL": { // 格陵蘭
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "GM": { // 甘比亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "GN": { // 幾內亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "GP": { // 瓜地洛普
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "GQ": { // 赤道幾內亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "GR": { // 希臘
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "GS": { // 南喬治亞與南三明治群島
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "GU": { // 關島
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "GW": { // 幾內亞比索
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "GY": { // 蓋亞那
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "HM": { // 赫德島與麥當勞群島
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "HN": { // 宏都拉斯
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "HR": { // 克羅埃西亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "HT": { // 海地
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "HU": { // 匈牙利
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "IE": { // 愛爾蘭
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "IL": { // 以色列
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "IM": { // 曼島
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "IO": { // 英屬印度洋領地
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "IQ": { // 伊拉克
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "IR": { // 伊朗
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "IS": { // 冰島
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "IT": { // 義大利
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "JE": { // 澤西島
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "JM": { // 牙買加
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "JO": { // 約旦
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "KE": { // 肯亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "KG": { // 吉爾吉斯
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "KH": { // 柬埔寨
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "KI": { // 吉里巴斯
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "KM": { // 科摩羅
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "KN": { // 聖克里斯多福及尼維斯
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "KP": { // 北韓
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "XK": { // 科索沃
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "KW": { // 科威特
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "KY": { // 開曼群島
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "KZ": { // 哈薩克
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "LA": { // 寮國
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "LB": { // 黎巴嫩
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "LC": { // 聖露西亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "LI": { // 列支敦斯登
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "LK": { // 斯里蘭卡
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "LR": { // 賴比瑞亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "LS": { // 賴索托
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "LT": { // 立陶宛
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "LU": { // 盧森堡
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "LV": { // 拉脫維亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "LY": { // 利比亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "MA": { // 摩洛哥
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "MC": { // 摩納哥
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "MD": { // 摩爾多瓦
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "MG": { // 馬達加斯加
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "ME": { // 蒙特內哥羅
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "MF": { // 法屬聖馬丁
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "MH": { // 馬紹爾群島
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "MK": { // 北馬其頓
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "ML": { // 馬利
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "MM": { // 緬甸
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "MN": { // 蒙古
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "MP": { // 北馬利安納群島
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "MQ": { // 馬丁尼克
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "MR": { // 茅利塔尼亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "MS": { // 蒙特色拉特
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "MT": { // 馬爾他
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "MU": { // 模里西斯
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "MV": { // 馬爾地夫
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "MW": { // 馬拉威
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "MZ": { // 莫三比克
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "NA": { // 納米比亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "NC": { // 新喀里多尼亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "NE": { // 尼日
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "NF": { // 諾福克島
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "NG": { // 奈及利亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "NI": { // 尼加拉瓜
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "NL": { // 荷蘭
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "NO": { // 挪威
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "NP": { // 尼泊爾
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "NR": { // 諾魯
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "NU": { // 紐埃
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "NZ": { // 紐西蘭
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "OM": { // 阿曼
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "PF": { // 法屬玻里尼西亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "PG": { // 巴布亞紐幾內亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "PK": { // 巴基斯坦
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "PL": { // 波蘭
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "PM": { // 聖皮耶與密克隆
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "PN": { // 皮特肯群島
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "PR": { // 波多黎各
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "PS": { // 巴勒斯坦
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "PT": { // 葡萄牙
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "PW": { // 帛琉
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "PY": { // 巴拉圭
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "QA": { // 卡達
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "RE": { // 留尼旺
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "RO": { // 羅馬尼亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "RS": { // 塞爾維亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "RU": { // 俄羅斯
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "RW": { // 盧安達
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "SA": { // 沙烏地阿拉伯
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "SB": { // 索羅門群島
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "SC": { // 塞席爾
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "SD": { // 蘇丹
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "SE": { // 瑞典
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "SH": { // 聖赫勒拿
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "SI": { // 斯洛維尼亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "SJ": { // 斯瓦巴及揚馬延
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "SK": { // 斯洛伐克
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "SL": { // 獅子山
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "SM": { // 聖馬利諾
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "SN": { // 塞內加爾
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "SO": { // 索馬利亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "SR": { // 蘇利南
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "SS": { // 南蘇丹
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "ST": { // 聖多美普林西比
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "SX": { // 荷屬聖馬丁
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "SY": { // 敘利亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "SZ": { // 史瓦帝尼
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "TC": { // 土克凱可群島
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "TD": { // 查德
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "TF": { // 法屬南部領地
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "TG": { // 多哥
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "TJ": { // 塔吉克
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "TK": { // 托克勞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "TL": { // 東帝汶
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "TM": { // 土庫曼
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "TN": { // 突尼西亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "TO": { // 東加
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "TR": { // 土耳其
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "TT": { // 千里達及托巴哥
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "TV": { // 吐瓦魯
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "TZ": { // 坦尚尼亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "UA": { // 烏克蘭
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "UG": { // 烏干達
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "UZ": { // 烏茲別克
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "VA": { // 教廷（梵蒂岡）
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "VC": { // 聖文森及格瑞那丁
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "VE": { // 委內瑞拉
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "VG": { // 英屬維京群島
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "VI": { // 美屬維京群島
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "VU": { // 萬那杜
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "WF": { // 瓦利斯和富圖那
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "WS": { // 薩摩亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "YE": { // 葉門
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "YT": { // 馬約特
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "ZA": { // 南非
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "ZM": { // 尚比亞
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
  "ZW": { // 辛巴威
    "map-flag-Places": false,
    methods: {
      credit_card    : [],
      ewallet        : [],
      bank_transfer  : [],
      carrier_billing: [],
      cash_store     : [],
      bnpl           : [],
    }
  },
};

// 取用介面
window.getCountryPayments = function(iso2){
  const code = String(iso2||'').toUpperCase();
  return (window.COUNTRY_PAYMENTS && window.COUNTRY_PAYMENTS[code]) || { methods: {} };
};
