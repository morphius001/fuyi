# Codex Tasks

这个目录保存可复用的 Codex 任务文件。以后可以用一句话触发任务，主 agent 会先读取仓库根目录 `AGENTS.md`，再读取对应任务文件。

## How To Run

可直接对 Codex 说：

```text
执行 admin-shell
执行 vendor-shell
执行 codegen-baseline
执行 pickup-card-architecture
执行 mock-service-providers
执行 storefront-zhcn-baseline
```

也可以说：

```text
执行任务 admin-shell
执行下一个任务
```

当用户说“执行下一个任务”时，Codex 应读取 `.codex/queue.md`，选择第一个未完成且未标记 `local-wip` 或 `done` 的任务。

## Available Tasks

- `admin-shell`: 中国大陆平台运营后台基础壳。
- `vendor-shell`: 中国大陆商户后台基础壳。
- `codegen-baseline`: 修复 `@acme/api/_generated` 缺失导致的 Admin/Vendor build 问题。
- `pickup-card-architecture`: 设计提货卡系统后端架构文档。
- `mock-service-providers`: 设计 MockChatProvider、MockSmsProvider、MockLogisticsProvider 边界。
- `storefront-zhcn-baseline`: `apps/storefront` 基础中文化和国内电商前台风格。

## Global Defaults

- 默认不要自动 commit。
- 默认不要 push。
- 默认不要创建 PR。
- 默认不要运行 `git reset --hard`, `git merge`, `git rebase`, `git pull`, `git worktree remove`。
- 如果任务文件和用户当前指令冲突，以用户当前指令为准。
- 如果任务文件和 `AGENTS.md` 冲突，以 `AGENTS.md` 的安全边界为准。

