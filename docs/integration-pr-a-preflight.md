# PR A Preflight: Codex Workflow And Task Memory

日期：2026-05-05

本文档记录 `china/integration-localization` worktree 第一批 PR A 的预检结果。PR A 目标是提交 Codex 工作流、任务队列、记忆文件和基础本地化规划，不包含应用 UI、后端业务代码或真实 Provider。

## 建议纳入 PR A

```text
AGENTS.md
.codex/memory.md
.codex/queue.md
.codex/scripts/start-dev.sh
.codex/tasks/README.md
.codex/tasks/admin-shell.md
.codex/tasks/vendor-shell.md
.codex/tasks/codegen-baseline.md
.codex/tasks/pickup-card-architecture.md
.codex/tasks/mock-service-providers.md
.codex/tasks/storefront-zhcn-baseline.md
.codex/tasks/*.md
docs/china-localization-task-list.md
docs/codex-app-setup.md
docs/china-worktree-plan.md
```

说明：

- `.codex/tasks/*.md` 可以整体纳入 PR A，因为它们是后续一句话执行任务的入口。
- `.codex/scripts/start-dev.sh` 建议纳入 PR A，因为它解决重启后后台 shell PATH 不加载导致 `bun` 找不到的问题，并提供统一服务恢复入口。
- `docs/china-localization-task-list.md` 属于任务规划主文档，可以随 PR A 进入。
- `docs/codex-app-setup.md`、`docs/china-worktree-plan.md` 如果当前有改动，也适合随 PR A 进入；如果无改动则不需要强行触碰。

## 建议排除 PR A

```text
.codex/agent-notes/**
.mercur/**
apps/**
packages/**
docs/admin-*.md
docs/vendor-*.md
docs/storefront-*.md
docs/china-backend-data-contract-map.md
docs/china-platform-architecture-map.md
docs/integration-*.md
docs/mock-service-providers.md
docs/pickup-card-architecture.md
node_modules/**
dist/**
.next/**
*.log
*.tmp
.env
.env.local
真实密钥或证书
```

说明：

- `.codex/agent-notes/**` 目前是过程交接痕迹，先不进 PR A；如后续要公开为交接文档，应整理后放到 `docs/`。
- `docs/integration-*.md`、架构图、数据契约、页面覆盖文档更适合 PR B。
- `apps/**`、`packages/**` 分别属于 Admin、Vendor、Storefront、Provider 或 API 配置 PR，不进入 PR A。
- `.mercur/**` 需要单独确认来源，当前不提交。

## 风险扫描结果

命令意图：

- 扫描 PR A 范围内是否包含默认自动 commit、push、创建 PR、`reset --hard`、`worktree remove` 等高风险指令。
- 扫描是否包含真实密钥特征词。
- 检查尾随空白。

结果：

- `git commit`、`git push`、`create PR`、`reset --hard`、`worktree remove` 等命中均出现在“默认不要做”或“禁止/除非明确允许”的规则中。
- `secret` 等命中均为“不要写真实 secrets”或 mock 边界说明，未发现真实密钥。
- 尾随空白检查通过。

注意：

- 曾有一次 bash `grep` 风险扫描被管道转义影响，误扫到依赖目录；该结果不采信。最终采用 PowerShell 对指定 PR A 文件清单精确扫描。

## start-dev 脚本检查

`.codex/scripts/start-dev.sh` 当前行为：

- 加载 `nvm` 和 `~/.bun/bin`，解决后台 shell 没有 PATH 的问题。
- 启动本地 Postgres 到 `127.0.0.1:15432`。
- 启动 API `9000`、Admin `7000`、Vendor `7001`、Storefront `3101`。
- 使用 `pk_mock_visual_qa` 作为缺省 mock publishable key。
- 只提供 `start` 和 `status`，不删除数据、不提交代码、不 push。

风险：

- 本地 Postgres 使用 `trust` 认证，仅适合本机开发环境。
- 脚本会启动后台服务并写 `/tmp/fuyi-dev` 日志；不属于生产部署脚本。
- 不应把它误用于服务器上线流程。

## PR A 提交前命令

只做预检，不自动提交：

```bash
git status --short -- AGENTS.md .codex docs/china-localization-task-list.md docs/codex-app-setup.md docs/china-worktree-plan.md
git diff --check -- AGENTS.md .codex docs/china-localization-task-list.md docs/codex-app-setup.md docs/china-worktree-plan.md
.codex/scripts/start-dev.sh status
```

如果要 staged，也应按清单显式添加，不要使用 `git add .`。

## 当前结论

PR A 可以作为第一批准备对象，但建议提交前再做一次人工 review：

- 确认 `.codex/tasks/*.md` 是否全部都要纳入，或只先纳入最核心任务文件。
- 确认 `.codex/scripts/start-dev.sh` 是否作为本地开发脚本进入仓库。
- 确认 `.codex/agent-notes/**` 暂不提交。
- 确认不包含 `apps/**`、`packages/**` 和 `.mercur/**`。
