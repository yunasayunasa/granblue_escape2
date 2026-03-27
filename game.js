// ===== game.js: 状態管理・メインロジック =====

'use strict';

// ===== ゲーム状態 =====
const state = {
  currentScene: 'title',
  currentView: 'front',
  inventory: [],
  inspected: {},
  selectedItems: [],
  flags: {
    // アイテム取得
    mistPaperTaken: false,
    candleTaken: false,
    oilJarTaken: false,
    stoneFragmentTaken: false,
    // 状態フラグ
    tabletRevealed: false,
    rubbingDone: false,
    overlayRead: false,
    windowIlluminated: false,
    magicStoneRemoved: false,
    // 扉
    symbolOrder: [],
    doorUnlocked: false,
    // 回廊・ネブリア
    paintingsSeen: [],
    allPaintingsSeen: false,
    muistraDialogue: 0,
    muistraAnswers: [],
  },
};

// ===== Web Audio API 効果音 =====
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function triggerSFX(type) {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    switch (type) {
      case 'item_get': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
        break;
      }
      case 'item_use': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now); osc.stop(now + 0.12);
        break;
      }
      case 'combine': {
        [0, 0.1, 0.2].forEach((t, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime([528, 660, 792][i], now + t);
          osc.frequency.linearRampToValueAtTime([660, 792, 1056][i], now + t + 0.2);
          gain.gain.setValueAtTime(0.2, now + t);
          gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.35);
          osc.start(now + t); osc.stop(now + t + 0.35);
        });
        break;
      }
      case 'correct': {
        [0, 0.12, 0.24].forEach((t, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime([523, 659, 784][i], now + t);
          gain.gain.setValueAtTime(0.25, now + t);
          gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.4);
          osc.start(now + t); osc.stop(now + t + 0.4);
        });
        break;
      }
      case 'wrong': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.3);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
        break;
      }
      case 'door_open': {
        [0, 0.15, 0.3].forEach((t) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(80 - t * 20, now + t);
          gain.gain.setValueAtTime(0.3, now + t);
          gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.4);
          osc.start(now + t); osc.stop(now + t + 0.4);
        });
        break;
      }
      case 'text': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now); osc.stop(now + 0.04);
        break;
      }
    }
  } catch (e) {
    // AudioAPI未対応環境では無視
  }
}

// ===== タイトル→ゲーム遷移 =====
function startGame() {
  triggerSFX('correct');
  document.getElementById('title-screen').classList.add('hidden');
  showStoryIntro(() => {
    const game = document.getElementById('game-screen');
    game.classList.remove('hidden');
    state.currentScene = 'game';
    state.currentView  = 'front';
    loadScene('front');
    setupSwipe();
    setupItemInteractions();
  });
}

// ===== ストーリーイントロ =====
const STORY_LINES = [
  '気づいたとき、空が見えなかった。',
  '浮遊する孤島の奥——霧に閉ざされた、古い祠の中。',
  'グランサイファーとはぐれたのか……それとも、霧に引き込まれたのか。',
  '何も覚えていない。ただ、この霧だけが生き物のように揺れている。',
  '——脱出しなければ。',
];

function showStoryIntro(onComplete) {
  const wrapper = document.createElement('div');
  wrapper.className = 'story-intro-wrap';
  document.body.appendChild(wrapper);

  requestAnimationFrame(() => requestAnimationFrame(() => {
    wrapper.style.opacity = '1';
  }));

  setTimeout(() => showStoryLine(wrapper, 0, () => {
    const btn = document.createElement('button');
    btn.className = 'story-proceed-btn';
    btn.textContent = '——扉の前に立つ';
    btn.onclick = () => {
      wrapper.style.opacity = '0';
      setTimeout(() => { wrapper.remove(); onComplete(); }, 600);
    };
    wrapper.appendChild(btn);
  }), 500);
}

function showStoryLine(wrapper, index, onAllDone) {
  if (index >= STORY_LINES.length) { onAllDone(); return; }
  const p = document.createElement('p');
  p.className = 'story-line';
  wrapper.appendChild(p);
  requestAnimationFrame(() => requestAnimationFrame(() => { p.style.opacity = '1'; }));

  let i = 0;
  const tick = setInterval(() => {
    if (i < STORY_LINES[index].length) {
      p.textContent += STORY_LINES[index][i++];
    } else {
      clearInterval(tick);
      setTimeout(() => showStoryLine(wrapper, index + 1, onAllDone), 650);
    }
  }, 70);
}

// ===== シーン読み込み =====
function loadScene(viewId) {
  state.currentView = viewId;
  const sceneView = document.getElementById('scene-view');

  // 遷移アニメーション
  sceneView.classList.add('transitioning');
  setTimeout(() => sceneView.classList.remove('transitioning'), 300);

  const scene = getScene(viewId);
  sceneView.innerHTML = scene.render(state);

  // ラベル更新
  const label = document.getElementById('scene-label');
  if (label) label.textContent = VIEW_LABELS[viewId] || '';

  // ナビゲーションボタン制御
  const isSpecial = viewId === 'corridor' || viewId === 'muistora';
  document.getElementById('btn-left').style.display  = isSpecial ? 'none' : 'flex';
  document.getElementById('btn-right').style.display = isSpecial ? 'none' : 'flex';

  renderInventory();
}

// ===== 視点移動 =====
function navigateView(direction) {
  if (state.currentView === 'corridor' || state.currentView === 'muistora') return;
  triggerSFX('item_use');
  const idx = VIEW_ORDER.indexOf(state.currentView);
  let next;
  if (direction === 'left') {
    next = VIEW_ORDER[(idx - 1 + VIEW_ORDER.length) % VIEW_ORDER.length];
  } else {
    next = VIEW_ORDER[(idx + 1) % VIEW_ORDER.length];
  }
  loadScene(next);
}

// ===== スポットクリック処理（scenes.js の spots に委譲） =====
function handleSpotClick(spotId) {
  triggerSFX('item_use');
  const scene = SCENES[state.currentView];
  if (!scene || !scene.spots) return;
  const spot = scene.spots.find(s => s.id === spotId);
  if (!spot) { showDialog('特に何もない。'); return; }

  // アイテム使用モード（1個選択中）
  if (state.selectedItems.length === 1) {
    const itemId = state.selectedItems[0];
    if (spot.canUse && spot.canUse(itemId)) {
      spot.use(itemId);
    } else {
      const itemName = ITEMS[itemId] ? ITEMS[itemId].name : itemId;
      showDialog(`${itemName}はここでは使えない。`);
    }
    clearSelection();
    return;
  }

  spot.inspect();
}

// ===== シンボル入力（正面扉パネル） =====
function handleSymbolInput(symbol) {
  if (state.flags.magicStoneRemoved || state.flags.doorUnlocked) return;
  if (state.flags.symbolOrder.includes(symbol)) return;

  triggerSFX('item_use');
  state.flags.symbolOrder.push(symbol);
  loadScene(state.currentView);

  if (state.flags.symbolOrder.length === 3) {
    const correct = ['○', '▲', '◆'];
    const isCorrect = state.flags.symbolOrder.every((s, i) => s === correct[i]);
    if (isCorrect) {
      state.flags.magicStoneRemoved = true;
      triggerSFX('correct');
      loadScene(state.currentView);
      showDialog('シンボルが正しい順に輝いた。封印が緩み、星晶が扉からゆっくりと外れた。\n「封印星晶」を手に入れた。');
      setTimeout(() => addItem('magic_stone'), 500);
    } else {
      triggerSFX('wrong');
      state.flags.symbolOrder = [];
      loadScene(state.currentView);
      showDialog('順番が違うようだ……もう一度試そう。');
    }
  }
}

function resetSymbolOrder() {
  if (state.flags.doorUnlocked) return;
  state.flags.symbolOrder = [];
  loadScene(state.currentView);
}

// ===== ネブリアの対話（MUISTRA_DIALOGUE は scenes.js で定義） =====
function startMuistraDialogue() {
  if (!state.flags.allPaintingsSeen) {
    showDialog('……まず、私の記憶を見よ。', null, null, 'ネブリア');
    return;
  }
  const idx = state.flags.muistraDialogue;
  if (idx >= MUISTRA_DIALOGUE.length) {
    showDialog('ネブリアは静かに佇んでいる。', null, null, 'ネブリア');
    return;
  }
  const dlg = MUISTRA_DIALOGUE[idx];
  const options = dlg.choices.map(choice => ({
    text: choice.text,
    onClick: () => {
      if (choice.correct) {
        state.flags.muistraAnswers.push(choice.text);
        const onCorrect = dlg.onCorrect || null;
        showDialog(dlg.correct_response, null, () => {
          state.flags.muistraDialogue++;
          if (onCorrect) onCorrect();
          else if (state.flags.muistraDialogue < MUISTRA_DIALOGUE.length) {
            setTimeout(() => startMuistraDialogue(), 400);
          }
        }, 'ネブリア');
      } else {
        showDialog(dlg.wrong_response, null, null, 'ネブリア');
      }
    },
  }));
  showDialog(dlg.question, options, null, 'ネブリア');
}

// ===== アイテム管理 =====
function addItem(itemId) {
  if (state.inventory.includes(itemId)) return;
  if (state.inventory.length >= 8) {
    showDialog('持ち物がいっぱいだ。何かを整理する必要がある。');
    return;
  }
  state.inventory.push(itemId);
  triggerSFX('item_get');
  renderInventory();
}

function removeItem(itemId) {
  const idx = state.inventory.indexOf(itemId);
  if (idx !== -1) state.inventory.splice(idx, 1);
  state.selectedItems = state.selectedItems.filter(id => id !== itemId);
  renderInventory();
}

// 長押し判定フラグ（selectItem が誤発火しないよう）
let _longPressJustFired = false;

function selectItem(slotIndex) {
  if (_longPressJustFired) { _longPressJustFired = false; return; }
  const itemId = state.inventory[slotIndex];
  if (!itemId) return;

  triggerSFX('item_use');
  const idx = state.selectedItems.indexOf(itemId);
  if (idx !== -1) {
    // 選択解除
    state.selectedItems.splice(idx, 1);
  } else if (state.selectedItems.length < 2) {
    state.selectedItems.push(itemId);
  } else {
    // 3個目は最初を外して入れ替え
    state.selectedItems.shift();
    state.selectedItems.push(itemId);
  }
  renderInventory();
  document.getElementById('btn-combine').disabled = state.selectedItems.length !== 2;
}

function clearSelection() {
  state.selectedItems = [];
  renderInventory();
  document.getElementById('btn-combine').disabled = true;
}

// ===== アイテム合成 =====
function tryCombine() {
  if (state.selectedItems.length !== 2) return;
  const [a, b] = state.selectedItems;

  const recipe = COMBINE_RECIPES.find(r =>
    (r.inputs[0] === a && r.inputs[1] === b) ||
    (r.inputs[0] === b && r.inputs[1] === a)
  );

  if (!recipe) {
    triggerSFX('wrong');
    showDialog('この二つは組み合わせられない。');
    clearSelection();
    return;
  }

  removeItem(recipe.inputs[0]);
  removeItem(recipe.inputs[1]);

  // onCombine コールバック（scenes.js のレシピで定義）
  if (recipe.onCombine) recipe.onCombine();

  // addItem は item_get SFX を鳴らすため、combine SFX は addItem の後に上書き再生
  state.inventory.push(recipe.output);
  triggerSFX(recipe.sfx || 'combine');
  renderInventory();
  showDialog(recipe.message || recipe.msg || '合成した。');
  clearSelection();
  loadScene(state.currentView);
}

// ===== インベントリ描画 =====
function renderInventory() {
  for (let i = 0; i < 8; i++) {
    const slot = document.getElementById(`slot-${i}`);
    if (!slot) continue;
    const itemId = state.inventory[i];
    if (itemId) {
      const item = ITEMS[itemId];
      const isSelected = state.selectedItems.includes(itemId);
      slot.innerHTML = `<span>${item.emoji}</span>`;
      slot.classList.add('has-item');
      slot.classList.toggle('selected', isSelected);
      slot.title = item.name;
    } else {
      slot.innerHTML = '';
      slot.classList.remove('has-item', 'selected');
      slot.title = '';
    }
  }
  document.getElementById('btn-combine').disabled = state.selectedItems.length !== 2;
}

// ===== アイテム詳細 (長押し) =====
function showItemDetail(itemId) {
  const item = ITEMS[itemId];
  if (!item) return;
  triggerSFX('item_use');
  showDialog(`${item.name}\n\n${item.desc}`, null, null, `${item.emoji} アイテム`);
}

// ===== 長押し検出セットアップ (startGame で1回だけ呼ぶ) =====
let _itemInteractionsReady = false;

function setupItemInteractions() {
  if (_itemInteractionsReady) return;
  _itemInteractionsReady = true;

  for (let i = 0; i < 8; i++) {
    const slot = document.getElementById(`slot-${i}`);
    if (!slot) continue;

    let timer = null;

    slot.addEventListener('pointerdown', () => {
      timer = setTimeout(() => {
        const itemId = state.inventory[i];
        if (itemId) {
          _longPressJustFired = true;
          showItemDetail(itemId);
        }
        timer = null;
      }, 500);
    }, { passive: true });

    const cancel = () => { if (timer) { clearTimeout(timer); timer = null; } };
    slot.addEventListener('pointerup',     cancel, { passive: true });
    slot.addEventListener('pointercancel', cancel, { passive: true });
    slot.addEventListener('pointermove',   cancel, { passive: true });
  }
}

// ===== ダイアログ表示 =====
let typewriterTimer = null;

function showDialog(text, options = null, onEnd = null, speaker = '') {
  const area    = document.getElementById('dialog-area');
  const spkEl   = document.getElementById('dialog-speaker');
  const textEl  = document.getElementById('dialog-text');
  const optEl   = document.getElementById('dialog-options');
  const closeBtn = document.getElementById('dialog-close');

  area.classList.remove('hidden');
  spkEl.textContent  = speaker || '';
  textEl.textContent = '';
  optEl.innerHTML    = '';

  // タイプライター
  if (typewriterTimer) { clearInterval(typewriterTimer); typewriterTimer = null; }
  let i = 0;
  typewriterTimer = setInterval(() => {
    if (i < text.length) {
      textEl.textContent += text[i];
      if (i % 3 === 0) triggerSFX('text');
      i++;
    } else {
      clearInterval(typewriterTimer);
      typewriterTimer = null;

      // 選択肢表示（options: [{text, onClick}] 形式）
      if (options && options.length > 0) {
        closeBtn.style.display = 'none';
        options.forEach(opt => {
          const btn = document.createElement('button');
          btn.className = 'dialog-option-btn';
          btn.textContent = opt.text;
          btn.onclick = () => {
            closeDialog();
            if (opt.onClick) setTimeout(() => opt.onClick(), 100);
          };
          optEl.appendChild(btn);
        });
      } else {
        closeBtn.style.display = 'block';
        if (onEnd) {
          closeBtn.onclick = () => { closeDialog(); onEnd(); };
        } else {
          closeBtn.onclick = closeDialog;
        }
      }
    }
  }, 40);
}

function closeDialog() {
  if (typewriterTimer) { clearInterval(typewriterTimer); typewriterTimer = null; }
  document.getElementById('dialog-area').classList.add('hidden');
  document.getElementById('dialog-options').innerHTML = '';
  document.getElementById('dialog-close').onclick = closeDialog;
  document.getElementById('dialog-close').style.display = 'block';
}

// ===== ヒントシステム =====
function showHint() {
  triggerSFX('item_use');
  const hint = getHint(); // scenes.js に定義
  showDialog(`【ヒント】\n${hint}`, null, null, '星の羅針盤');
}

// ===== スワイプ検出 =====
function setupSwipe() {
  const sceneView = document.getElementById('scene-view');
  let touchStartX = 0;
  let touchStartY = 0;

  sceneView.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  sceneView.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      navigateView(dx < 0 ? 'right' : 'left');
    }
  }, { passive: true });
}

// ===== エンディングトリガー =====
function triggerEnding(type) {
  closeDialog();
  const endingScreen = document.getElementById('ending-screen');
  const gameScreen   = document.getElementById('game-screen');
  gameScreen.classList.add('hidden');
  endingScreen.classList.remove('hidden');
  if (typeof renderEnding === 'function') {
    renderEnding(type, state);
  }
}
