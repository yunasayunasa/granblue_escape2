// ===== ending.js Phase 3 =====
'use strict';

// ===== エンディング種別 =====
let _endingType = 'good';

// ===== エントリーポイント =====
function renderEnding(type, gameState) {
  _endingType = type || 'good';
  injectEndingStyles();
  const screen = document.getElementById('ending-screen');
  screen.innerHTML = '';
  screen.classList.remove('hidden');

  // フェーズ1から順に実行
  runPhase1(() => {
    runPhase2(() => {
      runPhase3(() => {
        runPhase4(() => {
          runPhase5(screen);
        });
      });
    });
  });
}

// フェード共通ヘルパー
function fadeIn(el, duration, cb) {
  el.style.opacity = '0';
  el.style.transition = `opacity ${duration}ms ease`;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      if (cb) setTimeout(cb, duration);
    });
  });
}
function fadeOut(el, duration, cb) {
  el.style.transition = `opacity ${duration}ms ease`;
  el.style.opacity = '0';
  if (cb) setTimeout(cb, duration);
}

// ===== Phase 1: 別れのテキスト =====
const FAREWELL_LINES = {
  good: [
    '霧が、晴れていく',
    '長い間、ここに閉じ込められていた',
    '……でも、もう一人じゃない',
    '行け。また、来い',
    '——ネブリアの声が、遠くなっていく',
  ],
  neutral: [
    '霧が、晴れていく',
    '……伝えてくれるか',
    '誰かが、また来るかもしれない',
    '——ネブリアの声が、聞こえた気がした',
  ],
  bad: [
    '霧が、押し寄せてくる',
    '——逃げなければ',
    '振り返った時、扉はもうなかった',
    '……あの問いの、答えは出ていない',
  ],
};

function runPhase1(onComplete) {
  const screen = document.getElementById('ending-screen');
  const wrapper = document.createElement('div');
  wrapper.id = 'ep1-wrapper';
  wrapper.style.cssText = [
    'position:fixed;inset:0;background:#000;',
    'display:flex;align-items:center;justify-content:center;',
    'flex-direction:column;gap:24px;padding:40px;z-index:300;',
    'opacity:0;',
  ].join('');
  screen.appendChild(wrapper);

  fadeIn(wrapper, 500, () => {
    const lines = FAREWELL_LINES[_endingType] || FAREWELL_LINES.good;
    showFarewellLines(wrapper, lines, 0, () => {
      // 最終行を少し見せてからフェードアウト
      setTimeout(() => {
        fadeOut(wrapper, 600, () => {
          wrapper.remove();
          onComplete();
        });
      }, 1800);
    });
  });
}

function showFarewellLines(wrapper, lines, index, onAllDone) {
  if (index >= lines.length) {
    onAllDone();
    return;
  }
  const line = lines[index];
  const p = document.createElement('p');
  p.style.cssText = [
    'color:#c8c0e8;font-family:"Noto Serif JP",serif;',
    'font-size:clamp(14px,4vw,20px);letter-spacing:3px;',
    'text-align:center;opacity:0;margin:0;line-height:1.9;',
    'transition:opacity 0.6s ease;',
  ].join('');
  wrapper.appendChild(p);

  // タイプライター
  let i = 0;
  const tick = setInterval(() => {
    if (i < line.length) {
      p.textContent += line[i++];
    } else {
      clearInterval(tick);
      // フェードイン完了後、次の行へ
      setTimeout(() => showFarewellLines(wrapper, lines, index + 1, onAllDone), 700);
    }
  }, 80);

  // 行ごとにフェードイン
  requestAnimationFrame(() => requestAnimationFrame(() => { p.style.opacity = '1'; }));
}

// ===== Phase 2: 扉が開くSVGアニメーション =====
function runPhase2(onComplete) {
  const screen = document.getElementById('ending-screen');
  const wrapper = document.createElement('div');
  wrapper.id = 'ep2-wrapper';
  wrapper.style.cssText = [
    'position:fixed;inset:0;background:#08060f;',
    'display:flex;align-items:center;justify-content:center;',
    'z-index:290;opacity:0;overflow:hidden;',
  ].join('');

  wrapper.innerHTML = `
    <svg id="ep2-svg" viewBox="0 0 400 560" xmlns="http://www.w3.org/2000/svg"
         style="width:100%;max-width:500px;height:100%;object-fit:contain;">
      <defs>
        <linearGradient id="doorLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="60%" stop-color="#b8e8ff"/>
          <stop offset="100%" stop-color="#87ceeb"/>
        </linearGradient>
        <radialGradient id="doorGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#87ceeb" stop-opacity="0"/>
        </radialGradient>
        <filter id="ep2blur"><feGaussianBlur stdDeviation="12"/></filter>
      </defs>

      <!-- 石壁の背景 -->
      <rect width="400" height="560" fill="#08060f"/>
      <rect x="0"   y="0"  width="120" height="560" fill="#0d0b1a"/>
      <rect x="280" y="0"  width="120" height="560" fill="#0d0b1a"/>
      <!-- 壁ブロック左 -->
      <rect x="4"  y="60"  width="52" height="28" fill="#131128" stroke="#0a0818" stroke-width=".5"/>
      <rect x="60" y="60"  width="56" height="28" fill="#141229" stroke="#0a0818" stroke-width=".5"/>
      <rect x="4"  y="92"  width="60" height="28" fill="#12102a" stroke="#0a0818" stroke-width=".5"/>
      <rect x="68" y="92"  width="48" height="28" fill="#111026" stroke="#0a0818" stroke-width=".5"/>
      <rect x="4"  y="120" width="50" height="28" fill="#131029" stroke="#0a0818" stroke-width=".5"/>
      <rect x="58" y="120" width="58" height="28" fill="#100f25" stroke="#0a0818" stroke-width=".5"/>
      <rect x="4"  y="148" width="56" height="28" fill="#141229" stroke="#0a0818" stroke-width=".5"/>
      <rect x="64" y="148" width="52" height="28" fill="#111027" stroke="#0a0818" stroke-width=".5"/>
      <rect x="4"  y="176" width="48" height="28" fill="#12102a" stroke="#0a0818" stroke-width=".5"/>
      <rect x="56" y="176" width="60" height="28" fill="#130f27" stroke="#0a0818" stroke-width=".5"/>
      <!-- 壁ブロック右 -->
      <rect x="284" y="60"  width="56" height="28" fill="#131128" stroke="#0a0818" stroke-width=".5"/>
      <rect x="344" y="60"  width="52" height="28" fill="#141229" stroke="#0a0818" stroke-width=".5"/>
      <rect x="284" y="92"  width="48" height="28" fill="#12102a" stroke="#0a0818" stroke-width=".5"/>
      <rect x="336" y="92"  width="60" height="28" fill="#111026" stroke="#0a0818" stroke-width=".5"/>
      <rect x="284" y="120" width="58" height="28" fill="#131029" stroke="#0a0818" stroke-width=".5"/>
      <rect x="346" y="120" width="50" height="28" fill="#100f25" stroke="#0a0818" stroke-width=".5"/>
      <rect x="284" y="148" width="52" height="28" fill="#141229" stroke="#0a0818" stroke-width=".5"/>
      <rect x="340" y="148" width="56" height="28" fill="#111027" stroke="#0a0818" stroke-width=".5"/>
      <rect x="284" y="176" width="60" height="28" fill="#12102a" stroke="#0a0818" stroke-width=".5"/>
      <rect x="348" y="176" width="48" height="28" fill="#130f27" stroke="#0a0818" stroke-width=".5"/>

      <!-- 扉の向こうの光（開いてから表示） -->
      <rect id="ep2-light" x="120" y="80" width="160" height="400"
            fill="url(#doorLight)" opacity="0"/>
      <ellipse id="ep2-glow" cx="200" cy="280" rx="120" ry="200"
               fill="url(#doorGlow)" filter="url(#ep2blur)" opacity="0"/>

      <!-- 扉枠 -->
      <rect x="118" y="78" width="164" height="404" rx="4"
            fill="none" stroke="#2e2658" stroke-width="3"/>
      <path d="M120,78 Q200,62 280,78" fill="none" stroke="#534AB7" stroke-width="2"/>

      <!-- 左扉パネル（開くアニメ：transform-originは左端） -->
      <g id="ep2-door-left"
         style="transform-origin:120px 280px;transform:rotateY(0deg);transition:transform 1.2s ease-in-out;">
        <rect x="120" y="80" width="80" height="400" fill="#09070f" stroke="#2e2658" stroke-width="1.5"/>
        <rect x="128" y="100" width="30" height="60" rx="2" fill="#0d0b1e" stroke="#1e1a3a"/>
        <rect x="128" y="200" width="30" height="60" rx="2" fill="#0d0b1e" stroke="#1e1a3a"/>
        <rect x="128" y="320" width="30" height="60" rx="2" fill="#0d0b1e" stroke="#1e1a3a"/>
        <!-- 取っ手 -->
        <circle cx="196" cy="282" r="6" fill="#2e2658" stroke="#534AB7" stroke-width="1"/>
      </g>

      <!-- 右扉パネル（開くアニメ：transform-originは右端） -->
      <g id="ep2-door-right"
         style="transform-origin:280px 280px;transform:rotateY(0deg);transition:transform 1.2s ease-in-out;">
        <rect x="200" y="80" width="80" height="400" fill="#09070f" stroke="#2e2658" stroke-width="1.5"/>
        <rect x="242" y="100" width="30" height="60" rx="2" fill="#0d0b1e" stroke="#1e1a3a"/>
        <rect x="242" y="200" width="30" height="60" rx="2" fill="#0d0b1e" stroke="#1e1a3a"/>
        <rect x="242" y="320" width="30" height="60" rx="2" fill="#0d0b1e" stroke="#1e1a3a"/>
        <circle cx="204" cy="282" r="6" fill="#2e2658" stroke="#534AB7" stroke-width="1"/>
      </g>

      <!-- 床 -->
      <rect x="0" y="480" width="400" height="80" fill="#06040a" opacity=".8"/>
      <line x1="0" y1="480" x2="400" y2="480" stroke="#2e2658" stroke-width="1"/>
    </svg>`;

  screen.appendChild(wrapper);
  fadeIn(wrapper, 500, () => {
    // 少し待ってから扉を開く
    setTimeout(() => openDoors(wrapper, onComplete), 600);
  });
}

function openDoors(wrapper, onComplete) {
  const light    = wrapper.querySelector('#ep2-light');
  const glow     = wrapper.querySelector('#ep2-glow');
  const doorL    = wrapper.querySelector('#ep2-door-left');
  const doorR    = wrapper.querySelector('#ep2-door-right');

  // CSS transformで扉を開く（perspectiveはCSS側で付与）
  doorL.style.transform = 'translateX(-90px)';
  doorR.style.transform = 'translateX(90px)';

  // 光を徐々に表示
  setTimeout(() => {
    light.style.transition = 'opacity 1s ease';
    glow.style.transition  = 'opacity 1s ease';
    light.setAttribute('opacity', '1');
    glow.setAttribute('opacity', '0.7');
  }, 400);

  // 全体フェードアウトして次フェーズへ
  setTimeout(() => {
    fadeOut(wrapper, 600, () => {
      wrapper.remove();
      onComplete();
    });
  }, 2400);
}

// ===== Phase 3: エンディング一枚絵 =====
function runPhase3(onComplete) {
  const screen = document.getElementById('ending-screen');
  const wrapper = document.createElement('div');
  wrapper.id = 'ep3-wrapper';
  wrapper.style.cssText = [
    'position:fixed;inset:0;overflow:hidden;',
    'z-index:280;opacity:0;',
    'background:#87CEEB;',
  ].join('');

  const img = document.createElement('img');
  img.src = '無題134_20260328111447.jpeg';
  img.style.cssText = [
    'position:absolute;inset:0;',
    'width:100%;height:100%;',
    'object-fit:cover;object-position:center top;',
  ].join('');
  wrapper.appendChild(img);

  // エンディング種別ごとの色調オーバーレイ
  const tintColors = {
    good:    'rgba(0,0,0,0)',
    neutral: 'rgba(160,120,40,0.28)',
    bad:     'rgba(0,0,20,0.55)',
  };
  const tint = document.createElement('div');
  tint.style.cssText = [
    'position:absolute;inset:0;',
    `background:${tintColors[_endingType] || tintColors.good};`,
    'pointer-events:none;',
  ].join('');
  wrapper.appendChild(tint);

  screen.appendChild(wrapper);

  fadeIn(wrapper, 900, () => {
    setTimeout(() => onComplete(), 1800);
  });
}

function buildSkySVG_UNUSED() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 400 700');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';

  svg.innerHTML = `
<defs>
  <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stop-color="#87CEEB"/>
    <stop offset="55%"  stop-color="#b8e8f8"/>
    <stop offset="100%" stop-color="#E0F4FF"/>
  </linearGradient>
  <linearGradient id="islandGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"  stop-color="#6abf5e"/>
    <stop offset="40%" stop-color="#4e9e3f"/>
    <stop offset="100%" stop-color="#7a5c2e"/>
  </linearGradient>
  <linearGradient id="islandGrad2" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"  stop-color="#82c96a"/>
    <stop offset="40%" stop-color="#5aaa45"/>
    <stop offset="100%" stop-color="#8a6a38"/>
  </linearGradient>
  <filter id="cloudBlur"><feGaussianBlur stdDeviation="4"/></filter>
  <filter id="softBlur"><feGaussianBlur stdDeviation="2"/></filter>
  <style>
    @keyframes cloudL1 { 0%{transform:translateX(0)}  100%{transform:translateX(-520px)} }
    @keyframes cloudL2 { 0%{transform:translateX(0)}  100%{transform:translateX(-620px)} }
    @keyframes cloudL3 { 0%{transform:translateX(80px)} 100%{transform:translateX(-540px)} }
    @keyframes ep3Twinkle { 0%,100%{opacity:.2;transform:scale(.7)} 50%{opacity:.9;transform:scale(1.1)} }
    @keyframes ep3Float   { 0%,100%{transform:translateY(0)}       50%{transform:translateY(-6px)} }
    @keyframes ep3Mist    { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:.9;transform:scale(1.15)} }
    @media(prefers-reduced-motion:no-preference){
      .ep3-cloud1{animation:cloudL1 22s linear infinite}
      .ep3-cloud2{animation:cloudL2 18s linear infinite 4s}
      .ep3-cloud3{animation:cloudL3 26s linear infinite 8s}
      .ep3-island-float{animation:ep3Float 5s ease-in-out infinite}
      .ep3-island-float2{animation:ep3Float 7s ease-in-out infinite 2s}
    }
  </style>
</defs>

<!-- 空背景 -->
<rect width="400" height="700" fill="url(#skyGrad)"/>

<!-- 雲レイヤー（後ろ） -->
<g class="ep3-cloud3" opacity=".55">
  <ellipse cx="80"  cy="120" rx="70"  ry="28" fill="#fff" filter="url(#cloudBlur)"/>
  <ellipse cx="120" cy="108" rx="50"  ry="22" fill="#fff" filter="url(#cloudBlur)"/>
  <ellipse cx="320" cy="90"  rx="80"  ry="26" fill="#fff" filter="url(#cloudBlur)"/>
  <ellipse cx="360" cy="78"  rx="55"  ry="20" fill="#fff" filter="url(#cloudBlur)"/>
</g>

<!-- 雲レイヤー（中） -->
<g class="ep3-cloud2" opacity=".75">
  <ellipse cx="50"   cy="200" rx="55"  ry="24" fill="#fff" filter="url(#softBlur)"/>
  <ellipse cx="90"   cy="188" rx="45"  ry="20" fill="#fff" filter="url(#softBlur)"/>
  <ellipse cx="60"   cy="208" rx="36"  ry="16" fill="#fff" filter="url(#softBlur)"/>
  <ellipse cx="280"  cy="170" rx="65"  ry="26" fill="#fff" filter="url(#softBlur)"/>
  <ellipse cx="330"  cy="158" rx="50"  ry="22" fill="#fff" filter="url(#softBlur)"/>
  <ellipse cx="490"  cy="195" rx="60"  ry="24" fill="#fff" filter="url(#softBlur)"/>
</g>

<!-- 雲レイヤー（手前） -->
<g class="ep3-cloud1" opacity=".9">
  <ellipse cx="160"  cy="300" rx="72"  ry="30" fill="#fff" filter="url(#softBlur)"/>
  <ellipse cx="210"  cy="285" rx="58"  ry="26" fill="#fff" filter="url(#softBlur)"/>
  <ellipse cx="180"  cy="310" rx="48"  ry="22" fill="#fff" filter="url(#softBlur)"/>
  <ellipse cx="460"  cy="270" rx="80"  ry="32" fill="#fff" filter="url(#softBlur)"/>
  <ellipse cx="510"  cy="255" rx="60"  ry="26" fill="#fff" filter="url(#softBlur)"/>
</g>

<!-- 空島（遠景・小） -->
<g class="ep3-island-float2" transform="translate(30,280)">
  <ellipse cx="35" cy="38" rx="35" ry="14" fill="#7a5c2e" opacity=".9"/>
  <path d="M4,28 Q12,10 24,6 Q36,2 50,8 Q62,14 66,28 Q70,38 35,38 Q0,38 4,28Z"
        fill="url(#islandGrad2)"/>
  <ellipse cx="22" cy="14" rx="8" ry="5" fill="#6abf5e" opacity=".8"/>
  <ellipse cx="48" cy="10" rx="7" ry="4" fill="#6abf5e" opacity=".8"/>
</g>

<!-- 空島（中景） -->
<g class="ep3-island-float" transform="translate(240,340)">
  <ellipse cx="65" cy="58" rx="65" ry="20" fill="#7a5c2e" opacity=".9"/>
  <path d="M4,44 Q12,20 30,10 Q50,2 80,8 Q110,16 124,36 Q130,50 65,58 Q0,58 4,44Z"
        fill="url(#islandGrad)"/>
  <!-- 小木 -->
  <rect x="28" y="14" width="4" height="14" rx="1" fill="#5c3d1a"/>
  <ellipse cx="30" cy="12" rx="9" ry="7" fill="#3a8c2e"/>
  <rect x="60" y="10" width="5" height="18" rx="1" fill="#5c3d1a"/>
  <ellipse cx="62" cy="8"  rx="11" ry="8" fill="#4aac3e"/>
  <rect x="92" y="16" width="4" height="12" rx="1" fill="#5c3d1a"/>
  <ellipse cx="94" cy="14" rx="8"  ry="6" fill="#3a8c2e"/>
</g>

<!-- 空島（大・手前） -->
<g class="ep3-island-float" transform="translate(60,500)" style="animation-delay:1s">
  <ellipse cx="100" cy="80" rx="100" ry="28" fill="#7a5c2e" opacity=".95"/>
  <path d="M4,60 Q14,28 40,12 Q68,0 100,4 Q136,8 168,28 Q192,46 196,64 Q198,78 100,80 Q2,80 4,60Z"
        fill="url(#islandGrad)"/>
  <!-- 木々 -->
  <rect x="24"  y="20" width="5" height="22" rx="1" fill="#5c3d1a"/>
  <ellipse cx="26"  cy="18" rx="13" ry="10" fill="#3a8c2e"/>
  <rect x="55"  y="14" width="6" height="28" rx="1" fill="#5c3d1a"/>
  <ellipse cx="58"  cy="12" rx="15" ry="11" fill="#4aac3e"/>
  <rect x="92"  y="10" width="6" height="30" rx="1" fill="#5c3d1a"/>
  <ellipse cx="95"  cy="8"  rx="16" ry="12" fill="#3a8c2e"/>
  <rect x="132" y="16" width="5" height="24" rx="1" fill="#5c3d1a"/>
  <ellipse cx="134" cy="14" rx="13" ry="10" fill="#4aac3e"/>
  <rect x="162" y="22" width="4" height="18" rx="1" fill="#5c3d1a"/>
  <ellipse cx="164" cy="20" rx="10" ry="8"  fill="#3a8c2e"/>
  <!-- 草の線 -->
  <path d="M10,52 Q30,44 60,48 Q90,52 120,46 Q150,42 186,50" fill="none" stroke="#6abf5e" stroke-width="2" opacity=".6"/>
</g>`;

  // 光の粒子（25個）をSVGに追加
  const particleData = [
    [38,82],[72,145],[120,60],[160,200],[200,140],[240,80],[290,170],[340,100],[360,210],[380,60],
    [50,250],[100,310],[150,380],[190,290],[230,350],[270,260],[310,400],[350,330],[380,280],[20,400],
    [60,450],[140,500],[200,460],[280,520],[340,480],
  ];
  const particlesSVG = particleData.map(([x, y], i) => {
    const r     = (0.5 + Math.random() * 1.5).toFixed(1);
    const delay = (i * 0.3 % 3).toFixed(1);
    const dur   = (2 + Math.random() * 2).toFixed(1);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFF9E6"
      style="animation:ep3Twinkle ${dur}s ease-in-out ${delay}s infinite"/>`;
  }).join('');
  svg.innerHTML += `<g id="ep3-particles" opacity=".85">${particlesSVG}</g>`;

  // 主人公シルエット（飛び出すポーズ）
  svg.innerHTML += `
<g id="ep3-hero"
   style="transform:translateY(120px);opacity:0;transform-origin:200px 400px;">
  <!-- コートの裾（風になびく） -->
  <path d="M178,438 Q164,470 152,490 Q160,495 168,488 Q176,475 184,462Z"
        fill="#1a1530" opacity=".85"/>
  <path d="M222,438 Q238,468 248,488 Q240,494 232,488 Q224,474 216,460Z"
        fill="#1a1530" opacity=".85"/>
  <!-- コート本体 -->
  <path d="M175,400 Q168,418 170,440 Q180,450 200,450 Q220,450 230,440 Q232,418 225,400Z"
        fill="#1a1530"/>
  <!-- 胴 -->
  <rect x="186" y="370" width="28" height="34" rx="8" fill="#1a1530"/>
  <!-- 頭 -->
  <ellipse cx="200" cy="352" rx="18" ry="20" fill="#1a1530"/>
  <!-- 髪（なびく） -->
  <path d="M184,342 Q174,332 170,320 Q178,326 184,338Z" fill="#1a1530"/>
  <path d="M216,342 Q224,330 230,318 Q222,326 216,338Z" fill="#1a1530"/>
  <!-- 右腕（前に伸ばす） -->
  <path d="M224,382 Q248,370 264,364 Q260,372 250,378 Q240,384 228,390Z"
        fill="#1a1530"/>
  <!-- 左腕（後ろに流れる） -->
  <path d="M176,382 Q156,374 142,376 Q146,384 158,384 Q168,386 174,390Z"
        fill="#1a1530"/>
  <!-- 足（ジャンプ中） -->
  <path d="M193,448 Q188,468 182,488 Q190,492 196,482 Q200,468 200,450Z"
        fill="#1a1530"/>
  <path d="M207,448 Q212,468 218,488 Q210,492 204,482 Q200,468 200,450Z"
        fill="#1a1530"/>
  <!-- 目のきらめき -->
  <circle cx="194" cy="350" r="2" fill="#7F77DD" opacity=".8"/>
  <circle cx="206" cy="350" r="2" fill="#7F77DD" opacity=".8"/>
</g>`;

  // ネブリアの欠片（霧の粒10個）
  const mistFragments = [
    { x: 172, y: 440, s: 1.0, d: 0.0, op: '0.7' },
    { x: 180, y: 432, s: 0.8, d: 0.2, op: '0.6' },
    { x: 164, y: 448, s: 1.2, d: 0.1, op: '0.5' },
    { x: 190, y: 444, s: 0.6, d: 0.3, op: '0.65'},
    { x: 158, y: 436, s: 0.9, d: 0.4, op: '0.55'},
    { x: 170, y: 458, s: 1.1, d: 0.15,op: '0.6' },
    { x: 185, y: 426, s: 0.7, d: 0.25,op: '0.5' },
    { x: 162, y: 462, s: 1.3, d: 0.05,op: '0.45'},
    { x: 176, y: 420, s: 0.85,d: 0.35,op: '0.6' },
    { x: 195, y: 454, s: 0.75,d: 0.45,op: '0.55'},
  ];
  const fragSVG = mistFragments.map((f, i) => `
    <ellipse class="ep3-fragment" cx="${f.x}" cy="${f.y}" rx="${5*f.s}" ry="${4*f.s}"
             fill="#c8c0e8"
             data-max-opacity="${f.op}"
             style="transform:translateY(100px);opacity:0;
                    animation:ep3Mist ${2+f.s}s ease-in-out ${f.d}s infinite;"/>`
  ).join('');
  svg.innerHTML += `<g id="ep3-fragments">${fragSVG}</g>`;

  return svg;
}

// ===== Phase 4: エンディングテキスト =====
const ENDING_TEXTS = {
  good: [
    { text: '霧纏いし牢獄　クリア', size: 'clamp(18px,5vw,26px)', weight: '700', spacing: '4px' },
    { text: 'ネブリアはいつか、また誰かに出会うだろう', size: 'clamp(13px,3.5vw,17px)', weight: '400', spacing: '2px' },
    { text: '——そして今度は、自ら話しかけるかもしれない', size: 'clamp(12px,3vw,15px)', weight: '400', spacing: '1px' },
  ],
  neutral: [
    { text: '霧纏いし牢獄　クリア', size: 'clamp(18px,5vw,26px)', weight: '700', spacing: '4px' },
    { text: 'ネブリアは扉を開いた——誰かが伝えてくれることを、信じて', size: 'clamp(13px,3.5vw,17px)', weight: '400', spacing: '2px' },
    { text: '——いつか、また誰かが来るかもしれない', size: 'clamp(12px,3vw,15px)', weight: '400', spacing: '1px' },
  ],
  bad: [
    { text: '霧纏いし牢獄　脱出', size: 'clamp(18px,5vw,26px)', weight: '700', spacing: '4px' },
    { text: '——ネブリアは、またひとりになった', size: 'clamp(13px,3.5vw,17px)', weight: '400', spacing: '2px' },
    { text: 'あの問いの答えを、まだ持っていない', size: 'clamp(12px,3vw,15px)', weight: '400', spacing: '1px' },
  ],
};

function runPhase4(onComplete) {
  const screen = document.getElementById('ending-screen');
  // ep3-wrapperの上に重ねてテキストを表示
  const overlay = document.createElement('div');
  overlay.id = 'ep4-overlay';
  overlay.style.cssText = [
    'position:fixed;inset:0;',
    'display:flex;flex-direction:column;',
    'align-items:center;justify-content:flex-end;',
    'padding-bottom:120px;gap:20px;',
    'z-index:285;pointer-events:none;',
  ].join('');
  screen.appendChild(overlay);

  const texts = ENDING_TEXTS[_endingType] || ENDING_TEXTS.good;
  showEndingTextLines(overlay, texts, 0, () => {
    setTimeout(onComplete, 1000);
  });
}

function showEndingTextLines(container, texts, index, onAllDone) {
  if (index >= texts.length) {
    onAllDone();
    return;
  }
  const t = texts[index];
  const p = document.createElement('p');
  p.style.cssText = [
    `font-size:${t.size};font-weight:${t.weight};`,
    `letter-spacing:${t.spacing};`,
    'font-family:"Noto Serif JP",serif;',
    'color:#ffffff;text-align:center;margin:0;padding:0 24px;',
    'text-shadow:0 0 4px rgba(0,0,0,1), 1px 1px 0 rgba(0,0,0,0.9), -1px -1px 0 rgba(0,0,0,0.9), 1px -1px 0 rgba(0,0,0,0.9), -1px 1px 0 rgba(0,0,0,0.9), 0 2px 12px rgba(0,0,0,0.8);',
    'opacity:0;transform:translateY(10px);',
    'transition:opacity 0.8s ease,transform 0.8s ease;',
  ].join('');
  p.textContent = t.text;
  container.appendChild(p);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    p.style.opacity   = '1';
    p.style.transform = 'translateY(0)';
  }));
  setTimeout(() => showEndingTextLines(container, texts, index + 1, onAllDone), 1000);
}

// ===== Phase 5: リスタートボタン =====
function runPhase5(screen) {
  const btnWrapper = document.createElement('div');
  btnWrapper.id = 'ep5-btn';
  btnWrapper.style.cssText = [
    'position:fixed;bottom:40px;left:0;right:0;',
    'display:flex;justify-content:center;',
    'z-index:290;opacity:0;',
    'transition:opacity 0.8s ease;',
    'pointer-events:auto;',
  ].join('');

  const btn = document.createElement('button');
  btn.textContent = 'もう一度プレイ';
  btn.style.cssText = [
    'padding:14px 48px;',
    'background:linear-gradient(135deg,#4a90d9,#7ab8f5);',
    'border:none;border-radius:30px;',
    'color:#fff;font-family:"Noto Serif JP",serif;',
    'font-size:16px;letter-spacing:4px;',
    'cursor:pointer;',
    'box-shadow:0 4px 20px rgba(74,144,217,0.5);',
    'transition:transform 0.15s,box-shadow 0.15s;',
    'min-height:52px;min-width:200px;',
  ].join('');
  btn.addEventListener('touchstart', () => {
    btn.style.transform  = 'scale(0.96)';
    btn.style.boxShadow  = '0 2px 10px rgba(74,144,217,0.3)';
  }, { passive: true });
  btn.addEventListener('touchend', () => {
    btn.style.transform  = 'scale(1)';
    btn.style.boxShadow  = '0 4px 20px rgba(74,144,217,0.5)';
  }, { passive: true });
  btn.onclick = restartGame;

  btnWrapper.appendChild(btn);
  screen.appendChild(btnWrapper);

  setTimeout(() => { btnWrapper.style.opacity = '1'; }, 500);
}

// ===== CSS インジェクト =====
function injectEndingStyles() {
  if (document.getElementById('ending-injected-styles')) return;
  const style = document.createElement('style');
  style.id = 'ending-injected-styles';
  style.textContent = `
    #ending-screen {
      position: fixed;
      inset: 0;
      background: #000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 100;
      overflow: hidden;
    }
    #ending-screen.hidden {
      display: none;
    }
    .ending-phase-wrap {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0;
    }
    .ep1-line {
      color: #e8e0d4;
      font-family: 'Noto Serif JP', serif;
      font-size: clamp(14px, 4vw, 20px);
      letter-spacing: 3px;
      line-height: 2.4;
      text-align: center;
      opacity: 0;
      transition: opacity 800ms ease;
    }
    .ep2-wrap {
      position: absolute;
      inset: 0;
      background: #0a0812;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ep3-wrap {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }
    .ep4-wrap {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      padding-bottom: 12vh;
      pointer-events: none;
    }
    .ep4-line {
      color: #fff;
      font-family: 'Noto Serif JP', serif;
      text-align: center;
      margin: 6px 0;
      opacity: 0;
      transition: opacity 900ms ease;
    }
    .ep5-btn-wrap {
      position: absolute;
      bottom: 5vh;
      left: 50%;
      transform: translateX(-50%);
      opacity: 0;
      transition: opacity 800ms ease;
    }
    .ep5-restart-btn {
      background: linear-gradient(135deg, #2a4a8a, #4a90d9);
      color: #fff;
      border: none;
      border-radius: 999px;
      padding: 14px 36px;
      font-family: 'Noto Serif JP', serif;
      font-size: clamp(14px, 3.5vw, 18px);
      letter-spacing: 2px;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(74,144,217,0.5);
      transition: transform 200ms ease, box-shadow 200ms ease;
    }
  `;
  document.head.appendChild(style);
}

// ===== リスタート =====
function restartGame() {
  // state リセット
  state.currentScene   = 'title';
  state.currentView    = 'front';
  state.inventory      = [];
  state.inspected      = {};
  state.selectedItems  = [];
  state.flags = {
    mistPaperTaken:     false,
    candleTaken:        false,
    oilJarTaken:        false,
    stoneFragmentTaken: false,
    tabletRevealed:     false,
    rubbingDone:        false,
    overlayRead:        false,
    windowIlluminated:  false,
    magicStoneRemoved:  false,
    symbolOrder:        [],
    doorUnlocked:       false,
    paintingsSeen:      [],
    allPaintingsSeen:   false,
    muistraDialogue:    0,
    muistraAnswers:     [],
  };

  // 画面切り替え
  document.getElementById('ending-screen').classList.add('hidden');
  document.getElementById('ending-screen').innerHTML = '';
  document.getElementById('game-screen').classList.add('hidden');
  document.getElementById('title-screen').classList.remove('hidden');
}
