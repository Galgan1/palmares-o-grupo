// ============================================================
// PALMARES: O GRUPO — story.js
// Narrativa (4 fases) + sistema multi-dado (4 stats) + árvore de 6 finais.
// Lógica pura (clampStat, pickEnding, applyEffects) testável em Node.
// ============================================================

const CHARACTERS = {
  zumbi:    { name: 'Zumbi',         emoji: '👑', avatar: 'assets/zumbi.png',       color: '#FFD700' },
  dandara:  { name: 'Dandara',       emoji: '⚔️', avatar: 'assets/dandara.png',     color: '#FF6B6B' },
  ganga:    { name: 'Ganga Zumba',   emoji: '🧓', avatar: 'assets/ganga_zumba.png', color: '#7EC8E3' },
  grio:     { name: 'Griô',          emoji: '📖', avatar: 'assets/grio.png',        color: '#C9B1FF' },
  domingos: { name: 'Domingos',      emoji: '💀', avatar: 'assets/domingos.png',    color: '#FF4444' },
  espiao:   { name: 'Nº Desconhecido', emoji: '🕵️', avatar: 'assets/espiao.png',   color: '#888888' },
  sistema:  { name: 'Sistema',       emoji: '📱', avatar: null,                     color: '#555555' },
};

const BACKGROUNDS = {
  trilha:     'assets/bg_trilha.png',
  serra:      'assets/bg_serra.png',
  mocambo:    'assets/bg_mocambo.png',
  entardecer: 'assets/bg_entardecer.png',
  batalha:    'assets/bg_batalha.png',
};

// Bandeira desenhada (SVG) a partir da escolha — usada na revelação e no Dashboard
const BANDEIRAS = {
  'Palmeira e Lança': { cor: '#2e7d32', cor2: '#1b5e20', simbolo: '🌴' },
  'Corrente Partida': { cor: '#b71c1c', cor2: '#7f0000', simbolo: '⛓️‍💥' },
  'Tambor e Sol':     { cor: '#f9a825', cor2: '#f57f17', simbolo: '🥁' },
};
function flagSVG(bandeira, w = 120, h = 78) {
  const f = BANDEIRAS[bandeira];
  if (!f) return '';
  return `<svg viewBox="0 0 120 78" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bandeira ${bandeira}">
    <rect x="8" y="3" width="5" height="73" rx="2" fill="#5d4037"/>
    <circle cx="10.5" cy="5" r="3.5" fill="#ffd700"/>
    <rect x="13" y="7" width="98" height="56" rx="3" fill="${f.cor}" stroke="${f.cor2}" stroke-width="2"/>
    <text x="62" y="47" font-size="32" text-anchor="middle">${f.simbolo}</text>
  </svg>`;
}

const STORY = [

  // ========== FASE 0 — CRIAR O QUILOMBO ==========
  {
    id: 'start',
    phase: 0,
    bg: 'trilha',
    walkTo: 0.15,
    messages: [
      { char: 'sistema', text: '👑 Zumbi criou o grupo "NOVO QUILOMBO 🌴🔥"' },
      { char: 'sistema', text: '👑 Zumbi adicionou Dandara, Ganga Zumba, Griô e +297' },
      { char: 'dandara', text: 'Antes de andar mais, precisamos organizar essa bagunça.' },
      { char: 'dandara', text: 'Primeiro: como chamamos nossa terra?' },
    ],
    choices: [
      { text: '🌴 Palmares', effects: { nomeQuilombo: 'Palmares' }, next: 'bandeira' },
      { text: '🏔️ Serra Livre', effects: { nomeQuilombo: 'Serra Livre' }, next: 'bandeira' },
      { text: '🔥 Aqualtune', effects: { nomeQuilombo: 'Aqualtune' }, next: 'bandeira' },
    ]
  },
  {
    id: 'bandeira',
    phase: 0,
    bg: 'trilha',
    walkTo: 0.28,
    messages: [
      { char: 'grio', text: '🎤 Áudio (2:15)' },
      { char: 'grio', text: '"Cada povo tinha seus símbolos. Aqui precisamos de algo que una todos, mesmo sendo de nações diferentes..."' },
      { char: 'dandara', text: 'TL;DR do Griô: algo que una todo mundo.' },
      { char: 'dandara', text: '2️⃣ BANDEIRA — qual símbolo nos representa?' },
    ],
    choices: [
      { text: '🌿 Palmeira com lança', effects: { bandeira: 'Palmeira e Lança' }, next: 'moeda' },
      { text: '⛓️💥 Corrente partida', effects: { bandeira: 'Corrente Partida' }, next: 'moeda' },
      { text: '🥁 Tambor com sol', effects: { bandeira: 'Tambor e Sol' }, next: 'moeda' },
    ]
  },
  {
    id: 'moeda',
    phase: 0,
    bg: 'trilha',
    walkTo: 0.42,
    messages: [
      { char: 'ganga', text: '🎤 Áudio (3:40)' },
      { char: 'ganga', text: '"Escambo funciona. Troca milho por ferro, simples."' },
      { char: 'zumbi', text: 'Escambo é coisa do passado. 😤' },
      { char: 'grio', text: '"Passado"? Rapaz, estamos em 1605. 😂' },
      { char: 'dandara', text: '3️⃣ MOEDA — como fazemos trocas?' },
    ],
    choices: [
      { text: '🐚 Búzios', effects: { moeda: 'Búzios', soberania: 5, riqueza: 15 }, next: 'constituicao' },
      { text: '🌽 Sacos de milho', effects: { moeda: 'Sacos de Milho', soberania: 3, riqueza: 8, populacao: 20 }, next: 'constituicao' },
      { text: '🪙 PalmCoin 😂', effects: { moeda: 'PalmCoin', insatisfacao: 5, riqueza: -5 }, next: 'constituicao' },
    ]
  },
  {
    id: 'constituicao',
    phase: 0,
    bg: 'trilha',
    walkTo: 0.58,
    messages: [
      { char: 'dandara', text: '4️⃣ CONSTITUIÇÃO — quais são as regras básicas?' },
      { char: 'dandara', text: 'Vou mandar 3 modelos. Votem:' },
    ],
    choices: [
      { text: '📜 Todos livres e iguais. Voto.', effects: { constituicao: 'Igualitária', soberania: 5, insatisfacao: -5 }, next: 'saude' },
      { text: '⚔️ Líder forte. Disciplina.', effects: { constituicao: 'Centralizada', soberania: 10, insatisfacao: 10 }, next: 'saude' },
      { text: '🤝 Conselho decide, líder executa.', effects: { constituicao: 'Conselho', soberania: 7, insatisfacao: 3 }, next: 'saude' },
    ]
  },
  {
    id: 'saude',
    phase: 0,
    bg: 'trilha',
    walkTo: 0.75,
    messages: [
      { char: 'grio', text: '🎤 Áudio (4:45)' },
      { char: 'grio', text: '"Na África tínhamos curandeiros que conheciam cada planta..."' },
      { char: 'dandara', text: 'Resumo: a mata é a farmácia. 🌿💊' },
      { char: 'dandara', text: '5️⃣ POLÍTICA DE SAÚDE:' },
    ],
    choices: [
      { text: '🌿 Curandeiros tradicionais', effects: { saude: 'Tradicional', insatisfacao: -5, populacao: 30 }, next: 'resumo_fundacao' },
      { text: '🏥 Treinar enfermeiros', effects: { saude: 'Treinamento', soberania: 5, populacao: 20, riqueza: -5 }, next: 'resumo_fundacao' },
      { text: '🌿🏥 Misturar os dois', effects: { saude: 'Mista', soberania: 3, insatisfacao: -3, populacao: 25 }, next: 'resumo_fundacao' },
    ]
  },
  {
    id: 'resumo_fundacao',
    phase: 0,
    bg: 'trilha',
    walkTo: 0.90,
    messages: [
      { char: 'dandara', text: '✅ Quilombo fundado!' },
      { char: 'dandara', text: '📋 Resumo da nossa micronação pronto.' },
      { char: 'zumbi', text: 'Agora começa o trabalho de verdade. 💪🔥' },
    ],
    choices: [
      { text: '▶️ Avançar para a Fundação (1605)', effects: {}, next: 'fase1_quem_manda' },
    ]
  },

  // ========== FASE 1 — FUNDAÇÃO (1605) ==========
  {
    id: 'fase1_quem_manda',
    phase: 1,
    bg: 'serra',
    walkTo: 0.20,
    transition: '1605 — Fundação',
    onEnter: { populacao: 1700, riqueza: 700 },
    messages: [
      { char: 'zumbi', text: 'Chegamos na Serra! Primeiro problema real: quem planta e quem vigia?' },
      { char: 'ganga', text: '🎤 Áudio (5:12)' },
      { char: 'ganga', text: '"Se todo mundo vigiar, ninguém planta. Se todo mundo plantar, ninguém vigia..."' },
      { char: 'dandara', text: 'Resumo: dividir tarefas. Quem decide?' },
    ],
    choices: [
      { text: '👑 Zumbi divide como achar melhor', effects: { soberania: 10, insatisfacao: 5 }, next: 'fase1_fugitivos' },
      { text: '🗳️ Cada um escolhe o que quer', effects: { soberania: -5, insatisfacao: -5 }, next: 'fase1_fugitivos' },
    ]
  },
  {
    id: 'fase1_fugitivos',
    phase: 1,
    bg: 'serra',
    walkTo: 0.40,
    messages: [
      { char: 'sistema', text: '🕵️ Número Desconhecido entrou no grupo' },
      { char: 'espiao', text: 'Fugi do engenho do capitão Brito. Trouxe 50 pessoas. Tem lugar?' },
      { char: 'ganga', text: '🎤 Áudio (5:12)' },
      { char: 'ganga', text: '"Eu acho que a gente tem que ter cuidado, né, porque da última vez..."' },
      { char: 'dandara', text: 'Resumo do Ganga: "sim, mas com cuidado" 😅' },
      { char: 'ganga', text: 'EU IA CHEGAR LÁ, DANDARA 😤' },
    ],
    choices: [
      { text: '✅ Aceitar todos. Liberdade não tem peneira.', effects: { soberania: -5, insatisfacao: -5, populacao: 600 }, next: 'fase1_colheita' },
      { text: '🔍 Aceitar com triagem. Dandara, monitora.', effects: { soberania: 5, insatisfacao: 3, populacao: 250 }, next: 'fase1_colheita' },
    ]
  },
  {
    id: 'fase1_colheita',
    phase: 1,
    bg: 'serra',
    walkTo: 0.60,
    messages: [
      { char: 'dandara', text: 'Primeira colheita! 🌽 Mas não dá pra todo mundo comer igual.' },
      { char: 'dandara', text: 'Quem come primeiro?' },
      { char: 'zumbi', text: 'Os guerreiros. Sem eles, não tem defesa.' },
      { char: 'grio', text: '🎤 Áudio (3:20)' },
      { char: 'grio', text: '"E as crianças? E os velhos? Quando eu era jovem..."' },
      { char: 'dandara', text: 'Griô, foco. 🙄' },
    ],
    choices: [
      { text: '🍽️ Igual pra todos. Fome repartida.', effects: { soberania: -5, insatisfacao: -10, populacao: 150 }, next: 'fase1_educacao' },
      { text: '⚔️ Guerreiros primeiro. Eles protegem.', effects: { soberania: 5, insatisfacao: 10, populacao: -50 }, next: 'fase1_educacao' },
    ]
  },
  {
    id: 'fase1_educacao',
    phase: 1,
    bg: 'serra',
    walkTo: 0.80,
    messages: [
      { char: 'dandara', text: 'A primeira geração de crianças nasceu aqui.' },
      { char: 'dandara', text: 'Nunca viram uma senzala. O que contamos a elas?' },
      { char: 'zumbi', text: 'Que somos guerreiros. Descendentes de reis. 🔥' },
      { char: 'grio', text: '🎤 Áudio (6:30)' },
      { char: 'grio', text: '"A verdade é mais complicada que isso..."' },
      { char: 'zumbi', text: 'Ninguém pediu complicação, Griô.' },
    ],
    choices: [
      { text: '📖 A história real, dura mas honesta.', effects: { soberania: 3, insatisfacao: 5 }, next: 'fase2_comercio' },
      { text: '🦁 A versão heroica. Orgulho e força.', effects: { soberania: 8, insatisfacao: -5 }, next: 'fase2_comercio' },
    ]
  },

  // ========== FASE 2 — CRESCIMENTO E CISÃO (1650–1678) ==========
  {
    id: 'fase2_comercio',
    phase: 2,
    bg: 'mocambo',
    walkTo: 0.20,
    transition: '45 anos depois...',
    onEnter: { populacao: 17000, riqueza: 4000 },
    messages: [
      { char: 'dandara', text: 'Precisamos de pólvora, ferro e sal.' },
      { char: 'dandara', text: 'A única fonte: as vilas coloniais. As mesmas que têm escravos.' },
      { char: 'ganga', text: 'Negócio é negócio. 🤝' },
      { char: 'zumbi', text: 'Fazer negócio com quem escraviza nossos irmãos? 😤' },
      { char: 'grio', text: '🎤 Áudio (4:10)' },
      { char: 'grio', text: '"Nenhuma sociedade é autossuficiente. Até os romanos..."' },
      { char: 'dandara', text: 'GRIÔ. FOCO. 🙄' },
    ],
    choices: [
      { text: '🤝 Comerciar. Precisamos sobreviver.', effects: { soberania: 5, insatisfacao: 5, riqueza: 1500 }, next: 'fase2_regras' },
      { text: '🚫 Roubar. Eles nos devem.', effects: { soberania: 10, insatisfacao: 10, riqueza: 2500 }, next: 'fase2_regras' },
    ]
  },
  {
    id: 'fase2_regras',
    phase: 2,
    bg: 'mocambo',
    walkTo: 0.45,
    messages: [
      { char: 'dandara', text: '⚠️ Notificação: as regras do quilombo mudaram.' },
      { char: 'dandara', text: 'Antes: qualquer um era livre e igual.' },
      { char: 'dandara', text: 'Agora: novos membros juram lealdade ao líder.' },
      { char: 'grio', text: '🎤 Áudio (5:00)' },
      { char: 'grio', text: '"Isso me lembra uma história sobre um grupo de animais que fez uma revolução..."' },
      { char: 'zumbi', text: 'São tempos de guerra. Disciplina salva vidas.' },
      { char: 'espiao', text: 'As regras mudam pra proteger o povo ou pra proteger o líder? 🤔' },
      { char: 'zumbi', text: 'QUEM. É. VOCÊ. 👀' },
    ],
    choices: [
      { text: '⚔️ Necessário. Estamos em guerra.', effects: { soberania: 10, insatisfacao: 10 }, next: 'fase2_acordo' },
      { text: '⚖️ Perigoso. Líderes precisam de limites.', effects: { soberania: -5, insatisfacao: -5 }, next: 'fase2_acordo' },
    ]
  },
  {
    id: 'fase2_acordo',
    phase: 2,
    bg: 'entardecer',
    walkTo: 0.55,
    messages: [
      { char: 'sistema', text: '💀 Domingos J. Velho tentou entrar no grupo' },
      { char: 'sistema', text: '⚔️ Dandara bloqueou Domingos J. Velho' },
      { char: 'dandara', text: 'O Domingos mandou DM no Insta:' },
      { char: 'dandara', text: '"@palmares.oficial vim alinhar uma proposta de sinergia. Vcs ficam com a terra SE devolverem os fugitivos novos. Win-win. 📊"' },
      { char: 'ganga', text: 'Gente... e se a gente aceitar? Tô cansado de guerra.' },
      { char: 'zumbi', text: 'DEVOLVER FUGITIVOS?? Eles vão voltar pra senzala! JAMAIS 🔥' },
      { char: 'dandara', text: '🗳️ ENQUETE SÉRIA (sem zoeira): aceitar o acordo?' },
    ],
    choices: [
      { text: '🕊️ Aceitar. Paz agora, luta depois.', effects: { soberania: -15, insatisfacao: -10 }, next: 'fase2_morte_ganga' },
      { text: '⚔️ Recusar. Não entregamos ninguém.', effects: { soberania: 10, insatisfacao: 10 }, next: 'fase2_morte_ganga' },
    ]
  },
  {
    id: 'fase2_morte_ganga',
    phase: 2,
    bg: 'entardecer',
    walkTo: 0.80,
    removeChar: 'ganga',
    messages: [
      { char: 'sistema', text: '👑 Zumbi removeu 🧓 Ganga Zumba do grupo' },
      { char: 'grio', text: '... ele fundou esse grupo.' },
      { char: 'zumbi', text: 'O grupo evoluiu. Ele não acompanhou.' },
      { char: 'dandara', text: 'Gente, tô recebendo mensagem de que o Ganga Zumba foi encontrado morto. Dizem que foi envenenado. 😨' },
      { char: 'zumbi', text: 'Triste. Mas a luta continua. 🙏' },
      { char: 'espiao', text: 'Quem ganha com a morte dele? 🤔' },
      { char: 'zumbi', text: 'QUEM É VOCÊ? 👀' },
      { char: 'sistema', text: '🕵️ Número Desconhecido saiu do grupo' },
    ],
    choices: [
      { text: '😔 Momento de silêncio. Era um fundador.', effects: { insatisfacao: -5 }, next: 'fase3_stories' },
      { text: '🤷 A vida segue. Próxima pauta.', effects: { insatisfacao: 10 }, next: 'fase3_stories' },
    ]
  },

  // ========== FASE 3 — O CERCO FINAL (1694) ==========
  {
    id: 'fase3_stories',
    phase: 3,
    bg: 'batalha',
    walkTo: 0.20,
    transition: '16 anos depois... 6 de janeiro de 1694',
    onEnter: { populacao: -3000, riqueza: -2500 },
    messages: [
      { char: 'dandara', text: 'URGENTE. Domingos postou nos Stories.' },
      { char: 'dandara', text: '📸 Foto: 6.000 soldados com CANHÕES.' },
      { char: 'dandara', text: 'Legenda: "Rumo à sinergia final. #EmpreendedorismoColonial #HustleCulture"' },
      { char: 'dandara', text: '247 curtidas. 😬' },
      { char: 'grio', text: '🎤 Áudio (7:14)' },
      { char: 'grio', text: '"Quando o inimigo vem com canhão, a melhor estratégia é... não estar na frente do canhão."' },
      { char: 'dandara', text: 'Griô, todo mundo ouviu esse áudio inteiro.' },
      { char: 'zumbi', text: 'Lutamos. Sempre lutamos. 🔥' },
    ],
    choices: [
      { text: '🏔️ Todos na Serra. Juntos até o fim.', effects: { soberania: 15, insatisfacao: 5 }, next: 'fase3_traidor' },
      { text: '🌿 Espalhar o povo. Sobreviver é resistir.', effects: { soberania: -5, insatisfacao: -10, populacao: -4000 }, next: 'fase3_traidor' },
    ]
  },
  {
    id: 'fase3_traidor',
    phase: 3,
    bg: 'batalha',
    walkTo: 0.40,
    messages: [
      { char: 'dandara', text: 'Interceptei uma mensagem. Alguém tá passando info pros portugueses.' },
      { char: 'zumbi', text: 'Quem?? 🔥🔥' },
      { char: 'espiao', text: 'Todo mundo tá olhando pra mim, né? 😒' },
      { char: 'grio', text: '🎤 Áudio (2:00)' },
      { char: 'grio', text: '"Nem sempre o culpado é o mais suspeito..."' },
      { char: 'dandara', text: 'Temos dois suspeitos. Sem provas contra nenhum.' },
    ],
    choices: [
      { text: '🔒 Prender os dois. Segurança primeiro.', effects: { soberania: 10, insatisfacao: 15 }, next: 'fase3_rendicao' },
      { text: '🤝 Sem provas, sem pena. Confiamos no grupo.', effects: { soberania: -5, insatisfacao: -5 }, next: 'fase3_rendicao' },
    ]
  },
  {
    id: 'fase3_rendicao',
    phase: 3,
    bg: 'batalha',
    walkTo: 0.60,
    messages: [
      { char: 'dandara', text: 'Domingos mandou áudio pelo Insta:' },
      { char: 'domingos', text: '"Último offer: rendam-se e ninguém morre. 6.000 vs 1.500. Façam o ROI dessa batalha. 📊"' },
      { char: 'zumbi', text: 'Morrer de pé ou viver de joelhos?' },
      { char: 'grio', text: '🎤 Áudio (1:30)' },
      { char: 'grio', text: '"Viver não é covardia. Morrer não é coragem. Depende do porquê."' },
      { char: 'dandara', text: '...Griô, isso foi bonito.' },
      { char: 'grio', text: '😊' },
    ],
    choices: [
      { text: '🏳️ Render pra salvar o povo.', effects: { soberania: -20, insatisfacao: -15, populacao: 500 }, next: 'fase3_ultima' },
      { text: '⚔️ Lutar. A liberdade não se negocia.', effects: { soberania: 15, insatisfacao: 5, populacao: -5000 }, next: 'fase3_ultima' },
    ]
  },
  {
    id: 'fase3_ultima',
    phase: 3,
    bg: 'batalha',
    walkTo: 0.75,
    messages: [
      { char: 'sistema', text: '📅 6 de fevereiro de 1694' },
      { char: 'dandara', text: 'Se for nosso último dia: valeu a pena. Cada dia livre valeu. ❤️' },
      { char: 'grio', text: '🎤 Áudio (1:02)' },
      { char: 'grio', text: '"Guardem a história real. Não a bonita. A real. Promete?"' },
      { char: 'zumbi', text: 'Ninguém nos esquece. 🔥' },
      { char: 'espiao', text: 'A história é contada por quem sobrevive. Escolham bem quem conta a de vocês.' },
      { char: 'zumbi', text: 'QUEM É VOCÊ?? 👀👀👀' },
    ],
    choices: [
      { text: '📖 Guardar a história real, com defeitos e tudo.', effects: {}, next: 'END' },
      { text: '🏆 Guardar a lenda. Heróis perfeitos.', effects: { soberania: 10 }, next: 'END' },
    ]
  },
];

const ENDINGS = {
  resistencia: {
    title: '🛡️ A Resistência Unida',
    reason: 'Soberania alta com um povo unido (baixa insatisfação).',
    text: 'Palmares caiu em 6 de fevereiro de 1694 — mas caiu de pé e unido. 104 anos de liberdade, mais do que muitos países tiveram. O preço foi altíssimo, e a escolha foi consciente. Ninguém ali morreu de joelhos.',
  },
  ferro: {
    title: '⚔️ O Reino de Ferro',
    reason: 'Soberania altíssima, mas conquistada à custa da liberdade interna.',
    text: 'O quilombo sobreviveu forte — mas endureceu. As regras que protegiam o povo passaram a proteger o líder. Resistiu ao inimigo de fora virando, por dentro, um pouco daquilo que jurou combater.',
  },
  revolta: {
    title: '🔥 A Revolta Interna',
    reason: 'A insatisfação transbordou antes mesmo do inimigo chegar.',
    text: 'Não foram os canhões de Domingos que derrubaram Palmares primeiro — foi a panela de pressão de dentro. Quando o povo deixa de se reconhecer no projeto, nenhuma muralha segura.',
  },
  exodo: {
    title: '🌿 O Êxodo',
    reason: 'A população se dispersou para sobreviver ao cerco.',
    text: 'Palmares como lugar caiu, mas como ideia se espalhou pela mata em mil pedaços. Cada grupo que fugiu carregou uma semente. Sobreviver, às vezes, é a forma mais teimosa de resistir.',
  },
  prospera: {
    title: '💰 A Nação Próspera',
    reason: 'Riqueza e estabilidade econômica acima de tudo.',
    text: 'Palmares virou potência econômica do sertão — comerciava, acumulava, negociava de igual para igual. Mas a prosperidade tem um preço: até onde dá pra crescer sem fazer acordos com quem te quer acorrentado?',
  },
  verdade: {
    title: '📖 A Verdade',
    reason: 'Um caminho do meio: nem lenda perfeita, nem colapso.',
    text: 'Palmares durou 104 anos. Não era perfeito — tinha hierarquias, contradições e gente real fazendo escolhas impossíveis. Era uma sociedade humana, com tudo que isso significa. E talvez por isso valha a pena lembrar.',
  },
};

// ===== SISTEMA MULTI-DADO =====
const INITIAL_STATS = { soberania: 50, insatisfacao: 20, populacao: 300, riqueza: 50 };

// Os 4 dados vivos exibidos na HUD (tela principal)
const STATS = [
  { key: 'soberania',    emoji: '👑', label: 'Soberania',    kind: 'index' },
  { key: 'insatisfacao', emoji: '😤', label: 'Insatisfação', kind: 'index', higherIsBad: true },
  { key: 'populacao',    emoji: '👥', label: 'População',     kind: 'count' },
  { key: 'riqueza',      emoji: '💰', label: 'Riqueza',       kind: 'count' },
];

function clampStat(key, value) {
  if (key === 'soberania' || key === 'insatisfacao') return Math.max(0, Math.min(100, value));
  if (key === 'populacao' || key === 'riqueza') return Math.max(0, Math.round(value));
  return value;
}

// Dados derivados (mostrados no Dashboard, calculados a partir dos vivos)
function derivedIDH(s) {
  const bemEstar = (s.soberania + (100 - s.insatisfacao)) / 200;            // 0..1
  const perCapita = Math.min(1, (s.riqueza / Math.max(1, s.populacao)) / 0.4);
  return Math.round((bemEstar * 0.7 + perCapita * 0.3) * 100) / 100;
}
const TAXAS = { 'Igualitária': '5%', 'Conselho': '15%', 'Centralizada': '30%' };
function derivedTaxas(s) { return TAXAS[s.constituicao] || '10%'; }

// ===== ÁRVORE DE FINAIS — função PURA do perfil final (ordem = prioridade) =====
function pickEnding(s) {
  if (s.insatisfacao >= 70) return 'revolta';
  if (s.soberania >= 75 && s.insatisfacao >= 45) return 'ferro';
  if (s.soberania >= 60 && s.insatisfacao <= 35) return 'resistencia';
  if (s.populacao <= 10000) return 'exodo';
  if (s.riqueza >= 4500 && s.soberania >= 45) return 'prospera';
  return 'verdade';
}

// Aplica deltas/sets em um estado (puro) — usado pelo motor e pelos testes
function applyEffects(state, effects) {
  for (const k in effects) {
    if (k in INITIAL_STATS) state[k] = clampStat(k, (state[k] || 0) + effects[k]);
    else state[k] = effects[k];
  }
  return state;
}

const ONU_TEXT = `<h2>🌐 A ONU e Palmares</h2>
<p>A ONU foi criada em <strong>1945</strong> — 251 anos depois da queda de Palmares.</p>
<h3>O que é a ONU?</h3>
<p>Organização com 193 países que busca paz, segurança e direitos humanos.</p>
<h3>Como poderia intervir?</h3>
<ul>
<li><strong>Assembleia Geral</strong>: Palmares poderia pedir reconhecimento como nação independente.</li>
<li><strong>Conselho de Segurança</strong>: Poderia enviar capacetes azuis — mas só se nenhum membro permanente vetasse.</li>
<li><strong>ACNUR</strong>: Os quilombolas seriam classificados como refugiados?</li>
<li><strong>Declaração Universal dos Direitos Humanos (1948)</strong>: Art. 1 — "Todos nascem livres e iguais." Palmares tentou viver esse princípio 251 anos antes.</li>
</ul>
<h3>O dilema</h3>
<p>Em 1694, a escravidão era <em>legal</em>. A ONU protege a <strong>lei</strong> ou a <strong>justiça</strong>? E quando as duas não coincidem?</p>`;

const CREDITS = [
  { role: '', name: '🌴 PALMARES: O GRUPO 🌴' },
  { role: 'Criado por', name: 'Débora M. V.' },
  { role: 'Game Design & Narrativa', name: 'Débora M. V.' },
  { role: 'Pesquisa Histórica', name: 'Débora M. V.' },
  { role: 'Arte e Assets', name: 'Gerados com auxílio de IA' },
  { role: 'Diálogos', name: 'Desenvolvidos com auxílio de IA' },
  { role: 'Motor do Jogo', name: 'HTML5 / JavaScript' },
  { role: '—', name: '' },
  { role: 'Fontes Históricas', name: '' },
  { role: '', name: 'Edison Carneiro — O Quilombo dos Palmares (1947)' },
  { role: '', name: 'Décio Freitas — Palmares: a guerra dos escravos (1971)' },
  { role: '', name: 'Flávio Gomes — Palmares: escravidão e liberdade (2005)' },
  { role: '', name: 'John K. Thornton — Warfare in Atlantic Africa (1999)' },
  { role: '—', name: '' },
  { role: 'Trabalho Escolar — 2026', name: '"Construindo um Estado" — Grupo 3' },
  { role: '—', name: '' },
  { role: '', name: '"A história é contada por quem sobrevive.' },
  { role: '', name: 'Escolha bem quem conta a sua."' },
];

// Export p/ testes em Node (inofensivo no browser: 'module' é undefined lá)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    STORY, ENDINGS, STATS, INITIAL_STATS, BANDEIRAS,
    flagSVG, clampStat, pickEnding, derivedIDH, derivedTaxas, applyEffects,
  };
}
