// ============================================================
// PALMARES: O GRUPO — game.js
// Motor do jogo: caminhada, diálogo, escolhas, indicadores
// ============================================================

const Game = {
  state: {
    ...INITIAL_STATS,            // soberania, insatisfacao, populacao, riqueza
    nomeQuilombo: '',
    bandeira: '',
    moeda: '',
    constituicao: '',
    saude: '',
    currentNode: 0,
    phase: 0,
    gangaAlive: true,
  },

  els: {},
  statEls: {},
  messageQueue: [],

  init() {
    this.cacheElements();
    this.buildStatsBar();
    this.bindEvents();
    this.preloadImages();
    this.initSprites();
  },

  cacheElements() {
    this.els = {
      titleScreen: document.getElementById('title-screen'),
      gameContainer: document.getElementById('game-container'),
      endScreen: document.getElementById('end-screen'),
      creditsScreen: document.getElementById('credits-screen'),
      bgLayer: document.getElementById('bg-layer'),
      bgLayerNext: document.getElementById('bg-layer-next'),
      hud: document.getElementById('hud'),
      groupName: document.getElementById('group-name'),
      statsBar: document.getElementById('stats-bar'),
      flagReveal: document.getElementById('flag-reveal'),
      phoneNotif: document.getElementById('phone-notif'),
      dialogueContainer: document.getElementById('dialogue-container'),
      messagesList: document.getElementById('messages-list'),
      choicesContainer: document.getElementById('choices-container'),
      dashOverlay: document.getElementById('dash-overlay'),
      onuOverlay: document.getElementById('onu-overlay'),
      transitionOverlay: document.getElementById('transition-overlay'),
      transitionText: document.getElementById('transition-text'),
      endTitle: document.getElementById('end-title'),
      endText: document.getElementById('end-text'),
      endStats: document.getElementById('end-stats'),
      creditsScroll: document.getElementById('credits-scroll'),
      charZumbi: document.getElementById('char-zumbi'),
      charDandara: document.getElementById('char-dandara'),
      charGanga: document.getElementById('char-ganga'),
      charGrio: document.getElementById('char-grio'),
      charPovo: document.getElementById('char-povo'),
    };
  },

  bindEvents() {
    document.getElementById('start-btn').addEventListener('click', () => this.startGame());
    document.getElementById('btn-dash').addEventListener('click', () => this.showDashboard());
    document.getElementById('btn-onu').addEventListener('click', () => this.showONU());
    document.querySelectorAll('.close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.overlay').forEach(o => o.classList.remove('active'));
      });
    });
    document.getElementById('end-credits-btn').addEventListener('click', () => this.showCredits());
  },

  preloadImages() {
    Object.values(BACKGROUNDS).forEach(src => {
      const img = new Image();
      img.src = src;
    });
    document.querySelectorAll('.character[data-sprite]').forEach(el => {
      const src = el.getAttribute('data-sprite');
      if (src) {
        const img = new Image();
        img.src = src;
      }
    });
  },

  initSprites() {
    // Set background-image from data-sprite attribute
    document.querySelectorAll('.character[data-sprite]').forEach(el => {
      const src = el.getAttribute('data-sprite');
      el.style.backgroundImage = `url('${src}')`;
      // Start offscreen
      el.style.left = '-15%';
    });
  },

  // ===== STATS BAR (todos os dados na tela principal) =====
  buildStatsBar() {
    const bar = this.els.statsBar;
    bar.innerHTML = '';
    this.statEls = {};
    STATS.forEach(meta => {
      const el = document.createElement('div');
      el.className = 'stat';
      el.title = meta.label;
      const val = document.createElement('span');
      val.className = 'stat-val';
      val.textContent = this.fmtStat(meta.key, this.state[meta.key]);
      el.innerHTML = `<span class="stat-emoji">${meta.emoji}</span>`;
      el.appendChild(val);
      bar.appendChild(el);
      this.statEls[meta.key] = { el, value: val };
    });
  },

  compact(n) {
    const x = Math.abs(n);
    if (x >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(n);
  },
  fmtStat(key, v) {
    return STATS.find(s => s.key === key).kind === 'count' ? this.compact(v) : String(v);
  },

  // ===== START =====
  startGame() {
    this.els.titleScreen.classList.add('hidden');
    setTimeout(() => {
      this.els.titleScreen.style.display = 'none';
      this.els.gameContainer.classList.add('active');
      this.loadNode(0);
    }, 800);
  },

  // ===== NODE LOADING =====
  loadNode(index) {
    if (index >= STORY.length) return;
    const node = STORY[index];
    this.state.currentNode = index;

    // Phase transition?
    if (node.transition) {
      this.showTransition(node.transition, () => {
        this.setupScene(node);
      });
    } else {
      this.setupScene(node);
    }
  },

  setupScene(node) {
    // Background change — if bg changed, reset positions so chars walk in
    const newBgUrl = BACKGROUNDS[node.bg];
    const currentBg = this.els.bgLayer.style.backgroundImage;
    const bgChanged = !currentBg.includes(node.bg);

    this.setBackground(newBgUrl);

    // Update phase
    if (node.phase !== this.state.phase) {
      this.state.phase = node.phase;
    }

    // Crescimento/perdas históricas ao entrar na fase (anima os deltas na HUD)
    if (node.onEnter) this.applyEffects(node.onEnter);

    // Remove character if needed
    if (node.removeChar === 'ganga') {
      this.state.gangaAlive = false;
      const gangaEl = this.els.charGanga;
      if (gangaEl) gangaEl.classList.add('removed');
    }

    // If background changed, snap characters to offscreen left instantly
    if (bgChanged) {
      document.querySelectorAll('.character').forEach(c => {
        c.classList.add('no-transition');
        c.style.left = '-20%';
      });
      // Force reflow then allow transitions again
      void document.body.offsetHeight;
      requestAnimationFrame(() => {
        document.querySelectorAll('.character').forEach(c => {
          c.classList.remove('no-transition');
        });
        setTimeout(() => this.walkAndTalk(node), 50);
      });
    } else {
      this.walkAndTalk(node);
    }
  },

  walkAndTalk(node) {
    // Walk characters to position
    this.walkCharactersTo(node.walkTo, () => {
      // Show phone notification
      this.showPhoneNotif(() => {
        // Show dialogue
        this.showDialogue(node.messages, node.choices);
      });
    });
  },

  // ===== BACKGROUND =====
  setBackground(url) {
    const current = this.els.bgLayer;
    const next = this.els.bgLayerNext;

    if (current.style.backgroundImage === `url("${url}")`) return;

    next.style.backgroundImage = `url("${url}")`;
    next.style.opacity = '1';

    setTimeout(() => {
      current.style.backgroundImage = `url("${url}")`;
      next.style.opacity = '0';
    }, 1000);
  },

  // ===== CHARACTER WALKING =====
  // Faixas fixas e bem separadas + profundidade (CSS) = coluna em marcha, sem
  // sobreposição confusa. O grupo desliza um pouco conforme avança na trilha.
  walkCharactersTo(targetPercent, callback) {
    const lanes = { charPovo: 24, charGrio: 8, charGanga: 24, charDandara: 40, charZumbi: 56 };
    const slide = targetPercent * 12; // deriva sutil do grupo (0..~11%)
    const order = ['charPovo', 'charGrio', 'charGanga', 'charDandara', 'charZumbi'];

    order.forEach((id, i) => {
      const el = this.els[id];
      if (!el || el.classList.contains('removed')) return;
      setTimeout(() => {
        el.classList.add('walking');
        el.style.left = `${(lanes[id] || 0) + slide}%`;
      }, i * 150); // chegada escalonada
    });

    setTimeout(() => {
      order.forEach(id => { const el = this.els[id]; if (el) el.classList.remove('walking'); });
      if (callback) callback();
    }, 3000);
  },

  // ===== PHONE NOTIFICATION =====
  showPhoneNotif(callback) {
    const notif = this.els.phoneNotif;
    notif.classList.add('active');

    // Play notification sound (subtle vibration effect)
    this.playNotifSound();

    setTimeout(() => {
      notif.classList.remove('active');
      if (callback) callback();
    }, 1500);
  },

  playNotifSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) { /* silent fallback */ }
  },

  // ===== DIALOGUE =====
  showDialogue(messages, choices) {
    const container = this.els.dialogueContainer;

    // Cada etapa começa com o chat limpo (sem acúmulo de histórico)
    this.els.messagesList.innerHTML = '';
    this.els.choicesContainer.innerHTML = '';
    container.classList.add('active');

    // Queue messages one by one
    this.messageQueue = [...messages];
    this.currentChoices = choices;
    this.typeNextMessage();
  },

  typeNextMessage() {
    if (this.messageQueue.length === 0) {
      // All messages shown, show choices
      this.showChoices(this.currentChoices);
      return;
    }

    const msg = this.messageQueue.shift();
    const char = CHARACTERS[msg.char];
    const msgList = this.els.messagesList;

    const div = document.createElement('div');

    if (msg.char === 'sistema') {
      div.className = 'msg system';
      div.innerHTML = `<div class="msg-body"><div class="msg-text">${msg.text}</div></div>`;
    } else {
      div.className = 'msg';
      const isAudio = msg.text.startsWith('🎤');
      div.innerHTML = `
        <div class="msg-avatar" style="background-image: url('${char.avatar}')"></div>
        <div class="msg-body">
          <div class="msg-name" style="color: ${char.color}">${char.emoji} ${char.name}</div>
          <div class="msg-text">${isAudio ? `<span class="audio-badge">🎤 Áudio</span> ${msg.text.replace('🎤 ', '').replace('🎤', '').replace(/^Áudio\s*/, '')}` : msg.text}</div>
        </div>
      `;
    }

    // Animate with delay
    div.style.animationDelay = '0s';
    msgList.appendChild(div);
    msgList.scrollTop = msgList.scrollHeight;

    setTimeout(() => this.typeNextMessage(), 600);
  },

  // ===== CHOICES =====
  showChoices(choices) {
    const container = this.els.choicesContainer;
    container.innerHTML = '';

    choices.forEach((choice, i) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = choice.text;
      btn.style.animationDelay = `${i * 0.15}s`;
      btn.addEventListener('click', () => this.makeChoice(choice));
      container.appendChild(btn);
    });
  },

  // ===== MAKE CHOICE =====
  makeChoice(choice) {
    this.applyEffects(choice.effects);
    this.els.dialogueContainer.classList.remove('active');

    if (choice.next === 'END') {
      setTimeout(() => this.showEnding(), 1500);
    } else {
      const nextIndex = STORY.findIndex(n => n.id === choice.next);
      if (nextIndex >= 0) setTimeout(() => this.loadNode(nextIndex), 800);
    }
  },

  // Aplica efeitos (deltas nos 4 dados + sets categóricos), animando a HUD
  applyEffects(effects) {
    if (!effects) return;
    for (const key in effects) {
      const val = effects[key];
      if (key in INITIAL_STATS) {
        const novo = clampStat(key, (this.state[key] || 0) + val);
        this.state[key] = novo;
        this.updateStat(key, novo, val);
      } else {
        this.state[key] = val;
        if (key === 'nomeQuilombo') this.els.groupName.textContent = `${val} 🌴🔥`;
        if (key === 'bandeira') this.showFlagReveal(val);
      }
    }
  },

  // ===== ATUALIZA UM DADO NA HUD (valor + bolha de delta) =====
  updateStat(key, value, delta) {
    const ref = this.statEls[key];
    if (!ref) return;
    ref.value.textContent = this.fmtStat(key, value);
    ref.el.classList.add('flash');
    setTimeout(() => ref.el.classList.remove('flash'), 500);

    if (delta) {
      const meta = STATS.find(s => s.key === key);
      const bom = meta.higherIsBad ? delta < 0 : delta > 0;
      const pop = document.createElement('span');
      pop.className = 'delta-pop ' + (bom ? 'pos' : 'neg');
      pop.textContent = (delta > 0 ? '+' : '-') + this.compact(Math.abs(delta));
      ref.el.appendChild(pop);
      setTimeout(() => pop.remove(), 1100);
    }
  },

  // Bandeira desenhada após a escolha (revelação rápida)
  showFlagReveal(bandeira) {
    const el = this.els.flagReveal;
    if (!el) return;
    el.innerHTML = flagSVG(bandeira, 168, 109);
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
  },

  // ===== TRANSITION =====
  showTransition(text, callback) {
    const overlay = this.els.transitionOverlay;
    this.els.transitionText.textContent = text;
    overlay.classList.add('active');

    setTimeout(() => {
      overlay.classList.remove('active');
      if (callback) setTimeout(callback, 500);
    }, 2500);
  },

  // ===== ENDING (árvore de finais por perfil de dados) =====
  showEnding() {
    const s = this.state;
    const ending = ENDINGS[pickEnding(s)];

    this.els.gameContainer.classList.remove('active');
    this.els.endScreen.classList.add('active');
    this.els.endTitle.textContent = ending.title;
    this.els.endText.textContent = ending.text;

    // Por que este final? + os dados finais que levaram a ele
    this.els.endStats.innerHTML =
      `<div class="end-reason">🔎 ${ending.reason}</div>` +
      '<div class="end-stat-grid">' +
      STATS.map(m => `<div class="end-stat"><span>${m.emoji}</span><b>${this.fmtStat(m.key, s[m.key])}</b><small>${m.label}</small></div>`).join('') +
      '</div>';
  },

  // ===== DASHBOARD =====
  showDashboard() {
    const s = this.state;
    const cell = (label, value, opts = {}) =>
      `<div class="dash-item${opts.full ? ' full-width' : ''}">
        <div class="dash-label">${label}</div>
        <div class="dash-value"${opts.style ? ` style="${opts.style}"` : ''}>${value}</div>
      </div>`;
    const grid = cells => `<div class="dash-grid">${cells.join('')}</div>`;
    const sm = 'font-size:0.9rem';
    const bandeira = s.bandeira
      ? flagSVG(s.bandeira, 100, 64) + `<div style="margin-top:4px">${s.bandeira}</div>`
      : '—';

    document.getElementById('dash-content').innerHTML =
      grid([
        cell('Nome', s.nomeQuilombo || '(não definido)', { full: true }),
        cell('Bandeira', bandeira, { style: 'font-size:0.8rem' }),
        cell('Moeda', s.moeda || '—', { style: sm }),
        cell('Constituição', s.constituicao || '—', { style: sm }),
        cell('Saúde', s.saude || '—', { style: sm }),
      ]) +
      '<hr style="border-color: rgba(255,255,255,0.1); margin: 16px 0;">' +
      grid([
        cell('👥 População', s.populacao.toLocaleString('pt-BR')),
        cell('💰 Riqueza', `${s.riqueza.toLocaleString('pt-BR')} ${s.moeda || ''}`.trim()),
        cell('📈 IDH', derivedIDH(s)),
        cell('💸 Taxas', derivedTaxas(s)),
        cell('👑 Soberania', s.soberania),
        cell('😤 Insatisfação', s.insatisfacao),
      ]);

    this.els.dashOverlay.classList.add('active');
  },

  // ===== ONU =====
  showONU() {
    document.getElementById('onu-content').innerHTML = ONU_TEXT;
    this.els.onuOverlay.classList.add('active');
  },

  // ===== CREDITS =====
  showCredits() {
    this.els.endScreen.classList.remove('active');
    this.els.creditsScreen.classList.add('active');

    const scroll = this.els.creditsScroll;
    scroll.innerHTML = '';

    CREDITS.forEach(item => {
      if (item.role === '—') {
        const div = document.createElement('div');
        div.className = 'credit-divider';
        scroll.appendChild(div);
      } else {
        const div = document.createElement('div');
        div.className = 'credit-item';
        if (item.role) div.innerHTML += `<div class="credit-role">${item.role}</div>`;
        if (item.name) div.innerHTML += `<div class="credit-name">${item.name}</div>`;
        scroll.appendChild(div);
      }
    });

    // After credits roll, back to title
    setTimeout(() => {
      this.els.creditsScreen.classList.remove('active');
      this.els.titleScreen.style.display = '';
      this.els.titleScreen.classList.remove('hidden');
      // Reset state
      this.state = {
        ...INITIAL_STATS,
        nomeQuilombo: '', bandeira: '', moeda: '',
        constituicao: '', saude: '',
        currentNode: 0, phase: 0, gangaAlive: true,
      };
      this.buildStatsBar();
      this.els.groupName.textContent = 'PALMARES 🌴🔥';
      if (this.els.charGanga) this.els.charGanga.classList.remove('removed');
      // Reset positions
      document.querySelectorAll('.character').forEach(c => c.style.left = '-15%');
    }, 28000);
  },
};

// Boot
document.addEventListener('DOMContentLoaded', () => Game.init());
