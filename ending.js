// ===== ending.js: エンディング演出 =====

'use strict';

// ===== エンディングデータ =====
const ENDINGS = {
  good: {
    title: '霧の晴れる朝',
    subtitle: 'TRUE END',
    color: '#7F77DD',
    glowColor: 'rgba(127,119,221,0.4)',
    lines: [
      'ムイスタの導きで、二人は回廊の奥へと進んだ。',
      '霧の核——深紫の水晶が浮かぶその場所で、',
      'あなたは拓本に刻まれた呪文を唱えた。',
      '',
      '水晶は震え、砕け、霧が渦を巻いて消えていく。',
      '',
      '差し込んできたのは、久しく見ていなかった',
      '青空のひかりだった。',
      '',
      'ムイスタは静かに微笑んだ。',
      '「……よくやった。この牢獄の呪いは解けた。」',
      '',
      '霧纏いし牢獄から、あなたは脱出した。',
    ],
    epilogue: '〔了〕',
  },
  bad: {
    title: '霧の中に消えて',
    subtitle: 'BAD END',
    color: '#534AB7',
    glowColor: 'rgba(83,74,183,0.3)',
    lines: [
      '霧は深まるばかりで、出口は見つからない。',
      'ムイスタの声も、遠ざかっていく。',
      '',
      'あなたは霧に包まれた。',
    ],
    epilogue: '〔END〕',
  },
};

// ===== エンディング描画 =====
function renderEnding(type, gameState) {
  const data = ENDINGS[type] || ENDINGS.good;
  const screen = document.getElementById('ending-screen');

  screen.innerHTML = `
    <div class="ending-wrapper" id="ending-wrapper">
      <canvas id="ending-canvas" style="position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;"></canvas>
      <div class="ending-inner" id="ending-inner" style="opacity:0;">
        <div class="ending-subtitle" style="color:${data.color}">${data.subtitle}</div>
        <svg class="ending-title-svg" viewBox="0 0 320 80" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="endGlow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <linearGradient id="endGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#c8c0e8"/>
              <stop offset="50%" stop-color="${data.color}"/>
              <stop offset="100%" stop-color="#c8c0e8"/>
            </linearGradient>
          </defs>
          <text x="160" y="52" text-anchor="middle"
                font-family="'Noto Serif JP', serif"
                font-size="24" fill="url(#endGrad)"
                filter="url(#endGlow)" letter-spacing="4">${data.title}</text>
        </svg>
        <div class="ending-divider" style="background:${data.color}"></div>
        <div class="ending-text" id="ending-text"></div>
        <div class="ending-epilogue" id="ending-epilogue" style="color:${data.color};opacity:0">${data.epilogue}</div>
        <div class="ending-stats" id="ending-stats" style="opacity:0">
          ${renderStats(gameState)}
        </div>
        <button class="ending-restart-btn" onclick="restartGame()" style="opacity:0;border-color:${data.color};color:${data.color}" id="ending-restart">
          もう一度プレイ
        </button>
      </div>
    </div>
  `;

  injectEndingStyles();
  startEndingParticles(data, type);
  startEndingAnimation(data);
}

// ===== エンディングスタイル注入 =====
function injectEndingStyles() {
  if (document.getElementById('ending-style')) return;
  const style = document.createElement('style');
  style.id = 'ending-style';
  style.textContent = `
    .ending-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding: 0;
      position: relative;
      overflow-x: hidden;
    }
    .ending-inner {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px 24px 40px;
      width: 100%;
      max-width: 480px;
      margin: 0 auto;
      gap: 0;
      transition: opacity 1s ease;
    }
    .ending-subtitle {
      font-family: sans-serif;
      font-size: 11px;
      letter-spacing: 6px;
      margin-bottom: 12px;
      opacity: 0.8;
    }
    .ending-title-svg {
      width: min(320px, 90vw);
      height: auto;
      margin-bottom: 8px;
    }
    .ending-divider {
      width: 120px;
      height: 1px;
      opacity: 0.5;
      margin: 16px auto 24px;
    }
    .ending-text {
      font-family: 'Noto Serif JP', serif;
      font-size: 14px;
      line-height: 2;
      color: #c8c0e8;
      text-align: center;
      width: 100%;
      white-space: pre-wrap;
      min-height: 200px;
    }
    .ending-epilogue {
      font-family: 'Noto Serif JP', serif;
      font-size: 13px;
      letter-spacing: 3px;
      margin-top: 24px;
      transition: opacity 1.5s ease;
    }
    .ending-stats {
      margin-top: 32px;
      padding: 16px 20px;
      border: 1px solid #2e2658;
      border-radius: 4px;
      background: rgba(15,13,30,0.7);
      font-size: 12px;
      color: #7F77DD;
      line-height: 1.9;
      text-align: left;
      width: 100%;
      transition: opacity 1s ease;
    }
    .ending-stats-title {
      font-size: 11px;
      letter-spacing: 3px;
      color: #534AB7;
      margin-bottom: 8px;
    }
    .ending-restart-btn {
      margin-top: 32px;
      padding: 14px 40px;
      background: transparent;
      border: 1px solid;
      font-family: 'Noto Serif JP', serif;
      font-size: 14px;
      letter-spacing: 4px;
      cursor: pointer;
      border-radius: 3px;
      transition: background 0.2s, opacity 1s ease;
      min-height: 48px;
    }
    .ending-restart-btn:active {
      background: rgba(83,74,183,0.2);
    }
  `;
  document.head.appendChild(style);
}

// ===== エンディングアニメーション =====
function startEndingAnimation(data) {
  const inner = document.getElementById('ending-inner');
  const textEl = document.getElementById('ending-text');
  const epilogueEl = document.getElementById('ending-epilogue');
  const statsEl = document.getElementById('ending-stats');
  const restartBtn = document.getElementById('ending-restart');

  // フェードイン
  setTimeout(() => {
    inner.style.opacity = '1';
  }, 300);

  // テキストをタイプライターで表示
  setTimeout(() => {
    typewriteLines(data.lines, textEl, 0, () => {
      // 全行表示後
      setTimeout(() => {
        epilogueEl.style.opacity = '1';
      }, 600);
      setTimeout(() => {
        statsEl.style.opacity = '1';
      }, 1200);
      setTimeout(() => {
        restartBtn.style.opacity = '1';
      }, 1800);
    });
  }, 1200);
}

function typewriteLines(lines, el, lineIndex, onComplete) {
  if (lineIndex >= lines.length) {
    if (onComplete) onComplete();
    return;
  }
  const line = lines[lineIndex];
  let charIndex = 0;
  el.textContent += (lineIndex > 0 ? '\n' : '');

  if (line === '') {
    el.textContent += '';
    setTimeout(() => typewriteLines(lines, el, lineIndex + 1, onComplete), 200);
    return;
  }

  const timer = setInterval(() => {
    if (charIndex < line.length) {
      el.textContent += line[charIndex];
      charIndex++;
    } else {
      clearInterval(timer);
      setTimeout(() => typewriteLines(lines, el, lineIndex + 1, onComplete), 300);
    }
  }, 60);
}

// ===== パーティクルエフェクト =====
function startEndingParticles(data, type) {
  const canvas = document.getElementById('ending-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = [];
  const count = type === 'good' ? 60 : 30;
  const baseColor = type === 'good' ? [127, 119, 221] : [83, 74, 183];

  for (let i = 0; i < count; i++) {
    particles.push(createParticle(baseColor, type));
  }

  let running = true;
  function animate() {
    if (!running || !document.getElementById('ending-canvas')) {
      running = false;
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
      p.y -= p.vy;
      p.x += Math.sin(p.phase + Date.now() * 0.001) * 0.5;
      p.alpha -= p.fade;
      p.phase += 0.02;
      if (p.alpha <= 0) {
        particles[i] = createParticle(baseColor, type);
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = `rgb(${baseColor[0]},${baseColor[1]},${baseColor[2]})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    requestAnimationFrame(animate);
  }
  animate();
}

function createParticle(baseColor, type) {
  return {
    x: Math.random() * window.innerWidth,
    y: window.innerHeight + Math.random() * 100,
    r: Math.random() * 2.5 + 0.5,
    vy: Math.random() * 0.8 + 0.3,
    alpha: Math.random() * 0.6 + 0.2,
    fade: Math.random() * 0.003 + 0.001,
    phase: Math.random() * Math.PI * 2,
  };
}

// ===== クリア統計 =====
function renderStats(gameState) {
  const f = gameState.flags;
  const inv = gameState.inventory;
  const items = gameState.inventory.length;
  const answer = f.muistraAnswers[0] === '助け' ? '助けを求めた' : '自力を選んだ';

  return `
    <div class="ending-stats-title">— 記録 —</div>
    <div>発見アイテム数：${Object.keys(gameState.inspected || {}).length + inv.length} / 11</div>
    <div>石板の謎：${f.tabletRevealed ? '解読済み ✓' : '未解読'}</div>
    <div>窓の照明：${f.windowIlluminated ? '照らした ✓' : '未実施'}</div>
    <div>ムイスタの選択：${answer}</div>
  `;
}

// ===== リスタート =====
function restartGame() {
  // 状態リセット
  state.currentScene = 'title';
  state.currentView  = 'front';
  state.inventory    = [];
  state.inspected    = {};
  state.selectedItems = [];
  state.flags = {
    candleLit: false,
    tabletRevealed: false,
    rubbingDone: false,
    overlayRead: false,
    windowIlluminated: false,
    symbolOrder: [],
    doorUnlocked: false,
    corridorUnlocked: false,
    muistraDialogue: 0,
    muistraAnswers: [],
  };

  // 画面切り替え
  document.getElementById('ending-screen').classList.add('hidden');
  document.getElementById('ending-screen').innerHTML = '';
  document.getElementById('game-screen').classList.add('hidden');
  document.getElementById('title-screen').classList.remove('hidden');

  // スタイル削除
  const s = document.getElementById('ending-style');
  if (s) s.remove();
}
