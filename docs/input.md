# Remus Input — incremento 007

Fonte: **10 Atoms — Form Controls** (`198:206`) > `Atom/Input` (`304:10`).

- Input nativo de uma linha (`TextInput`), sem dependências adicionais.
- Altura **48 dp/pt**, raio **8**, padding horizontal **16**, fonte de sistema **16**.
- Estados: Default (borda 1), Focused (borda 2 no token focus/primary), Error (borda 2 no token feedback/error), Disabled (borda 1 no token disabled, opacidade 0,55).
- Prioridade visual: Disabled > Error > Focused > Default.
- `onFocus` e `onBlur` preservam callbacks do consumidor; `disabled` bloqueia edição.
- Texto usa cor semântica `text`; placeholder usa `secondaryText`.
- `value`, `onChangeText` e propriedades nativas de `TextInput` continuam disponíveis.
- Labels, helper text e mensagens de validação pertencem à futura **Molecule/Field**, conforme o Figma. O átomo recebe `accessibilityLabel` quando usado isoladamente.
- Galeria de QA inclui entrada editável, erro e desabilitado. Toque no campo normal para conferir o estado de foco.
- Antes do commit: `npm run verify` no projeto com dependências instaladas, depois homologação em iOS e Android Light/Dark.
