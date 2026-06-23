// ============================================================
// PALMARES: O GRUPO — game.js
// Motor do jogo: caminhada, diálogo, escolhas, indicadores
// ============================================================

const Game = {
  state: {
    soberania: 50,
    insatisfacao: 20,
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
  messageQueue: [],
  isTyping: false,

  init() {
    this.cacheElements();
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
      soberaniaVal: document.getElementById('sob-val'),
      insatisfacaoVal: document.getElementById('insat-val'),
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

  // ===== START =====
  startGame() {
    this.els.titleScreen.classList.add('hidden');
    setTimeout(() => {
      this.els.titleScreen.style.display = 'none';
      this.els.gameContainer.classList.add('active');
      this.els.messagesList.innerHTML = ''; // novo jogo: chat começa vazio
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
  walkCharactersTo(targetPercent, callback) {
    const chars = ['charZumbi', 'charDandara', 'charGrio', 'charPovo'];
    if (this.state.gangaAlive) chars.splice(2, 0, 'charGanga');

    const offsets = [0, -8, -16, -24, -36]; // spacing between chars
    const baseLeft = targetPercent * 100;

    // Start all walking with stagger
    chars.forEach((id, i) => {
      const el = this.els[id];
      if (!el) return;
      if (el.classList.contains('removed')) return;

      setTimeout(() => {
        el.classList.add('walking');
        const offset = offsets[i] !== undefined ? offsets[i] : -36;
        const finalLeft = Math.max(0, baseLeft + offset);
        el.style.left = `${finalLeft}%`;
      }, i * 150); // staggered 150ms per char
    });

    // Stop walking after transition completes
    const totalTime = 3000;
    setTimeout(() => {
      chars.forEach(id => {
        const el = this.els[id];
        if (el) el.classList.remove('walking');
      });
      if (callback) callback();
    }, totalTime);
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
    const choicesEl = this.els.choicesContainer;

    // Histórico do chat é mantido entre etapas (não zera) — só troca as escolhas
    choicesEl.innerHTML = '';
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
    // Apply effects
    if (choice.effects) {
      Object.entries(choice.effects).forEach(([key, val]) => {
        if (key === 'soberania') {
          this.state.soberania = Math.max(0, Math.min(100, this.state.soberania + val));
          this.updateIndicator('sob', this.state.soberania, val);
        } else if (key === 'insatisfacao') {
          this.state.insatisfacao = Math.max(0, Math.min(100, this.state.insatisfacao + val));
          this.updateIndicator('insat', this.state.insatisfacao, val);
        } else {
          this.state[key] = val;
        }
      });
    }

    // Atualiza o nome do grupo na HUD (mesmo quando a escolha só define o nome)
    if (this.state.nomeQuilombo) {
      this.els.groupName.textContent = `${this.state.nomeQuilombo} 🌴🔥`;
    }

    // Bandeira recém-criada: desenha no chat (persiste no histórico) e no Dashboard
    if (choice.effects && choice.effects.bandeira) {
      const div = document.createElement('div');
      div.className = 'msg system';
      div.innerHTML = `<div class="msg-body"><div class="msg-text">🏴 Bandeira criada</div><div class="flag-msg">${flagSVG(choice.effects.bandeira)}</div></div>`;
      this.els.messagesList.appendChild(div);
      this.els.messagesList.scrollTop = this.els.messagesList.scrollHeight;
    }

    // Hide dialogue
    this.els.dialogueContainer.classList.remove('active');

    // Next node
    if (choice.next === 'END') {
      setTimeout(() => this.showEnding(), 1500);
    } else {
      const nextIndex = STORY.findIndex(n => n.id === choice.next);
      if (nextIndex >= 0) {
        setTimeout(() => this.loadNode(nextIndex), 800);
      }
    }
  },

  // ===== UPDATE INDICATORS =====
  updateIndicator(type, value, delta) {
    const el = type === 'sob' ? this.els.soberaniaVal : this.els.insatisfacaoVal;
    el.textContent = value;
    const ind = el.parentElement;
    ind.classList.add('flash');
    setTimeout(() => ind.classList.remove('flash'), 500);

    // Bolha flutuante com o delta (+5 / -3) a cada decisão
    if (delta) {
      const good = (type === 'sob') ? delta > 0 : delta < 0; // +soberania bom; +insatisfação ruim
      const pop = document.createElement('span');
      pop.className = 'delta-pop ' + (good ? 'pos' : 'neg');
      pop.textContent = (delta > 0 ? '+' : '') + delta;
      ind.appendChild(pop);
      setTimeout(() => pop.remove(), 1000);
    }
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

  // ===== ENDING =====
  showEnding() {
    let endKey;
    if (this.state.soberania >= 70) endKey = 'resistencia';
    else if (this.state.insatisfacao >= 70) endKey = 'espelho';
    else endKey = 'verdade';

    const ending = ENDINGS[endKey];

    this.els.gameContainer.classList.remove('active');
    this.els.endScreen.classList.add('active');
    this.els.endTitle.textContent = ending.title;
    this.els.endText.textContent = ending.text;
  },

  // ===== DASHBOARD =====
  showDashboard() {
    const d = PHASE_DATA[this.state.phase];
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
        cell('👥 População', d.populacao.toLocaleString()),
        cell('💰 PIB', `${d.pib.toLocaleString()} ${s.moeda || '?'}`),
        cell('📈 IDH', d.idh),
        cell('💸 Taxas', d.taxas),
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
        soberania: 50, insatisfacao: 20,
        nomeQuilombo: '', bandeira: '', moeda: '',
        constituicao: '', saude: '',
        currentNode: 0, phase: 0, gangaAlive: true,
      };
      this.els.soberaniaVal.textContent = '50';
      this.els.insatisfacaoVal.textContent = '20';
      this.els.groupName.textContent = 'PALMARES 🌴🔥';
      if (this.els.charGanga) this.els.charGanga.classList.remove('removed');
      // Reset positions
      document.querySelectorAll('.character').forEach(c => c.style.left = '-15%');
    }, 28000);
  },
};

// Boot
document.addEventListener('DOMContentLoaded', () => Game.init());
