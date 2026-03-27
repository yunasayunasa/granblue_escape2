// ===== scenes.js Phase 2 =====
'use strict';

// ===== ITEMS =====
const ITEMS = {
  mist_paper:     { id: 'mist_paper',     name: '霧の写し紙',      emoji: '📄', desc: '霧が薄く剥がれた、紙のような何か' },
  candle:         { id: 'candle',         name: '古い燭台',         emoji: '🕯',  desc: '油が切れた壁掛け燭台' },
  oil_jar:        { id: 'oil_jar',        name: '油の壺',           emoji: '🫙',  desc: '古い油が入った小壺' },
  lit_candle:     { id: 'lit_candle',     name: '火のついた燭台',   emoji: '🔥', desc: '炎が揺れている。光源になる' },
  stone_fragment: { id: 'stone_fragment', name: '結晶片',           emoji: '🔮', desc: '特殊な形の結晶の破片' },
  rubbing:        { id: 'rubbing',        name: '石板の拓本',       emoji: '📋', desc: '石板の文字を写し取った紙' },
  overlay_sheet:  { id: 'overlay_sheet',  name: '重ね合わせの紙',   emoji: '✨', desc: '透かすと隠された文字が読める' },
  magic_stone:    { id: 'magic_stone',    name: '扉の魔石',         emoji: '💎', desc: '扉から外れた魔力を帯びた石' },
  crystal_key:    { id: 'crystal_key',    name: '結晶の鍵',         emoji: '🗝',  desc: '不思議な光を放つ結晶製の鍵' },
};

// ===== COMBINE_RECIPES =====
const COMBINE_RECIPES = [
  {
    inputs: ['candle', 'oil_jar'],
    output: 'lit_candle',
    message: '燭台に油を注ぎ、火をつけた。「火のついた燭台」を手に入れた。',
    sfx: 'combine',
  },
  {
    inputs: ['mist_paper', 'rubbing'],
    output: 'overlay_sheet',
    message: '霧の写し紙と拓本を重ね合わせると、透かして文字が読めた——「◆は遅く、▲は中、○は速く、扉に捧げよ」',
    sfx: 'combine',
    onCombine: () => { state.flags.overlayRead = true; },
  },
  {
    inputs: ['stone_fragment', 'magic_stone'],
    output: 'crystal_key',
    message: '結晶片が魔石にはまり込み、鍵の形に変わった。「結晶の鍵」を手に入れた。',
    sfx: 'combine',
  },
];

// ===== VIEW ORDER =====
const VIEW_ORDER = ['front', 'left', 'back', 'right'];
const VIEW_LABELS = {
  front:    '正面 — 封印の扉',
  left:     '左壁 — 結晶と燭台',
  back:     '後ろ壁 — 壺と石板',
  right:    '右壁 — 結晶と窓枠',
  corridor: '回廊',
  muistora: 'ムィストラの間',
};

// ===== MUISTRA_DIALOGUE =====
const MUISTRA_DIALOGUE = [
  {
    question: '「……お前は、なぜここに来た？」',
    choices: [
      { text: '「宝を求めて来た」',          correct: false },
      { text: '「迷い込んだだけだ」',          correct: true  },
      { text: '「お前を倒しに来た」',          correct: false },
    ],
    correct_response: '「そうか。迷子か。……私も、同じだ」',
    wrong_response:   '「……違う。もう一度、考えよ」',
  },
  {
    question: '「長い孤独の中で……お前が最も恐れるものは、何だ」',
    choices: [
      { text: '「死ぬことだ」',               correct: false },
      { text: '「痛みだ」',                   correct: false },
      { text: '「誰にも気づかれないことだ」', correct: true  },
    ],
    correct_response: '「……知っているのか。その感覚を」',
    wrong_response:   '「……違う。壁画をもう一度、見よ」',
  },
  {
    question: '「もし私が扉を開けたなら……お前はどうする」',
    choices: [
      { text: '「すぐに逃げる」',             correct: false },
      { text: '「また来る。今度は話をしに」', correct: true  },
      { text: '「お前のことを誰かに伝える」', correct: false },
    ],
    correct_response: '「……ふ。そうか」\n\n長い沈黙の後、霧が静かに晴れていく。\n\n「行け。……また、来い」',
    wrong_response:   '「……それでは、駄目だ」',
    onCorrect: () => { triggerEnding('good'); },
  },
];

// ===== SCENES =====
const SCENES = {
  front: {
    label: VIEW_LABELS.front,
    render(state) {
      const f = state.flags;
      const inv = state.inventory;

      // シンボル入力パネル（overlayRead後・魔石取得前）
      const symbolPanelSVG = (f.overlayRead && !f.magicStoneRemoved && !f.doorUnlocked) ? (() => {
        const ord = f.symbolOrder;
        const syms = ['○','▲','◆'];
        const btns = syms.map((s, i) => {
          const bx = 283 + i * 42;
          const done = ord[i] !== undefined;
          return `<g onclick="handleSymbolInput('${s}')" style="cursor:pointer">
            <rect x="${bx}" y="280" width="34" height="30" rx="3" fill="${done?'#534AB7':'#0f0d1e'}" stroke="${done?'#7F77DD':'#2e2658'}" stroke-width="1.2"/>
            <text x="${bx+17}" y="301" text-anchor="middle" font-size="16" fill="${done?'#fff':'#c8c0e8'}" font-family="sans-serif">${s}</text>
          </g>`;
        }).join('');
        return `<g id="sym-panel">
          <rect x="272" y="260" width="136" height="62" rx="4" fill="#09070f" stroke="#534AB7" stroke-width="1.2" opacity=".96"/>
          <text x="340" y="277" text-anchor="middle" font-size="9" fill="#7F77DD" letter-spacing="1" font-family="sans-serif">記号を順に</text>
          ${btns}
          <g onclick="resetSymbolOrder()" style="cursor:pointer">
            <text x="340" y="318" text-anchor="middle" font-size="8" fill="#534AB7" opacity=".7" font-family="sans-serif">リセット</text>
          </g>
        </g>`;
      })() : '';

      // 扉開放オーバーレイ
      const doorOpenSVG = f.doorUnlocked ? `
        <g onclick="handleSpotClick('door')" style="cursor:pointer">
          <rect x="296" y="144" width="88" height="155" fill="#04020a" opacity=".85"/>
          <text x="340" y="222" text-anchor="middle" font-size="11" fill="#1D9E75" letter-spacing="1" font-family="sans-serif">→ 先へ進む</text>
        </g>` : '';

      return `<svg width="100%" viewBox="0 0 680 400" xmlns="http://www.w3.org/2000/svg">
<style>
@keyframes sc_m1{0%,100%{transform:translateX(0) scaleY(1)}50%{transform:translateX(22px) scaleY(1.08)}}
@keyframes sc_m2{0%,100%{transform:translateX(0) scaleY(1)}50%{transform:translateX(-18px) scaleY(.94)}}
@keyframes sc_m3{0%,100%{transform:translateX(0) translateY(0)}50%{transform:translateX(12px) translateY(-6px)}}
@keyframes sc_pulse{0%,100%{opacity:.5}50%{opacity:1}}
@keyframes sc_pulse2{0%,100%{opacity:.3}50%{opacity:.8}}
@keyframes sc_glow{0%,100%{opacity:.6}50%{opacity:1}}
@media(prefers-reduced-motion:no-preference){
.m1{animation:sc_m1 12s ease-in-out infinite}
.m2{animation:sc_m2 9s ease-in-out infinite 1.5s}
.m3{animation:sc_m3 15s ease-in-out infinite 3s}
.m4{animation:sc_m1 11s ease-in-out infinite 2s}
.m5{animation:sc_m2 14s ease-in-out infinite .5s}
.gl{animation:sc_glow 3s ease-in-out infinite}
.pl{animation:sc_pulse 4s ease-in-out infinite}
.pl2{animation:sc_pulse2 5s ease-in-out infinite 1s}}
.hs{cursor:pointer}.ho{opacity:0;transition:opacity .18s}.hs:hover .ho{opacity:1}
</style>
<defs><clipPath id="scene"><rect width="680" height="400"/></clipPath>
<linearGradient id="ceilg" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#06040d"/><stop offset="100%" stop-color="#100c1e"/>
</linearGradient></defs>
<rect width="680" height="400" fill="#06040d"/>
<polygon points="0,0 680,0 520,105 160,105" fill="url(#ceilg)"/>
<polygon points="0,0 160,105 160,295 0,400" fill="#0d0b1a"/>
<polygon points="680,0 520,105 520,295 680,400" fill="#0d0b1a"/>
<polygon points="0,400 680,400 520,295 160,295" fill="#08060f"/>
<rect x="160" y="105" width="360" height="190" fill="#0f0d1e"/>
<!-- row1 --><rect x="160" y="105" width="58" height="34" fill="#131128" stroke="#0a0818" stroke-width=".5"/><rect x="218" y="105" width="44" height="34" fill="#141229" stroke="#0a0818" stroke-width=".5"/><rect x="262" y="105" width="52" height="34" fill="#121027" stroke="#0a0818" stroke-width=".5"/><rect x="314" y="105" width="48" height="34" fill="#13112a" stroke="#0a0818" stroke-width=".5"/><rect x="362" y="105" width="55" height="34" fill="#111026" stroke="#0a0818" stroke-width=".5"/><rect x="417" y="105" width="46" height="34" fill="#141229" stroke="#0a0818" stroke-width=".5"/><rect x="463" y="105" width="57" height="34" fill="#121128" stroke="#0a0818" stroke-width=".5"/>
<!-- row2 --><rect x="160" y="139" width="46" height="32" fill="#111026" stroke="#0a0818" stroke-width=".5"/><rect x="206" y="139" width="60" height="32" fill="#13112a" stroke="#0a0818" stroke-width=".5"/><rect x="266" y="139" width="44" height="32" fill="#100f24" stroke="#0a0818" stroke-width=".5"/><rect x="310" y="139" width="58" height="32" fill="#141228" stroke="#0a0818" stroke-width=".5"/><rect x="368" y="139" width="48" height="32" fill="#12102a" stroke="#0a0818" stroke-width=".5"/><rect x="416" y="139" width="52" height="32" fill="#111027" stroke="#0a0818" stroke-width=".5"/><rect x="468" y="139" width="52" height="32" fill="#131228" stroke="#0a0818" stroke-width=".5"/>
<!-- row3 --><rect x="160" y="171" width="54" height="30" fill="#12102a" stroke="#0a0818" stroke-width=".5"/><rect x="214" y="171" width="48" height="30" fill="#100f25" stroke="#0a0818" stroke-width=".5"/><rect x="262" y="171" width="56" height="30" fill="#141229" stroke="#0a0818" stroke-width=".5"/><rect x="318" y="171" width="44" height="30" fill="#111028" stroke="#0a0818" stroke-width=".5"/><rect x="362" y="171" width="60" height="30" fill="#13112b" stroke="#0a0818" stroke-width=".5"/><rect x="422" y="171" width="46" height="30" fill="#120f26" stroke="#0a0818" stroke-width=".5"/><rect x="468" y="171" width="52" height="30" fill="#141329" stroke="#0a0818" stroke-width=".5"/>
<!-- row4-6 --><rect x="160" y="201" width="48" height="32" fill="#131029" stroke="#0a0818" stroke-width=".5"/><rect x="208" y="201" width="56" height="32" fill="#11102a" stroke="#0a0818" stroke-width=".5"/><rect x="264" y="201" width="42" height="32" fill="#130f27" stroke="#0a0818" stroke-width=".5"/><rect x="306" y="201" width="58" height="32" fill="#14122b" stroke="#0a0818" stroke-width=".5"/><rect x="364" y="201" width="50" height="32" fill="#100e25" stroke="#0a0818" stroke-width=".5"/><rect x="414" y="201" width="54" height="32" fill="#131128" stroke="#0a0818" stroke-width=".5"/><rect x="468" y="201" width="52" height="32" fill="#120f29" stroke="#0a0818" stroke-width=".5"/>
<rect x="160" y="233" width="52" height="30" fill="#110f27" stroke="#0a0818" stroke-width=".5"/><rect x="212" y="233" width="44" height="30" fill="#14122a" stroke="#0a0818" stroke-width=".5"/><rect x="256" y="233" width="60" height="30" fill="#131028" stroke="#0a0818" stroke-width=".5"/><rect x="316" y="233" width="46" height="30" fill="#100f26" stroke="#0a0818" stroke-width=".5"/><rect x="362" y="233" width="54" height="30" fill="#14112b" stroke="#0a0818" stroke-width=".5"/><rect x="416" y="233" width="48" height="30" fill="#120f27" stroke="#0a0818" stroke-width=".5"/><rect x="464" y="233" width="56" height="30" fill="#131229" stroke="#0a0818" stroke-width=".5"/>
<rect x="160" y="263" width="56" height="32" fill="#131128" stroke="#0a0818" stroke-width=".5"/><rect x="216" y="263" width="46" height="32" fill="#100e24" stroke="#0a0818" stroke-width=".5"/><rect x="262" y="263" width="54" height="32" fill="#13112a" stroke="#0a0818" stroke-width=".5"/><rect x="316" y="263" width="48" height="32" fill="#141229" stroke="#0a0818" stroke-width=".5"/><rect x="364" y="263" width="58" height="32" fill="#111027" stroke="#0a0818" stroke-width=".5"/><rect x="422" y="263" width="46" height="32" fill="#120f28" stroke="#0a0818" stroke-width=".5"/><rect x="468" y="263" width="52" height="32" fill="#14122a" stroke="#0a0818" stroke-width=".5"/>
<!-- 左右壁 -->
<g clip-path="url(#scene)">
<rect x="0" y="0" width="160" height="400" fill="#0c0a1c"/>
<rect x="18" y="110" width="52" height="28" fill="#0f0d1e" stroke="#070614" stroke-width=".5"/><rect x="70" y="110" width="42" height="28" fill="#0e0c1d" stroke="#070614" stroke-width=".5"/><rect x="112" y="110" width="48" height="28" fill="#100e1f" stroke="#070614" stroke-width=".5"/>
<rect x="18" y="138" width="44" height="30" fill="#0d0b1c" stroke="#070614" stroke-width=".5"/><rect x="62" y="138" width="56" height="30" fill="#0f0d1e" stroke="#070614" stroke-width=".5"/><rect x="118" y="138" width="42" height="30" fill="#0e0c1d" stroke="#070614" stroke-width=".5"/>
<rect x="18" y="168" width="50" height="28" fill="#100d1f" stroke="#070614" stroke-width=".5"/><rect x="68" y="168" width="44" height="28" fill="#0c0b1c" stroke="#070614" stroke-width=".5"/><rect x="112" y="168" width="48" height="28" fill="#0f0d1e" stroke="#070614" stroke-width=".5"/>
<rect x="18" y="196" width="42" height="30" fill="#0d0b1c" stroke="#070614" stroke-width=".5"/><rect x="60" y="196" width="58" height="30" fill="#100e1f" stroke="#070614" stroke-width=".5"/><rect x="118" y="196" width="42" height="30" fill="#0e0c1d" stroke="#070614" stroke-width=".5"/>
<rect x="18" y="226" width="54" height="28" fill="#0f0d1e" stroke="#070614" stroke-width=".5"/><rect x="72" y="226" width="46" height="28" fill="#0d0b1c" stroke="#070614" stroke-width=".5"/><rect x="118" y="226" width="42" height="28" fill="#100e1f" stroke="#070614" stroke-width=".5"/>
<rect x="18" y="254" width="46" height="30" fill="#0c0b1c" stroke="#070614" stroke-width=".5"/><rect x="64" y="254" width="54" height="30" fill="#0e0c1d" stroke="#070614" stroke-width=".5"/><rect x="118" y="254" width="42" height="30" fill="#0f0d1e" stroke="#070614" stroke-width=".5"/>
<rect x="18" y="284" width="52" height="28" fill="#100d1f" stroke="#070614" stroke-width=".5"/><rect x="70" y="284" width="48" height="28" fill="#0d0b1c" stroke="#070614" stroke-width=".5"/><rect x="118" y="284" width="42" height="28" fill="#0f0e1e" stroke="#070614" stroke-width=".5"/>
</g>
<g clip-path="url(#scene)">
<rect x="520" y="0" width="160" height="400" fill="#0c0a1c"/>
<rect x="520" y="110" width="48" height="28" fill="#0f0d1e" stroke="#070614" stroke-width=".5"/><rect x="568" y="110" width="54" height="28" fill="#0e0c1d" stroke="#070614" stroke-width=".5"/><rect x="622" y="110" width="40" height="28" fill="#100e1f" stroke="#070614" stroke-width=".5"/>
<rect x="520" y="138" width="42" height="30" fill="#0d0b1c" stroke="#070614" stroke-width=".5"/><rect x="562" y="138" width="58" height="30" fill="#0f0d1e" stroke="#070614" stroke-width=".5"/><rect x="620" y="138" width="42" height="30" fill="#0e0c1d" stroke="#070614" stroke-width=".5"/>
<rect x="520" y="168" width="48" height="28" fill="#100d1f" stroke="#070614" stroke-width=".5"/><rect x="568" y="168" width="44" height="28" fill="#0c0b1c" stroke="#070614" stroke-width=".5"/><rect x="612" y="168" width="50" height="28" fill="#0f0d1e" stroke="#070614" stroke-width=".5"/>
<rect x="520" y="196" width="42" height="30" fill="#0d0b1c" stroke="#070614" stroke-width=".5"/><rect x="562" y="196" width="56" height="30" fill="#100e1f" stroke="#070614" stroke-width=".5"/><rect x="618" y="196" width="44" height="30" fill="#0e0c1d" stroke="#070614" stroke-width=".5"/>
<rect x="520" y="226" width="50" height="28" fill="#0f0d1e" stroke="#070614" stroke-width=".5"/><rect x="570" y="226" width="46" height="28" fill="#0d0b1c" stroke="#070614" stroke-width=".5"/><rect x="616" y="226" width="46" height="28" fill="#100e1f" stroke="#070614" stroke-width=".5"/>
<rect x="520" y="254" width="44" height="30" fill="#0c0b1c" stroke="#070614" stroke-width=".5"/><rect x="564" y="254" width="54" height="30" fill="#0e0c1d" stroke="#070614" stroke-width=".5"/><rect x="618" y="254" width="44" height="30" fill="#0f0d1e" stroke="#070614" stroke-width=".5"/>
<rect x="520" y="284" width="52" height="28" fill="#100d1f" stroke="#070614" stroke-width=".5"/><rect x="572" y="284" width="46" height="28" fill="#0d0b1c" stroke="#070614" stroke-width=".5"/><rect x="618" y="284" width="44" height="28" fill="#0f0e1e" stroke="#070614" stroke-width=".5"/>
</g>
<rect x="160" y="105" width="360" height="190" fill="#1a1730" opacity=".08"/>
<rect x="160" y="105" width="360" height="60" fill="#06040d" opacity=".4"/>
<rect x="160" y="235" width="360" height="60" fill="#06040d" opacity=".3"/>
<!-- 扉 -->
<path d="M300,295 L300,183 Q300,148 340,148 Q380,148 380,183 L380,295 Z" fill="#09070f" stroke="#2e2658" stroke-width="2.5"/>
<path d="M307,295 L307,186 Q307,158 340,158 Q373,158 373,186 L373,295 Z" fill="#07050e" stroke="#231e48" stroke-width="1"/>
<rect x="307" y="195" width="30" height="44" rx="2" fill="#0b091a" stroke="#1e1a3a" stroke-width="1"/>
<rect x="343" y="195" width="30" height="44" rx="2" fill="#0b091a" stroke="#1e1a3a" stroke-width="1"/>
<rect x="307" y="247" width="30" height="40" rx="2" fill="#0b091a" stroke="#1e1a3a" stroke-width="1"/>
<rect x="343" y="247" width="30" height="40" rx="2" fill="#0b091a" stroke="#1e1a3a" stroke-width="1"/>
<path d="M307,186 Q307,158 340,158 Q373,158 373,186" fill="none" stroke="#3d3578" stroke-width="1.5"/>
<path d="M309,188 Q309,163 340,163 Q371,163 371,188" fill="none" stroke="#534AB7" stroke-width=".8" opacity=".6"/>
<ellipse cx="340" cy="182" rx="8" ry="8" fill="#0e0c1e" stroke="#534AB7" stroke-width="1.2"/>
${!f.magicStoneRemoved ? `<circle cx="340" cy="182" r="4" fill="#534AB7" opacity=".7" class="gl"/><circle cx="340" cy="182" r="2" fill="#9f99e8" opacity=".9" class="gl"/>` : `<circle cx="340" cy="182" r="4" fill="#1a1530" stroke="#2e2658" stroke-width="1"/>`}
<rect x="333" y="217" width="14" height="5" rx="2" fill="#2a244e"/>
<circle cx="340" cy="230" r="4" fill="#1e1a3a" stroke="#534AB7" stroke-width=".8"/>
<!-- 左結晶 -->
<g transform="translate(38,140)"><polygon points="22,0 38,12 44,35 30,55 14,55 0,35 6,12" fill="#1e1a38" stroke="#3d3580" stroke-width="1"/><polygon points="22,0 38,12 22,28" fill="#2a2650" stroke="#4a4298" stroke-width=".8"/><polygon points="38,12 44,35 22,28" fill="#302a60" stroke="#534AB7" stroke-width=".8"/><circle cx="22" cy="28" r="2.5" fill="#7F77DD" opacity=".8" class="pl"/></g>
<g transform="translate(68,175)"><polygon points="16,0 28,10 32,28 20,44 8,44 0,28 4,10" fill="#1a1632" stroke="#34308a" stroke-width=".8"/><polygon points="16,0 28,10 16,20" fill="#221e42" stroke="#4040a0" stroke-width=".7"/><circle cx="16" cy="20" r="2" fill="#6058c8" opacity=".7" class="pl2"/></g>
<g transform="translate(20,208)"><polygon points="18,0 32,8 38,26 24,42 10,42 0,26 6,8" fill="#18143a" stroke="#2e2a70" stroke-width=".8"/><circle cx="18" cy="22" r="2" fill="#5050b8" opacity=".6" class="pl"/></g>
<ellipse cx="68" cy="296" rx="52" ry="8" fill="#3d3598" opacity=".12" class="pl2"/>
<!-- 右結晶 -->
<g transform="translate(560,148)"><polygon points="18,0 34,10 40,32 24,52 12,52 0,32 4,10" fill="#201c3c" stroke="#403890" stroke-width="1"/><polygon points="18,0 34,10 18,26" fill="#2c2858" stroke="#504898" stroke-width=".8"/><polygon points="34,10 40,32 18,26" fill="#34306a" stroke="#5850b0" stroke-width=".8"/><circle cx="18" cy="26" r="3" fill="#7F77DD" opacity=".9" class="gl"/></g>
<g transform="translate(590,178)"><polygon points="14,0 24,8 28,24 18,38 6,38 0,24 4,8" fill="#1c1838" stroke="#343088" stroke-width=".8"/><circle cx="14" cy="20" r="1.8" fill="#6058c8" opacity=".7" class="pl2"/></g>
<g transform="translate(536,186)"><polygon points="20,0 36,10 40,30 26,48 10,48 0,30 6,10" fill="#1a1636" stroke="#302c7a" stroke-width=".8"/><circle cx="20" cy="24" r="2.5" fill="#7F77DD" opacity=".8" class="gl"/></g>
<ellipse cx="600" cy="296" rx="50" ry="8" fill="#3d3598" opacity=".12" class="pl2"/>
<!-- 床の封印紋 -->
<ellipse cx="340" cy="370" rx="90" ry="15" fill="none" stroke="#2e2860" stroke-width="1.5" class="pl"/>
<ellipse cx="340" cy="370" rx="68" ry="11" fill="none" stroke="#534AB7" stroke-width=".8" class="pl2"/>
<ellipse cx="340" cy="370" rx="46" ry="7" fill="none" stroke="#3d3598" stroke-width=".6" class="pl"/>
<line x1="340" y1="355" x2="340" y2="385" stroke="#2e2860" stroke-width=".8" class="pl2"/>
<line x1="250" y1="370" x2="430" y2="370" stroke="#2e2860" stroke-width=".8" class="pl2"/>
<line x1="276" y1="352" x2="404" y2="388" stroke="#2a2458" stroke-width=".6" class="pl"/>
<line x1="404" y1="352" x2="276" y2="388" stroke="#2a2458" stroke-width=".6" class="pl"/>
<ellipse cx="340" cy="370" rx="8" ry="3" fill="#534AB7" opacity=".25" class="gl"/>
<!-- 霧 -->
<g class="m1"><ellipse cx="340" cy="155" rx="195" ry="22" fill="#e8e0f8" opacity=".038"/></g>
<g class="m2"><ellipse cx="220" cy="162" rx="148" ry="18" fill="#d8d0f0" opacity=".032"/></g>
<g class="m1"><ellipse cx="340" cy="230" rx="182" ry="26" fill="#d0c8e8" opacity=".042"/></g>
<g class="m3"><ellipse cx="340" cy="310" rx="210" ry="30" fill="#c0b8e0" opacity=".048"/></g>
<g class="m4"><ellipse cx="340" cy="380" rx="230" ry="28" fill="#b8b0dc" opacity=".050"/></g>
<g class="m3"><ellipse cx="68" cy="270" rx="100" ry="32" fill="#c8c0e4" opacity=".04"/></g>
<g class="m4"><ellipse cx="612" cy="262" rx="95" ry="28" fill="#ccc4e8" opacity=".038"/></g>
<!-- 枠線 -->
<line x1="160" y1="105" x2="160" y2="295" stroke="#06040d" stroke-width="3"/><line x1="520" y1="105" x2="520" y2="295" stroke="#06040d" stroke-width="3"/><line x1="160" y1="105" x2="520" y2="105" stroke="#06040d" stroke-width="3"/><line x1="160" y1="295" x2="520" y2="295" stroke="#06040d" stroke-width="3"/>
<line x1="160" y1="105" x2="160" y2="295" stroke="#1a163a" stroke-width="1"/><line x1="520" y1="105" x2="520" y2="295" stroke="#1a163a" stroke-width="1"/>
<!-- ホットスポット -->
<g class="hs" onclick="handleSpotClick('door')">
  <rect x="296" y="144" width="88" height="155" fill="#534AB7" opacity="0"/>
  <rect x="296" y="144" width="88" height="155" fill="#7F77DD" class="ho" opacity=".08" rx="2"/>
</g>
<g class="hs" onclick="handleSpotClick('crystal_left')">
  <rect x="15" y="130" width="130" height="165" fill="#534AB7" opacity="0"/>
  <rect x="15" y="130" width="130" height="165" fill="#7F77DD" class="ho" opacity=".07"/>
</g>
<g class="hs" onclick="handleSpotClick('crystal_right_front')">
  <rect x="530" y="138" width="135" height="160" fill="#534AB7" opacity="0"/>
  <rect x="530" y="138" width="135" height="160" fill="#7F77DD" class="ho" opacity=".07"/>
</g>
<g class="hs" onclick="handleSpotClick('floor_rune')">
  <ellipse cx="340" cy="370" rx="95" ry="22" fill="#534AB7" opacity="0"/>
  <ellipse cx="340" cy="370" rx="95" ry="22" fill="#7F77DD" class="ho" opacity=".09"/>
</g>
<g class="hs" onclick="handleSpotClick('ceiling_mist')">
  <rect x="160" y="105" width="360" height="50" fill="#534AB7" opacity="0"/>
  <rect x="160" y="105" width="360" height="50" fill="#7F77DD" class="ho" opacity=".06"/>
</g>
${symbolPanelSVG}
${doorOpenSVG}
</svg>`;
    },
    spots: [
      {
        id: 'door',
        label: '封印の扉',
        inspect() {
          if (state.flags.doorUnlocked) {
            showDialog('鍵が開いている。先に進める。', [{ text: '→ 回廊へ進む', onClick: () => { closeDialog(); loadScene('corridor'); } }]);
          } else {
            showDialog('古い石の扉。アーチに封印紋が刻まれ、中央の魔石が脈動している。錠前に特殊な形の鍵穴がある。');
          }
        },
        canUse(itemId) { return itemId === 'crystal_key' && !state.flags.doorUnlocked; },
        use(itemId) {
          state.flags.doorUnlocked = true;
          removeItem('crystal_key');
          triggerSFX('door_open');
          loadScene(state.currentView);
          showDialog('結晶の鍵が錠前にはまった。ゆっくりと、扉が軋みながら開いていく…', [{ text: '→ 回廊へ進む', onClick: () => { closeDialog(); loadScene('corridor'); } }]);
        },
      },
      {
        id: 'ceiling_mist',
        label: '天井の霧',
        inspect() {
          if (state.inventory.includes('mist_paper') || state.flags.mistPaperTaken) {
            showDialog('霧はすでに写し取った。');
          } else {
            state.flags.mistPaperTaken = true;
            addItem('mist_paper');
            triggerSFX('item_get');
            showDialog('霧が渦を巻いている。手を伸ばすと……霧が紙のように薄く剥がれた。「霧の写し紙」を手に入れた。');
          }
        },
      },
      {
        id: 'crystal_left',
        label: '左の結晶群',
        inspect() {
          state.inspected['crystal_left'] = true;
          if (state.inspected['crystal_left_count'] >= 1) {
            showDialog('光の強さは ◆ > ▲ > ○ だ。');
          } else {
            state.inspected['crystal_left_count'] = (state.inspected['crystal_left_count'] || 0) + 1;
            showDialog('三種類の結晶が並んでいる。◆が最も強く輝き、▲が次、○が弱く光っている。');
          }
        },
      },
      {
        id: 'crystal_right_front',
        label: '右の結晶群',
        inspect() {
          showDialog('右壁の結晶はより明るく輝いている。表面に何かが映り込んでいるようにも見える。右の壁に回れば詳しく調べられそうだ。');
        },
      },
      {
        id: 'floor_rune',
        label: '床の封印紋',
        inspect() {
          if (state.flags.overlayRead) {
            showDialog('封印紋が読めた。速い順に ○ ▲ ◆ と並んでいる。扉のシンボルを同じ順で入力せよ。');
          } else {
            showDialog('六芒星の封印紋。記号が刻まれているが、霧で順番が読めない。後ろの壁に何か手がかりがあるかもしれない。');
          }
        },
      },
    ],
  },
  left: {
    label: VIEW_LABELS.left,
    render(state) {
      const candleTaken = state.inventory.includes('candle') || state.flags.candleTaken;
      return `<svg width="100%" viewBox="0 0 680 400" xmlns="http://www.w3.org/2000/svg">
<style>
@keyframes sc_pulse{0%,100%{opacity:.5}50%{opacity:1}}
@keyframes sc_pulse2{0%,100%{opacity:.3}50%{opacity:.8}}
@keyframes sc_glow{0%,100%{opacity:.6}50%{opacity:1}}
@media(prefers-reduced-motion:no-preference){.gl{animation:sc_glow 3s ease-in-out infinite}.pl{animation:sc_pulse 4s ease-in-out infinite}.pl2{animation:sc_pulse2 5s ease-in-out infinite 1s}}
.hs{cursor:pointer}.ho{opacity:0;transition:opacity .18s}.hs:hover .ho{opacity:1}
</style>
<rect width="680" height="400" fill="#06040d"/>
<polygon points="0,0 680,0 680,80 0,80" fill="#09070f"/>
<rect x="0" y="80" width="680" height="240" fill="#0f0d1e"/>
<polygon points="0,320 680,320 680,400 0,400" fill="#08060f"/>
<!-- 石壁ブロック -->
<rect x="0" y="80" width="88" height="32" fill="#131128" stroke="#0a0818" stroke-width=".5"/><rect x="88" y="80" width="96" height="32" fill="#141229" stroke="#0a0818" stroke-width=".5"/><rect x="184" y="80" width="80" height="32" fill="#121027" stroke="#0a0818" stroke-width=".5"/><rect x="264" y="80" width="100" height="32" fill="#13112a" stroke="#0a0818" stroke-width=".5"/><rect x="364" y="80" width="88" height="32" fill="#111026" stroke="#0a0818" stroke-width=".5"/><rect x="452" y="80" width="96" height="32" fill="#141229" stroke="#0a0818" stroke-width=".5"/><rect x="548" y="80" width="132" height="32" fill="#121128" stroke="#0a0818" stroke-width=".5"/>
<rect x="0" y="112" width="104" height="30" fill="#111026" stroke="#0a0818" stroke-width=".5"/><rect x="104" y="112" width="80" height="30" fill="#13112a" stroke="#0a0818" stroke-width=".5"/><rect x="184" y="112" width="96" height="30" fill="#100f24" stroke="#0a0818" stroke-width=".5"/><rect x="280" y="112" width="88" height="30" fill="#141228" stroke="#0a0818" stroke-width=".5"/><rect x="368" y="112" width="96" height="30" fill="#12102a" stroke="#0a0818" stroke-width=".5"/><rect x="464" y="112" width="80" height="30" fill="#111027" stroke="#0a0818" stroke-width=".5"/><rect x="544" y="112" width="136" height="30" fill="#131228" stroke="#0a0818" stroke-width=".5"/>
<rect x="0" y="142" width="88" height="32" fill="#12102a" stroke="#0a0818" stroke-width=".5"/><rect x="88" y="142" width="96" height="32" fill="#100f25" stroke="#0a0818" stroke-width=".5"/><rect x="184" y="142" width="80" height="32" fill="#141229" stroke="#0a0818" stroke-width=".5"/><rect x="264" y="142" width="104" height="32" fill="#111028" stroke="#0a0818" stroke-width=".5"/><rect x="368" y="142" width="88" height="32" fill="#13112b" stroke="#0a0818" stroke-width=".5"/><rect x="456" y="142" width="96" height="32" fill="#120f26" stroke="#0a0818" stroke-width=".5"/><rect x="552" y="142" width="128" height="32" fill="#141329" stroke="#0a0818" stroke-width=".5"/>
<rect x="0" y="174" width="96" height="30" fill="#131029" stroke="#0a0818" stroke-width=".5"/><rect x="96" y="174" width="80" height="30" fill="#11102a" stroke="#0a0818" stroke-width=".5"/><rect x="176" y="174" width="104" height="30" fill="#130f27" stroke="#0a0818" stroke-width=".5"/><rect x="280" y="174" width="88" height="30" fill="#14122b" stroke="#0a0818" stroke-width=".5"/><rect x="368" y="174" width="96" height="30" fill="#100e25" stroke="#0a0818" stroke-width=".5"/><rect x="464" y="174" width="80" height="30" fill="#131128" stroke="#0a0818" stroke-width=".5"/><rect x="544" y="174" width="136" height="30" fill="#120f29" stroke="#0a0818" stroke-width=".5"/>
<rect x="0" y="204" width="88" height="32" fill="#110f27" stroke="#0a0818" stroke-width=".5"/><rect x="88" y="204" width="96" height="32" fill="#14122a" stroke="#0a0818" stroke-width=".5"/><rect x="184" y="204" width="80" height="32" fill="#131028" stroke="#0a0818" stroke-width=".5"/><rect x="264" y="204" width="100" height="32" fill="#100f26" stroke="#0a0818" stroke-width=".5"/><rect x="364" y="204" width="96" height="32" fill="#14112b" stroke="#0a0818" stroke-width=".5"/><rect x="460" y="204" width="80" height="32" fill="#120f27" stroke="#0a0818" stroke-width=".5"/><rect x="540" y="204" width="140" height="32" fill="#131229" stroke="#0a0818" stroke-width=".5"/>
<rect x="0" y="236" width="96" height="30" fill="#131128" stroke="#0a0818" stroke-width=".5"/><rect x="96" y="236" width="80" height="30" fill="#100e24" stroke="#0a0818" stroke-width=".5"/><rect x="176" y="236" width="104" height="30" fill="#13112a" stroke="#0a0818" stroke-width=".5"/><rect x="280" y="236" width="88" height="30" fill="#141229" stroke="#0a0818" stroke-width=".5"/><rect x="368" y="236" width="96" height="30" fill="#111027" stroke="#0a0818" stroke-width=".5"/><rect x="464" y="236" width="80" height="30" fill="#120f28" stroke="#0a0818" stroke-width=".5"/><rect x="544" y="236" width="136" height="30" fill="#14122a" stroke="#0a0818" stroke-width=".5"/>
<rect x="0" y="266" width="88" height="32" fill="#12102a" stroke="#0a0818" stroke-width=".5"/><rect x="88" y="266" width="96" height="32" fill="#100f25" stroke="#0a0818" stroke-width=".5"/><rect x="184" y="266" width="80" height="32" fill="#141229" stroke="#0a0818" stroke-width=".5"/><rect x="264" y="266" width="104" height="32" fill="#111028" stroke="#0a0818" stroke-width=".5"/><rect x="368" y="266" width="80" height="32" fill="#13112b" stroke="#0a0818" stroke-width=".5"/><rect x="448" y="266" width="96" height="32" fill="#120f26" stroke="#0a0818" stroke-width=".5"/><rect x="544" y="266" width="136" height="32" fill="#141329" stroke="#0a0818" stroke-width=".5"/>
<!-- 結晶群（大） -->
<g transform="translate(80,100)"><polygon points="28,0 50,16 58,46 38,72 18,72 0,46 8,16" fill="#1e1a38" stroke="#3d3580" stroke-width="1.2"/><polygon points="28,0 50,16 28,36" fill="#2a2650" stroke="#4a4298" stroke-width=".9"/><polygon points="28,0 8,16 28,36" fill="#251f4a" stroke="#3d3580" stroke-width=".9"/><polygon points="50,16 58,46 28,36" fill="#302a60" stroke="#534AB7" stroke-width=".9"/><polygon points="8,16 0,46 28,36" fill="#26204c" stroke="#3d3580" stroke-width=".9"/><circle cx="28" cy="36" r="3" fill="#7F77DD" opacity=".85" class="gl"/></g>
<!-- 結晶群（中） -->
<g transform="translate(152,130)"><polygon points="18,0 32,10 38,30 24,48 10,48 0,30 6,10" fill="#1a1632" stroke="#34308a" stroke-width=".9"/><polygon points="18,0 32,10 18,24" fill="#221e42" stroke="#4040a0" stroke-width=".8"/><polygon points="32,10 38,30 18,24" fill="#2c2858" stroke="#4a46b0" stroke-width=".8"/><circle cx="18" cy="24" r="2.2" fill="#6058c8" opacity=".75" class="pl"/></g>
<!-- 結晶群（小） -->
<g transform="translate(128,178)"><polygon points="12,0 22,8 26,22 16,34 6,34 0,22 4,8" fill="#181436" stroke="#2e2a80" stroke-width=".8"/><circle cx="12" cy="18" r="1.8" fill="#5050b8" opacity=".65" class="pl2"/></g>
<ellipse cx="148" cy="320" rx="70" ry="10" fill="#3d3598" opacity=".1" class="pl2"/>
<!-- 壁掛け燭台 -->
${!candleTaken ? `
<g onclick="handleSpotClick('old_candle')" class="hs" transform="translate(380,110)">
  <rect x="0" y="30" width="14" height="48" rx="2" fill="#5a4a30" stroke="#3a2e18"/>
  <rect x="-10" y="22" width="34" height="12" rx="2" fill="#4a3c22" stroke="#2e2010"/>
  <rect x="3" y="8" width="8" height="24" rx="1" fill="#c8a060"/>
  <ellipse cx="7" cy="8" rx="5" ry="5" fill="#2a1e10"/>
  <text x="34" y="18" font-size="18" fill="#EF9F27" class="pl">!</text>
  <rect x="-16" y="16" width="46" height="70" fill="#534AB7" opacity="0" class="ho" rx="2"/>
</g>` : `
<g transform="translate(380,110)">
  <rect x="0" y="30" width="14" height="48" rx="2" fill="#3a2e1a" stroke="#2a1e0a"/>
  <rect x="-10" y="22" width="34" height="12" rx="2" fill="#2e2210" stroke="#1e1408"/>
  <rect x="3" y="8" width="8" height="24" rx="1" fill="#7a6040"/>
  <ellipse cx="7" cy="8" rx="5" ry="5" fill="#1a1208"/>
  <text x="28" y="12" font-size="12" fill="#1D9E75">✓</text>
</g>`}
<!-- 壁の刻み傷（数字の3） -->
<g onclick="handleSpotClick('wall_scratch')" class="hs" transform="translate(500,160)">
  <path d="M10,10 Q30,10 30,25 Q30,38 16,38 Q30,38 30,52 Q30,68 10,68" fill="none" stroke="#3a3260" stroke-width="2.5" stroke-linecap="round"/>
  <rect x="0" y="0" width="50" height="80" fill="#534AB7" opacity="0" class="ho" rx="2"/>
</g>
<!-- 霧 -->
<rect x="0" y="80" width="680" height="240" fill="#1a1730" opacity=".06"/>
</svg>`;
    },
    spots: [
      {
        id: 'crystal_group_left',
        label: '結晶群',
        inspect() {
          showDialog('◆が最も強く輝き、▲が次、○が弱く光っている。形はそれぞれ異なる。');
        },
      },
      {
        id: 'old_candle',
        label: '古い燭台',
        inspect() {
          if (state.flags.candleTaken) {
            showDialog('燭台はもう持っている。');
          } else {
            state.flags.candleTaken = true;
            addItem('candle');
            triggerSFX('item_get');
            loadScene(state.currentView);
            showDialog('壁掛けの古い燭台を外した。油が切れていて火がつかない。「古い燭台」を手に入れた。');
          }
        },
      },
      {
        id: 'wall_scratch',
        label: '壁の刻み傷',
        inspect() {
          showDialog('誰かが爪で必死に壁を削った跡。数字の「3」のような形に見える。3番目、という意味だろうか。');
        },
      },
    ],
  },

  right: {
    label: VIEW_LABELS.right,
    render(state) {
      const fragTaken = state.flags.stoneFragmentTaken;
      const illuminated = state.flags.windowIlluminated;
      return `<svg width="100%" viewBox="0 0 680 400" xmlns="http://www.w3.org/2000/svg">
<style>
@keyframes sc_pulse{0%,100%{opacity:.5}50%{opacity:1}}
@keyframes sc_pulse2{0%,100%{opacity:.3}50%{opacity:.8}}
@keyframes sc_glow{0%,100%{opacity:.6}50%{opacity:1}}
@media(prefers-reduced-motion:no-preference){.gl{animation:sc_glow 3s ease-in-out infinite}.pl{animation:sc_pulse 4s ease-in-out infinite}.pl2{animation:sc_pulse2 5s ease-in-out infinite 1s}}
.hs{cursor:pointer}.ho{opacity:0;transition:opacity .18s}.hs:hover .ho{opacity:1}
</style>
<rect width="680" height="400" fill="#06040d"/>
<polygon points="0,0 680,0 680,80 0,80" fill="#09070f"/>
<rect x="0" y="80" width="680" height="240" fill="#0f0d1e"/>
<polygon points="0,320 680,320 680,400 0,400" fill="#08060f"/>
<!-- 石壁 -->
<rect x="0" y="80" width="96" height="32" fill="#131128" stroke="#0a0818" stroke-width=".5"/><rect x="96" y="80" width="80" height="32" fill="#141229" stroke="#0a0818" stroke-width=".5"/><rect x="176" y="80" width="104" height="32" fill="#121027" stroke="#0a0818" stroke-width=".5"/><rect x="280" y="80" width="88" height="32" fill="#13112a" stroke="#0a0818" stroke-width=".5"/><rect x="368" y="80" width="96" height="32" fill="#111026" stroke="#0a0818" stroke-width=".5"/><rect x="464" y="80" width="80" height="32" fill="#141229" stroke="#0a0818" stroke-width=".5"/><rect x="544" y="80" width="136" height="32" fill="#121128" stroke="#0a0818" stroke-width=".5"/>
<rect x="0" y="112" width="88" height="30" fill="#111026" stroke="#0a0818" stroke-width=".5"/><rect x="88" y="112" width="104" height="30" fill="#13112a" stroke="#0a0818" stroke-width=".5"/><rect x="192" y="112" width="80" height="30" fill="#100f24" stroke="#0a0818" stroke-width=".5"/><rect x="272" y="112" width="96" height="30" fill="#141228" stroke="#0a0818" stroke-width=".5"/><rect x="368" y="112" width="80" height="30" fill="#12102a" stroke="#0a0818" stroke-width=".5"/><rect x="448" y="112" width="96" height="30" fill="#111027" stroke="#0a0818" stroke-width=".5"/><rect x="544" y="112" width="136" height="30" fill="#131228" stroke="#0a0818" stroke-width=".5"/>
<rect x="0" y="142" width="96" height="32" fill="#12102a" stroke="#0a0818" stroke-width=".5"/><rect x="96" y="142" width="80" height="32" fill="#100f25" stroke="#0a0818" stroke-width=".5"/><rect x="176" y="142" width="104" height="32" fill="#141229" stroke="#0a0818" stroke-width=".5"/><rect x="280" y="142" width="88" height="32" fill="#111028" stroke="#0a0818" stroke-width=".5"/><rect x="368" y="142" width="96" height="32" fill="#13112b" stroke="#0a0818" stroke-width=".5"/><rect x="464" y="142" width="80" height="32" fill="#120f26" stroke="#0a0818" stroke-width=".5"/><rect x="544" y="142" width="136" height="32" fill="#141329" stroke="#0a0818" stroke-width=".5"/>
<rect x="0" y="174" width="88" height="30" fill="#131029" stroke="#0a0818" stroke-width=".5"/><rect x="88" y="174" width="96" height="30" fill="#11102a" stroke="#0a0818" stroke-width=".5"/><rect x="184" y="174" width="80" height="30" fill="#130f27" stroke="#0a0818" stroke-width=".5"/><rect x="264" y="174" width="104" height="30" fill="#14122b" stroke="#0a0818" stroke-width=".5"/><rect x="368" y="174" width="88" height="30" fill="#100e25" stroke="#0a0818" stroke-width=".5"/><rect x="456" y="174" width="96" height="30" fill="#131128" stroke="#0a0818" stroke-width=".5"/><rect x="552" y="174" width="128" height="30" fill="#120f29" stroke="#0a0818" stroke-width=".5"/>
<rect x="0" y="204" width="96" height="32" fill="#110f27" stroke="#0a0818" stroke-width=".5"/><rect x="96" y="204" width="80" height="32" fill="#14122a" stroke="#0a0818" stroke-width=".5"/><rect x="176" y="204" width="96" height="32" fill="#131028" stroke="#0a0818" stroke-width=".5"/><rect x="272" y="204" width="88" height="32" fill="#100f26" stroke="#0a0818" stroke-width=".5"/><rect x="360" y="204" width="104" height="32" fill="#14112b" stroke="#0a0818" stroke-width=".5"/><rect x="464" y="204" width="80" height="32" fill="#120f27" stroke="#0a0818" stroke-width=".5"/><rect x="544" y="204" width="136" height="32" fill="#131229" stroke="#0a0818" stroke-width=".5"/>
<rect x="0" y="236" width="88" height="32" fill="#131128" stroke="#0a0818" stroke-width=".5"/><rect x="88" y="236" width="96" height="32" fill="#100e24" stroke="#0a0818" stroke-width=".5"/><rect x="184" y="236" width="80" height="32" fill="#13112a" stroke="#0a0818" stroke-width=".5"/><rect x="264" y="236" width="104" height="32" fill="#141229" stroke="#0a0818" stroke-width=".5"/><rect x="368" y="236" width="88" height="32" fill="#111027" stroke="#0a0818" stroke-width=".5"/><rect x="456" y="236" width="96" height="32" fill="#120f28" stroke="#0a0818" stroke-width=".5"/><rect x="552" y="236" width="128" height="32" fill="#14122a" stroke="#0a0818" stroke-width=".5"/>
<rect x="0" y="268" width="96" height="28" fill="#12102a" stroke="#0a0818" stroke-width=".5"/><rect x="96" y="268" width="80" height="28" fill="#100f25" stroke="#0a0818" stroke-width=".5"/><rect x="176" y="268" width="104" height="28" fill="#141229" stroke="#0a0818" stroke-width=".5"/><rect x="280" y="268" width="88" height="28" fill="#111028" stroke="#0a0818" stroke-width=".5"/><rect x="368" y="268" width="96" height="28" fill="#13112b" stroke="#0a0818" stroke-width=".5"/><rect x="464" y="268" width="80" height="28" fill="#120f26" stroke="#0a0818" stroke-width=".5"/><rect x="544" y="268" width="136" height="28" fill="#141329" stroke="#0a0818" stroke-width=".5"/>
<!-- 結晶群（明るく） -->
<g transform="translate(480,95)"><polygon points="28,0 50,16 56,44 36,68 16,68 0,44 8,16" fill="#241e42" stroke="#4840b0" stroke-width="1.2"/><polygon points="28,0 50,16 28,34" fill="#342e62" stroke="#6058d0" stroke-width=".9"/><polygon points="28,0 8,16 28,34" fill="#2e2858" stroke="#5850c0" stroke-width=".9"/><polygon points="50,16 56,44 28,34" fill="#3c3670" stroke="#6860d8" stroke-width=".9"/><circle cx="28" cy="34" r="3.5" fill="#9f99e8" opacity=".95" class="gl"/></g>
<g transform="translate(540,130)"><polygon points="20,0 36,12 40,34 26,52 10,52 0,34 6,12" fill="#201c40" stroke="#4040a8" stroke-width=".9"/><polygon points="20,0 36,12 20,26" fill="#2c2860" stroke="#5050c0" stroke-width=".8"/><circle cx="20" cy="26" r="2.8" fill="#8880d8" opacity=".9" class="pl"/></g>
<g transform="translate(510,165)"><polygon points="14,0 26,8 30,26 18,40 8,40 0,26 4,8" fill="#1c1838" stroke="#3838a0" stroke-width=".8"/><circle cx="14" cy="20" r="2" fill="#7070c8" opacity=".8" class="pl2"/></g>
<ellipse cx="530" cy="320" rx="72" ry="10" fill="#4840b0" opacity=".15" class="pl"/>
<!-- 窓枠の跡（凹み） -->
<g onclick="handleSpotClick('window_frame')" class="hs">
  <rect x="250" y="100" width="160" height="130" rx="4" fill="#0a0818" stroke="${illuminated?'#EF9F27':'#2e2658'}" stroke-width="${illuminated?'2':'1.5'}"/>
  <rect x="258" y="108" width="144" height="114" rx="2" fill="#06040d"/>
  <!-- 金属フレームの光沢 -->
  <rect x="250" y="100" width="160" height="8" rx="2" fill="#2a2650" opacity=".8"/>
  <rect x="250" y="222" width="160" height="8" rx="2" fill="#2a2650" opacity=".8"/>
  <rect x="250" y="100" width="8" height="130" rx="2" fill="#2a2650" opacity=".8"/>
  <rect x="402" y="100" width="8" height="130" rx="2" fill="#2a2650" opacity=".8"/>
  ${illuminated ? `<ellipse cx="330" cy="165" rx="60" ry="50" fill="#EF9F27" opacity=".08"/>
  <text x="330" y="158" text-anchor="middle" font-size="10" fill="#EF9F27" opacity=".9" font-family="sans-serif">光が差し込んでいる</text>
  <text x="330" y="178" text-anchor="middle" font-size="14" fill="#EF9F27" opacity=".7" font-family="sans-serif">○ ▲ ◆</text>` : `<text x="330" y="165" text-anchor="middle" font-size="10" fill="#534AB7" opacity=".5" font-family="sans-serif">かつて窓があった凹み</text>`}
  <rect x="250" y="100" width="160" height="130" fill="#534AB7" opacity="0" class="ho" rx="4"/>
</g>
<!-- 石板の破片 -->
${!fragTaken ? `
<g onclick="handleSpotClick('stone_fragment')" class="hs" transform="translate(120,276)">
  <polygon points="0,20 30,0 60,8 70,30 50,44 20,44" fill="#2a2850" stroke="#534AB7" stroke-width="1"/>
  <text x="10" y="22" font-size="7" fill="#c8c0e8" opacity=".7" font-family="sans-serif">速き者が先</text>
  <text x="6" y="33" font-size="7" fill="#c8c0e8" opacity=".7" font-family="sans-serif">遅き者が後</text>
  <text x="72" y="4" font-size="18" fill="#EF9F27" class="pl">!</text>
  <rect x="-10" y="-4" width="100" height="56" fill="#534AB7" opacity="0" class="ho"/>
</g>` : `
<g transform="translate(120,276)">
  <polygon points="0,20 30,0 60,8 70,30 50,44 20,44" fill="#1a1830" stroke="#2e2658" stroke-width="1" opacity=".5"/>
  <text x="28" y="48" font-size="12" fill="#1D9E75">✓</text>
</g>`}
<rect x="0" y="80" width="680" height="240" fill="#1a1730" opacity=".05"/>
</svg>`;
    },
    spots: [
      {
        id: 'crystal_group_right',
        label: '結晶群',
        inspect() {
          showDialog('こちらの結晶は点滅している。○が最も速く、▲が次、◆がゆっくりと瞬いている。');
        },
      },
      {
        id: 'stone_fragment',
        label: '石板の破片',
        inspect() {
          if (state.flags.stoneFragmentTaken) {
            showDialog('すでに拾った。');
          } else {
            state.flags.stoneFragmentTaken = true;
            addItem('stone_fragment');
            triggerSFX('item_get');
            loadScene(state.currentView);
            showDialog('床に落ちた石板の破片。「速き者が先、遅き者が後」と刻まれている。「結晶片」を手に入れた。');
          }
        },
      },
      {
        id: 'window_frame',
        label: '窓枠の跡',
        inspect() {
          if (state.flags.windowIlluminated) {
            showDialog('光が床の封印紋を照らしている。○ ▲ ◆ の順が読めた。正面に戻って確かめよう。');
          } else {
            showDialog('かつて窓があった凹み。金属の光沢が残っている。光を当てれば何か反射するかもしれない。');
          }
        },
        canUse(itemId) { return itemId === 'lit_candle' && !state.flags.windowIlluminated; },
        use(itemId) {
          state.flags.windowIlluminated = true;
          state.flags.overlayRead = true;
          triggerSFX('item_use');
          loadScene(state.currentView);
          showDialog('燭台の炎が窓枠の金属に反射し、床の封印紋を照らした。霧越しに記号の順番が読める——○、▲、◆');
        },
      },
    ],
  },
  back: {
    label: VIEW_LABELS.back,
    render(state) {
      const f = state.flags;
      return `<svg width="100%" viewBox="0 0 680 400" xmlns="http://www.w3.org/2000/svg">
<style>
@keyframes sc_pulse{0%,100%{opacity:.5}50%{opacity:1}}
@keyframes sc_pulse2{0%,100%{opacity:.3}50%{opacity:.8}}
@keyframes sc_glow{0%,100%{opacity:.6}50%{opacity:1}}
@keyframes sc_m2{0%,100%{transform:translateX(0)}50%{transform:translateX(-10px)}}
@media(prefers-reduced-motion:no-preference){.gl{animation:sc_glow 3s ease-in-out infinite}.pl{animation:sc_pulse 4s ease-in-out infinite}.pl2{animation:sc_pulse2 5s ease-in-out infinite 1s}.m2{animation:sc_m2 10s ease-in-out infinite}}
.hs{cursor:pointer}.ho{opacity:0;transition:opacity .18s}.hs:hover .ho{opacity:1}
</style>
<rect width="680" height="400" fill="#06040d"/>
<polygon points="0,0 680,0 680,80 0,80" fill="#09070f"/>
<rect x="0" y="80" width="680" height="240" fill="#0f0d1e"/>
<polygon points="0,320 680,320 680,400 0,400" fill="#08060f"/>
<!-- 石壁 -->
<rect x="0" y="80" width="88" height="32" fill="#131128" stroke="#0a0818" stroke-width=".5"/><rect x="88" y="80" width="96" height="32" fill="#141229" stroke="#0a0818" stroke-width=".5"/><rect x="184" y="80" width="80" height="32" fill="#121027" stroke="#0a0818" stroke-width=".5"/><rect x="264" y="80" width="100" height="32" fill="#13112a" stroke="#0a0818" stroke-width=".5"/><rect x="364" y="80" width="88" height="32" fill="#111026" stroke="#0a0818" stroke-width=".5"/><rect x="452" y="80" width="96" height="32" fill="#141229" stroke="#0a0818" stroke-width=".5"/><rect x="548" y="80" width="132" height="32" fill="#121128" stroke="#0a0818" stroke-width=".5"/>
<rect x="0" y="112" width="104" height="30" fill="#111026" stroke="#0a0818" stroke-width=".5"/><rect x="104" y="112" width="80" height="30" fill="#13112a" stroke="#0a0818" stroke-width=".5"/><rect x="184" y="112" width="96" height="30" fill="#100f24" stroke="#0a0818" stroke-width=".5"/><rect x="280" y="112" width="88" height="30" fill="#141228" stroke="#0a0818" stroke-width=".5"/><rect x="368" y="112" width="96" height="30" fill="#12102a" stroke="#0a0818" stroke-width=".5"/><rect x="464" y="112" width="80" height="30" fill="#111027" stroke="#0a0818" stroke-width=".5"/><rect x="544" y="112" width="136" height="30" fill="#131228" stroke="#0a0818" stroke-width=".5"/>
<rect x="0" y="142" width="88" height="32" fill="#12102a" stroke="#0a0818" stroke-width=".5"/><rect x="88" y="142" width="96" height="32" fill="#100f25" stroke="#0a0818" stroke-width=".5"/><rect x="184" y="142" width="80" height="32" fill="#141229" stroke="#0a0818" stroke-width=".5"/><rect x="264" y="142" width="104" height="32" fill="#111028" stroke="#0a0818" stroke-width=".5"/><rect x="368" y="142" width="88" height="32" fill="#13112b" stroke="#0a0818" stroke-width=".5"/><rect x="456" y="142" width="96" height="32" fill="#120f26" stroke="#0a0818" stroke-width=".5"/><rect x="552" y="142" width="128" height="32" fill="#141329" stroke="#0a0818" stroke-width=".5"/>
<rect x="0" y="174" width="96" height="30" fill="#131029" stroke="#0a0818" stroke-width=".5"/><rect x="96" y="174" width="80" height="30" fill="#11102a" stroke="#0a0818" stroke-width=".5"/><rect x="176" y="174" width="104" height="30" fill="#130f27" stroke="#0a0818" stroke-width=".5"/><rect x="280" y="174" width="88" height="30" fill="#14122b" stroke="#0a0818" stroke-width=".5"/><rect x="368" y="174" width="96" height="30" fill="#100e25" stroke="#0a0818" stroke-width=".5"/><rect x="464" y="174" width="80" height="30" fill="#131128" stroke="#0a0818" stroke-width=".5"/><rect x="544" y="174" width="136" height="30" fill="#120f29" stroke="#0a0818" stroke-width=".5"/>
<rect x="0" y="204" width="88" height="32" fill="#110f27" stroke="#0a0818" stroke-width=".5"/><rect x="88" y="204" width="96" height="32" fill="#14122a" stroke="#0a0818" stroke-width=".5"/><rect x="184" y="204" width="80" height="32" fill="#131028" stroke="#0a0818" stroke-width=".5"/><rect x="264" y="204" width="100" height="32" fill="#100f26" stroke="#0a0818" stroke-width=".5"/><rect x="364" y="204" width="96" height="32" fill="#14112b" stroke="#0a0818" stroke-width=".5"/><rect x="460" y="204" width="80" height="32" fill="#120f27" stroke="#0a0818" stroke-width=".5"/><rect x="540" y="204" width="140" height="32" fill="#131229" stroke="#0a0818" stroke-width=".5"/>
<rect x="0" y="236" width="96" height="32" fill="#131128" stroke="#0a0818" stroke-width=".5"/><rect x="96" y="236" width="80" height="32" fill="#100e24" stroke="#0a0818" stroke-width=".5"/><rect x="176" y="236" width="104" height="32" fill="#13112a" stroke="#0a0818" stroke-width=".5"/><rect x="280" y="236" width="88" height="32" fill="#141229" stroke="#0a0818" stroke-width=".5"/><rect x="368" y="236" width="96" height="32" fill="#111027" stroke="#0a0818" stroke-width=".5"/><rect x="464" y="236" width="80" height="32" fill="#120f28" stroke="#0a0818" stroke-width=".5"/><rect x="544" y="236" width="136" height="32" fill="#14122a" stroke="#0a0818" stroke-width=".5"/>
<rect x="0" y="268" width="88" height="30" fill="#12102a" stroke="#0a0818" stroke-width=".5"/><rect x="88" y="268" width="96" height="30" fill="#100f25" stroke="#0a0818" stroke-width=".5"/><rect x="184" y="268" width="80" height="30" fill="#141229" stroke="#0a0818" stroke-width=".5"/><rect x="264" y="268" width="104" height="30" fill="#111028" stroke="#0a0818" stroke-width=".5"/><rect x="368" y="268" width="88" height="30" fill="#13112b" stroke="#0a0818" stroke-width=".5"/><rect x="456" y="268" width="96" height="30" fill="#120f26" stroke="#0a0818" stroke-width=".5"/><rect x="552" y="268" width="128" height="30" fill="#141329" stroke="#0a0818" stroke-width=".5"/>
<!-- 石板（中央） -->
<g onclick="handleSpotClick('stone_tablet')" class="hs">
  <rect x="240" y="88" width="200" height="210" rx="4" fill="#12102a" stroke="${f.tabletRevealed?'#7F77DD':'#2e2658'}" stroke-width="${f.tabletRevealed?'2':'1.5'}"/>
  ${f.tabletRevealed ? `
    <text x="340" y="155" text-anchor="middle" font-size="13" fill="#c8c0e8" font-family="'Noto Serif JP',serif" letter-spacing="1">重ねれば</text>
    <text x="340" y="185" text-anchor="middle" font-size="13" fill="#c8c0e8" font-family="'Noto Serif JP',serif" letter-spacing="1">霧も晴れる</text>
    <line x1="270" y1="200" x2="410" y2="200" stroke="#534AB7" stroke-width=".8" opacity=".5"/>
    <text x="340" y="230" text-anchor="middle" font-size="10" fill="#7F77DD" font-family="sans-serif" opacity=".8">炎で照らされた刻文</text>` : `
    <text x="340" y="160" text-anchor="middle" font-size="10" fill="#534AB7" opacity=".5" font-family="sans-serif">霧で霞んでいる…</text>
    <line x1="270" y1="175" x2="410" y2="175" stroke="#2e2658" stroke-width=".5" opacity=".4"/>
    <line x1="270" y1="195" x2="410" y2="195" stroke="#2e2658" stroke-width=".5" opacity=".4"/>
    <line x1="270" y1="215" x2="410" y2="215" stroke="#2e2658" stroke-width=".5" opacity=".3"/>
    ${!f.tabletRevealed ? '<text x="432" y="92" font-size="18" fill="#EF9F27" class="pl">!</text>' : ''}`}
  <rect x="240" y="88" width="200" height="210" fill="#534AB7" opacity="0" class="ho" rx="4"/>
</g>
<!-- 苔むした床（石板下） -->
<g onclick="handleSpotClick('mossy_floor')" class="hs">
  <ellipse cx="340" cy="325" rx="90" ry="12" fill="#1a3020" stroke="#2a4030" stroke-width="1"/>
  <ellipse cx="310" cy="322" rx="20" ry="6" fill="#1e3824" opacity=".7"/>
  <ellipse cx="370" cy="326" rx="16" ry="5" fill="#1c3422" opacity=".6"/>
  <ellipse cx="340" cy="325" rx="90" ry="12" fill="#534AB7" opacity="0" class="ho"/>
</g>
<!-- 古い壺 -->
<g onclick="handleSpotClick('oil_jar')" class="hs" transform="translate(560,240)">
  <ellipse cx="36" cy="72" rx="36" ry="8" fill="#2a1e10" opacity=".8"/>
  <path d="M12,72 Q8,40 16,20 Q24,4 36,4 Q48,4 56,20 Q64,40 60,72 Z" fill="#5a4830" stroke="#3a2e1a" stroke-width="1.5"/>
  <path d="M24,8 Q36,2 48,8" fill="none" stroke="#7a6848" stroke-width="2"/>
  <ellipse cx="36" cy="4" rx="12" ry="5" fill="#4a3820" stroke="#3a2810" stroke-width="1"/>
  ${!state.flags.oilJarTaken ? `<text x="56" y="-4" font-size="18" fill="#EF9F27" class="pl">!</text>` : `<text x="52" y="-4" font-size="14" fill="#1D9E75">✓</text>`}
  <rect x="-4" y="-8" width="80" height="90" fill="#534AB7" opacity="0" class="ho"/>
</g>
<!-- 霧 -->
<g class="m2"><ellipse cx="340" cy="140" rx="200" ry="30" fill="#c8c0e8" opacity=".035"/></g>
<g class="m2"><ellipse cx="340" cy="220" rx="180" ry="28" fill="#c0b8e0" opacity=".040"/></g>
<rect x="0" y="80" width="680" height="240" fill="#1a1730" opacity=".05"/>
</svg>`;
    },
    spots: [
      {
        id: 'oil_jar',
        label: '古い壺',
        inspect() {
          if (state.flags.oilJarTaken) {
            showDialog('もう油は取り出した。');
          } else {
            state.flags.oilJarTaken = true;
            addItem('oil_jar');
            triggerSFX('item_get');
            loadScene(state.currentView);
            showDialog('古い壺。蓋を開けると油が入っていた。「油の壺」を手に入れた。');
          }
        },
      },
      {
        id: 'stone_tablet',
        label: '石板',
        inspect() {
          const f = state.flags;
          if (f.rubbingDone) {
            showDialog('拓本は取り終えた。');
          } else if (f.tabletRevealed) {
            showDialog('「重ねれば 霧も晴れる」と刻まれている。写し紙で拓本を取れるかもしれない。');
          } else {
            showDialog('壁に埋め込まれた大きな石板。霧のせいで文字が霞んで読めない。何か光るものがあれば……');
          }
        },
        canUse(itemId) {
          const f = state.flags;
          if (itemId === 'lit_candle' && !f.tabletRevealed) return true;
          if (itemId === 'mist_paper' && f.tabletRevealed && !f.rubbingDone) return true;
          return false;
        },
        use(itemId) {
          if (itemId === 'lit_candle') {
            state.flags.tabletRevealed = true;
            loadScene(state.currentView);
            showDialog('燭台の炎を近づけると、霧が晴れて石板の文字が浮かび上がった。「重ねれば 霧も晴れる」');
          } else if (itemId === 'mist_paper') {
            state.flags.rubbingDone = true;
            removeItem('mist_paper');
            addItem('rubbing');
            triggerSFX('combine');
            loadScene(state.currentView);
            showDialog('霧の写し紙を石板に押し当てると、文字が写し取られた。「石板の拓本」を手に入れた。');
          }
        },
      },
      {
        id: 'mossy_floor',
        label: '苔むした床',
        inspect() {
          showDialog('床の苔の模様が、正面の封印紋と同じ形をしている。正面の床と繋がっているのかもしれない。');
        },
      },
    ],
  },

  corridor: {
    label: VIEW_LABELS.corridor,
    render(state) {
      const seen = state.flags.paintingsSeen || [];
      const allSeen = state.flags.allPaintingsSeen;
      const paintingData = [
        { id: 'p1', x: 40,  y: 100, w: 120, h: 90,  side: 'L', title: '孤独な影',           seen: seen.includes('p1') },
        { id: 'p2', x: 40,  y: 210, w: 120, h: 90,  side: 'L', title: '遠くの光',           seen: seen.includes('p2') },
        { id: 'p3', x: 520, y: 100, w: 120, h: 90,  side: 'R', title: '並んで歩く2つの影', seen: seen.includes('p3') },
        { id: 'p4', x: 520, y: 210, w: 120, h: 90,  side: 'R', title: '光の中へ飛び出す瞬間', seen: seen.includes('p4') },
      ];
      const paintingSVGs = paintingData.map(p => `
        <g onclick="handleSpotClick('${p.id}')" class="hs">
          <rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="2" fill="#0c0a1e" stroke="${p.seen?'#534AB7':'#2e2658'}" stroke-width="${p.seen?'1.5':'1'}"/>
          <rect x="${p.x+4}" y="${p.y+4}" width="${p.w-8}" height="${p.h-8}" fill="#08060f"/>
          ${p.id==='p1' ? `<ellipse cx="${p.x+p.w/2}" cy="${p.y+p.h/2+10}" rx="12" ry="28" fill="#1a1530" opacity=".9"/><ellipse cx="${p.x+p.w/2}" cy="${p.y+12}" rx="8" ry="8" fill="#1a1530" opacity=".8"/>` : ''}
          ${p.id==='p2' ? `<ellipse cx="${p.x+p.w/2}" cy="${p.y+24}" rx="18" ry="18" fill="#534AB7" opacity=".15"/><ellipse cx="${p.x+p.w/2}" cy="${p.y+24}" rx="8" ry="8" fill="#7F77DD" opacity=".25"/>` : ''}
          ${p.id==='p3' ? `<ellipse cx="${p.x+p.w/2-10}" cy="${p.y+p.h/2+8}" rx="8" ry="24" fill="#1a1530" opacity=".9"/><ellipse cx="${p.x+p.w/2+10}" cy="${p.y+p.h/2+8}" rx="8" ry="24" fill="#2a1e40" opacity=".9"/>` : ''}
          ${p.id==='p4' ? `<ellipse cx="${p.x+p.w/2}" cy="${p.y+12}" rx="24" ry="24" fill="#EF9F27" opacity=".12"/><ellipse cx="${p.x+p.w/2-4}" cy="${p.y+p.h/2+8}" rx="9" ry="22" fill="#1a1530" opacity=".8"/>` : ''}
          <text x="${p.x+p.w/2}" y="${p.y+p.h+14}" text-anchor="middle" font-size="8" fill="${p.seen?'#7F77DD':'#534AB7'}" font-family="sans-serif">${p.title}</text>
          ${!p.seen ? `<text x="${p.x+p.w}" y="${p.y}" font-size="16" fill="#EF9F27">!</text>` : `<text x="${p.x+p.w-8}" y="${p.y+14}" font-size="12" fill="#1D9E75">✓</text>`}
          <rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="#534AB7" opacity="0" class="ho" rx="2"/>
        </g>`).join('');
      return `<svg width="100%" viewBox="0 0 680 400" xmlns="http://www.w3.org/2000/svg">
<style>.hs{cursor:pointer}.ho{opacity:0;transition:opacity .18s}.hs:hover .ho{opacity:1}</style>
<rect width="680" height="400" fill="#06040d"/>
<!-- 回廊パース -->
<polygon points="0,0 200,80 200,320 0,400" fill="#0d0b1a"/>
<polygon points="680,0 480,80 480,320 680,400" fill="#0d0b1a"/>
<polygon points="200,80 480,80 480,320 200,320" fill="#0f0d1e"/>
<polygon points="0,0 680,0 480,80 200,80" fill="#09070f"/>
<polygon points="0,400 680,400 480,320 200,320" fill="#08060f"/>
<!-- 奥の扉 -->
<rect x="300" y="130" width="80" height="110" rx="3" fill="#07050e" stroke="#2e2658" stroke-width="1.5"/>
<path d="M308,130 Q340,118 372,130" fill="none" stroke="#534AB7" stroke-width="1"/>
<circle cx="340" cy="185" r="4" fill="#534AB7" opacity=".5"/>
<!-- 壁の装飾ライン -->
<line x1="200" y1="80" x2="200" y2="320" stroke="#1a163a" stroke-width="1.5"/>
<line x1="480" y1="80" x2="480" y2="320" stroke="#1a163a" stroke-width="1.5"/>
<line x1="200" y1="80" x2="480" y2="80" stroke="#1a163a" stroke-width="1.5"/>
<line x1="200" y1="320" x2="480" y2="320" stroke="#1a163a" stroke-width="1.5"/>
${paintingSVGs}
<!-- ムィストラの間へ -->
<g onclick="handleSpotClick('enter_muistora')" class="hs">
  <rect x="300" y="130" width="80" height="110" fill="#534AB7" opacity="0"/>
  <rect x="300" y="130" width="80" height="110" fill="#7F77DD" class="ho" opacity=".1" rx="2"/>
</g>
${allSeen ? '' : `<text x="340" y="370" text-anchor="middle" font-size="10" fill="#534AB7" opacity=".7" font-family="sans-serif">壁画を全て調べよ（${seen.length}/4）</text>`}
</svg>`;
    },
    spots: [
      {
        id: 'p1', label: '壁画：孤独な影',
        inspect() {
          if (!state.flags.paintingsSeen) state.flags.paintingsSeen = [];
          if (!state.flags.paintingsSeen.includes('p1')) {
            state.flags.paintingsSeen.push('p1');
            if (state.flags.paintingsSeen.length >= 4) state.flags.allPaintingsSeen = true;
            loadScene(state.currentView);
          }
          showDialog('【壁画：孤独な影】\n霧の中に一人佇む影が描かれている。誰かを待っているようにも、諦めているようにも見える。孤独の重さが伝わってくる。');
        },
      },
      {
        id: 'p2', label: '壁画：遠くの光',
        inspect() {
          if (!state.flags.paintingsSeen) state.flags.paintingsSeen = [];
          if (!state.flags.paintingsSeen.includes('p2')) {
            state.flags.paintingsSeen.push('p2');
            if (state.flags.paintingsSeen.length >= 4) state.flags.allPaintingsSeen = true;
            loadScene(state.currentView);
          }
          showDialog('【壁画：遠くの光】\n深い霧の奥に、かすかな光の点が描かれている。届かない距離にある希望——あるいは、記憶の中の何かのようだ。');
        },
      },
      {
        id: 'p3', label: '壁画：並んで歩く2つの影',
        inspect() {
          if (!state.flags.paintingsSeen) state.flags.paintingsSeen = [];
          if (!state.flags.paintingsSeen.includes('p3')) {
            state.flags.paintingsSeen.push('p3');
            if (state.flags.paintingsSeen.length >= 4) state.flags.allPaintingsSeen = true;
            loadScene(state.currentView);
          }
          showDialog('【壁画：並んで歩く2つの影】\n二つの影が並んで霧の中を歩いている。一方は霧の存在、もう一方は迷い込んだ者——長い孤独の果てに、やっと誰かがいる。');
        },
      },
      {
        id: 'p4', label: '壁画：光の中へ飛び出す瞬間',
        inspect() {
          if (!state.flags.paintingsSeen) state.flags.paintingsSeen = [];
          if (!state.flags.paintingsSeen.includes('p4')) {
            state.flags.paintingsSeen.push('p4');
            if (state.flags.paintingsSeen.length >= 4) state.flags.allPaintingsSeen = true;
            loadScene(state.currentView);
          }
          showDialog('【壁画：光の中へ飛び出す瞬間】\n一つの影が光の中へと踏み出している。もう一方の影は霧の中に残り、それを見送っている。別れの絵——しかし悲しみではなく、解放の瞬間が描かれているようだ。');
        },
      },
      {
        id: 'enter_muistora', label: 'ムィストラの間へ',
        inspect() {
          if (!state.flags.allPaintingsSeen) {
            showDialog('……まず、私の記憶を見よ。\n（壁画を全て調べよう）');
          } else {
            loadScene('muistora');
          }
        },
      },
    ],
  },
  muistora: {
    label: VIEW_LABELS.muistora,
    render(state) {
      const dlgIdx = state.flags.muistraDialogue || 0;
      const dlg = MUISTRA_DIALOGUE[dlgIdx];
      const allSeen = state.flags.allPaintingsSeen;
      return `<svg width="100%" viewBox="0 0 680 400" xmlns="http://www.w3.org/2000/svg">
<style>
@keyframes sc_pulse{0%,100%{opacity:.5}50%{opacity:1}}
@keyframes sc_pulse2{0%,100%{opacity:.3}50%{opacity:.8}}
@keyframes sc_glow{0%,100%{opacity:.6}50%{opacity:1}}
@keyframes sc_float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes sc_mist{0%,100%{transform:scale(1) rotate(0deg)}50%{transform:scale(1.06) rotate(2deg)}}
@media(prefers-reduced-motion:no-preference){
  .gl{animation:sc_glow 3s ease-in-out infinite}
  .pl{animation:sc_pulse 4s ease-in-out infinite}
  .pl2{animation:sc_pulse2 5s ease-in-out infinite 1s}
  .sc-float{animation:sc_float 4s ease-in-out infinite}
  .sc-mist{animation:sc_mist 8s ease-in-out infinite}}
.hs{cursor:pointer}.ho{opacity:0;transition:opacity .18s}.hs:hover .ho{opacity:1}
</style>
<rect width="680" height="400" fill="#06040d"/>
<!-- 霧の広がり -->
<ellipse cx="340" cy="200" rx="320" ry="180" fill="#1a1540" opacity=".15" class="sc-mist"/>
<ellipse cx="340" cy="200" rx="220" ry="130" fill="#2a2060" opacity=".12" class="sc-mist"/>
<!-- 魔法陣 -->
<circle cx="340" cy="200" r="140" fill="none" stroke="#2e2658" stroke-width="1" class="pl"/>
<circle cx="340" cy="200" r="110" fill="none" stroke="#3d3578" stroke-width=".8" class="pl2"/>
<circle cx="340" cy="200" r="80"  fill="none" stroke="#534AB7" stroke-width=".6" class="pl"/>
<polygon points="340,72 428,256 252,256" fill="none" stroke="#2e2658" stroke-width=".8" class="pl2"/>
<polygon points="340,328 252,144 428,144" fill="none" stroke="#2e2658" stroke-width=".6" class="pl"/>
<!-- ムィストラの実体（霧の揺らぎ） -->
<g class="sc-float">
  <ellipse cx="340" cy="160" rx="52" ry="68" fill="#1e1840" opacity=".7"/>
  <ellipse cx="340" cy="160" rx="38" ry="52" fill="#28224e" opacity=".6"/>
  <ellipse cx="340" cy="120" rx="26" ry="26" fill="#2e2858" opacity=".8"/>
  <!-- 目 -->
  <ellipse cx="330" cy="148" rx="7" ry="9" fill="#7F77DD" opacity=".9" class="gl"/>
  <ellipse cx="350" cy="148" rx="7" ry="9" fill="#7F77DD" opacity=".9" class="gl"/>
  <ellipse cx="330" cy="149" rx="4" ry="5" fill="#c8c0e8" opacity=".8"/>
  <ellipse cx="350" cy="149" rx="4" ry="5" fill="#c8c0e8" opacity=".8"/>
  <!-- 霧の尾 -->
  <path d="M310,200 Q300,230 315,260 Q330,290 340,300" stroke="#534AB7" stroke-width="1.5" fill="none" opacity=".4"/>
  <path d="M370,200 Q380,230 365,260 Q350,290 340,300" stroke="#534AB7" stroke-width="1.5" fill="none" opacity=".4"/>
  <!-- 光のオーラ -->
  <ellipse cx="340" cy="160" rx="65" ry="80" fill="#534AB7" opacity=".06" class="pl2"/>
</g>
<!-- 名前 -->
<text x="340" y="340" text-anchor="middle" font-size="13" fill="#7F77DD" letter-spacing="3" font-family="'Noto Serif JP',serif">ムィストラ</text>
<line x1="260" y1="348" x2="420" y2="348" stroke="#534AB7" stroke-width=".5" opacity=".6"/>
<!-- 話しかけるボタン -->
<g onclick="handleSpotClick('muistora_entity')" class="hs">
  <rect x="220" y="356" width="200" height="36" rx="3" fill="#0f0d1e" stroke="#534AB7" stroke-width="1.2"/>
  <text x="320" y="379" text-anchor="middle" font-size="13" fill="#7F77DD" letter-spacing="2" font-family="'Noto Serif JP',serif">話しかける</text>
  <rect x="220" y="356" width="200" height="36" fill="#534AB7" opacity="0" class="ho" rx="3"/>
</g>
<!-- 戻るボタン -->
<g onclick="handleSpotClick('corridor_back')" class="hs">
  <rect x="20" y="356" width="100" height="36" rx="3" fill="#0f0d1e" stroke="#2e2658" stroke-width="1"/>
  <text x="70" y="379" text-anchor="middle" font-size="11" fill="#7F77DD" font-family="sans-serif">← 回廊へ</text>
  <rect x="20" y="356" width="100" height="36" fill="#534AB7" opacity="0" class="ho" rx="3"/>
</g>
</svg>`;
    },
    spots: [
      {
        id: 'muistora_entity',
        label: 'ムィストラ',
        inspect() { startMuistraDialogue(); },
      },
      {
        id: 'corridor_back',
        label: '回廊へ戻る',
        inspect() { loadScene('corridor'); },
      },
    ],
  },
};

// ===== HINT =====
function getHint() {
  const f = state.flags;
  const inv = state.inventory;

  if (!inv.includes('mist_paper'))
    return '正面の天井の霧を調べてみよう';
  if (!inv.includes('candle'))
    return '左の壁にある燭台を調べてみよう';
  if (!inv.includes('oil_jar'))
    return '後ろの壁にある壺を調べてみよう';
  if (!inv.includes('lit_candle'))
    return 'インベントリで燭台と油の壺を選んで合成してみよう';
  if (!f.tabletRevealed)
    return '火のついた燭台を後ろ壁の石板に使ってみよう';
  if (!inv.includes('rubbing'))
    return '霧の写し紙を後ろ壁の石板に使って拓本を取ろう';
  if (!inv.includes('overlay_sheet'))
    return 'インベントリで霧の写し紙と石板の拓本を合成しよう';
  if (!f.windowIlluminated)
    return '火のついた燭台を右壁の窓枠に使ってみよう';
  if (!f.overlayRead)
    return '重ね合わせの紙をインベントリで確認しよう';
  if (!inv.includes('stone_fragment'))
    return '右の壁の石板の破片を拾おう';
  if (f.symbolOrder.length < 3)
    return '正面の扉のシンボルを ○→▲→◆ の順でタップしよう';
  if (!inv.includes('magic_stone'))
    return '正面の扉を調べると魔石が外れるはずだ';
  if (!inv.includes('crystal_key'))
    return 'インベントリで結晶片と扉の魔石を合成しよう';
  if (!f.doorUnlocked)
    return '結晶の鍵を扉に使おう';
  if (state.currentView !== 'corridor' && state.currentView !== 'muistora')
    return '扉が開いた。先に進もう';
  if (!f.allPaintingsSeen)
    return '回廊の壁画を全て調べよう（4枚）';
  if (f.muistraDialogue === 0)
    return 'ムィストラに話しかけよう';
  if (f.muistraDialogue === 1)
    return '第一の問い：迷子として素直に答えよう';
  if (f.muistraDialogue === 2)
    return '第二の問い：壁画「孤独な影」を思い出そう';
  if (f.muistraDialogue === 3)
    return '第三の問い：壁画「光の中へ飛び出す瞬間」を思い出そう';
  return 'よく探索できている。先に進もう';
}

// ===== SCENE ACCESSOR =====
function getScene(viewId) { return SCENES[viewId] || SCENES.front; }
