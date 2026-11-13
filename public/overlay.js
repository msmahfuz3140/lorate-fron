/**
 * ============================================================================
 * ROULETTE.TOOLS — DIRECT BETTING SITE OVERLAY WIDGET
 * ============================================================================
 * Injects a floating Messenger bubble & live prediction drawer directly on top
 * of any online roulette or betting site (Stake, Bet365, Evolution, Roobet, etc.)
 * Works on Desktop & Mobile browsers!
 * ============================================================================
 */
(function () {
  if (window.__ROULETTE_OVERLAY_LOADED__) {
    if (typeof window.__ROULETTE_OVERLAY_TOGGLE__ === 'function') {
      window.__ROULETTE_OVERLAY_TOGGLE__();
    }
    return;
  }
  window.__ROULETTE_OVERLAY_LOADED__ = true;

  const HOST = 'https://roulettecomputer.com';
  const TOOL_URL = HOST + '/api/roulette-tool';
  const LOGO_URL = HOST + '/logo.png';

  // Container wrapper
  const root = document.createElement('div');
  root.id = 'roulette-overlay-root';
  root.style.cssText = 'all:initial;position:fixed;z-index:2147483647;font-family:sans-serif;';
  document.body.appendChild(root);

  // Shadow DOM to avoid CSS collisions with betting site
  const shadow = root.attachShadow({ mode: 'open' });

  // Scoped Stylesheet
  const style = document.createElement('style');
  style.textContent = `
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }

    /* Floating Messenger Bubble */
    #bubble {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 62px;
      height: 62px;
      border-radius: 50%;
      background: #070b14;
      border: 2px solid #f5b301;
      box-shadow: 0 10px 30px rgba(0,0,0,0.85), 0 0 18px rgba(245,179,1,0.45);
      cursor: grab;
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
      touch-action: none;
      transition: transform 0.18s ease, box-shadow 0.18s ease;
      z-index: 2147483647;
    }
    #bubble:hover {
      transform: scale(1.08);
      box-shadow: 0 14px 40px rgba(0,0,0,0.95), 0 0 25px rgba(245,179,1,0.65);
    }
    #bubble:active {
      transform: scale(0.95);
      cursor: grabbing;
    }
    #bubble-logo {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
      pointer-events: none;
    }
    #bubble-beacon {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #22c55e;
      border: 2px solid #070b14;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #bubble-beacon-ping {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: #22c55e;
      animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
    }
    @keyframes ping {
      0% { transform: scale(1); opacity: 0.8; }
      100% { transform: scale(2.2); opacity: 0; }
    }
    #bubble-label {
      position: absolute;
      bottom: -8px;
      background: linear-gradient(90deg, #f5b301, #eab308);
      color: #000;
      font-size: 9px;
      font-weight: 900;
      padding: 1px 7px;
      border-radius: 999px;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(0,0,0,0.6);
      letter-spacing: 0.05em;
    }

    /* Mobile Backdrop */
    #backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(4px);
      z-index: 2147483646;
    }
    #backdrop.active {
      display: block;
    }

    /* Side Drawer / Popup Window */
    #drawer {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 520px;
      max-width: calc(100vw - 32px);
      height: 82vh;
      max-height: 720px;
      background: #070b14;
      border: 1px solid rgba(245,179,1,0.4);
      border-radius: 20px;
      box-shadow: 0 25px 70px rgba(0,0,0,0.95), 0 0 30px rgba(245,179,1,0.25);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 2147483647;
      transform: scale(0.85) translateY(30px);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
    }
    #drawer.open {
      transform: scale(1) translateY(0);
      opacity: 1;
      pointer-events: auto;
    }

    /* Header */
    #header {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background: #0a0f1d;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      user-select: none;
    }
    #header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    #header-logo {
      width: 26px;
      height: 26px;
      border-radius: 50%;
    }
    #header-title {
      font-size: 13px;
      font-weight: 800;
      color: #fff;
      letter-spacing: 0.04em;
    }
    #header-title span { color: #f5b301; }
    #header-sub {
      font-size: 10px;
      color: #22c55e;
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 700;
    }
    #header-sub i {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #22c55e;
      display: inline-block;
    }
    #header-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .hbtn {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      color: #cbd5e1;
      border-radius: 8px;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.15s;
    }
    .hbtn:hover {
      background: rgba(245,179,1,0.2);
      color: #f5b301;
      border-color: rgba(245,179,1,0.5);
    }
    .hbtn-close:hover {
      background: rgba(239,68,68,0.25);
      color: #f87171;
      border-color: rgba(239,68,68,0.5);
    }

    /* Iframe body */
    #iframe-wrap {
      flex: 1;
      width: 100%;
      height: 100%;
      background: #05080f;
      position: relative;
    }
    #tool-frame {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    }

    /* Mobile Bottom Sheet Adaptation */
    @media (max-width: 640px) {
      #bubble {
        bottom: 20px;
        right: 16px;
        width: 56px;
        height: 56px;
      }
      #bubble-logo { width: 42px; height: 42px; }
      #drawer {
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        width: 100vw !important;
        max-width: 100vw !important;
        height: 88vh !important;
        max-height: 88vh !important;
        border-radius: 24px 24px 0 0 !important;
        border-bottom: none !important;
      }
    }
  `;
  shadow.appendChild(style);

  // HTML Content inside Shadow DOM
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <!-- Mobile Tap Backdrop -->
    <div id="backdrop"></div>

    <!-- Floating Messenger Bubble -->
    <div id="bubble" title="Roulette Prediction (Click to Open / Minimize)">
      <img id="bubble-logo" src="${LOGO_URL}" alt="Roulette Tools" />
      <div id="bubble-beacon"><div id="bubble-beacon-ping"></div></div>
      <div id="bubble-label">PREDICTOR</div>
    </div>

    <!-- Floating Drawer Window -->
    <div id="drawer">
      <div id="header">
        <div id="header-left">
          <img id="header-logo" src="${LOGO_URL}" alt="Logo" />
          <div>
            <div id="header-title">ROULETTE<span>.TOOLS</span></div>
            <div id="header-sub"><i></i> LIVE BETTING OVERLAY</div>
          </div>
        </div>
        <div id="header-actions">
          <button id="btn-min" class="hbtn" title="Minimize back to floating Messenger bubble">🗕</button>
          <button id="btn-close" class="hbtn hbtn-close" title="Hide overlay">✕</button>
        </div>
      </div>
      <div id="iframe-wrap">
        <iframe id="tool-frame" src="${TOOL_URL}" allow="fullscreen"></iframe>
      </div>
    </div>
  `;
  shadow.appendChild(wrapper);

  // References
  const bubble = shadow.getElementById('bubble');
  const drawer = shadow.getElementById('drawer');
  const backdrop = shadow.getElementById('backdrop');
  const btnMin = shadow.getElementById('btn-min');
  const btnClose = shadow.getElementById('btn-close');

  let isOpen = false;

  function openDrawer() {
    isOpen = true;
    drawer.classList.add('open');
    if (window.innerWidth <= 640) {
      backdrop.classList.add('active');
    }
    bubble.style.display = 'none';
  }

  function minimizeDrawer() {
    isOpen = false;
    drawer.classList.remove('open');
    backdrop.classList.remove('active');
    bubble.style.display = 'flex';
  }

  window.__ROULETTE_OVERLAY_TOGGLE__ = function () {
    if (isOpen) minimizeDrawer();
    else openDrawer();
  };

  bubble.addEventListener('click', (e) => {
    // Only open if not dragged
    if (!isDragging) {
      openDrawer();
    }
  });

  btnMin.addEventListener('click', minimizeDrawer);
  backdrop.addEventListener('click', minimizeDrawer);
  btnClose.addEventListener('click', () => {
    minimizeDrawer();
  });

  // Touch and Mouse Dragging for Bubble
  let isDragging = false;
  let startX = 0, startY = 0;
  let initialLeft = 0, initialTop = 0;
  let hasMoved = false;

  function onPointerDown(e) {
    isDragging = false;
    hasMoved = false;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    startX = clientX;
    startY = clientY;

    const rect = bubble.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);
  }

  function onPointerMove(e) {
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const dx = clientX - startX;
    const dy = clientY - startY;

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      isDragging = true;
      hasMoved = true;
      if (e.cancelable) e.preventDefault();

      let nextLeft = initialLeft + dx;
      let nextTop = initialTop + dy;

      nextLeft = Math.max(10, Math.min(window.innerWidth - 75, nextLeft));
      nextTop = Math.max(10, Math.min(window.innerHeight - 75, nextTop));

      bubble.style.left = nextLeft + 'px';
      bubble.style.top = nextTop + 'px';
      bubble.style.right = 'auto';
      bubble.style.bottom = 'auto';
    }
  }

  function onPointerUp() {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('touchmove', onPointerMove);
    window.removeEventListener('touchend', onPointerUp);

    setTimeout(() => {
      isDragging = false;
    }, 50);
  }

  bubble.addEventListener('pointerdown', onPointerDown);
  bubble.addEventListener('touchstart', onPointerDown, { passive: true });

  console.log('Roulette.tools Betting Site Overlay successfully loaded.');
})();

