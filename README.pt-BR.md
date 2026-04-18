<div align="center">

# GET SHIT DONE

[English](README.md) · **Português** · [简体中文](README.zh-CN.md) · [日本語](README.ja-JP.md)

**Um sistema leve e poderoso de meta-prompting, engenharia de contexto e desenvolvimento orientado a especificação para Claude Code, OpenCode, Gemini CLI, Kilo, Codex, Copilot, Cursor, Windsurf, Antigravity, Augment, Trae e Cline.**

**Resolve context rot — a degradação de qualidade que acontece conforme o Claude enche a janela de contexto.**

[![npm version](https://img.shields.io/npm/v/brief-cc?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/brief-cc)
[![npm downloads](https://img.shields.io/npm/dm/brief-cc?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/brief-cc)
[![Tests](https://img.shields.io/github/actions/workflow/status/brief-build/brief/test.yml?branch=main&style=for-the-badge&logo=github&label=Tests)](https://github.com/brief-build/brief/actions/workflows/test.yml)
[![Discord](https://img.shields.io/badge/Discord-Join-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/mYgfVNfA2r)
[![X (Twitter)](https://img.shields.io/badge/X-@gsd__foundation-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/gsd_foundation)
[![$BRIEF Token](https://img.shields.io/badge/$BRIEF-Dexscreener-1C1C1C?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iIzAwRkYwMCIvPjwvc3ZnPg==&logoColor=00FF00)](https://dexscreener.com/solana/dwudwjvan7bzkw9zwlbyv6kspdlvhwzrqy6ebk8xzxkv)
[![GitHub stars](https://img.shields.io/github/stars/brief-build/brief?style=for-the-badge&logo=github&color=181717)](https://github.com/brief-build/brief)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)

<br>

```bash
npx brief-cc@latest
```

**Funciona em Mac, Windows e Linux.**

<br>

![BRIEF Install](assets/terminal.svg)

<br>

*"Se você sabe claramente o que quer, isso VAI construir para você. Sem enrolação."*

*"Eu já usei SpecKit, OpenSpec e Taskmaster — este me deu os melhores resultados."*

*"De longe a adição mais poderosa ao meu Claude Code. Nada superengenheirado. Simplesmente faz o trabalho."*

<br>

**Confiado por engenheiros da Amazon, Google, Shopify e Webflow.**

[Por que eu criei isso](#por-que-eu-criei-isso) · [Como funciona](#como-funciona) · [Comandos](#comandos) · [Por que funciona](#por-que-funciona) · [Guia do usuário](docs/pt-BR/USER-GUIDE.md)

</div>

---

## Por que eu criei isso

Sou desenvolvedor solo. Eu não escrevo código — o Claude Code escreve.

Existem outras ferramentas de desenvolvimento orientado por especificação. BMAD, Speckit... Mas quase todas parecem mais complexas do que o necessário (cerimônias de sprint, story points, sync com stakeholders, retrospectivas, fluxos Jira) ou não entendem de verdade o panorama do que você está construindo. Eu não sou uma empresa de software com 50 pessoas. Não quero teatro corporativo. Só quero construir coisas boas que funcionem.

Então eu criei o BRIEF. A complexidade fica no sistema, não no seu fluxo. Por trás: engenharia de contexto, formatação XML de prompts, orquestração de subagentes, gerenciamento de estado. O que você vê: alguns comandos que simplesmente funcionam.

O sistema dá ao Claude tudo que ele precisa para fazer o trabalho *e* validar o resultado. Eu confio no fluxo. Ele entrega.

— **TÂCHES**

---

Vibe coding ganhou má fama. Você descreve algo, a IA gera código, e sai um resultado inconsistente que quebra em escala.

O BRIEF corrige isso. É a camada de engenharia de contexto que torna o Claude Code confiável.

---

## Para quem é

Para quem quer descrever o que precisa e receber isso construído do jeito certo — sem fingir que está rodando uma engenharia de 50 pessoas.

Quality gates embutidos capturam problemas reais: detecção de schema drift sinaliza mudanças ORM sem migrations, segurança ancora verificação a modelos de ameaça, e detecção de redução de escopo impede o planner de descartar requisitos silenciosamente.

### Destaques v1.32.0

- **Gates de consistência STATE.md** — `state validate` detecta divergência entre STATE.md e o filesystem; `state sync` reconstrói a partir do estado real do projeto
- **Flag `--to N`** — Para a execução autônoma após completar uma fase específica
- **Research gate** — Bloqueia planejamento quando RESEARCH.md tem perguntas abertas não resolvidas
- **Filtro de escopo do verificador** — Lacunas abordadas em fases posteriores são marcadas como "adiadas", não como lacunas
- **Guard de leitura antes de edição** — Hook consultivo previne loops de retry infinitos em runtimes não-Claude
- **Redução de contexto** — Truncamento de Markdown e ordenação de prompts cache-friendly para menor uso de tokens
- **4 novos runtimes** — Trae, Kilo, Augment e Cline (12 runtimes no total)

---

## Primeiros passos

```bash
npx brief-cc@latest
```

O instalador pede:
1. **Runtime** — Claude Code, OpenCode, Gemini, Kilo, Codex, Copilot, Cursor, Windsurf, Antigravity, Augment, Trae, Cline, ou todos
2. **Local** — Global (todos os projetos) ou local (apenas projeto atual)

Verifique com:
- Claude Code / Gemini / Copilot / Antigravity: `/brief-help`
- OpenCode / Kilo / Augment / Trae: `/brief-help`
- Codex: `$gsd-help`
- Cline: BRIEF instala via `.clinerules` — verifique se `.clinerules` existe

> [!NOTE]
> Claude Code 2.1.88+ e Codex instalam como skills (`skills/brief-*/SKILL.md`). Cline usa `.clinerules`. O instalador lida com todos os formatos automaticamente.

> [!TIP]
> Para instalação a partir do código-fonte ou ambientes sem npm, consulte **[docs/manual-update.md](docs/manual-update.md)**.

### Mantendo atualizado

```bash
npx brief-cc@latest
```

<details>
<summary><strong>Instalação não interativa (Docker, CI, Scripts)</strong></summary>

```bash
# Claude Code
npx brief-cc --claude --global
npx brief-cc --claude --local

# OpenCode
npx brief-cc --opencode --global

# Gemini CLI
npx brief-cc --gemini --global

# Kilo
npx brief-cc --kilo --global
npx brief-cc --kilo --local

# Codex
npx brief-cc --codex --global
npx brief-cc --codex --local

# Copilot
npx brief-cc --copilot --global
npx brief-cc --copilot --local

# Cursor
npx brief-cc --cursor --global
npx brief-cc --cursor --local

# Antigravity
npx brief-cc --antigravity --global
npx brief-cc --antigravity --local

# Augment
npx brief-cc --augment --global     # Install to ~/.augment/
npx brief-cc --augment --local      # Install to ./.augment/

# Trae
npx brief-cc --trae --global        # Install to ~/.trae/
npx brief-cc --trae --local         # Install to ./.trae/

# Cline
npx brief-cc --cline --global       # Install to ~/.cline/
npx brief-cc --cline --local        # Install to ./.clinerules

# Todos
npx brief-cc --all --global
```

Use `--global` (`-g`) ou `--local` (`-l`) para pular a pergunta de local.
Use `--claude`, `--opencode`, `--gemini`, `--kilo`, `--codex`, `--copilot`, `--cursor`, `--windsurf`, `--antigravity`, `--augment`, `--trae`, `--cline` ou `--all` para pular a pergunta de runtime.

</details>

### Recomendado: modo sem permissões

```bash
claude --dangerously-skip-permissions
```

> [!TIP]
> Esse é o modo pensado para o BRIEF: aprovar `date` e `git commit` 50 vezes mata a produtividade.

---

## Como funciona

> **Já tem código?** Rode `/brief-map-codebase` primeiro para analisar stack, arquitetura, convenções e riscos.

### 1. Inicializar projeto

```
/brief-new-project
```

O sistema:
1. **Pergunta** até entender seu objetivo
2. **Pesquisa** o domínio com agentes em paralelo
3. **Extrai requisitos** (v1, v2 e fora de escopo)
4. **Monta roadmap** por fases

**Cria:** `PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`, `.planning/research/`

### 2. Discutir fase

```
/brief-discuss-phase 1
```

Captura suas preferências de implementação antes do planejamento.

**Cria:** `{phase_num}-CONTEXT.md`

### 3. Planejar fase

```
/brief-plan-phase 1
```

1. Pesquisa abordagens
2. Cria 2-3 planos atômicos em XML
3. Verifica contra os requisitos

**Cria:** `{phase_num}-RESEARCH.md`, `{phase_num}-{N}-PLAN.md`

### 4. Executar fase

```
/brief-execute-phase 1
```

1. Executa planos em ondas
2. Contexto novo por plano
3. Commit atômico por tarefa
4. Verifica contra objetivos

**Cria:** `{phase_num}-{N}-SUMMARY.md`, `{phase_num}-VERIFICATION.md`

### 5. Verificar trabalho

```
/brief-verify-work 1
```

Validação manual orientada para confirmar que a feature realmente funciona como esperado.

**Cria:** `{phase_num}-UAT.md` e planos de correção se necessário

### 6. Repetir -> Entregar -> Completar

```
/brief-discuss-phase 2
/brief-plan-phase 2
/brief-execute-phase 2
/brief-verify-work 2
/brief-ship 2
/brief-complete-milestone
/brief-new-milestone
```

Ou deixe o BRIEF decidir:

```
/brief-next
```

### Modo rápido

```
/brief-quick
```

Para tarefas ad-hoc sem ciclo completo de planejamento.

---

## Por que funciona

### Engenharia de contexto

| Arquivo | Papel |
|---------|-------|
| `PROJECT.md` | Visão do projeto |
| `research/` | Conhecimento do ecossistema |
| `REQUIREMENTS.md` | Escopo v1/v2 |
| `ROADMAP.md` | Direção e progresso |
| `STATE.md` | Memória entre sessões |
| `PLAN.md` | Tarefa atômica com XML |
| `SUMMARY.md` | O que mudou |
| `todos/` | Ideias para depois |
| `threads/` | Contexto persistente |
| `seeds/` | Ideias para próximos marcos |

### Formato XML de prompt

```xml
<task type="auto">
  <name>Create login endpoint</name>
  <files>src/app/api/auth/login/route.ts</files>
  <action>
    Use jose for JWT (not jsonwebtoken - CommonJS issues).
    Validate credentials against users table.
    Return httpOnly cookie on success.
  </action>
  <verify>curl -X POST localhost:3000/api/auth/login returns 200 + Set-Cookie</verify>
  <done>Valid credentials return cookie, invalid return 401</done>
</task>
```

### Orquestração multiagente

Um orquestrador leve chama agentes especializados para pesquisa, planejamento, execução e verificação.

### Commits atômicos

Cada tarefa gera commit próprio, facilitando `git bisect`, rollback e rastreabilidade.

---

## Comandos

### Fluxo principal

| Comando | O que faz |
|---------|-----------|
| `/brief-new-project [--auto]` | Inicializa projeto completo |
| `/brief-discuss-phase [N] [--auto] [--analyze] [--chain]` | Captura decisões antes do plano (`--chain` encadeia automaticamente em plan+execute) |
| `/brief-plan-phase [N] [--auto] [--reviews]` | Pesquisa + plano + validação |
| `/brief-execute-phase <N>` | Executa planos em ondas paralelas |
| `/brief-verify-work [N]` | UAT manual |
| `/brief-ship [N] [--draft]` | Cria PR da fase validada |
| `/brief-next` | Avança automaticamente para o próximo passo |
| `/brief-fast <text>` | Tarefas triviais sem planejamento |
| `/brief-complete-milestone` | Fecha o marco e marca release |
| `/brief-new-milestone [name]` | Inicia próximo marco |

### Qualidade e utilidades

| Comando | O que faz |
|---------|-----------|
| `/brief-review` | Peer review com múltiplas IAs |
| `/brief-pr-branch` | Cria branch limpa para PR |
| `/brief-settings` | Configura perfis e agentes |
| `/brief-set-profile <profile>` | Troca perfil (quality/balanced/budget/inherit) |
| `/brief-quick [--full] [--discuss] [--research]` | Execução rápida com garantias do BRIEF (`--full` ativa todas as etapas, `--validate` ativa apenas verificação) |
| `/brief-health [--repair]` | Verifica e repara `.planning/` |

> Para a lista completa de comandos e opções, use `/brief-help`.

---

## Configuração

As configurações do projeto ficam em `.planning/config.json`.
Você pode configurar no `/brief-new-project` ou ajustar depois com `/brief-settings`.

### Ajustes principais

| Configuração | Opções | Padrão | Controle |
|--------------|--------|--------|----------|
| `mode` | `yolo`, `interactive` | `interactive` | Autoaprovar vs confirmar etapas |
| `granularity` | `coarse`, `standard`, `fine` | `standard` | Granularidade de fases/planos |

### Perfis de modelo

| Perfil | Planejamento | Execução | Verificação |
|--------|--------------|----------|-------------|
| `quality` | Opus | Opus | Sonnet |
| `balanced` | Opus | Sonnet | Sonnet |
| `budget` | Sonnet | Sonnet | Haiku |
| `inherit` | Inherit | Inherit | Inherit |

Troca rápida:
```
/brief-set-profile budget
```

---

## Segurança

### Endurecimento embutido

O BRIEF inclui proteções como:
- prevenção de path traversal
- detecção de prompt injection
- validação de argumentos de shell
- parsing seguro de JSON
- scanner de injeção para CI

### Protegendo arquivos sensíveis

Adicione padrões sensíveis ao deny list do Claude Code:

```json
{
  "permissions": {
    "deny": [
      "Read(.env)",
      "Read(.env.*)",
      "Read(**/secrets/*)",
      "Read(**/*credential*)",
      "Read(**/*.pem)",
      "Read(**/*.key)"
    ]
  }
}
```

---

## Solução de problemas

**Comandos não apareceram após instalar?**
- Reinicie o runtime
- Verifique se os arquivos foram instalados no diretório correto

**Comandos não funcionam como esperado?**
- Rode `/brief-help`
- Reinstale com `npx brief-cc@latest`

**Em Docker/container?**
- Defina `CLAUDE_CONFIG_DIR` antes da instalação:

```bash
CLAUDE_CONFIG_DIR=/home/youruser/.claude npx brief-cc --global
```

### Desinstalar

```bash
# Instalações globais
npx brief-cc --claude --global --uninstall
npx brief-cc --opencode --global --uninstall
npx brief-cc --gemini --global --uninstall
npx brief-cc --kilo --global --uninstall
npx brief-cc --codex --global --uninstall
npx brief-cc --copilot --global --uninstall
npx brief-cc --cursor --global --uninstall
npx brief-cc --antigravity --global --uninstall
npx brief-cc --augment --global --uninstall
npx brief-cc --trae --global --uninstall
npx brief-cc --cline --global --uninstall

# Instalações locais (projeto atual)
npx brief-cc --claude --local --uninstall
npx brief-cc --opencode --local --uninstall
npx brief-cc --gemini --local --uninstall
npx brief-cc --kilo --local --uninstall
npx brief-cc --codex --local --uninstall
npx brief-cc --copilot --local --uninstall
npx brief-cc --cursor --local --uninstall
npx brief-cc --antigravity --local --uninstall
npx brief-cc --augment --local --uninstall
npx brief-cc --trae --local --uninstall
npx brief-cc --cline --local --uninstall
```

---

## Community Ports

OpenCode, Gemini CLI, Kilo e Codex agora são suportados nativamente via `npx brief-cc`.

| Projeto | Plataforma | Descrição |
|---------|------------|-----------|
| [gsd-opencode](https://github.com/rokicool/brief-opencode) | OpenCode | Adaptação original para OpenCode |
| gsd-gemini (archived) | Gemini CLI | Adaptação original para Gemini por uberfuzzy |

---

## Star History

<a href="https://star-history.com/#gsd-build/brief&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=gsd-build/brief&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=gsd-build/brief&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=gsd-build/brief&type=Date" />
 </picture>
</a>

---

## Licença

Licença MIT. Veja [LICENSE](LICENSE).

---

<div align="center">

**Claude Code é poderoso. O BRIEF o torna confiável.**

</div>
