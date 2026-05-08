# template-preview-validation

## 目标

验证第九十七轮模板预览规划收口状态。

## 允许修改

- `docs/template-preview-validation.md`
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
git diff --check
```

## 提交规则

本任务可在验证通过后提交、推送并创建 PR。
