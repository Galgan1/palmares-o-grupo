# 🌴 Palmares: O Grupo

Jogo narrativo interativo sobre o **Quilombo dos Palmares (1605–1694)**, no formato de um grupo de WhatsApp: Zumbi, Dandara, Ganga Zumba e o Griô trocam mensagens, áudios e enquetes — e você toma as decisões que constroem (ou condenam) a micronação.

Trabalho escolar de **Débora M. V.** — 2026.

🎮 **Jogar agora:** https://www.andregalgani.com.br/jogos/palmares/

## Como funciona
- **4 fases:** fundação do quilombo → 1605 → crescimento e cisão → o cerco final de 1694.
- **2 indicadores:** 👑 Soberania e 😤 Insatisfação, ajustados (+5 / -3...) a cada escolha.
- **3 finais**, definidos pelas suas decisões.
- **Dashboard do quilombo** (com a bandeira que você desenha) e um painel **"A ONU e Palmares"**.
- Histórico do chat preservado do começo ao fim, como num grupo de verdade.

## Stack
HTML + CSS + JavaScript puro — sem build, sem dependências.

## Rodar localmente

```bash
python -m http.server 8080
```

E abra http://localhost:8080/

## Estrutura
- `index.html` — telas e estrutura
- `game.js` — motor (chat, escolhas, indicadores, dashboard, finais)
- `story.js` — narrativa completa (18 nós, 4 fases, 3 finais) + bandeiras
- `style.css` — visual e responsividade (layout palco + chat, responsivo no celular)
- `assets/` — personagens (sprites com transparência) e cenários

## Créditos
Game design, narrativa e pesquisa histórica: **Débora M. V.**
Arte e diálogos desenvolvidos com auxílio de IA.
