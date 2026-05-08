# template-system-validation

## 目标

验证第九十六轮 UI 模板系统规划和只读 registry skeleton 合并后的状态。

## 允许修改

- `docs/template-system-validation.md`
- `.codex/queue.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`
- `project-ledger/changelog.md`

## 禁止修改

- `apps/**`
- `packages/**`
- `package.json`
- `bun.lock`
- `.env`
- 真实密钥

## 验证命令

```bash
cd packages/api && bun run test:unit -- template-registry-readonly-contract.unit.spec.ts
./node_modules/.bin/tsc --noEmit -p packages/api/tsconfig.json
cd apps/admin && bun run lint
cd apps/vendor && bun run lint
git diff --check
```

如果 typecheck 触发 `packages/api/.mercur/index.d.ts` generated diff，本任务应恢复该文件，不纳入验证 PR。

## 提交规则

本任务可在验证通过后提交、推送并创建 PR。
