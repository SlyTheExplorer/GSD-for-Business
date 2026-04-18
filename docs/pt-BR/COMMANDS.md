# Referência de Comandos do BRIEF

Este documento descreve os comandos principais do BRIEF em Português.  
Para detalhes completos de flags avançadas e mudanças recentes, consulte também a [versão em inglês](../COMMANDS.md).

---

## Fluxo Principal

| Comando | Finalidade | Quando usar |
|---------|------------|-------------|
| `/brief-new-project` | Inicialização completa: perguntas, pesquisa, requisitos e roadmap | Início de projeto |
| `/brief-discuss-phase [N]` | Captura decisões de implementação (`--chain`, `--power`) | Antes do planejamento |
| `/brief-ui-phase [N]` | Gera contrato de UI (`UI-SPEC.md`) | Fases com frontend |
| `/brief-plan-phase [N]` | Pesquisa + planejamento + verificação | Antes de executar uma fase |
| `/brief-execute-phase <N>` | Executa planos em ondas paralelas | Após planejamento aprovado |
| `/brief-verify-work [N]` | UAT manual com diagnóstico automático | Após execução |
| `/brief-ship [N]` | Cria PR da fase validada | Ao concluir a fase |
| `/brief-next` | Detecta e executa o próximo passo lógico | Qualquer momento |
| `/brief-fast <texto>` | Tarefa curta sem planejamento completo | Ajustes triviais |

## Navegação e Sessão

| Comando | Finalidade |
|---------|------------|
| `/brief-progress` | Mostra status atual e próximos passos |
| `/brief-resume-work` | Retoma contexto da sessão anterior |
| `/brief-pause-work` | Salva handoff estruturado |
| `/brief-session-report` | Gera resumo da sessão |
| `/brief-autonomous` | Executa todas as fases restantes de forma autônoma (`--from N`, `--to N`, `--only N`) |
| `/brief-help` | Lista comandos e uso |
| `/brief-update` | Atualiza o BRIEF |

## Gestão de Fases

| Comando | Finalidade |
|---------|------------|
| `/brief-add-phase` | Adiciona fase no roadmap |
| `/brief-insert-phase [N]` | Insere trabalho urgente entre fases |
| `/brief-remove-phase [N]` | Remove fase futura e reenumera |
| `/brief-list-phase-assumptions [N]` | Mostra abordagem assumida pelo Claude |
| `/brief-plan-milestone-gaps` | Cria fases para fechar lacunas de auditoria |

## Brownfield e Utilidades

| Comando | Finalidade |
|---------|------------|
| `/brief-map-codebase` | Mapeia base existente antes de novo projeto |
| `/brief-quick` | Tarefas ad-hoc com garantias do BRIEF |
| `/brief-debug [desc]` | Debug sistemático com estado persistente (`--diagnose` para modo diagnóstico) |
| `/brief-analyze-dependencies` | Detecta dependências entre fases e sugere `Depends on` no ROADMAP.md (v1.32) |
| `/brief-forensics` | Diagnóstico de falhas no workflow |
| `/brief-settings` | Configuração de agentes, perfil e toggles |
| `/brief-set-profile <perfil>` | Troca rápida de perfil de modelo |

## Qualidade de Código

| Comando | Finalidade |
|---------|------------|
| `/brief-review` | Peer review com múltiplas IAs |
| `/brief-pr-branch` | Cria branch limpa sem commits de planejamento |
| `/brief-audit-uat` | Audita dívida de validação/UAT |

## Backlog e Threads

| Comando | Finalidade |
|---------|------------|
| `/brief-add-backlog <desc>` | Adiciona item no backlog (999.x) |
| `/brief-review-backlog` | Promove, mantém ou remove itens |
| `/brief-plant-seed <ideia>` | Registra ideia com gatilho futuro |
| `/brief-thread [nome]` | Gerencia threads persistentes |

## Gerenciamento de Estado

| Comando | Finalidade |
|---------|------------|
| `state validate` | Detecta drift entre STATE.md e o filesystem real |
| `state sync` | Reconstrói STATE.md a partir do estado real no disco |
| `state sync --verify` | Dry-run: mostra mudanças propostas sem gravar |
| `state planned-phase --phase N --plans N` | Registra transição de estado após plan-phase |

```bash
node brief-tools.cjs state validate          # Detectar drift
node brief-tools.cjs state sync --verify     # Prévia do que sync mudaria
node brief-tools.cjs state sync              # Reconstruir STATE.md a partir do disco
```

---

## Exemplo rápido

```bash
/brief-new-project
/brief-discuss-phase 1
/brief-plan-phase 1
/brief-execute-phase 1
/brief-verify-work 1
/brief-ship 1
```
