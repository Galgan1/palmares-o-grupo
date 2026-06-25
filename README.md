# 🌴 Palmares: O Grupo

Jogo narrativo interativo sobre o **Quilombo dos Palmares (1605–1694)**, no formato de um grupo de mensagens: Zumbi, Dandara, Ganga Zumba e o Griô trocam mensagens, áudios e enquetes — e **você** toma as decisões que constroem (ou condenam) a micronação.

Projeto escolar (2026) dos alunos **Laura Lima · Rafael Afonso · Débora Marilack · Luiz Teodoro · João Luiz**.

🎮 **Jogar agora:** https://www.andregalgani.com.br/jogos/palmares/

## Como funciona
- **4 fases:** fundação do quilombo → 1605 → crescimento e cisão → o cerco final de 1694.
- **4 dados vivos** na tela: 👑 Soberania, 😤 Insatisfação, 👥 População e 💰 Riqueza — cada escolha move vários deles.
- **6 finais**, definidos pelo perfil final das suas decisões.
- Tela de **Introdução**, **Dashboard do quilombo** (com a bandeira que você desenha) e um painel **"A ONU e Palmares"**.

## Stack
HTML + CSS + JavaScript puro — sem build, sem dependências.

## Rodar localmente

```bash
python -m http.server 8080
```

E abra http://localhost:8080/

## Testes

```bash
node test.js
```

Verifica integridade do grafo, limites dos dados e que todos os 6 finais são alcançáveis.

## Estrutura
- `index.html` — telas e estrutura
- `game.js` — motor (chat, escolhas, dados, dashboard, finais)
- `story.js` — narrativa (18 nós, 4 fases, 6 finais) + bandeiras + lógica testável
- `style.css` — visual e responsividade
- `assets/` — personagens (sprites com transparência) e cenários

## Créditos
Projeto de **Laura Lima, Rafael Afonso, Débora Marilack, Luiz Teodoro e João Luiz**.
Arte e diálogos desenvolvidos com auxílio de IA.
