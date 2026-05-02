# Task: codegen-baseline

## Goal

修复 `@acme/api/_generated` 缺失导致 Admin/Vendor build 失败的问题。做最小修复，避免 UI 和业务逻辑扩散。

## Read First

- `AGENTS.md`
- 本文件 `.codex/tasks/codegen-baseline.md`
- `package.json`
- `packages/api/package.json`
- `packages/api/medusa-config.ts`
- 相关 Admin/Vendor client import

## Allowed Changes

- `packages/api/**`
- 必要的 client import
- `package.json`
- `bun.lock`

## Forbidden Changes

- 禁止修改 Admin/Vendor/Storefront UI
- 禁止修改支付、订单、退款、结算、佣金、权限业务逻辑
- 禁止新增真实 provider 或真实密钥
- 不要自动提交
- 不要 push

## Required Audit

先审计 codegen 来源：

- `@acme/api` 的 `exports["./_generated"]`
- `.mercur/_generated` 是否存在
- Mercur CLI codegen 期望输入和输出
- Admin/Vendor client import 是否引用 `@acme/api/_generated`
- 是否已有生成文件被 `.gitignore` 排除

## Implementation Rules

- 做最小修复。
- 优先使用 Mercur/Medusa 官方或项目既有 codegen 机制。
- 如果需要提交生成类型，确认它们不是环境特定产物。
- 如果只需修复 import 或 package exports，保持变更最小。
- 不要借机调整 UI、菜单、业务流程或 provider。

## Verification

优先运行：

```bash
bun --cwd apps/admin run build
bun --cwd apps/vendor run build
bun run lint
```

如 codegen 命令可用，记录并运行：

```bash
bunx @mercurjs/cli codegen
```

如果命令失败，输出失败原因、缺失依赖或环境变量，不做大范围替代实现。

## Output

完成后只输出：

- 修改文件
- 验证结果
- 风险点
- 下一步建议

