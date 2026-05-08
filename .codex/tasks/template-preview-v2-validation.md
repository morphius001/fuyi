# template-preview-v2-validation

## 目标

汇总第九十八轮四个 template v2 surface 的合并后验证结果，并规划下一轮安全任务。

## 允许修改

- `docs/template-preview-v2-validation.md`
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
- checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment runtime

## 必须覆盖

- Storefront home template v2。
- Storefront shop template v2。
- Admin dashboard template v2。
- Vendor role workspace template v2。
- 已执行验证命令。
- 子 agent 复核结论。
- 未提交视觉 QA 产物边界。
- 下一轮建议：模板 registry 对接三端、真实 view model 读取计划、视觉 QA 或继续 docs-only。

## 验证

```bash
git diff --check
git diff --name-only
```

确认没有 `apps/**` 或 `packages/**` 修改。

## 提交规则

本任务可在验证通过后提交、推送并创建 PR。提交时必须排除 `docs/visual-qa-artifacts/**`。
