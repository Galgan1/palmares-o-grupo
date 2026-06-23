// Testes do Palmares: O Grupo — rodar com: node test.js  (exit 0 = verde)
// Cobrem: integridade do grafo, limites dos stats, árvore de finais e helpers.
const S = require('./story.js');
const { STORY, ENDINGS, INITIAL_STATS, BANDEIRAS, flagSVG, clampStat, pickEnding, applyEffects } = S;

let fails = 0;
const ok = (cond, msg) => { if (cond) { console.log('  ok  ' + msg); } else { console.log('FAIL  ' + msg); fails++; } };

// ---------- 1. Integridade do grafo ----------
const ids = new Set(STORY.map(n => n.id));
let graphOk = true, semEscolhas = false;
STORY.forEach(n => {
  if (!n.choices || !n.choices.length) semEscolhas = true;
  (n.choices || []).forEach(c => { if (c.next !== 'END' && !ids.has(c.next)) graphOk = false; });
});
ok(graphOk, 'todo choice.next resolve para um nó existente ou END');
ok(!semEscolhas, 'todo nó tem ao menos uma escolha');

// alcançabilidade a partir de start
const seen = new Set(); const stack = ['start'];
while (stack.length) { const id = stack.pop(); if (seen.has(id) || id === 'END') continue; seen.add(id); STORY.find(x => x.id === id).choices.forEach(c => stack.push(c.next)); }
ok(STORY.every(n => seen.has(n.id)), 'todos os nós são alcançáveis a partir de start');

// ---------- 2. Helpers puros ----------
ok(clampStat('soberania', 150) === 100 && clampStat('soberania', -10) === 0, 'soberania clampa em 0..100');
ok(clampStat('populacao', -5) === 0, 'populacao nunca fica negativa');
ok(clampStat('populacao', 12.6) === 13, 'populacao é arredondada');
ok(Object.keys(BANDEIRAS).every(b => flagSVG(b).startsWith('<svg')), 'flagSVG desenha cada bandeira');
ok(flagSVG('inexistente') === '', 'flagSVG vazio para bandeira desconhecida');

// ---------- 3. Enumeração determinística de TODAS as jogadas ----------
const seq = []; let id = 'start';
while (id !== 'END') { const n = STORY.find(x => x.id === id); seq.push(n); id = n.choices[0].next; }
const radices = seq.map(n => n.choices.length);
const total = radices.reduce((a, b) => a * b, 1);

const endingsHit = {};
const bounds = { soberania: [Infinity, -Infinity], insatisfacao: [Infinity, -Infinity], populacao: [Infinity, -Infinity], riqueza: [Infinity, -Infinity] };
let boundsOk = true, endingValido = true;

for (let i = 0; i < total; i++) {
  let rem = i;
  const state = Object.assign({}, INITIAL_STATS);
  for (let j = 0; j < seq.length; j++) {
    const node = seq[j];
    if (node.onEnter) applyEffects(state, node.onEnter);
    const idx = rem % radices[j]; rem = Math.floor(rem / radices[j]);
    applyEffects(state, node.choices[idx].effects || {});
  }
  for (const k of Object.keys(bounds)) {
    bounds[k][0] = Math.min(bounds[k][0], state[k]);
    bounds[k][1] = Math.max(bounds[k][1], state[k]);
  }
  if (state.soberania < 0 || state.soberania > 100 || state.insatisfacao < 0 || state.insatisfacao > 100 || state.populacao < 0 || state.riqueza < 0) boundsOk = false;
  const e = pickEnding(state);
  if (!ENDINGS[e]) endingValido = false;
  endingsHit[e] = (endingsHit[e] || 0) + 1;
}

console.log(`  ..  ${total.toLocaleString()} jogadas possíveis enumeradas`);
console.log('  ..  finais alcançados:', endingsHit);
console.log('  ..  faixas dos stats:', JSON.stringify(bounds));
ok(boundsOk, 'stats permanecem nos limites em todas as jogadas');
ok(endingValido, 'pickEnding sempre retorna um final que existe em ENDINGS');
ok(Object.keys(endingsHit).length >= 5, `>= 5 finais distintos alcançáveis (${Object.keys(endingsHit).length})`);
ok(Object.keys(ENDINGS).every(k => k in endingsHit), 'todo final declarado é de fato alcançável (sem final morto)');

// ---------- 4. Todos os 4 dados realmente variam ----------
const variam = Object.keys(bounds).every(k => bounds[k][0] !== bounds[k][1]);
ok(variam, 'os 4 dados (soberania, insatisfação, população, riqueza) variam conforme as escolhas');

console.log(fails === 0 ? '\nVERDE: todos os testes passaram.' : `\nVERMELHO: ${fails} teste(s) falharam.`);
process.exit(fails === 0 ? 0 : 1);
