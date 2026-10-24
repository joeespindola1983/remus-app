# Remus Icon Button — incremento 005

Fonte: Figma **07 Atoms — Icon Button** (`97:2`).

- Usa `RemusIcon` com paths SVG originais e cor semântica resolvida pela composição.
- `small` 40 px, `medium` 50 px, `large` 56 px: círculo contornado de 2 px.
- `workout` 72 px: círculo preenchido, exceção intencional para controles de treino. Neutral usa o token semântico `onAccent` (`#111827`) sobre `accent` para contraste adequado; Primary usa cor inversa.
- Variantes implementadas neste incremento: `neutral` (accent) e `primary`.
- Estados: default, pressed, disabled. `loading`, `warning` e `destructive` permanecem fora do escopo.
- `accessibilityLabel` é obrigatório; botão desabilitado não executa `onPress`.
- Small utiliza `hitSlop=4`, aumentando a área de interação de 40 para 48 px.
- Galeria debug-only: exemplos de quatro tamanhos e dois estados em Athlete Light/Dark.
- Antes do commit: `npm run verify` e validação visual nos dispositivos iOS/Android.
