# Gravação — integração com Remus Recorder

## Decisão e limites

Estudo autorizado em 2026-10-25. Reaproveitar o núcleo do `../remus-recorder` para
captura e persistência nativas. Esta revisão substitui a proposta de criar uma
máquina de estados de gravação do zero na 014A. Não implementa captura no app.

O primeiro destino é **phone-only**, com início, parada, recuperação e exportação.
Reutilizar o Design System do remus-app. BLE, Watch, Wear OS, comunidade,
sincronização remota e novos algoritmos esportivos ficam para incrementos próprios.
Pausa/retomada não é prometida até existir uma semântica nativa verificável.

## Fonte examinada e reprodutibilidade

- App: `develop`, marco QA `v0.0.2`, commit `96ca00b`.
- Recorder: `hotfix/recorder-3.3.0-phone-only`, HEAD
  `1e4c0a64d3f7bbbfe30247c0c07008921dbf134d`, package `3.3.0`.
- **O working tree do Recorder está modificado.** O estudo inclui arquivos locais
  ainda não commitados; entre eles `RemusRecordingService.kt` e testes Android.
  HEAD sozinho não reproduz o comportamento estudado. Antes de portar código,
  registrar o commit homologado que contenha essas mudanças ou um snapshot
  explicitamente aprovado e seus hashes. Não commitar mudanças do outro projeto
  como parte desta tarefa.
- Os documentos do Recorder referenciam `docs/DATA_DICTIONARY.md`,
  `docs/DATA_MODEL_AND_FLOW.md`, `docs/DATA_INGESTION_AND_ENRICHMENT.md` e
  `contracts/terminology/` no app. Eles não estão presentes neste checkout do app.
  Resolver a origem antes de afirmar conformidade com esse catálogo.
- Estudo estático de arquivos e testes existentes; não foi executada a suíte do
  Recorder nem repetida sua homologação física nesta revisão.

## Mapa de reaproveitamento

Todos os caminhos de origem abaixo são relativos a `../remus-recorder`.

| Origem | Uso no app | Adaptação / critério |
| --- | --- | --- |
| `src/services/recording/RecordingService.ts` | Contrato de comandos, estado, manifest e exportação | Recortar phone-only; validar respostas em runtime e normalizar aliases |
| `ios/RemusApp/RemusRecordingBridge.swift` e `.m` | Core Motion, Core Location e bridge | Separar dependências Watch/BLE; verificar RN 0.88 e permissões QA |
| `ios/RemusApp/RemusEvidenceStore.swift` | Escrita serial, sincronização, manifest, hashes e recuperação | Preservar formato e identidades; testar falhas e recuperação |
| `android/app/src/main/java/com/espindola/remus/recorder/RemusRecordingModule.kt` | Sensores e localização Android | Adaptar namespace/registro; separar SPM e integrações opcionais |
| `android/app/src/main/java/com/espindola/remus/recorder/RemusRecordingService.kt` | Serviço foreground, notificação e wake lock | Qualificar ownership da captura e falha de inicialização |
| `android/app/src/main/java/com/espindola/remus/recorder/RemusEvidenceStore.kt` | Writer, manifest, recuperação e ZIP | Corrigir/qualificar durabilidade antes de homologar |
| `src/application/coordinator/RecordingCoordinator.ts` | Referência de comandos idempotentes e confirmação de finalização | Não portar o protocolo multifonte inteiro para phone-only |
| `src/contracts/acquisition/` e testes de gravação | Semântica, unidades, identidade e fixtures | Importar somente dependências necessárias ao contrato escolhido |

Começar com um recorte rastreável dos arquivos, atrás de uma interface pequena.
Não depender em runtime de caminhos absolutos para o checkout irmão. Não publicar
um pacote compartilhado ou introduzir monorepo antes de qualificar esse recorte.
Após os dois adapters funcionarem, avaliar extração compartilhada para evitar
divergência entre os produtos.

## Pontos encontrados que exigem validação

1. **Contrato Android divergente:** `startRecording` retorna `directoryPath`,
   enquanto `RecordingStartResult` declara `artifactDirectory`. Normalizar no
   adapter e testar a resposta real de cada plataforma; não usar cast como prova.
2. **Falhas de persistência Android:** `append`, fechamento de writers e
   `writeManifest` possuem catches vazios. `stop` pode retornar `finalized` apesar
   de falhas ignoradas; `manifest.json` usa escrita direta. Exigir propagação de
   falha, estado interrompido, sincronização e substituição atômica verificadas.
3. **Segundo plano Android:** o serviço mantém foreground/wake lock, mas os
   listeners ficam no módulo React Native. `START_STICKY` sozinho não restaura
   aquisição. Testar perda/recriação do processo e falha de startService, hoje
   silenciosa; não representar serviço ativo como prova de captura ativa.
4. **iOS possui mecanismos úteis:** fila serial, sync a cada 500 appends,
   manifest atômico e falha registrada que impede finalização normal. Ainda
   medir filas, perda máxima e comportamento com tela bloqueada em aparelho.
5. **Coordenador e bridge são caminhos diferentes:** o reducer planeja IDs e
   prepare/commit, enquanto a bridge recebe `sourceIds` e cria IDs no nativo.
   Para phone-only, o adapter deve adotar os IDs efetivamente persistidos e
   reconciliar estado após timeout. Não inventar confirmação distribuída.
6. **Pausa ausente na interface nativa examinada:** não oferecer botão funcional
   apoiado apenas em timer JS. Planejar separadamente sem reescrever evidência.
7. **Teste de recuperação Android:**
   `testFinalizeRecordingRepairsInterruptedSession` reproduz parsing no próprio
   teste, sem chamar `finalizeRecording`. Acrescentar cobertura do caminho real.
8. **Documentação defasada:** `IOS_EVIDENCE_RECORDING.md` ainda descreve Android
   como futuro. A existência de implementação não prova equivalência ou QA.
9. **Compatibilidade:** Recorder usa RN 0.87.1/React 19.2.3; app usa
   RN 0.88.0/React 19.3.0. Qualificar as bridges no app sem downgrade da base.

## SQLite e arquivos de captura

Manter `remus.sqlite` como journal e futuro catálogo consultável de gravações,
estado e referências aos artefatos. O Recorder hoje preserva amostras em arquivos
NDJSON nativos e manifests; aproveitar esse caminho primeiro. Não converter
amostras para inserts individuais via JavaScript nem duplicar a captura em dois
writers. SQLite continua sendo parte da arquitetura escolhida pelo usuário.

Manifest/arquivos nativos são a evidência de captura; o catálogo SQLite é uma
projeção reconstruível. Uma falha de atualização do catálogo não deve apagar
artefatos nem transformar gravação incompleta em concluída. Coordenadas e amostras
nunca entram no journal diagnóstico de 200 eventos/64 KiB.

## Sequência de entregas

Cada incremento termina em revisão de diff, evidências de teste e homologação.
Não começar automaticamente o próximo incremento após implementar o anterior.

| Etapa | Entrega pequena | Aceite observável |
| --- | --- | --- |
| 014A — contrato e baseline | Fixar origem homologada; adapter phone-only com fake e fixtures das duas bridges; decisão de IDs e aliases | Start/state/stop/export normalizados; falhas, timeout, resposta inválida e comando repetido cobertos; nenhuma dependência nativa nova |
| 014B — iOS | Portar captura/writer necessários; início/parada em tela QA usando componentes existentes | Aparelho grava movimento/GPS, fecha manifest com hashes válidos, exporta e preserva IDs; permissões negadas não mostram gravação ativa |
| 014C — Android | Portar captura/serviço/writer e qualificar falhas identificadas | Mesmo contrato; notificação e background testados; erro de escrita nunca resulta em sucesso falso |
| 014D — recuperação e catálogo | Indexar manifests no SQLite e reconciliar interrupções de forma idempotente | Reinício encontra arquivos; cauda truncada e manifest incompleto preservam evidência e motivo da interrupção; sem duplicação |
| 014E — qualificação phone-only | Histórico mínimo, exportação e campanha em aparelhos físicos | Gravação prolongada, tela bloqueada, segundo treino, pouco espaço e interrupção têm resultados registrados e verificáveis |
| Posterior | Pausa, Remus PC/BLE, store-and-forward, relógios e engine | Contratos e QA próprios; só iniciar após homologação phone-only |

## QA necessário para portar o Recorder

- Fixtures sintéticas: mesmo activityId/recordingId no retorno, manifest e amostras;
  timestamps originais e domínios de relógio preservados; medidas ausentes não
  viram zero; unidade de aceleração explícita e validada entre plataformas.
- Falha injetada em append, sync, manifest e exportação; stop repetido e timeout;
  start enquanto ativo; recuperação após término abrupto.
- Validar hashes e contagens independentemente do contador da tela.
- Rodar `npm run verify` e `npm run firebase:verify`; builds QA nativos quando
  houver alterações de bridge/configuração. Confirmar RN 0.88 no host real.
- Em aparelhos iPhone/Android: sessão inicial curta e depois pelo menos 30 minutos
  com tela bloqueada; segunda sessão consecutiva; GPS/permissão indisponível;
  retorno após encerramento do processo. Simulador não comprova esses cenários.
- Telemetria informa código/etapa da falha, sem PII, coordenadas ou payload bruto.

## Git e versão

Manter v0.0.2 imutável. Trabalho futuro em feature a partir de develop conforme
`git-workflow.md`. Não modificar/pushar o Recorder a partir deste plano.
Documentação isolada não exige bump de binário. Em cada novo marco QA distribuído,
incrementar npm/lock, Gradle versionName/versionCode e todas as configurações
Xcode MARKETING_VERSION/CURRENT_PROJECT_VERSION. Rodar `version:verify` e conferir
versão dentro dos artefatos. O verificador atual compara consistência; não detecta
sozinho que alguém esqueceu de incrementar todos os números simultaneamente.

## Prompt pronto para um modelo de execução mais rápido

> Implemente somente a 014A de docs/recording-integration-plan.md no remus-app.
> Leia o plano e docs/git-workflow.md; confira branch, status e instruções locais.
> Releia as interfaces atuais do remus-recorder sem modificá-lo. O checkout
> estudado tinha mudanças não commitadas: reporte se ainda não há baseline
> homologada e não porte código nativo nessa situação. Prepare o contrato
> phone-only e um adapter testável por injeção de uma bridge fake, usando o menor
> recorte necessário das interfaces existentes. Normalize directoryPath para
> artifactDirectory na fronteira, preserve IDs retornados e rejeite respostas
> inválidas. Explicite comandos repetidos, timeout/estado desconhecido e
> recuperação via consulta de estado; nunca declare finalização por timer.
> Não acrescente pause/resume, sensores, dependências, BLE, Watch, algoritmos
> esportivos ou um segundo coordenador multifonte. Adicione testes comportamentais
> com fixtures sintéticas de iOS e Android. Execute npm run verify. Entregue diff,
> testes, limitações e roteiro de homologação, parando antes de commit/merge e da
> 014B. Não altere tags existentes. Documente a origem exata de qualquer código
> reutilizado e pare se o contrato depender de terminologia ausente e ambígua.
