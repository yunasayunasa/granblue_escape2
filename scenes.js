// ===== scenes.js: シーン定義・SVG描画・ギミック =====

'use strict';

// ===== アイテム定義 =====
const ITEMS = {
  candle:        { id: 'candle',        name: '燭台',         emoji: '🕯️',  desc: '古びた鉄製の燭台。蝋が少し残っている。' },
  oil:           { id: 'oil',           name: '油瓶',         emoji: '🫙',  desc: '小さな陶器の瓶。植物油が入っている。' },
  candle_lit:    { id: 'candle_lit',    name: '灯り燭台',     emoji: '🔥',  desc: '火のついた燭台。炎が揺れている。' },
  charcoal:      { id: 'charcoal',      name: '炭片',         emoji: '🪨',  desc: '細かい木炭の欠片。何かに使えそうだ。' },
  parchment:     { id: 'parchment',     name: '羊皮紙',       emoji: '📜',  desc: '古い羊皮紙。薄くてしなやか。' },
  rubbing:       { id: 'rubbing',       name: '拓本',         emoji: '📄',  desc: '石板の模様を写し取った拓本。記号が見える。' },
  overlay:       { id: 'overlay',       name: '透かし紙',     emoji: '🗺️',  desc: '拓本と羊皮紙を重ねたもの。何かが浮かぶ。' },
  key_fragment1: { id: 'key_fragment1', name: '鍵の欠片A',    emoji: '🔑',  desc: '古い鍵の一部。単体では使えない。' },
  key_fragment2: { id: 'key_fragment2', name: '鍵の欠片B',    emoji: '🗝️',  desc: '古い鍵の一部。欠片Aと合わさりそうだ。' },
  old_key:       { id: 'old_key',       name: '古鍵',         emoji: '⚷',  desc: '二つの欠片が合わさった完全な鍵。' },
  muistra_note:  { id: 'muistra_note',  name: 'ムイスタの手記', emoji: '📖', desc: 'ムイスタが残した古い手記。脱出のヒントが。' },
};

// ===== 合成レシピ =====
const COMBINE_RECIPES = [
  { inputs: ['candle', 'oil'],           output: 'candle_lit',   sfx: 'combine', msg: '燭台に油を注ぎ、炎を灯した。' },
  { inputs: ['charcoal', 'parchment'],   output: 'rubbing',      sfx: 'combine', msg: '炭で羊皮紙に石板の模様を写し取った。' },
  { inputs: ['rubbing', 'parchment'],    output: 'overlay',      sfx: 'combine', msg: '二枚の紙を重ねると、隠された記号の順序が浮かび上がった。' },
  { inputs: ['key_fragment1', 'key_fragment2'], output: 'old_key', sfx: 'combine', msg: '二つの欠片がぴたりと合わさり、完全な鍵になった。' },
];

// ===== ビュー順序 =====
const VIEW_ORDER = ['front', 'left', 'back', 'right'];

// ===== ビューラベル =====
const VIEW_LABELS = {
  front:    '正面',
  left:     '左手',
  back:     '背面',
  right:    '右手',
  corridor: '回廊',
  muistra:  'ムイスタ',
};

// ===== シーンSVG生成 =====
const SCENES = {

  // ---------- 正面：鉄格子の扉 ----------
  front: {
    label: '正面 — 鉄格子の扉',
    render(state) {
      return `
<svg viewBox="0 0 360 560" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="roomLight" cx="50%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#1a1030"/>
      <stop offset="100%" stop-color="#06040d"/>
    </radialGradient>
    <filter id="blur2"><feGaussianBlur stdDeviation="2"/></filter>
  </defs>

  <!-- 背景 -->
  <rect width="360" height="560" fill="url(#roomLight)"/>

  <!-- 石壁テクスチャ -->
  ${stoneWall(0, 0, 360, 560)}

  <!-- 扉枠 -->
  <rect x="90" y="80" width="180" height="320" rx="4" fill="#0a0818" stroke="#2e2658" stroke-width="2"/>

  <!-- 鉄格子 -->
  ${ironBars(90, 80, 180, 320)}

  <!-- 錠前 -->
  ${state.flags.doorUnlocked
    ? `<g id="spot-door-unlocked">
         <rect x="162" y="215" width="36" height="30" rx="3" fill="#1D9E75" stroke="#2e2658" stroke-width="1.5"/>
         <text x="180" y="235" text-anchor="middle" font-size="14" fill="#fff">✓</text>
       </g>`
    : `<g class="hotspot" id="spot-lock" onclick="handleSpotClick('lock')">
         <rect x="158" y="212" width="44" height="36" rx="4" fill="#1a1530" stroke="#534AB7" stroke-width="1.5"/>
         <rect x="167" y="220" width="26" height="20" rx="3" fill="#2e2658"/>
         <path d="M175 220 Q180 208 185 220" stroke="#7F77DD" stroke-width="2" fill="none"/>
         <circle cx="180" cy="233" r="4" fill="#7F77DD"/>
         ${!state.flags.doorUnlocked ? exclaimMark(192, 208) : ''}
       </g>`
  }

  <!-- 記号入力パネル -->
  ${state.flags.doorUnlocked ? '' : symbolPanel(state)}

  <!-- 扉の向こうの廊下 -->
  ${state.flags.doorUnlocked
    ? `<g class="hotspot" onclick="handleSpotClick('corridor-enter')">
         <rect x="92" y="82" width="176" height="316" fill="#04020a" opacity="0.7"/>
         <text x="180" y="240" text-anchor="middle" font-size="13" fill="#7F77DD" letter-spacing="2">→ 回廊へ進む</text>
       </g>`
    : ''}

  <!-- 松明ブラケット（左） -->
  <g class="hotspot" id="spot-torch-left" onclick="handleSpotClick('torch-left')">
    <rect x="30" y="180" width="18" height="60" rx="2" fill="#2a2040" stroke="#2e2658"/>
    ${state.flags.candleLit
      ? `<ellipse cx="39" cy="175" rx="8" ry="12" fill="#EF9F27" opacity="0.8" filter="url(#blur2)"/>
         <ellipse cx="39" cy="178" rx="4" ry="7" fill="#fff8e1" opacity="0.9"/>`
      : `<ellipse cx="39" cy="178" rx="5" ry="5" fill="#1a1030"/>`
    }
  </g>

  <!-- 地面の燭台 -->
  ${!state.inventory.includes('candle') && !state.flags.candleLit
    ? `<g class="hotspot" onclick="handleSpotClick('floor-candle')">
         <rect x="55" y="400" width="10" height="30" rx="1" fill="#8a7a60"/>
         <rect x="50" y="425" width="20" height="6" rx="2" fill="#6a5a40"/>
         ${exclaimMark(64, 396)}
       </g>`
    : ''}

  <!-- 油瓶 -->
  ${!state.inventory.includes('oil') && !state.inventory.includes('candle_lit')
    ? `<g class="hotspot" onclick="handleSpotClick('oil-bottle')">
         <ellipse cx="310" cy="420" rx="10" ry="14" fill="#7a9a6a" stroke="#2e2658"/>
         <rect x="306" y="407" width="8" height="6" rx="1" fill="#5a7a4a"/>
         ${exclaimMark(318, 402)}
       </g>`
    : ''}

  <!-- 床 -->
  <rect x="0" y="480" width="360" height="80" fill="#08060f" opacity="0.7"/>
  <line x1="0" y1="480" x2="360" y2="480" stroke="#2e2658" stroke-width="1"/>
</svg>`;
    },
  },

  // ---------- 左手：石板の壁 ----------
  left: {
    label: '左手 — 石板の壁',
    render(state) {
      return `
<svg viewBox="0 0 360 560" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="roomLight2" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#1a1030"/>
      <stop offset="100%" stop-color="#06040d"/>
    </radialGradient>
    <filter id="blur3"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <rect width="360" height="560" fill="url(#roomLight2)"/>
  ${stoneWall(0, 0, 360, 560)}

  <!-- 石板 -->
  <g class="hotspot" id="spot-tablet" onclick="handleSpotClick('tablet')">
    <rect x="80" y="100" width="200" height="280" rx="4" fill="#1a1530" stroke="#534AB7" stroke-width="1.5"/>
    <!-- 石板の模様 -->
    ${state.flags.tabletRevealed || state.flags.candleLit
      ? `<!-- 照らされた隠し文字 -->
         <text x="180" y="160" text-anchor="middle" font-size="28" fill="#EF9F27" opacity="0.9" filter="url(#blur3)">○</text>
         <text x="180" y="220" text-anchor="middle" font-size="28" fill="#EF9F27" opacity="0.9" filter="url(#blur3)">▲</text>
         <text x="180" y="280" text-anchor="middle" font-size="28" fill="#EF9F27" opacity="0.9" filter="url(#blur3)">◆</text>
         <text x="180" y="340" text-anchor="middle" font-size="10" fill="#c8c0e8" opacity="0.7" letter-spacing="2">順に押せ</text>`
      : `<!-- 通常の石板模様 -->
         <line x1="110" y1="150" x2="250" y2="150" stroke="#2e2658" stroke-width="1" opacity="0.5"/>
         <line x1="110" y1="200" x2="250" y2="200" stroke="#2e2658" stroke-width="1" opacity="0.5"/>
         <line x1="110" y1="250" x2="250" y2="250" stroke="#2e2658" stroke-width="1" opacity="0.5"/>
         <text x="180" y="230" text-anchor="middle" font-size="11" fill="#534AB7" opacity="0.5">古い刻文が見える</text>
         ${exclaimMark(270, 96)}`
    }
  </g>

  <!-- 炭片 -->
  ${!state.inventory.includes('charcoal') && !state.flags.rubbingDone
    ? `<g class="hotspot" onclick="handleSpotClick('charcoal-piece')">
         <ellipse cx="60" cy="460" rx="12" ry="8" fill="#333" stroke="#555"/>
         <ellipse cx="75" cy="465" rx="8" ry="6" fill="#2a2a2a" stroke="#444"/>
         ${exclaimMark(75, 446)}
       </g>`
    : ''}

  <!-- 羊皮紙 -->
  ${!state.inventory.includes('parchment') && !state.inventory.includes('rubbing') && !state.inventory.includes('overlay')
    ? `<g class="hotspot" onclick="handleSpotClick('parchment-scroll')">
         <rect x="280" y="380" width="50" height="70" rx="3" fill="#c8a870" stroke="#8a6a40" transform="rotate(-5,280,380)"/>
         <line x1="283" y1="395" x2="325" y2="388" stroke="#8a6a40" stroke-width="0.8" opacity="0.5"/>
         <line x1="282" y1="405" x2="324" y2="398" stroke="#8a6a40" stroke-width="0.8" opacity="0.5"/>
         ${exclaimMark(318, 372)}
       </g>`
    : ''}

  <!-- 鍵の欠片A -->
  ${!state.inventory.includes('key_fragment1') && !state.inventory.includes('old_key')
    ? `<g class="hotspot" onclick="handleSpotClick('key-frag-a')">
         <path d="M30 300 Q50 290 60 310 L55 340 L35 340 Z" fill="#7a7090" stroke="#534AB7" stroke-width="1"/>
         ${exclaimMark(55, 286)}
       </g>`
    : ''}

  <rect x="0" y="480" width="360" height="80" fill="#08060f" opacity="0.7"/>
  <line x1="0" y1="480" x2="360" y2="480" stroke="#2e2658" stroke-width="1"/>
</svg>`;
    },
  },

  // ---------- 背面：窓と謎のレリーフ ----------
  back: {
    label: '背面 — 窓とレリーフ',
    render(state) {
      return `
<svg viewBox="0 0 360 560" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="moonLight" cx="50%" cy="20%" r="40%">
      <stop offset="0%" stop-color="#1e1a40" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#06040d"/>
    </radialGradient>
    <filter id="moonGlow"><feGaussianBlur stdDeviation="6"/></filter>
  </defs>
  <rect width="360" height="560" fill="url(#moonLight)"/>
  ${stoneWall(0, 0, 360, 560)}

  <!-- 窓 -->
  <g class="hotspot" id="spot-window" onclick="handleSpotClick('window')">
    <rect x="130" y="60" width="100" height="140" rx="50 50 4 4" fill="#06040d" stroke="#2e2658" stroke-width="2"/>
    <!-- 月光 -->
    <ellipse cx="180" cy="80" rx="35" ry="35" fill="#1e1a40" opacity="0.6" filter="url(#moonGlow)"/>
    <circle cx="180" cy="76" r="22" fill="#c8c0e8" opacity="0.12"/>
    <!-- 窓枠の十字 -->
    <line x1="180" y1="62" x2="180" y2="198" stroke="#2e2658" stroke-width="1.5"/>
    <line x1="132" y1="130" x2="228" y2="130" stroke="#2e2658" stroke-width="1.5"/>
    ${state.flags.windowIlluminated
      ? `<ellipse cx="180" cy="130" rx="40" ry="60" fill="#EF9F27" opacity="0.15" filter="url(#moonGlow)"/>`
      : exclaimMark(220, 58)}
  </g>

  <!-- 壁のレリーフ -->
  <g class="hotspot" id="spot-relief" onclick="handleSpotClick('relief')">
    <rect x="60" y="240" width="240" height="160" rx="4" fill="#12102a" stroke="#534AB7" stroke-width="1" opacity="0.8"/>
    ${state.flags.windowIlluminated
      ? `<!-- 照らされた鍵の欠片B -->
         <text x="180" y="300" text-anchor="middle" font-size="12" fill="#c8c0e8" letter-spacing="1">光の中に何かが輝く</text>
         <path d="M165 320 Q180 310 195 320 L192 350 L168 350 Z" fill="#EF9F27" opacity="0.9" stroke="#fff" stroke-width="0.5"/>
         ${exclaimMark(195, 306)}`
      : `<text x="180" y="330" text-anchor="middle" font-size="11" fill="#534AB7" opacity="0.6">壁面に刻まれたレリーフ</text>
         <circle cx="180" cy="300" r="30" stroke="#2e2658" stroke-width="1" fill="none" opacity="0.4"/>
         <path d="M160 300 L200 300 M180 280 L180 320" stroke="#2e2658" stroke-width="1" opacity="0.4"/>`
    }
  </g>

  <!-- ムイスタの手記 -->
  ${!state.inventory.includes('muistra_note')
    ? `<g class="hotspot" onclick="handleSpotClick('muistra-note')">
         <rect x="270" y="440" width="60" height="40" rx="3" fill="#1a1030" stroke="#534AB7" stroke-width="1"/>
         <text x="300" y="458" text-anchor="middle" font-size="9" fill="#7F77DD">手記</text>
         <text x="300" y="472" text-anchor="middle" font-size="8" fill="#534AB7">ムイスタ</text>
         ${exclaimMark(322, 436)}
       </g>`
    : ''}

  <rect x="0" y="480" width="360" height="80" fill="#08060f" opacity="0.7"/>
  <line x1="0" y1="480" x2="360" y2="480" stroke="#2e2658" stroke-width="1"/>
</svg>`;
    },
  },

  // ---------- 右手：棚と仕掛け ----------
  right: {
    label: '右手 — 棚と仕掛け',
    render(state) {
      return `
<svg viewBox="0 0 360 560" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="roomLight3" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#1a1030"/>
      <stop offset="100%" stop-color="#06040d"/>
    </radialGradient>
  </defs>
  <rect width="360" height="560" fill="url(#roomLight3)"/>
  ${stoneWall(0, 0, 360, 560)}

  <!-- 棚 -->
  <rect x="40" y="180" width="280" height="14" rx="2" fill="#2a1e10" stroke="#1e1408"/>
  <rect x="40" y="300" width="280" height="14" rx="2" fill="#2a1e10" stroke="#1e1408"/>
  <rect x="40" y="180" width="12" height="134" rx="2" fill="#2a1e10"/>
  <rect x="308" y="180" width="12" height="134" rx="2" fill="#2a1e10"/>

  <!-- 棚の上の本 -->
  <rect x="60" y="145" width="18" height="38" rx="1" fill="#3a2050" stroke="#534AB7" stroke-width="0.5"/>
  <rect x="80" y="150" width="14" height="33" rx="1" fill="#503a20" stroke="#6a4a30" stroke-width="0.5"/>
  <rect x="96" y="148" width="20" height="35" rx="1" fill="#204050" stroke="#2e5060" stroke-width="0.5"/>

  <!-- 謎の装置 -->
  <g class="hotspot" id="spot-device" onclick="handleSpotClick('device')">
    <rect x="120" y="200" width="120" height="80" rx="6" fill="#12102a" stroke="#534AB7" stroke-width="1.5"/>
    <text x="180" y="225" text-anchor="middle" font-size="10" fill="#7F77DD" letter-spacing="1">解錠装置</text>
    <!-- 3つのシンボルボタン -->
    ${symbolButtons(state)}
    ${!state.flags.doorUnlocked ? exclaimMark(232, 197) : ''}
  </g>

  <!-- 鍵の欠片B（窓を照らした後） -->
  ${state.flags.windowIlluminated && !state.inventory.includes('key_fragment2') && !state.inventory.includes('old_key')
    ? `<g class="hotspot" onclick="handleSpotClick('key-frag-b')">
         <path d="M310 380 Q330 370 340 390 L335 420 L315 420 Z" fill="#EF9F27" stroke="#fff" stroke-width="0.5"/>
         ${exclaimMark(335, 366)}
       </g>`
    : ''}

  <!-- 廊下への扉（鍵が開いた後） -->
  ${state.flags.corridorUnlocked
    ? `<g class="hotspot" onclick="handleSpotClick('corridor-enter')">
         <rect x="290" y="310" width="55" height="120" rx="2" fill="#04020a" stroke="#1D9E75" stroke-width="1.5"/>
         <text x="317" y="370" text-anchor="middle" font-size="10" fill="#1D9E75" letter-spacing="1">回廊</text>
         <text x="317" y="385" text-anchor="middle" font-size="10" fill="#1D9E75">→</text>
       </g>`
    : ''}

  <rect x="0" y="480" width="360" height="80" fill="#08060f" opacity="0.7"/>
  <line x1="0" y1="480" x2="360" y2="480" stroke="#2e2658" stroke-width="1"/>
</svg>`;
    },
  },

  // ---------- 回廊 ----------
  corridor: {
    label: '回廊 — 霧の通路',
    render(state) {
      return `
<svg viewBox="0 0 360 560" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="corridorFog" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#1e1a40"/>
      <stop offset="100%" stop-color="#06040d"/>
    </radialGradient>
    <filter id="fogBlur"><feGaussianBlur stdDeviation="8"/></filter>
  </defs>
  <rect width="360" height="560" fill="url(#corridorFog)"/>

  <!-- 回廊の柱 -->
  <rect x="0" y="0" width="50" height="560" fill="#0a0818" stroke="#2e2658" stroke-width="1"/>
  <rect x="310" y="0" width="50" height="560" fill="#0a0818" stroke="#2e2658" stroke-width="1"/>

  <!-- 霧のエフェクト -->
  <ellipse cx="180" cy="280" rx="200" ry="120" fill="#534AB7" opacity="0.04" filter="url(#fogBlur)"/>
  <ellipse cx="180" cy="200" rx="160" ry="80" fill="#7F77DD" opacity="0.03" filter="url(#fogBlur)"/>

  <!-- 廊下の遠景 -->
  <path d="M50 560 L100 300 L260 300 L310 560" fill="#06040d" opacity="0.8"/>
  <path d="M100 300 L140 80 L220 80 L260 300" fill="#04020a" opacity="0.9"/>

  <!-- 廊下の壁アーチ -->
  <path d="M50 0 L50 560 M310 0 L310 560" stroke="#2e2658" stroke-width="1" fill="none"/>
  <path d="M80 100 Q180 60 280 100" stroke="#534AB7" stroke-width="1" fill="none" opacity="0.5"/>
  <path d="M80 200 Q180 160 280 200" stroke="#534AB7" stroke-width="1" fill="none" opacity="0.3"/>

  <!-- ムイスタへの進行 -->
  <g class="hotspot" onclick="handleSpotClick('muistra-approach')">
    <rect x="120" y="100" width="120" height="160" rx="60" fill="#04020a" opacity="0.6"/>
    <text x="180" y="175" text-anchor="middle" font-size="12" fill="#7F77DD" letter-spacing="2">奥へ進む</text>
    <text x="180" y="195" text-anchor="middle" font-size="20" fill="#534AB7">→</text>
  </g>

  <!-- 戻るボタン -->
  <g class="hotspot" onclick="handleSpotClick('back-to-room')">
    <rect x="30" y="490" width="80" height="40" rx="4" fill="#0f0d1e" stroke="#2e2658"/>
    <text x="70" y="515" text-anchor="middle" font-size="12" fill="#7F77DD">← 戻る</text>
  </g>
</svg>`;
    },
  },

  // ---------- ムイスタ ----------
  muistra: {
    label: 'ムイスタ',
    render(state) {
      return `
<svg viewBox="0 0 360 560" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="muistraLight" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#1e1a40"/>
      <stop offset="100%" stop-color="#06040d"/>
    </radialGradient>
    <filter id="muistraGlow"><feGaussianBlur stdDeviation="5"/></filter>
  </defs>
  <rect width="360" height="560" fill="url(#muistraLight)"/>

  <!-- 魔法陣 -->
  <circle cx="180" cy="280" r="100" stroke="#534AB7" stroke-width="1" fill="none" opacity="0.4"/>
  <circle cx="180" cy="280" r="80"  stroke="#7F77DD" stroke-width="0.5" fill="none" opacity="0.3"/>
  <circle cx="180" cy="280" r="60"  stroke="#534AB7" stroke-width="0.5" fill="none" opacity="0.2"/>
  <polygon points="180,190 255,325 105,325" stroke="#534AB7" stroke-width="1" fill="none" opacity="0.4"/>
  <polygon points="180,370 255,235 105,235" stroke="#534AB7" stroke-width="1" fill="none" opacity="0.3"/>

  <!-- ムイスタのシルエット -->
  <ellipse cx="180" cy="160" rx="30" ry="35" fill="#1a1530" stroke="#7F77DD" stroke-width="1.5"/>
  <path d="M150 190 Q160 240 170 280 L190 280 Q200 240 210 190 Q195 200 180 195 Q165 200 150 190Z" fill="#1a1530" stroke="#7F77DD" stroke-width="1.5"/>
  <!-- 髪 -->
  <path d="M155 145 Q160 120 180 118 Q200 120 205 145" fill="#0a0818" stroke="#534AB7" stroke-width="1"/>
  <!-- 目 -->
  <ellipse cx="173" cy="158" rx="5" ry="6" fill="#7F77DD" opacity="0.9"/>
  <ellipse cx="187" cy="158" rx="5" ry="6" fill="#7F77DD" opacity="0.9"/>
  <ellipse cx="173" cy="159" rx="3" ry="4" fill="#fff" opacity="0.8"/>
  <ellipse cx="187" cy="159" rx="3" ry="4" fill="#fff" opacity="0.8"/>
  <!-- 光のエフェクト -->
  <ellipse cx="180" cy="200" rx="40" ry="60" fill="#534AB7" opacity="0.08" filter="url(#muistraGlow)"/>

  <!-- 名前 -->
  <text x="180" y="440" text-anchor="middle" font-size="13" fill="#7F77DD" letter-spacing="3">ムイスタ</text>
  <line x1="120" y1="448" x2="240" y2="448" stroke="#534AB7" stroke-width="0.5" opacity="0.6"/>

  <!-- 話しかけるボタン -->
  <g class="hotspot" onclick="handleSpotClick('talk-muistra')">
    <rect x="100" y="460" width="160" height="50" rx="4" fill="#0f0d1e" stroke="#534AB7" stroke-width="1.5"/>
    <text x="180" y="490" text-anchor="middle" font-size="14" fill="#7F77DD" letter-spacing="2">話しかける</text>
  </g>
</svg>`;
    },
  },
};

// ===== SVGヘルパー関数 =====

function stoneWall(x, y, w, h) {
  let svg = '';
  const rows = 8;
  const cols = 6;
  const bw = w / cols;
  const bh = h / rows;
  for (let r = 0; r < rows; r++) {
    const offset = r % 2 === 0 ? 0 : bw / 2;
    for (let c = -1; c <= cols; c++) {
      const bx = x + c * bw + offset;
      const by = y + r * bh;
      svg += `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${(bw - 1).toFixed(1)}" height="${(bh - 1).toFixed(1)}" rx="1" fill="#0c0a1c" stroke="#2e2658" stroke-width="0.5" opacity="0.5"/>`;
    }
  }
  return svg;
}

function ironBars(x, y, w, h) {
  let svg = '';
  const cols = 6;
  const bw = w / cols;
  for (let i = 0; i <= cols; i++) {
    const bx = x + i * bw;
    svg += `<line x1="${bx}" y1="${y}" x2="${bx}" y2="${y + h}" stroke="#3a3050" stroke-width="${i === 0 || i === cols ? 3 : 4}"/>`;
  }
  const rows = 4;
  const rh = h / rows;
  for (let i = 0; i <= rows; i++) {
    const by = y + i * rh;
    svg += `<line x1="${x}" y1="${by}" x2="${x + w}" y2="${by}" stroke="#3a3050" stroke-width="${i === 0 || i === rows ? 3 : 2}"/>`;
  }
  return svg;
}

function exclaimMark(x, y) {
  return `<text x="${x}" y="${y}" text-anchor="middle" font-size="20" fill="#EF9F27" class="exclaim-mark">！</text>`;
}

function symbolPanel(state) {
  const order = state.flags.symbolOrder;
  const symbols = ['○', '▲', '◆'];
  let svg = `<g id="symbol-panel">`;
  svg += `<rect x="90" y="260" width="180" height="80" rx="4" fill="#0a0818" stroke="#534AB7" stroke-width="1" opacity="0.9"/>`;
  svg += `<text x="180" y="280" text-anchor="middle" font-size="9" fill="#534AB7" letter-spacing="1">記号を正しい順序で</text>`;

  // 入力済み表示
  for (let i = 0; i < 3; i++) {
    const sx = 118 + i * 50;
    const entered = order[i] || '？';
    const color = order[i] ? '#EF9F27' : '#2e2658';
    svg += `<rect x="${sx - 15}" y="288" width="30" height="30" rx="3" fill="#0f0d1e" stroke="${color}"/>`;
    svg += `<text x="${sx}" y="308" text-anchor="middle" font-size="16" fill="${color}">${entered}</text>`;
  }
  svg += `</g>`;
  return svg;
}

function symbolButtons(state) {
  const symbols = ['○', '▲', '◆'];
  let svg = '';
  const correct = ['○', '▲', '◆'];
  symbols.forEach((sym, i) => {
    const bx = 130 + i * 40;
    const inOrder = state.flags.symbolOrder.includes(sym);
    const fill = inOrder ? '#534AB7' : '#1a1530';
    const stroke = inOrder ? '#7F77DD' : '#2e2658';
    svg += `<g class="hotspot" onclick="handleSymbolInput('${sym}')">
      <rect x="${bx}" y="240" width="34" height="34" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
      <text x="${bx + 17}" y="263" text-anchor="middle" font-size="18" fill="#c8c0e8">${sym}</text>
    </g>`;
  });

  // リセットボタン
  svg += `<g class="hotspot" onclick="resetSymbolOrder()">
    <rect x="130" y="260" width="100" height="18" rx="3" fill="transparent" stroke="none"/>
    <text x="180" y="272" text-anchor="middle" font-size="9" fill="#534AB7" opacity="0.7">リセット</text>
  </g>`;

  return svg;
}

// シーンを外部から取得する関数
function getScene(viewId) {
  return SCENES[viewId] || SCENES.front;
}
