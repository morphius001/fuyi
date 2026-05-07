# mock-webhook-neutral-route-disabled-post-validation

## 目标

记录 neutral mock webhook disabled route 合并后的验证结果。

本任务只写文档，不修改 runtime。

## 允许修改

- `.codex/tasks/mock-webhook-neutral-route-disabled-post-validation.md`
- `docs/mock-webhook-neutral-route-disabled-post-validation.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/**`
- `.codex/scripts/**`
- `package.json`
- `bun.lock`
- `.env` 或真实密钥
- 支付、订单、退款、结算、佣金、权限业务逻辑

## 必须记录

- PR 编号和 merge commit。
- payment notification harness 结果。
- API typecheck 结果。
- runtime grep 结果。
- disposable DB residual query 结果。
- 当前仍然默认 disabled，未接 DB，未执行 workflow。

## 验证

```bash
git diff --check
```

## 不自动执行

- 不自动 commit，除非用户明确授权。
- 不自动 push，除非用户明确授权。
- 不自动创建 PR，除非用户明确授权。
