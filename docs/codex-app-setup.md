# Codex App Setup For China Localization

本文档记录本项目在 Codex App + MyCustomWSL + Worktree + parallel subagents 下的基础设置建议。第一阶段只做配置、检查、文档和规划，不修改业务代码。

## Current Environment Snapshot

- Workspace path: `/home/codex/code/fuyi`
- Windows UNC path: `\\wsl$\MyCustomWSL\home\codex\code\fuyi`
- Location check: project is in the WSL Linux filesystem, not under `/mnt/c`
- Git branch: `main`
- Git status at setup time: branch tracks `origin/main`; untracked `.agents/` exists
- `.nvmrc`: `24`
- `package.json` engine: `node >=20`
- Package manager declared by root `package.json`: `bun@1.3.13`
- Root workspaces: `packages/*`, `apps/*`
- Current apps: `apps/admin`, `apps/vendor`
- Current backend package: `packages/api`

## Node And Package Manager Notes

The preferred Node version is Node 24. The project already has `.nvmrc` set to `24`, and the root/package API engines only require `>=20`, so no `.nvmrc` change is needed.

In non-interactive WSL commands, `node` may not be available until nvm is loaded. Use:

```bash
source ~/.nvm/nvm.sh
nvm use
node --version
```

Observed after loading nvm:

```text
nvm: 0.40.4
node: v24.15.0
corepack: 0.34.6
npm: 11.12.1
```

At setup time, `bun` is not installed in the checked WSL PATH, while `package.json` declares `bun@1.3.13`. Before running project scripts, install or expose Bun in MyCustomWSL, then verify:

```bash
bun --version
bun install
bun run check-types
```

Do not add another package manager lockfile unless the project explicitly changes package manager policy.

## Codex App Working Pattern

1. Open the folder through the WSL path: `/home/codex/code/fuyi`.
2. Keep the main thread on planning, integration, and final review.
3. Create one worktree per independent audit or low-risk PR.
4. Assign parallel subagents only to independent scopes.
5. Keep high-risk payment, refund, reconciliation, payout, commission, and permission work serial.

Recommended first Codex App actions:

1. Confirm the workspace path points to `MyCustomWSL:/home/codex/code/fuyi`.
2. Confirm the terminal loads nvm or manually run `source ~/.nvm/nvm.sh && nvm use`.
3. Install or expose Bun 1.3.13 in MyCustomWSL.
4. Run a read-only baseline check after Bun is available:

```bash
bun install
bun run check-types
bun run lint
```

5. Create worktrees only after baseline checks are understood.

## Safe First-Phase Commands

```bash
pwd
git status --short --branch
cat .nvmrc
source ~/.nvm/nvm.sh && nvm use
node --version
corepack --version
bun --version
bun run check-types
bun run lint
```

Avoid running mutation-heavy scripts or database seed/reset commands unless the current task explicitly requires them.

## Subagent Guardrails

All subagent prompts should include:

- Work in zh-CN.
- Do not modify business code during audit.
- Do not touch payment, order, refund, payout, commission, or permission logic unless that is the assigned high-risk serial task.
- Do not add dependencies.
- Do not write real secrets.
- Return files inspected, findings, risk level, and verification steps.

