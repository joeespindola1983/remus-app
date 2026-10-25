# Remus Icon Button — incremento 005

Fonte: Figma **07 Atoms — Icon Button** (`97:2`).

- Usa `RemusIcon` com paths SVG originais e cor semântica resolvida pela composição.
- `small` 40 px, `medium` 50 px, `large` 56 px: círculo contornado de 2 px.
- `workout` 72 px: círculo preenchido, exceção intencional para controles de treino. Neutral usa o token semântico `onAccent` (`#111827`) sobre `accent` para contraste adequado; Primary usa cor inversa.
- Variantes: `neutral` (accent), `primary`, `warning`, `destructive`; todos usam tokens semânticos Light/Dark.
- Estados: default, pressed, disabled e loading. Loading substitui o ícone pelo vetor oficial `Icon/Loading` (`176:387`), anima rotação (exceto com Reduce Motion), desabilita ações e expõe `accessibilityState.busy`.
- `accessibilityLabel` é obrigatório; botão desabilitado não executa `onPress`.
- Small utiliza `hitSlop=4`, aumentando a área de interação de 40 para 48 px.
- Galeria debug-only: exemplos de quatro tamanhos e dois estados em Athlete Light/Dark.
- Antes do commit: `npm run verify` e validação visual nos dispositivos iOS/Android.

- Warning usa `warning` / `warningPressed` e o contraste `onWarning` / `onWarningPressed` no Workout. Destructive usa `destructive` / `destructivePressed` e `onDestructive`.
- Loading usa a mesma cor semântica da variante ativa, sem novas dependências ou ícones de terceiros.

- Auditoria de fidelidade: o componente `111:50` (Warning, Medium, Default) no Figma está ligado incorretamente a `warning-pressed` e apresenta o mesmo contorno de Pressed. A implementação usa `color/action/warning` em Default e `color/action/warning-pressed` em Pressed; revisar essa discrepância no Figma antes da homologação final.
- Para ações destrutivas irreversíveis, o consumidor deve solicitar confirmação; o átomo não implementa fluxos de negócios.
