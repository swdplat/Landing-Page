// ============================================================
// MyCard Map｜nation-map-app.js（整理註解版）
// - 功能：載入世界地圖 SVG、拖曳/縮放/雙指手勢、點擊地區顯示資訊卡、渲染各國金流、建立地圖下方國旗入口。
// - 重點：本檔只做「互動/狀態/資料串接」，視覺呈現以 nation-map-style.css 為主；兩者需同步維護。
// - 刪除影響：移除事件綁定或 transform 計算會讓地圖失去可用性（無法縮放/拖曳/點擊）。
// ============================================================
//
// [00] 基礎設定 / i18n（tr）
// [01] 滾動導引（service_map → world_map / mapFrame）
// [02] MapViewer：地圖載入、transform、手勢、點擊判定
// [02b] 國家外觀可控系統（W1）：applyCountryStyles() 讀 COUNTRY_STYLE 套 fill/pattern/gradient
// [03] 地圖下方其他地區（regionGrid）：依 country-payments 定義順序渲染
// [04] 國旗載入：依 ISO2 / 國名決定檔案候選清單
// [05] 金流顯示：模式切換（full/icon）、tooltip、行動版圓點與滑動同步
// ============================================================

// === [00] 基礎參數（路徑 / 尺寸 / 縮放界線） ===
// 功能：集中管理地圖資源路徑、初始尺寸、縮放上下限。
// 刪除影響：縮放/拖曳會失去界線，或地圖尺寸無法推算，容易出現「地圖飛走」。
// ------------------------------------------------------------
// === 可調參數 ===
const MAP_BASE  = './assest/map/';
let   FRAME_W   = 1895;
let   FRAME_H   = 800;
const MIN_ZOOM  = 1;
const MAX_ZOOM  = 8;
const ZOOM_STEP = 0.12;

// 注意：不要用 function t(...)，避免在非 module script 變成 window.t 造成遞迴
const tr = (key, fallback) => {
  const fn = window.t;
  return (typeof fn === 'function') ? fn(key, fallback) : (fallback ?? key);
};

// === 設定：可在外部先塞 window.NATION_MAP_CONFIG 覆蓋 ===
window.NATION_MAP_CONFIG = window.NATION_MAP_CONFIG || {};
const MAP_CFG = window.NATION_MAP_CONFIG;

// 其他地區顯示上限（可設 Infinity）
const REGION_LIST_MAX = Number.isFinite(MAP_CFG.regionListMax) ? MAP_CFG.regionListMax : 60;

// 滾動目標（整合頁面 .world_map； demo 沒有 fallback）
const SCROLL_TARGET_SELECTOR = MAP_CFG.scrollTargetSelector || '.world_map';
const SCROLL_DURATION = Number.isFinite(MAP_CFG.scrollDuration) ? MAP_CFG.scrollDuration : 800;

// === [00b] W3 八語系接線輔助（全部宣告為 const 箭頭，classic script 下不外洩到 window） ===
// 目前生效 locale：委派給 map-i18n.js 的 window.NationMap.getLocale，缺席時退 zh-TW。
const currentLocale = () => {
  const NM = window.NationMap;
  return (NM && typeof NM.getLocale === 'function') ? NM.getLocale() : 'zh-TW';
};

// W3 效能：Intl.DisplayNames 實例快取。切語系時 renderRegionGrid 迴圈最多 60 國各查一次，
// 每次 new Intl.DisplayNames 成本不低；以 `locale|type|style` 為 key 快取，找不到才建、建完存起來。
// classic script 下用 __nm 前綴避免與其他檔案的頂層 const 撞名。
const __nmDisplayNamesCache = new Map();
const __nmGetDisplayNames = (locale, type, style) => {
  const key = locale + '|' + type + '|' + style;
  let dn = __nmDisplayNamesCache.get(key);
  if (!dn) {
    dn = new Intl.DisplayNames([locale], { type, style });
    __nmDisplayNamesCache.set(key, dn);
  }
  return dn;
};

// W3 防護縱深：頂層 escape helper（renderPayments 為頂層函式拿不到 this.escapeHtml）。
// 與 MapViewer.escapeHtml 同一套規則，供付款名插進 innerHTML 前跳脫，和國名/幣名一致。
const __nmEscapeHtml = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'': '&#39;' }[ch]));

// 國名／地區名：以 Intl.DisplayNames 依當前 locale 動態產生。
// HK/MO 一律用 style:'short'（long 會輸出「中國香港特別行政區」塞爆 UI）。
// 整段 try/catch：Intl 不支援或丟例外（無效 region code）時 fallback 回傳呼叫端字串（通常是 COUNTRY_INFO.zhName）。
const localizedRegionName = (iso2, locale, fallback) => {
  try {
    if (!iso2 || typeof Intl === 'undefined' || !Intl.DisplayNames) return fallback;
    const code = String(iso2).toUpperCase().split('-')[0];
    if (code.length !== 2) return fallback;
    const useShort = (code === 'HK' || code === 'MO');
    const dn = __nmGetDisplayNames(locale, 'region', useShort ? 'short' : 'long');
    const name = dn.of(code);
    // Intl 對「格式正確但無對應」的 code 會原樣回傳 code（不丟例外）→ 視為未解析，退回 COUNTRY_INFO
    return (name && name !== code) ? name : fallback;
  } catch (_) {
    return fallback;
  }
};

// 幣名：以 Intl.DisplayNames(type:'currency') 依當前 locale 動態產生。
// HK/MO 同樣走 style:'short'。失敗或無幣別（'—'）時 fallback 回 COUNTRY_INFO.currencyName。
const localizedCurrencyName = (currencyCode, iso2, locale, fallback) => {
  try {
    if (!currencyCode || currencyCode === '—' || typeof Intl === 'undefined' || !Intl.DisplayNames) return fallback;
    const region = String(iso2 || '').toUpperCase().split('-')[0];
    const useShort = (region === 'HK' || region === 'MO');
    const dn = __nmGetDisplayNames(locale, 'currency', useShort ? 'short' : 'long');
    const upper = String(currencyCode).toUpperCase();
    const name = dn.of(upper);
    // 同 region：無對應幣別時 Intl 原樣回傳 code → 退回 COUNTRY_INFO 的 currencyName
    return (name && name !== upper) ? name : fallback;
  } catch (_) {
    return fallback;
  }
};

// 支付方式顯示名：走 window.NationMap.paymentName（payment-i18n.js），fallback 用 catalog 的 name_zh/name_en。
const localizedPaymentName = (id, name_zh, name_en) => {
  const fb = name_zh || name_en || '';
  const NM = window.NationMap;
  if (NM && typeof NM.paymentName === 'function') {
    return NM.paymentName(id, currentLocale(), fb);
  }
  return tr('pay.method.' + id, fb);
};

// 掃 index.html 靜態字串：data-i18n → textContent；data-i18n-aria-label → aria-label。
// 載入時與每次 setLocale 都會呼叫；tr(key) 命中字典即換，字典缺席則回退元素現有內容（優雅降級）。
const applyStaticI18n = (root) => {
  const scope = root || document;
  scope.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) el.textContent = tr(key, el.textContent);
  });
  scope.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria-label');
    if (key) el.setAttribute('aria-label', tr(key, el.getAttribute('aria-label') || ''));
  });
};

function animateScrollTo(targetY, duration = 800) {
  // 尊重 prefers-reduced-motion：直接跳到終點，避免造成暈眩的長距捲動動畫
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo(0, targetY);
    return;
  }

  const startY = window.scrollY || document.documentElement.scrollTop || 0;
  const diff = targetY - startY;
  const startT = performance.now();

  const easeInOutCubic = (x) =>
    x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

  function step(now) {
    const t01 = Math.min(1, (now - startT) / duration);
    const eased = easeInOutCubic(t01);
    window.scrollTo(0, startY + diff * eased);
    if (t01 < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}


// === [01] 滾動導引（點擊底部國旗 / service_map 入口時，平滑捲到地圖區） ===
// 功能：把使用者視線帶回地圖區，避免點了入口卻不知道地圖在哪裡。
// 刪除影響：功能不會壞，但 UX 會變差（點了入口沒有明顯回饋）。
// ------------------------------------------------------------
function scrollToWorldMap() {
  const target =
    document.querySelector(SCROLL_TARGET_SELECTOR) ||
    document.getElementById('mapFrame') ||
    document.getElementById('mapSvg');

  if (!target) return;

  const top = target.getBoundingClientRect().top + (window.scrollY || 0);
  animateScrollTo(top, SCROLL_DURATION);
}

function bindServiceMapScroll() {
  document.addEventListener('click', (e) => {
    const a = e.target && e.target.closest ? e.target.closest('#service_map') : null;
    if (!a) return;
    e.preventDefault();
    scrollToWorldMap();
  });
}



// === [02] MapViewer：地圖互動核心（載入 / transform / 手勢 / 點擊） ===
// 功能：管理 SVG 在 viewport 中的縮放與平移，並把點擊事件導向 showInfo。
// 刪除影響：地圖會變成靜態圖，或只剩顯示但無法操作。
// ------------------------------------------------------------
class MapViewer {
  constructor(svg, viewport, infoPanel) {
    this.svg       = svg;
    this.viewport  = viewport;
    this.infoPanel = infoPanel;

    // 加：記住外層 mapFrame
    this.frameEl = svg.parentElement;  // #mapFrame
    this.frameW = FRAME_W;
    this.frameH = FRAME_H;
    this.updateFrameSize();
    this.contentW = 1000;
    this.contentH = 500;

    this.baseScale  = 1;
    this.scale      = 1;
    this.zoomFactor = 1;

    this.tx = 0;
    this.ty = 0;

    this.isPanning     = false;
    this.panStart      = { x: 0, y: 0 };
    this.startTxTy     = { tx: 0, ty: 0 };
    this.pointerMap    = new Map();         // pointerId
    this.lastPinchDist = null;
    this.lastCenter    = null;

    this.activeEl = null;  // 目前高亮的元素

    // 桌機拖曳防誤觸：拖曳超過門檻才視為 drag，並短暫屏蔽 click
    // - 功能：避免拖曳後放開滑鼠時誤觸國家點擊
    // - 刪除影響：拖曳操作容易誤點國家、造成資訊卡跳出
    this.dragThreshold = 4;          // px（可依 UX 調整）
    this.didDrag = false;            // 本次 pointerdown 是否發生拖曳
    this.suppressClickUntil = 0;     // 拖曳結束後，在此時間點前忽略 click
    this.panningPointerId = null;    // 桌機拖曳用的 pointerId
    this.hasPointerCapture  = false;   // 只有真的開始拖曳才 capture（避免 click 事件目標被重定向）

    this.defaultTouchAction = window.getComputedStyle(this.svg).touchAction || 'auto';

    

// 觸控手勢：手機端優先使用 touch events（iOS/Safari 對 pointer 手勢較不穩定）
// - 功能：確保雙指縮放/雙指平移一致可用，並避免 Android 下拉重整。
// - 刪除影響：手機端可能恢復成「只能縮放、不能雙指拖曳」或被系統手勢吃掉。
this.useTouchEvents = this.isMobileLike() && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

// 雙指手勢期間的捲動鎖定（A 方案）
// - 功能：雙指開始時固定 body，避免 Android/部分瀏覽器觸發下拉重整或頁面跟著捲動。
// - 刪除影響：雙指移動時容易被系統手勢打斷、地圖操作卡住。
this.bodyScrollLocked = false;
this.lockedScrollY    = 0;
this.prevBodyInline   = null;

// 手勢進行中：用來暫停 resize / 避免高度變動造成框格跳動
this.isGestureActive  = false;
this.bindEvents();
  }

  isMobileLike() {
    return (
      window.matchMedia('(max-width: 899px)').matches ||
      window.matchMedia('(pointer: coarse)').matches ||
      navigator.maxTouchPoints > 0
    );
  }

  isMobileTouch(e) {
    return e.pointerType === 'touch' && this.isMobileLike();
  }

  setTouchAction(action) {
    // touch-action 會影響瀏覽器是否接管觸控手勢
    // - 'pan-y'：允許頁面垂直捲動（單指滑動時不會被地圖卡住）
    // - 'none' ：完全由程式接管（雙指縮放/雙指平移時避免頁面跟著捲動）
    // 刪除影響：手機端可能出現「雙指拖曳無效 / 只能縮放或只會捲頁」等問題。
    if (!this.svg) return;

    if (this.svg.style.touchAction !== action) this.svg.style.touchAction = action;
    if (this.viewport && this.viewport.style.touchAction !== action) this.viewport.style.touchAction = action;

    // iOS/Safari 對 SVG descendant 的 touch-action 行為較不一致：
    // 用 class 強制讓子節點同步，確保「雙指拖曳」不會被瀏覽器當成頁面手勢吃掉。
    if (this.frameEl) {
      if (action === 'none') this.frameEl.classList.add('gesture-lock');
      else this.frameEl.classList.remove('gesture-lock');
    }
  }


// ===========================================================
// 手勢期間捲動鎖定（A 方案）
// ===========================================================
lockBodyScroll() {
  if (this.bodyScrollLocked) return;

  const html = document.documentElement;
  const body = document.body;

  this.bodyScrollLocked = true;
  this.lockedScrollY = window.scrollY || window.pageYOffset || 0;

  // 記錄原本 inline（避免整合到其他頁面時誤傷既有樣式）
  // 注意：此處刻意不再用 position:fixed 鎖 body，因為 iOS/Safari 會觸發版面寬度重算，
  //       造成地圖外框「貼邊/跳動」、資訊卡中的旗幟/幣別偶發不顯示。
  this.prevBodyInline = {
    overflow: body.style.overflow,
    overscrollBehavior: body.style.overscrollBehavior,
    touchAction: body.style.touchAction,
  };
  this.prevHtmlInline = {
    overscrollBehavior: html.style.overscrollBehavior,
  };

  html.classList.add('nm-scroll-lock');
  body.classList.add('nm-scroll-lock');
}

unlockBodyScroll() {
  if (!this.bodyScrollLocked) return;

  const html = document.documentElement;
  const body = document.body;

  html.classList.remove('nm-scroll-lock');
  body.classList.remove('nm-scroll-lock');

  // 還原 inline
  if (this.prevBodyInline) {
    body.style.overflow          = this.prevBodyInline.overflow;
    body.style.overscrollBehavior = this.prevBodyInline.overscrollBehavior;
    body.style.touchAction       = this.prevBodyInline.touchAction;
  } else {
    body.style.overflow          = '';
    body.style.overscrollBehavior = '';
    body.style.touchAction       = '';
  }

  if (this.prevHtmlInline) {
    html.style.overscrollBehavior = this.prevHtmlInline.overscrollBehavior;
  } else {
    html.style.overscrollBehavior = '';
  }

  // 理論上手勢期間已阻止捲動，這裡仍保險回到手勢開始時的位置
  window.scrollTo(0, this.lockedScrollY);

  this.bodyScrollLocked = false;
  this.prevBodyInline   = null;
  this.prevHtmlInline   = null;
}

startGestureLock() {
  if (this.isGestureActive) return;
  this.isGestureActive = true;

  // 手勢期間，強制交由程式接管（避免 iOS/Safari/Android 把雙指當系統手勢）
  this.setTouchAction('none');
  this.lockBodyScroll();
}

endGestureLock() {
  if (!this.isGestureActive) return;
  this.isGestureActive = false;

  // 手勢結束後，恢復允許頁面垂直捲動（單指滑動不會卡住）
  this.setTouchAction('pan-y');
  this.unlockBodyScroll();
}

// ===========================================================
// 手機端 touch events（雙指縮放＋雙指平移、單指只點擊）
// ===========================================================
bindTouchEvents() {
  if (!this.frameEl) return;

  // 注意：touchmove 需要 passive:false 才能 preventDefault（否則擋不住下拉重整/頁面縮放）
  // 刪除影響：Android 可能被「下拉重整」打斷、iOS 可能把雙指當頁面手勢。
  this.frameEl.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
  this.frameEl.addEventListener('touchmove',  (e) => this.onTouchMove(e),  { passive: false });
  this.frameEl.addEventListener('touchend',   (e) => this.onTouchEnd(e),   { passive: true  });
  this.frameEl.addEventListener('touchcancel',(e) => this.onTouchEnd(e),   { passive: true  });
}

getTouchDistance(t1, t2) {
  const dx = t2.clientX - t1.clientX;
  const dy = t2.clientY - t1.clientY;
  return Math.hypot(dx, dy);
}

getTouchCenter(t1, t2) {
  return {
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2,
  };
}

onTouchStart(e) {
  // 只在地圖框內處理（避免在資訊卡上按壓造成地圖誤動作）
  if (e.target.closest('#infoPanel')) return;

  // 單指：不接管（保留點擊、保留頁面自然滑動）
  if (e.touches.length < 2) return;

  // 雙指：開始接管
  this.startGestureLock();

  const t1 = e.touches[0];
  const t2 = e.touches[1];
  this.lastPinchDist = this.getTouchDistance(t1, t2);
  this.lastCenter    = this.getTouchCenter(t1, t2);

  // 進入雙指狀態時清掉 pointerMap（避免 touch/pointer 雙狀態互相覆蓋）
  this.pointerMap.clear();

  if (e.cancelable) e.preventDefault();
}

onTouchMove(e) {
  if (!this.isGestureActive) return;

  // 雙指狀態中若少於兩指，交給 touchend 收尾
  if (e.touches.length < 2) return;

  const t1 = e.touches[0];
  const t2 = e.touches[1];

  const dist   = this.getTouchDistance(t1, t2);
  const center = this.getTouchCenter(t1, t2);

  // 先做雙指平移（中心點移動）
  if (this.lastCenter) {
    const dx = center.x - this.lastCenter.x;
    const dy = center.y - this.lastCenter.y;
    this.tx += dx;
    this.ty += dy;
  }

  // 再做縮放（以中心點為基準）
  if (this.lastPinchDist && dist > 0) {
    const factor = dist / this.lastPinchDist;
    const local  = this.toLocal({ clientX: center.x, clientY: center.y });
    this.zoomBy(factor, local.x, local.y);
  } else {
    this.clampTranslation();
    this.render();
  }

  this.lastCenter    = center;
  this.lastPinchDist = dist;

  if (e.cancelable) e.preventDefault();
}

onTouchEnd(e) {
  // 雙指結束（或被系統中斷）：解除鎖定
  if (this.isGestureActive && e.touches.length < 2) {
    this.endGestureLock();
    this.lastPinchDist = null;
    this.lastCenter    = null;
  }
}


  updateFrameSize() {
    if (!this.frameEl) return;
    // 手勢期間鎖住尺寸更新，避免 iOS/Android 地址列高度變動造成「框格跳動」
    // 刪除影響：移動/縮放時可能出現容器高度抖動、邊框跳動。
    if (this.isGestureActive) return;
    const rect = this.frameEl.getBoundingClientRect();
    this.frameW = rect.width  || FRAME_W;
    this.frameH = rect.height || FRAME_H;
    // 同步回全域（給還沒 refactor 完的地方用）
    FRAME_W = this.frameW;
    FRAME_H = this.frameH;
  }

  bindEvents() {
    // 滾輪：預設不攔截，讓頁面可自然上下滾動；
    //       僅在按住 Ctrl(Win/Linux) 或 ⌘(Mac) 時才接管縮放。
    // 刪除影響：若改回全攔截，使用者滑頁面會被地圖卡住。
    this.svg.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });

    this.svg.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    window.addEventListener('pointermove', (e) => this.onPointerMove(e));
    window.addEventListener('pointerup',   (e) => this.onPointerUp(e));

    // 點擊事件掛在 svg（避免 setPointerCapture 後 click 目標被 re-target 成 svg，導致 viewport 收不到事件）
    // 刪除影響：拖曳後點擊國家可能會失效（點不到）。
    this.svg.addEventListener('click', (e) => this.onRegionClick(e));

    // 手機端：用 touch events 接管雙指手勢（避免 pointer 手勢在 iOS/Safari 不穩）
    // 刪除影響：手機端可能出現「雙指拖曳無效 / 被系統下拉重整打斷」等問題。
    if (this.useTouchEvents) this.bindTouchEvents();

    // pointercancel：iOS/Android 在手勢中斷時可能觸發，若不清理會造成雙指狀態卡死
    // 刪除影響：手機端可能出現「縮放後無法再拖曳 / 無法再點擊」等殘留狀態。
    window.addEventListener('pointercancel', (e) => this.onPointerUp(e));

    // iOS Safari 雙指縮放會送出 gesture 事件，會與我們自訂的 pinch 衝突
    // 在 frameEl 攔截掉，避免畫面被瀏覽器一起放大整頁
    // 刪除影響：iOS 上雙指縮放地圖時，瀏覽器可能同時放大整個頁面 UI
    if (this.frameEl) {
      ['gesturestart', 'gesturechange', 'gestureend'].forEach((evt) => {
        this.frameEl.addEventListener(evt, (e) => {
          if (e.cancelable) e.preventDefault();
        }, { passive: false });
      });
    }
  }

  async load(fileName) {
    const url = MAP_BASE + fileName;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`載入失敗：${url}`);

    const txt    = await res.text();
    const doc    = new DOMParser().parseFromString(txt, 'image/svg+xml');
    const srcSvg = doc.documentElement;

      // 依 viewBox 推得原始尺寸
    if (srcSvg && srcSvg.viewBox && srcSvg.viewBox.baseVal) {
      this.contentW = srcSvg.viewBox.baseVal.width || parseFloat(srcSvg.getAttribute('width')) || FRAME_W;
      this.contentH = srcSvg.viewBox.baseVal.height || parseFloat(srcSvg.getAttribute('height')) || FRAME_H;
    } else {
      const wAttr         = parseFloat(srcSvg.getAttribute('width'));
      const hAttr         = parseFloat(srcSvg.getAttribute('height'));
            this.contentW = Number.isFinite(wAttr) ? wAttr : FRAME_W;
            this.contentH = Number.isFinite(hAttr) ? hAttr : FRAME_H;
    }

    this.viewport.innerHTML = '';
    const defs = srcSvg.querySelector('defs');
    if (defs) this.viewport.appendChild(document.importNode(defs, true));

    Array.from(srcSvg.childNodes).forEach((node) => {
      if (node.nodeType === 1 && node.tagName.toLowerCase() === 'defs') return;
      this.viewport.appendChild(document.importNode(node, true));
    });

    // 可互動圖形加上指標/點擊能力
    this.viewport.querySelectorAll('path, polygon, polyline, rect, circle').forEach(el => {
      el.style.cursor = 'pointer';
      el.style.pointerEvents = 'auto';
    });

    this.fitToContain();
    this.render();

    // W1：SVG 節點已就位，套用 COUNTRY_STYLE 自訂國家外觀（見 [02b]）
    this.applyCountryStyles();
  }

  fitToContain() {
    this.updateFrameSize();
    const sx = this.frameW / this.contentW;
    const sy = this.frameH / this.contentH;
      // 高度為基準，上下貼齊邊界
    this.baseScale = sy;

    this.zoomFactor = 1;
    this.scale      = this.baseScale * this.zoomFactor;

    const sw = this.contentW * this.scale;
    const sh = this.contentH * this.scale;

    this.tx = (this.frameW - sw) / 2;
    this.ty = (this.frameH - sh) / 2;
  }

  onWheel(e) {
    // 桌機滾輪縮放（可選模式）：僅在按住 Ctrl/⌘ 時啟用，避免滑頁面時被地圖卡住
    // - 功能：讓使用者「刻意」才縮放；一般滾動維持頁面行為
    // - 刪除影響：若改回全時啟用，滑頁面容易誤觸縮放造成卡住
    if (!(e.ctrlKey || e.metaKey)) return;
    if (e.cancelable) e.preventDefault();

    const delta  = Math.sign(e.deltaY) * -1;
    const factor = 1 + delta * ZOOM_STEP;

    const { x: mx, y: my } = this.toLocal(e);
    this.zoomBy(factor, mx, my);
  }

  zoomBy(factor, centerX = this.frameW / 2, centerY = this.frameH / 2) {
    const base    = this.baseScale;
    let   newZoom = (this.scale * factor) / base;
          newZoom = this.clamp(newZoom, MIN_ZOOM, MAX_ZOOM);

    const newScale = base * newZoom;
    const k        = newScale / this.scale;

      // 以指定中心點縮放
    this.tx = centerX - (centerX - this.tx) * k;
    this.ty = centerY - (centerY - this.ty) * k;

    this.scale      = newScale;
    this.zoomFactor = newZoom;

    this.clampTranslation();
    this.render();
  }

  onPointerMove(e) {
    // 手機端若已使用 touch events 接管，這裡忽略 touch pointer
    if (this.useTouchEvents && e.pointerType === 'touch') return;
    if (!this.pointerMap.has(e.pointerId)) return;
    this.pointerMap.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const isTouchMobile = this.isMobileTouch(e);

    // === 手機端：單指不接管；雙指才接管（pinch + 雙指平移） ===
    if (isTouchMobile) {
      if (this.pointerMap.size < 2) return;

      // 雙指手勢期間避免頁面跟著捲動
      if (e.cancelable) e.preventDefault();

      // 兩指 pinch：距離變化當縮放；中心點移動同步做平移
      if (this.pointerMap.size === 2 && this.lastPinchDist != null) {
        const pts  = Array.from(this.pointerMap.values());
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        if (dist <= 0) return;

        const factor = dist / this.lastPinchDist;
        this.lastPinchDist = dist;

        const cx = (pts[0].x + pts[1].x) / 2;
        const cy = (pts[0].y + pts[1].y) / 2;

        // 雙指中心點移動 => 平移（必須雙指才允許）
        if (this.lastCenter) {
          const dx = cx - this.lastCenter.x;
          const dy = cy - this.lastCenter.y;
          this.tx += dx;
          this.ty += dy;
        }
        this.lastCenter = { x: cx, y: cy };

        // zoomBy 的中心點要用 SVG local 座標，避免縮放抵銷平移（會變成只會縮放不能移動）
        const { x: lx, y: ly } = this.toLocal({ clientX: cx, clientY: cy });
        this.zoomBy(factor, lx, ly);
      }
      return;
    }

    // === 桌機端：左鍵拖曳平移 ===
    if (!this.isPanning || this.panningPointerId !== e.pointerId) return;

    const dx = e.clientX - this.panStart.x;
    const dy = e.clientY - this.panStart.y;

    // 超過門檻才視為拖曳，避免點擊也被當成 drag
    if (!this.didDrag && (Math.abs(dx) + Math.abs(dy) >= this.dragThreshold)) {
      this.didDrag = true;
      // 3.1.10 Tier 2【項目 10】真正開始拖曳後加 .is-panning,工具列淡化讓使用者專注
      if (this.frameEl) this.frameEl.classList.add('is-panning');
    }

    this.tx = this.startTxTy.tx + dx;
    this.ty = this.startTxTy.ty + dy;
    this.clampTranslation();
    this.render();
  }

  onPointerDown(e) {
    // 只在地圖框內處理（避免在資訊卡上按壓造成地圖誤動作）
    if (e.target.closest('#infoPanel')) return;

    // 手機端若已使用 touch events 接管，這裡忽略 touch pointer（避免雙系統狀態互相覆蓋）
    // 刪除影響：iOS/Android 可能出現「縮放/平移卡住、點擊失效、狀態亂跳」。
    if (this.useTouchEvents && e.pointerType === 'touch') return;

    const isTouchMobile = this.isMobileTouch(e);

    // === 手機端：單指點擊、雙指手勢（縮放/平移） ===
    if (isTouchMobile) {
      this.pointerMap.set(e.pointerId, { x: e.clientX, y: e.clientY });

      // 單指：只允許點擊；不接管拖曳/縮放，保持頁面可以自然上下滑動
      if (this.pointerMap.size < 2) {
        this.isPanning     = false;
        this.didDrag       = false;
        this.panningPointerId = null;
        this.lastPinchDist = null;
        this.lastCenter    = null;
        this.setTouchAction('pan-y');
        return;
      }

      // 雙指：接管手勢（pinch + 雙指平移），避免頁面在手勢期間跟著捲動
      this.setTouchAction('none');

      // 手機：雙指模式下把兩根手指都 capture（避免其中一指移出 SVG 後事件丟失）
      // 刪除影響：雙指拖曳/縮放可能時靈時不靈（尤其是 iOS）。
      for (const pid of this.pointerMap.keys()) {
        try { this.svg.setPointerCapture(pid); } catch (_) {}
      }

      // 第二指落下：建立 pinch 初始距離/中心點
      if (this.pointerMap.size === 2) {
        const pts = Array.from(this.pointerMap.values());
        this.lastPinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        this.lastCenter = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      }
      return;
    }

    // === 桌機端：滑鼠左鍵按住才拖曳平移 ===
    if (typeof e.button === 'number' && e.button !== 0) return;

    // 桌機：開始拖曳（若沒有真的移動，後續 click 仍可正常點選國家）
    this.pointerMap.set(e.pointerId, { x: e.clientX, y: e.clientY });
    this.isPanning     = true;
    this.didDrag       = false;
    this.panningPointerId = e.pointerId;

    this.panStart  = { x: e.clientX, y: e.clientY };
    this.startTxTy = { tx: this.tx, ty: this.ty };

    this.lastPinchDist = null;
    this.lastCenter    = null;

    // 桌機：先不做 pointer capture（避免 click 事件被 re-target 成 svg，導致點不到國家）
    // 真的開始拖曳（超過門檻）後才 capture，確保離開 svg 還能持續拖曳。
    this.hasPointerCapture = false;
  }

  

  onPointerUp(e) {
    // 手機端若已使用 touch events 接管，這裡忽略 touch pointer
    if (this.useTouchEvents && e.pointerType === 'touch') return;
    // 移除本指資料
    this.pointerMap.delete(e.pointerId);

    const isTouchMobile = this.isMobileTouch(e);

    // === 手機端：雙指結束後恢復頁面可捲動 ===
    if (isTouchMobile) {
      if (this.pointerMap.size < 2) {
        this.lastPinchDist = null;
        this.lastCenter    = null;
        this.setTouchAction('pan-y');
      }
      return;
    }

    // === 桌機端：結束拖曳並防誤觸 click ===
    if (e.pointerId === this.panningPointerId) {
      this.isPanning = false;
      this.panningPointerId = null;

      // 拖曳結束後短暫屏蔽 click，避免放開滑鼠時誤點國家
      if (this.didDrag) {
        const now = Date.now();
        this.suppressClickUntil = Math.max(this.suppressClickUntil, now + 260);
      }
    }

    // 3.1.10 Tier 2【項目 10】拖曳結束移除 .is-panning,工具列恢復
    if (this.frameEl) this.frameEl.classList.remove('is-panning');

    if (this.pointerMap.size === 0) {
      this.lastPinchDist = null;
      this.lastCenter    = null;
    }
  }


  onRegionClick(e) {
    // 拖曳結束後的短時間內忽略 click，避免誤點國家
    if (Date.now() < this.suppressClickUntil) return;

    let target = (e.target && e.target.closest)
      ? e.target.closest('path, polygon, polyline, rect, circle')
      : null;

    // 若 click 因為 pointer capture 被 re-target 成 svg，e.target 可能不是實際的 path
    // 這時用座標反查實際命中的 element，確保國家可點選。
    if (!target && typeof e.clientX === 'number' && typeof e.clientY === 'number') {
      const hit = document.elementFromPoint(e.clientX, e.clientY);
      if (hit && hit.closest) target = hit.closest('path, polygon, polyline, rect, circle');
    }

    if (!target || !this.viewport.contains(target)) {
      // 空白區域點擊：清除選取
      if (this.activeEl) {
        this.activeEl.classList.remove('active-region');
        this.activeEl = null;
      }
      // 移除聚焦模式類別
      this.frameEl.classList.remove('focus-mode');
      // 關閉資訊面板
      this.infoPanel.classList.remove('open');
      return;
    }

    if (this.activeEl && this.activeEl !== target) this.activeEl.classList.remove('active-region');
    this.activeEl = target;
    this.activeEl.classList.add('active-region');
    // 3.1.10 Tier 2【項目 2】active-region 一次性 pulse
    this.activeEl.classList.add('just-activated');
    setTimeout(() => { if (this.activeEl === target) target.classList.remove('just-activated'); }, 900);
    // 3.1.14:ripple 漣漪已移除(視覺不夠科技,active-region pulse 已足夠回饋)

    const name = this.extractRegionName(target);
    const iso2 = this.findIso2(target);
    const box  = target.getBBox ? target.getBBox() : { x: 0, y: 0, width: 0, height: 0 };

    this.showInfo({ name, iso2, bbox: box });
  }


  extractRegionName(el) {
    const dataName = el.getAttribute('data-name');
    if (dataName) return dataName;

      // 支援 attribute 形式的 title
    const titleAttr = el.getAttribute('title');
    if (titleAttr) return titleAttr;

    const titleEl = el.querySelector ? el.querySelector('title') : null;
    if (titleEl && titleEl.textContent) return titleEl.textContent.trim();

    const aria = el.getAttribute('aria-label');
    if (aria) return aria;

    const id = el.id || el.getAttribute('id');
    if (id) return id;

    let p = el.parentNode;
    while (p && p !== this.viewport && p.nodeType === 1) {
      const dn = p.getAttribute('data-name');
      if (dn) return dn;
      const pid = p.id || p.getAttribute('id');
      if (pid) return pid;
      p = p.parentNode;
    }
    return tr('ui.unnamedRegion', '未命名地區');
  }

  findIso2(el) {
    // 往上找最近的兩碼 ID；例如 UM-MQ 這種取前綴 UM
    // 子島 / 屬地對照表：prefix 不存在 COUNTRY_PAYMENTS 時改用所屬母國 ISO2
    // - UM (United States Minor Outlying Islands) → US
    // - GO / JU (French Southern Territories 子島) → TF
  const ISO2_REGION_PARENT = { UM: 'US', GO: 'TF', JU: 'TF' };
  let p = el;
  while (p && p !== this.viewport && p.nodeType === 1) {
    const id = (p.id || p.getAttribute && p.getAttribute('id') || '').toString();
    if (id) {
      const m = id.match(/^[A-Za-z]{2}(?:-[A-Za-z]{2})?$/);
      if (m) {
        const prefix = id.split('-')[0].toUpperCase();
        return ISO2_REGION_PARENT[prefix] || prefix;
      }
    }
    p = p.parentNode;
   }
   return null;
  }

    zoomToBBox(bbox, { pad = 1.1, screenX, screenY, animMs = 250 } = {}) {
    this.updateFrameSize();
    const fw = this.frameW;
    const fh = this.frameH;

    const targetW = (fw * 0.5) / pad;
    const targetH = (fh * 0.75) / pad;

    const sx = targetW / (bbox.width || 1);
    const sy = targetH / (bbox.height || 1);

    const zoomFactorTarget = this.clamp((Math.min(sx, sy) / this.baseScale), MIN_ZOOM, MAX_ZOOM);
    const scaleTarget      = this.baseScale * zoomFactorTarget;

    const cx = bbox.x + bbox.width / 2;
    const cy = bbox.y + bbox.height / 2;

    let txTarget = (screenX ?? fw / 2) - cx * scaleTarget;
    let tyTarget = (screenY ?? fh / 2) - cy * scaleTarget;

      // 邊界修正
    ({ tx: txTarget, ty: tyTarget } = this.clampTxTy({
      scale: scaleTarget,
      tx   : txTarget,
      ty   : tyTarget
    }));

      // 尊重 prefers-reduced-motion：直接跳到終點 transform，不跑補間
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.scale      = scaleTarget;
      this.tx         = txTarget;
      this.ty         = tyTarget;
      this.zoomFactor = this.scale / this.baseScale;
      this.render();
      return;
    }

      // 動畫補間
    const s0   = this.scale,  sx0 = this.tx,  sy0 = this.ty;
    const s1   = scaleTarget, sx1 = txTarget, sy1 = tyTarget;
    const t0   = performance.now();
    const ease = (t) => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;  // quad in-out

    const step = () => {
      const p               = Math.min(1, (performance.now() - t0) / animMs);
      const e               = ease(p);
            this.scale      = s0 + (s1 - s0) * e;
            this.tx         = sx0 + (sx1 - sx0) * e;
            this.ty         = sy0 + (sy1 - sy0) * e;
            this.zoomFactor = this.scale / this.baseScale;
      this.render();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }


  clampTxTy({ scale = this.scale, tx = this.tx, ty = this.ty }) {
    this.updateFrameSize();
    const sw    = this.contentW * scale;
    const sh    = this.contentH * scale;
    let   outTx = tx, outTy = ty;

    const fitsX = sw <= this.frameW;
    const fitsY = sh <= this.frameH;

    if (fitsX) outTx = (this.frameW - sw) / 2; else outTx = this.clamp(tx, this.frameW - sw, 0);
    if (fitsY) outTy = (this.frameH - sh) / 2; else outTy = this.clamp(ty, this.frameH - sh, 0);

    return { tx: outTx, ty: outTy };
  }

  resetView() {
    this.fitToContain();
    this.render();
  }

  
render() {
  // SVG transform 盡量做數值收斂，減少手機端移動時的像素抖動（框格跳動）
  // 刪除影響：在 iOS/Android 上平移/縮放時更容易出現線條閃爍、邊框抖動。
  const tx = Math.round(this.tx * 100) / 100;
  const ty = Math.round(this.ty * 100) / 100;
  const sc = Math.round(this.scale * 10000) / 10000;

  this.viewport.setAttribute('transform', `translate(${tx},${ty}) scale(${sc})`);
}

  clampTranslation() {
    const r       = this.clampTxTy({});
          this.tx = r.tx; this.ty = r.ty;
  }

  toLocal(e) {
    const rect = this.svg.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  setDockSide(side) {
      // side: 'left' 或 'right'
    const panel = this.infoPanel;
    const frame = this.frameEl;

    if (side === 'right') {
      panel.classList.add('right');
      frame.classList.add('dock-right');
    } else {
      panel.classList.remove('right');
      frame.classList.remove('dock-right');
    }
  }

  clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  escapeHtml(s) { return String(s).replace(/[&<>"']/g, (ch) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'': '&#39;' }[ch])); }
}

// === [02b] 國家外觀可控系統（W1）：applyCountryStyles() ===
// 功能：讀 window.COUNTRY_STYLE，展開 `_groups` 後逐國套用 fill / pattern / gradient 到
//       #viewport 內對應的 SVG 圖形（`#XX` 或 `[id^="XX-"]`；世界地圖目前皆為扁平 <path>，
//       但保留對 <g> 容器逐一套子節點的相容處理，避免未來換圖走鐘）。
// 資料來源：country-style.js（COUNTRY_STYLE）。
// 刪除影響：地圖回到單一石墨灰底色（3.1.15 以前的外觀），不影響任何手勢/transform。
// 冪等：defs 容器 `#mcCountryStyleDefs` 只建立一次，重複呼叫會清空重建、不會疊加重複節點。
// ------------------------------------------------------------
const SVG_NS = 'http://www.w3.org/2000/svg';

MapViewer.prototype.applyCountryStyles = function () {
  const table = window.COUNTRY_STYLE;
  if (!table || typeof table !== 'object') return;
  if (!this.svg || !this.viewport) return;

  // defs 容器：固定掛在 #mapSvg 底下（非 #viewport，避免被 transform 影響 pattern 座標系）
  let defs = this.svg.querySelector('defs#mcCountryStyleDefs');
  if (!defs) {
    defs = document.createElementNS(SVG_NS, 'defs');
    defs.setAttribute('id', 'mcCountryStyleDefs');
    this.svg.insertBefore(defs, this.svg.firstChild);
  } else {
    defs.innerHTML = ''; // 冪等：重複呼叫時清空重建，不重複注入
  }

  // 0) 預設底色：把 `_default.fill` inline 套到 #viewport 內所有圖形，作為「未命中任何
  //    群組/逐國規則」區域的基礎預設色（＝空區域唯一控制點）。此步先跑，之後 group + 逐國
  //    的 specific fill/pattern/gradient 會覆蓋（inline 後寫贏先寫），故 pattern/gradient
  //    國家不會被這層底色蓋掉。若無 _default.fill 則跳過，維持吃 CSS 的舊行為。
  const defaultStyle = table._default || {};
  if (defaultStyle.fill) {
    const baseTargets = this.viewport.querySelectorAll('path, polygon, polyline');
    baseTargets.forEach((shape) => { shape.style.fill = defaultStyle.fill; });
  }

  // 1) 展開 _groups → 逐國解析出最終樣式；逐國定義（top-level key）覆蓋群組展開結果
  const resolved = {};
  const groups = table._groups || {};
  Object.keys(groups).forEach((groupName) => {
    const group = groups[groupName] || {};
    const members = Array.isArray(group.iso2) ? group.iso2 : [];
    const groupStyle = {};
    Object.keys(group).forEach((k) => { if (k !== 'iso2') groupStyle[k] = group[k]; });
    members.forEach((iso2) => { resolved[iso2] = groupStyle; });
  });
  Object.keys(table).forEach((key) => {
    if (key === '_default' || key === '_groups') return;
    resolved[key] = table[key];
  });

  // 2) 逐國生成 paint 值（純色 / pattern url / gradient url）並套到對應圖形上
  Object.keys(resolved).forEach((iso2) => {
    const style = resolved[iso2];
    if (!style) return;
    const paint = this.resolveCountryPaint(defs, iso2, style);
    if (!paint) return;
    this.paintCountryElements(iso2, paint);
  });
};

// 依樣式物件決定 fill 用值：純色直接回傳 hex；pattern/gradient 先建節點再回傳 url() 參照
MapViewer.prototype.resolveCountryPaint = function (defs, iso2, style) {
  if (style.fill) return style.fill;
  if (style.pattern) return this.buildCountryPattern(defs, iso2, style.pattern);
  if (style.gradient) return this.buildCountryGradient(defs, iso2, style.gradient);
  return null;
};

// 找出 iso2 對應的 SVG 圖形並套 fill；元素可能本身就是 path/polygon/polyline，
// 也可能是包多個子圖形的容器（例如未來改版把群島國家包成 <g>）——兩種都要處理。
MapViewer.prototype.paintCountryElements = function (iso2, paintValue) {
  const targets = this.viewport.querySelectorAll(`#${iso2}, [id^="${iso2}-"]`);
  targets.forEach((el) => {
    const isShape = /^(path|polygon|polyline|rect|circle)$/i.test(el.tagName);
    const shapes = isShape ? [el] : Array.from(el.querySelectorAll('path, polygon, polyline, rect, circle'));
    shapes.forEach((shape) => { shape.style.fill = paintValue; });
  });
};

// pattern：stripes（斜條紋）/ dots（網點）/ image（貼圖平鋪）
// patternUnits 固定用 userSpaceOnUse，讓 tile 錨定在地圖座標系（而非跟著每個國家的 bbox 縮放），
// 避免地圖縮放時圖樣跟著跳動或產生摩爾紋。
MapViewer.prototype.buildCountryPattern = function (defs, iso2, opts) {
  const id = `mc-pat-${iso2}`;
  const type = opts && opts.type;
  let pattern;

  if (type === 'stripes') {
    const colors = Array.isArray(opts.colors) && opts.colors.length ? opts.colors : ['#2d3748', '#1a202c'];
    const stripeW = Number.isFinite(opts.width) ? opts.width : 6;
    const angle   = Number.isFinite(opts.angle) ? opts.angle : 45;
    const tile    = stripeW * colors.length;

    pattern = document.createElementNS(SVG_NS, 'pattern');
    pattern.setAttribute('id', id);
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    pattern.setAttribute('width', tile);
    pattern.setAttribute('height', tile);
    pattern.setAttribute('patternTransform', `rotate(${angle})`);

    colors.forEach((color, i) => {
      const rect = document.createElementNS(SVG_NS, 'rect');
      rect.setAttribute('x', i * stripeW);
      rect.setAttribute('y', 0);
      rect.setAttribute('width', stripeW);
      rect.setAttribute('height', tile);
      rect.setAttribute('fill', color);
      pattern.appendChild(rect);
    });
  } else if (type === 'dots') {
    const bg  = opts.bg  || '#2d3748';
    const dot = opts.dot || '#e2e8f0';
    const size = Number.isFinite(opts.size) ? opts.size : 2;
    const gap  = Number.isFinite(opts.gap)  ? opts.gap  : 8;

    pattern = document.createElementNS(SVG_NS, 'pattern');
    pattern.setAttribute('id', id);
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    pattern.setAttribute('width', gap);
    pattern.setAttribute('height', gap);

    const bgRect = document.createElementNS(SVG_NS, 'rect');
    bgRect.setAttribute('width', gap);
    bgRect.setAttribute('height', gap);
    bgRect.setAttribute('fill', bg);
    pattern.appendChild(bgRect);

    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.setAttribute('cx', gap / 2);
    circle.setAttribute('cy', gap / 2);
    circle.setAttribute('r', size);
    circle.setAttribute('fill', dot);
    pattern.appendChild(circle);
  } else if (type === 'image') {
    const href = opts.href;
    if (!href) return null;
    const tile = Number.isFinite(opts.tile) ? opts.tile : 32;

    pattern = document.createElementNS(SVG_NS, 'pattern');
    pattern.setAttribute('id', id);
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    pattern.setAttribute('width', tile);
    pattern.setAttribute('height', tile);

    const image = document.createElementNS(SVG_NS, 'image');
    image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', href);
    image.setAttribute('href', href);
    image.setAttribute('width', tile);
    image.setAttribute('height', tile);
    pattern.appendChild(image);
  } else {
    return null; // 未知 pattern type：不注入、也不讓整國變成無填色
  }

  defs.appendChild(pattern);
  return `url(#${id})`;
};

// gradient：目前只支援 linear（stops + angle）；預留 type 欄位供未來擴充 radial
MapViewer.prototype.buildCountryGradient = function (defs, iso2, opts) {
  if (!opts || opts.type !== 'linear' || !Array.isArray(opts.stops) || !opts.stops.length) return null;

  const id = `mc-grad-${iso2}`;
  const angle = Number.isFinite(opts.angle) ? opts.angle : 0;

  const grad = document.createElementNS(SVG_NS, 'linearGradient');
  grad.setAttribute('id', id);
  grad.setAttribute('gradientUnits', 'objectBoundingBox');
  grad.setAttribute('gradientTransform', `rotate(${angle}, 0.5, 0.5)`);

  opts.stops.forEach((s) => {
    const stopEl = document.createElementNS(SVG_NS, 'stop');
    stopEl.setAttribute('offset', s.offset);
    stopEl.setAttribute('stop-color', s.color);
    grad.appendChild(stopEl);
  });

  defs.appendChild(grad);
  return `url(#${id})`;
};

// === 其他地區（#regionGrid）動態按鈕 ===
function buildIso2ToEnglishNameMap() {
  const map = new Map();
  const src = window.COUNTRY_INFO || {};
  for (const enName of Object.keys(src)) {
    const iso2 = (src[enName] && src[enName].iso2) ? String(src[enName].iso2).toUpperCase() : '';
    if (iso2 && !map.has(iso2)) map.set(iso2, enName);
  }
  return map;
}


// === [03] 地圖下方：其他地區（regionGrid） ===
// 功能：用 country-payments.js 的「物件定義順序」當作顯示順序；並只顯示 map-flag-Places === true 的國家。
// 刪除影響：地圖仍可點擊，但使用者少了「國旗入口」，小島/難點的國家會很難找到。
// ------------------------------------------------------------
function renderRegionGrid(viewer){
  const grid = document.getElementById('regionGrid');
  if (!grid) return;

  const payments = window.COUNTRY_PAYMENTS || {};
  const iso2sDefinedOrder = Object.keys(payments); // 依 country-payments 定義順序（插入順序）
  const iso2ToEnName = buildIso2ToEnglishNameMap(); // iso2 -> English name key for COUNTRY_INFO

  // 只取需要顯示的（map-flag-Places: true），並且套用上限
  let list = iso2sDefinedOrder
    .filter(iso2 => !!iso2)
    .filter(iso2 => !!(payments[iso2] && payments[iso2]['map-flag-Places'] === true));

  if (Number.isFinite(REGION_LIST_MAX)) {
    list = list.slice(0, REGION_LIST_MAX);
  }

  grid.innerHTML = '';

  list.forEach((iso2) => {
    const enName = (iso2ToEnName.get(iso2) || iso2);

    const info = (window.getCountryInfo ? window.getCountryInfo(enName) : null);
    const zhName = (info && info.zhName) ? info.zhName : enName;
    // W3：國旗按鈕名稱依當前 locale 動態出（Intl.DisplayNames），失敗退 zhName。
    const displayName = localizedRegionName(iso2, currentLocale(), zhName);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'region-btn';
    btn.dataset.iso2 = iso2;
    // 保留接口：以後語系切換用
    btn.dataset.nameEn = enName;
    btn.dataset.nameZh = zhName;

    const nameWrap = document.createElement('span');
    nameWrap.className = 'region-name';
    // 顯示當前 locale 的地區名；原始 zh/en 名保留在 dataset（上面已塞）供 debug
    nameWrap.innerHTML = `<span class="zh">${displayName}</span>`;

    btn.appendChild(nameWrap);

    btn.addEventListener('click', () => {
      const el =
        (viewer && viewer.viewport && viewer.viewport.querySelector(`#${iso2}`)) ||
        (viewer && viewer.viewport && viewer.viewport.querySelector(`[id^="${iso2}-"]`));

      let bbox;
      let name;

      if (el && el.getBBox) {
        bbox = el.getBBox();
        name = viewer.extractRegionName(el);
      } else {
        bbox = { x: viewer.contentW * 0.5, y: viewer.contentH * 0.5, width: 1, height: 1 };
        name = enName;
      }

      if (viewer.activeEl && viewer.activeEl !== el) {
        viewer.activeEl.classList.remove('active-region');
      }
      viewer.activeEl = el || null;
      if (el) {
        el.classList.add('active-region');
        // 3.1.10 Tier 2【項目 2】active-region 一次性 pulse
        el.classList.add('just-activated');
        setTimeout(() => { if (viewer.activeEl === el) el.classList.remove('just-activated'); }, 900);
      }

      // 記錄觸發元素，Esc 關閉資訊卡時把焦點還回這顆國旗按鈕
      viewer.lastInfoTrigger = btn;
      viewer.showInfo({ name, iso2, bbox });

      // 點底下國旗後滾動到地圖區塊（整合頁面吃 .world_map）
      scrollToWorldMap();
    });

    grid.appendChild(btn);
  });
}

  // === 啟動 ===
(async function init() {
  const svg        = document.getElementById('mapSvg');
  const viewport   = document.getElementById('viewport');
  const infoPanel  = document.getElementById('infoPanel');
  const closeInfo  = document.getElementById('closeInfo');
  const btnZoomIn  = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');
  const btnReset   = document.getElementById('btnResetView');
  const mapHint    = document.getElementById('mapHint');

  // 必要 DOM 防呆：缺少任一關鍵節點就放棄初始化，避免後續整批拋錯
  if (!svg || !viewport || !infoPanel) {
    console.error('[nation-map] missing required DOM');
    return;
  }

  // infoPanel 補 ARIA（region + live region），供螢幕報讀器追蹤資訊卡變動
  infoPanel.setAttribute('role', 'region');
  infoPanel.setAttribute('aria-live', 'polite');
  infoPanel.setAttribute('aria-label', tr('ui.countryInfo', '國家資訊'));

  // W3：載入時先把 <html lang> 對齊生效 locale，並套用一次靜態字串（此時 window.t 已就緒）
  if (document.documentElement) document.documentElement.setAttribute('lang', currentLocale());
  applyStaticI18n(document);

  const viewer = new MapViewer(svg, viewport, infoPanel);
  bindServiceMapScroll();

  // 記錄觸發 infoPanel 開啟的元素,Esc 關閉時把焦點還回去
  viewer.lastInfoTrigger = null;

  // 3.1.10 Tier 2【項目 4】鍵帽圖示 hint
  const updateHintText = () => {
    if (!mapHint) return;
    const isMobile = viewer.isMobileLike();
    const uaData = navigator.userAgentData;
    const isMac = (navigator.platform && navigator.platform.includes('Mac'))
                  || (uaData && uaData.platform === 'macOS');
    const modKey = isMac ? '⌘' : 'Ctrl';
    if (isMobile) {
      mapHint.textContent = tr('ui.hintMobile', '雙指拖曳或縮放地圖；點擊地區查看資訊');
    } else {
      // 桌機保留 <kbd> 鍵帽結構（3.1.10 視覺特徵）：修飾鍵＋滾輪為硬編碼安全字串，
      // 其餘敘述文字走 tr('ui.hintDesktop') 依 locale 出。組合方式：<kbd>Mod</kbd> + <kbd>Wheel</kbd> 敘述。
      const wheelWord = tr('ui.hintWheel', '滾輪');
      const desc = tr('ui.hintDesktopSuffix', '縮放、拖曳平移；點擊地區查看資訊');
      const holdWord = tr('ui.hintHold', '按住');
      mapHint.innerHTML = holdWord + ' <kbd class="kbd">' + modKey + '</kbd> + <kbd class="kbd">' + wheelWord + '</kbd> ' + desc;
    }
  };
  updateHintText();

  // === [00c] W3 網頁語系接口（掛在 window.NationMap；切 locale 後即時重渲染、不重載頁面） ===
  // map-i18n.js 已提供內部版 setLocale（只換 currentLocale）與 getLocale/getSupportedLocales。
  // 這裡「包裝」setLocale：先委派內部版換 locale，再重繪所有受語系影響的 UI，並派事件。
  const __i18nSetLocaleInternal = window.NationMap && window.NationMap.setLocale;

  const rerenderAllI18n = () => {
    // 1) 靜態字串（skip-link / h1 / 工具列 aria / 其他地區標題與敘述 / infoPanel aria）
    applyStaticI18n(document);
    // 2) 地圖操作提示（依裝置動態產生）
    updateHintText();
    // 3) 地圖下方「其他地區」國旗清單（名稱走 Intl.DisplayNames）
    renderRegionGrid(viewer);
    // 4) 開啟中的資訊卡：重呼 showInfo → 國名/幣名/支付方式/模式鈕全部依新 locale 重繪
    if (infoPanel.classList.contains('open') && viewer.currentInfo) {
      viewer.showInfo(viewer.currentInfo);
    }
  };

  window.NationMap = window.NationMap || {};
  window.NationMap.setLocale = function setLocale(locale) {
    // 委派 map-i18n 內部版做 normalize + 換 currentLocale；缺席時原樣回傳
    const before = currentLocale();
    const applied = (typeof __i18nSetLocaleInternal === 'function')
      ? __i18nSetLocaleInternal(locale)
      : locale;
    // W3 效能：正規化後 locale 與現值相同 → 免重渲染、免派事件（仍回傳生效 locale）
    if (applied === before) return applied;
    // 更新 <html lang> 屬性
    if (document.documentElement) document.documentElement.setAttribute('lang', applied);
    // 即時重渲染
    rerenderAllI18n();
    // 派事件供外部整合頁面掛鉤
    try {
      document.dispatchEvent(new CustomEvent('nationmap:localechange', { detail: { locale: applied } }));
    } catch (_) { /* 老瀏覽器無 CustomEvent 建構式時靜默略過 */ }
    return applied;
  };

  // 3.1.10 Tier 2【項目 4】首次無修飾鍵滾輪 → pulse hint 提示使用者
  let hintPulseGuard = false;
  const pulseHintOnce = () => {
    if (!mapHint || hintPulseGuard) return;
    hintPulseGuard = true;
    mapHint.classList.add('is-pulsing');
    setTimeout(() => {
      mapHint.classList.remove('is-pulsing');
      // 重置 guard,允許 30 秒後再次提示
      setTimeout(() => { hintPulseGuard = false; }, 30000);
    }, 1300);
  };
  // SVG wheel 已被 viewer.bindEvents 捕捉,我們在 mapFrame 上補一個 capture-phase listener
  // 只在「無 ctrlKey/metaKey + 桌機」時觸發 pulse
  // 註:這裡用本地 getElementById 而非後面的 const mapFrame(避免 TDZ)
  const mfForHint = document.getElementById('mapFrame');
  if (mfForHint) {
    mfForHint.addEventListener('wheel', (e) => {
      if (viewer.isMobileLike()) return;
      if (e.ctrlKey || e.metaKey) return;
      pulseHintOnce();
    }, { passive: true });
  }

    // 更新外框大小＋重新限制邊界，不重置縮放與中心
    // 用 rAF 節流避免 resize / orientationchange / visualViewport 連續觸發造成抖動
  let resizePending = false;
  const onViewportResize = () => {
    if (resizePending) return;
    resizePending = true;
    requestAnimationFrame(() => {
      resizePending = false;
      viewer.updateFrameSize();
      viewer.clampTranslation();
      viewer.render();
      updateHintText();
    });
  };
  window.addEventListener('resize', onViewportResize);
  window.addEventListener('orientationchange', onViewportResize);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', onViewportResize);
  }

  // Esc 關閉資訊卡並把焦點還回觸發元素（若有記錄）
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!infoPanel.classList.contains('open')) return;
    infoPanel.classList.remove('open');
    // 3.1.13 Tier 3【項目 7】關閉時移除 focus-mode,讓 vignette 淡出
    if (viewer.frameEl) viewer.frameEl.classList.remove('focus-mode');
    hideMethodTooltip();
    const trigger = viewer.lastInfoTrigger;
    if (trigger && typeof trigger.focus === 'function') {
      try { trigger.focus(); } catch (_) { /* ignore */ }
    }
  });

  closeInfo && closeInfo.addEventListener('click', () => {
    infoPanel.classList.remove('open');
    // 3.1.13 Tier 3【項目 7】關閉時移除 focus-mode
    if (viewer.frameEl) viewer.frameEl.classList.remove('focus-mode');
    hideMethodTooltip();
  });
  const mapFrame = document.getElementById('mapFrame');

    // 手機版：點擊地圖空白處關閉資訊卡
  mapFrame && mapFrame.addEventListener('click', (e) => {
    const isMobileLike = window.matchMedia('(max-width: 899px)').matches;
    if (!isMobileLike) return;

      // 點到區域 path / svg 不關閉（那些會觸發 showInfo）
    const target = e.target;
    if (target.closest && target.closest('#infoPanel')) return;
    if (target.closest && target.closest('path, polygon, polyline, rect, circle')) return;
      // 點到工具列 / 提示 / 付款方式圓點不關閉（避免手機誤觸關卡）
    if (target.closest && target.closest('.map-toolbar, .map-tool-btn, .map-hint, .pay-dots')) return;

    infoPanel.classList.remove('open');
    // 3.1.13 Tier 3【項目 7】手機版點空白也移除 focus-mode
    if (viewer.frameEl) viewer.frameEl.classList.remove('focus-mode');
    hideMethodTooltip();
  });

  btnZoomIn && btnZoomIn.addEventListener('click', () => {
    viewer.zoomBy(1.25);  // 放大一點
  });

  btnZoomOut && btnZoomOut.addEventListener('click', () => {
    viewer.zoomBy(1 / 1.25);  // 縮小一點
  });

  btnReset && btnReset.addEventListener('click', () => {
    // 視角重置
    viewer.resetView();

    // 面板收起
    infoPanel.classList.remove('open');

    // 地圖高亮取消
    if (viewer.activeEl) {
      viewer.activeEl.classList.remove('active-region');
      viewer.activeEl = null;
    }

    // tooltip 關掉
    hideMethodTooltip();
  });

  // 3.1.10 Tier 2【項目 3】首屏 3 階段載入敘事:加 .is-booting,viewer.load() 完成後分階段移除
  // 複用前面已宣告的 const mapFrame(避免 TDZ + 重複 getElementById)
  if (mapFrame) mapFrame.classList.add('is-booting');

  try {
    await viewer.load('world.svg');

    // Stage 1:地圖淡入(立即移除 is-booting)
    requestAnimationFrame(() => {
      if (mapFrame) mapFrame.classList.remove('is-booting');
    });

    // 先渲染下方「其他地區」按鈕
    renderRegionGrid(viewer);

    // 3.1.10 Tier 2【項目 6】region-section IntersectionObserver stagger 進場
    const regionSection = document.getElementById('regionSection');
    if (regionSection && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.disconnect(); // 觸發後即停止觀察,釋放資源
          }
        });
      }, { threshold: 0.15 });
      io.observe(regionSection);
    } else if (regionSection) {
      // 老瀏覽器 fallback:直接加 in-view 跳過動畫
      regionSection.classList.add('in-view');
    }

      // 1) 嘗試用 ISO2 = TW 找到台灣 path
    const viewportEl = document.getElementById('viewport');
    let   tw         = viewportEl.querySelector('#TW') ||
             viewportEl.querySelector('[id^="TW-"]') ||
             viewportEl.querySelector('[data-name="Taiwan"]');

    if (tw && tw.getBBox) {
      const bbox = tw.getBBox();
      const name = viewer.extractRegionName(tw);
      const iso2 = viewer.findIso2(tw);

      if (viewer.activeEl && viewer.activeEl !== tw) {
        viewer.activeEl.classList.remove('active-region');
      }
      viewer.activeEl = tw;
      tw.classList.add('active-region');
      // 3.1.10 Tier 2【項目 2 + 項目 3】首次台灣展現 = highlight-breath(stage 3),不重複 just-activated
      tw.classList.add('highlight-breath');
      setTimeout(() => tw.classList.remove('highlight-breath'), 1300);

      viewer.showInfo({ name, iso2, bbox });  // 初始狀態就顯示台灣資訊
    }
  } catch (err) {
    console.error(err);
  }
})();


  // 旗幟來源嘗試：Exact / _ / - ；svg→png 退回
  // === 國旗載入：依「國名簡寫檔案」 ===
  // 旗幟放在 /assest/national-flag/，檔名為 ISO2：US.webp、TW.webp、JP.webp...
const FLAG_BASE = './assest/national-flag/';
function setFlagByIso2(imgEl, iso2){
  // 最佳化：直接走小寫 .webp（命中率近 100%），只有失敗才退到大寫 .webp 後援
  // 避免原本一律先試大寫 .webp/.svg/.png/.jpg 造成 4 次 404
  const lower = String(iso2||'').toLowerCase();
  const upper = String(iso2||'').toUpperCase();
  if (!lower) { imgEl.removeAttribute('src'); imgEl.alt = 'No flag'; return; }

  const fallback = FLAG_BASE + upper + '.webp';
  imgEl.onerror = ()=>{
      // 大寫後援也失敗就放棄，避免無限重試
    imgEl.onerror = ()=>{ imgEl.removeAttribute('src'); imgEl.alt = 'No flag'; };
    imgEl.src = fallback;
  };
  imgEl.src = FLAG_BASE + lower + '.webp';
}


  // 點擊事件
MapViewer.prototype.showInfo = function ({ name, iso2, bbox }) {
  // W3：記住當前顯示國，供 setLocale 時重呼 showInfo 重繪（bbox 為 content 座標，重繪不跳位）
  this.currentInfo = { name, iso2, bbox };

  const info = (window.getCountryInfo ? getCountryInfo(name) : null)
               || { zhName: name, currencyCode: '—', currencyName: '—', iso2 };

  const infoBody = document.getElementById('infoBody');
  // W3：國名／幣名改由 Intl.DisplayNames 依當前 locale 動態出；HK/MO 用 short；
  //     Intl 失敗（不支援或無效 code）時 fallback 回 COUNTRY_INFO 的 zhName/currencyName，絕不白屏。
  const loc      = currentLocale();
  const regionKey = iso2 || (info && info.iso2) || '';
  const zh       = this.escapeHtml(localizedRegionName(regionKey, loc, info.zhName || name));
  const en       = this.escapeHtml(name);
  const curZh    = this.escapeHtml(localizedCurrencyName(info.currencyCode, regionKey, loc, info.currencyName || '—'));
  const curEn    = this.escapeHtml(info.currencyCode || '—');

  infoBody.innerHTML = `
  <div class="info-top">
    <section class="card name-card card--naked">
      <h2 class="zh-title">${zh}</h2>
    </section>

    <section class="card meta-card card--naked">
      <div class="currency-box">
        <div class="zh-cur">${curZh}</div>
      </div>
    </section>
  </div>

  <section class="card payments-card" id="paymentsCard">
    <div class="payments-scroll" id="paymentsScroll"></div>
    <div class="pay-dots" id="payDots" aria-hidden="true"></div>
  </section>
  `;

  // 保留接口（給未來語系切換 / debug 用，不顯示）
  infoBody.dataset.nameEn = en;
  infoBody.dataset.currencyCode = curEn;

    // 判斷是否為手機／小平板畫面
  const isMobileLike = window.matchMedia('(max-width: 899px)').matches;

    // === 右上角模式滑桿（桌機／平板用；手機版不顯示） ===
  const header = document.querySelector('#infoPanel .info-header');
  if (!isMobileLike && header) {
    const old = header.querySelector('.mode-toggle');
    if (old) old.remove();

      // A11y：外層保留 .mode-toggle 維持 .knob / .is-icon 視覺樣式
      //       內層改用 role=radiogroup + 兩顆 button[role=radio]
      //       讓鍵盤 / 螢幕報讀器可用
    const toggle           = document.createElement('div');
          toggle.className = 'mode-toggle';
          toggle.innerHTML = `
      <div class = "knob"></div>
      <div role="radiogroup" aria-label="${tr('ui.payModeLabel', '付款方式顯示模式')}">
        <button type="button" class="opt opt-full" role="radio" aria-checked="true">${tr('ui.modeList', '清單')}</button>
        <button type="button" class="opt opt-icon" role="radio" aria-checked="false">${tr('ui.modeIcon', '圖標')}</button>
      </div>
    `;

      // 正確插在 controls 區塊前面，而不是 closeInfo 本身
    const controls = header.querySelector('.info-controls');
    if (controls) {
      header.insertBefore(toggle, controls);
    } else {
      header.appendChild(toggle);
    }

      // 沿用上次模式（記在 infoBody data-paymode）
    const mode          = infoBody.getAttribute('data-paymode') || 'full';
    const paymentsMount = document.getElementById('paymentsCard');
    const optFull       = toggle.querySelector('.opt-full');
    const optIcon       = toggle.querySelector('.opt-icon');

      // 共用：把 toggle 狀態套到 DOM / class / aria-checked / tabindex
    const applyMode = (isIcon) => {
      toggle.classList.toggle('is-icon', isIcon);
      paymentsMount.classList.toggle('icon-only', isIcon);
      infoBody.setAttribute('data-paymode', isIcon ? 'icon' : 'full');
      optFull.classList.toggle('active', !isIcon);
      optIcon.classList.toggle('active',  isIcon);
      optFull.setAttribute('aria-checked', String(!isIcon));
      optIcon.setAttribute('aria-checked', String(isIcon));
      // radiogroup 鍵盤焦點規範：只有被選中的 radio 可 Tab 進入
      optFull.tabIndex = isIcon ? -1 : 0;
      optIcon.tabIndex = isIcon ? 0 : -1;
      hideMethodTooltip();
    };

    applyMode(mode === 'icon');

      // 點擊整個 toggle（含 knob 與兩顆 button）都切換
      // 注意：button 點擊會冒泡到 toggle，這裡用「目標 opt-full 強制 full、opt-icon 強制 icon」
    toggle.addEventListener('click', (e) => {
      const btn = e.target.closest('.opt');
      if (btn === optFull) {
        applyMode(false);
      } else if (btn === optIcon) {
        applyMode(true);
      } else {
        // 點到 knob 或空白：保留原本 toggle 行為
        applyMode(!toggle.classList.contains('is-icon'));
      }
    });

      // A11y 鍵盤支援：Enter / Space 切換、ArrowLeft 切到 full、ArrowRight 切到 icon
    toggle.addEventListener('keydown', (e) => {
      const key = e.key;
      if (key === 'ArrowLeft') {
        e.preventDefault();
        applyMode(false);
        optFull.focus();
      } else if (key === 'ArrowRight') {
        e.preventDefault();
        applyMode(true);
        optIcon.focus();
      } else if (key === 'Enter' || key === ' ' || key === 'Spacebar') {
        // 在目前焦點的 radio 上 Enter/Space 切換到對應模式
        e.preventDefault();
        const focused = document.activeElement;
        if (focused === optFull) applyMode(false);
        else if (focused === optIcon) applyMode(true);
        else applyMode(!toggle.classList.contains('is-icon'));
      }
    });
  }

  const code = (iso2 || (info && info.iso2) || '').toString().split('-')[0];

    // 渲染支援付款方式
  const paymentsMount = document.getElementById('paymentsCard');

  if (isMobileLike) {
      // 手機版：固定 icon-only 模式
    paymentsMount.classList.add('icon-only');
    infoBody.setAttribute('data-paymode', 'icon');
  }

  renderPayments(code, paymentsMount);

    // === 依裝置類型決定資訊卡位置與對焦方式 ===
  this.updateFrameSize();
  const fw = this.frameW;
  const fh = this.frameH;

  // 3.1.10 Tier 2【項目 5】info-float 進場條件式 will-change(animationend 移除)
  const armWillChange = () => {
    if (!this.infoPanel) return;
    this.infoPanel.classList.add('is-opening');
    const onEnd = () => {
      this.infoPanel.classList.remove('is-opening');
      this.infoPanel.removeEventListener('transitionend', onEnd);
    };
    this.infoPanel.addEventListener('transitionend', onEnd);
  };

  if (isMobileLike) {
    this.infoPanel.classList.remove('right');
    armWillChange();
    this.infoPanel.classList.add('open');
    // 3.1.13 Tier 3【項目 7】vignette focus mode:資訊卡開啟時周圍變暗,讓視線聚焦中心
    if (this.frameEl) this.frameEl.classList.add('focus-mode');
    if (this.frameEl) {
      this.frameEl.classList.remove('dock-right');
    }

    const screenX = fw * 0.5;
    const screenY = fh * 0.32;  // 地圖中心略偏上

    this.zoomToBBox(bbox, {
      pad: 1.2,
      screenX,
      screenY,
      animMs: 280
    });
  } else {
      // 桌機／平板：偏左就把卡片放右邊，反之放左
    const cxRatio   = (bbox.x + bbox.width / 2) / this.contentW;
    const dockRight = cxRatio < 0.38;                             // 偏左 → 卡片靠右

    this.infoPanel.classList.toggle('right', dockRight);
    armWillChange();
    this.infoPanel.classList.add('open');
    // 3.1.13 Tier 3【項目 7】vignette focus mode
    if (this.frameEl) this.frameEl.classList.add('focus-mode');

    if (this.frameEl) {
      this.frameEl.classList.toggle('dock-right', dockRight);
    }

    this.updateFrameSize();
    const pw      = this.infoPanel.getBoundingClientRect().width || fw * 0.22;
    const screenX = dockRight
      ? (fw - pw) * 0.38
      :  pw + (fw - pw) * 0.62;

    this.zoomToBBox(bbox, {
      pad: 1.2,
      screenX,
      screenY: fh * 0.5,
      animMs : 280
    });
  }
};


  // === Icon 模式用的金流名稱 tooltip ===
const methodTooltipEl    = document.getElementById('methodTooltip');
let   methodTooltipTimer = null;

function hideMethodTooltip() {
  if (!methodTooltipEl) return;
  methodTooltipEl.classList.remove('visible');
  methodTooltipEl.textContent = '';
  methodTooltipTimer          = null;
}

function attachMethodTooltip(chip, meta) {
  if (!methodTooltipEl) return;

  const label = localizedPaymentName(meta.id, meta.name_zh, meta.name_en);
  if (!label) return;

  let hovering = false;

    // 共用：實際顯示 tooltip 的函式（給 hover 和長按共用）
  const showAt = (clientX, clientY) => {
    const card = chip.closest('.payments-card');
    if (!card || !card.classList.contains('icon-only')) return;

    const img                       = chip.querySelector('img');
          methodTooltipEl.innerHTML = '';

    if (img) {
      const iconClone = img.cloneNode(true);
      methodTooltipEl.appendChild(iconClone);
    }

    const span             = document.createElement('span');
          span.textContent = label;
    methodTooltipEl.appendChild(span);

    methodTooltipEl.style.left = clientX + 'px';
    methodTooltipEl.style.top  = (clientY - 16) + 'px';
    methodTooltipEl.classList.add('visible');
  };

    // 滑鼠 hover（桌機）
  chip.addEventListener('mouseenter', (e) => {
          hovering = true;
    const card     = chip.closest('.payments-card');
    if (!card || !card.classList.contains('icon-only')) return;

    const startEvent = e;
    methodTooltipTimer && clearTimeout(methodTooltipTimer);
    methodTooltipTimer = setTimeout(() => {
      if (!hovering) return;
      showAt(startEvent.clientX, startEvent.clientY);
    }, 500);
  });

  chip.addEventListener('mousemove', (e) => {
    if (!methodTooltipEl.classList.contains('visible')) return;
    methodTooltipEl.style.left = e.clientX + 'px';
    methodTooltipEl.style.top  = (e.clientY - 16) + 'px';
  });

  chip.addEventListener('mouseleave', () => {
    hovering = false;
    if (methodTooltipTimer) {
      clearTimeout(methodTooltipTimer);
      methodTooltipTimer = null;
    }
    hideMethodTooltip();
  });

    // 手機／觸控：長按顯示 tooltip，放開就消失
  let pressTimer = null;

  chip.addEventListener('pointerdown', (e) => {
    const card = chip.closest('.payments-card');
    if (!card || !card.classList.contains('icon-only')) return;

    pressTimer && clearTimeout(pressTimer);
    pressTimer = setTimeout(() => {
      showAt(e.clientX, e.clientY);
    }, 500);  // 長按 0.5 秒
  });

  const clearPress = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
    hideMethodTooltip();
  };

  chip.addEventListener('pointerup', clearPress);
  chip.addEventListener('pointercancel', clearPress);
  chip.addEventListener('pointerleave', clearPress);
}



function renderPayments(iso2, mountEl){
  // mountEl = #paymentsCard（外框，不應水平滾動）
  // 真正水平滾動的容器使用 .payments-scroll
  const scrollEl = mountEl.querySelector('.payments-scroll') || mountEl;
  const dotsHost = mountEl.querySelector('.pay-dots');

  // 清掉舊的 dots / scroll 事件
  if (mountEl.__payScrollHandler && scrollEl) {
    scrollEl.removeEventListener('scroll', mountEl.__payScrollHandler);
    mountEl.__payScrollHandler = null;
  }
  if (dotsHost) dotsHost.innerHTML = '';

  const data = (window.getCountryPayments ? getCountryPayments(iso2) : { methods: {} }).methods || {};
  const cats = (window.PAYMENT_CATEGORIES || []).slice();

  const content = document.createElement('div');
  const frag    = document.createDocumentFragment();

  const title = document.createElement('h3');
  title.className = 'sec-title';
  title.textContent = tr('ui.supportedPayments', '支援付款方式');

  cats.forEach(cat => {
    const ids = data[cat.id] || [];
    if (!ids.length) return;

    const row           = document.createElement('div');
          row.className = 'cat-row';

      // 左側：專門放金流「大類 icon」的欄位
    const left              = document.createElement('div');
          left.className    = 'cat-icon-col';
    const catIcon = document.createElement('img');
    catIcon.className = 'cat-icon';
    catIcon.alt = cat.name_zh || cat.name_en || '';
    resolveIcon(catIcon, cat.icon || `./assest/payments/icons/${cat.id}`);
    left.appendChild(catIcon);
    row.appendChild(left);

      // 右側：大標題（中文 / 英文）＋底下支援的支付方式清單
    const right = document.createElement('div');

    const head = document.createElement('div');
    head.className = 'cat-head';
    const catTitle = document.createElement('div');
    catTitle.className = 'cat-title';
    catTitle.textContent = tr(`pay.category.${cat.id}`, cat.name_zh || '');
    // head 只放標題，icon 留在左欄
    head.appendChild(catTitle);

    const list           = document.createElement('div');
          list.className = 'method-list';

    const pool = (window.PAYMENT_METHODS && window.PAYMENT_METHODS[cat.id]) || [];
    const byId = new Map(pool.map(m => [m.id, m]));
    ids.forEach(id => {
      const m = byId.get(id);
      if (!m) return;

        // A11y：chip 改為 <button>，讓鍵盤可聚焦並補 aria-label（含類別資訊）
      const chip      = document.createElement('button');
            chip.type = 'button';
            chip.className = 'method-chip';
      // W3：方式名走 payment-i18n 依當前 locale 出；類別名暫無 i18n 資料，沿用 catalog name_zh
      const methodLabel   = localizedPaymentName(m.id, m.name_zh, m.name_en);
      const categoryLabel = tr(`pay.category.${cat.id}`, cat.name_zh || cat.name_en || '');
      chip.setAttribute('aria-label', `${methodLabel} - ${categoryLabel}`);

      const mImg     = document.createElement('img');
            mImg.alt = m.name_en || m.name_zh;
      resolveIcon(mImg, m.icon || `./assest/payments/vendor/${m.id}`);

      const mText = document.createElement('div');
      mText.className = 'method-name';
        // icon-only 模式下 .m-zh 改用 visually-hidden 風格隱藏（不再 display:none）
        // 保留給螢幕報讀器；視覺資訊靠 tooltip 補
      mText.innerHTML = `
        <span class="m-zh">${__nmEscapeHtml(localizedPaymentName(m.id, m.name_zh, m.name_en))}</span>
      `;
      chip.dataset.nameEn = m.name_en || '';

      chip.appendChild(mImg);
      chip.appendChild(mText);
      attachMethodTooltip(chip, m);
      list.appendChild(chip);
    });

    right.appendChild(head);
    right.appendChild(list);
    row.appendChild(right);
    frag.appendChild(row);
  });

  if (!frag.childNodes.length) {
    // 3.1.13:精簡空狀態 — 移除信封 icon 與 mailto 連結,僅保留標題與簡述
    const empty = document.createElement('div');
    empty.className = 'payments-empty';
    empty.innerHTML =
      '<p class="empty-title">' + tr('ui.emptyTitle', '正在積極爭取中') + '</p>' +
      '<p class="empty-sub">' + tr('ui.emptySub', '此區域支付方式即將上線') + '</p>';
    frag.appendChild(empty);
  }

  content.appendChild(frag);
    // 更新 scroll 容器內的內容，dots 會留在外層
  scrollEl.innerHTML = '';
  scrollEl.appendChild(content);

      // === 手機／平板：建立卡片圓點與滑動邏輯 ===
  const isMobileLike = window.matchMedia('(max-width: 899px)').matches;
    // 舊的 title 清掉
  const oldTitle = mountEl.querySelector(':scope > .sec-title');
  if (oldTitle) oldTitle.remove();
  
  if (isMobileLike) {
      // 放在 payments-scroll 前面，避免 title 被當成橫向卡片的一份子
    mountEl.insertBefore(title, scrollEl);
  } else {
    mountEl.insertBefore(title, scrollEl);
  }
  if (isMobileLike) {
    const hasHorizontal = scrollEl.scrollWidth > scrollEl.clientWidth + 2;
    if (!hasHorizontal) return; // 直向捲動模式：不建立分頁圓點與橫滑事件

    const rows = Array.from(content.querySelectorAll('.cat-row'));
    if (rows.length > 1 && dotsHost) {
      rows.forEach((row, idx) => {
        const dot = document.createElement('button');
        if (idx === 0) dot.classList.add('is-active');
        dot.addEventListener('click', () => {
          const cardWidth = scrollEl.clientWidth || row.getBoundingClientRect().width;
          scrollEl.scrollTo({ left: cardWidth * idx, behavior: 'smooth' });
        });
        dotsHost.appendChild(dot);
      });

      const onScroll = () => {
        const cardWidth = scrollEl.clientWidth || 1;
        const index     = Math.round(scrollEl.scrollLeft / cardWidth);
        dotsHost.querySelectorAll('button').forEach((btn, i) => {
          btn.classList.toggle('is-active', i === index);
        });
      };
      mountEl.__payScrollHandler = onScroll;
      scrollEl.addEventListener('scroll', onScroll, { passive: true });
    }
  }
}
