# Mock Payment Provider Registry Validation

更新时间：2026-05-08 14:25 Asia/Shanghai

## 范围

本验证覆盖 PR #176 `mock-payment-provider-registry-contract` 合并后的主线状态。

## 验证命令

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
bunx tsc --noEmit -p packages/api/tsconfig.json
grep -R "china-payment-notification" packages/api/medusa-config.ts || true
psql -h 127.0.0.1 -p 15432 -U codex -d postgres -tAc \
  "select datname from pg_database where datname like 'fuyi_payment_notification_inbox_dry_run_%' order by datname"
git diff --check
git status --short --untracked-files=all
```

## 结果

- Payment notification harness 通过。
- 单元测试：19 suites / 128 tests passed。
- 本地 disposable DB dry-run 通过：row count `2|9`，down SQL 后表已删除。
- API typecheck 通过：`bunx tsc --noEmit -p packages/api/tsconfig.json`。
- `packages/api/medusa-config.ts` 未命中 `china-payment-notification`，说明模块仍未注册。
- 本地 disposable DB 名称查询为空，未发现 `fuyi_payment_notification_inbox_dry_run_%` 残留库。
- `git diff --check` 通过。

## 安全结论

当前 registry 仍是纯函数 contract：

- 默认 disabled。
- production blocked。
- 解析 mock contract 需要 `provider=mock_china_pay`、`mode=mock_contract_only` 和显式非生产 `nodeEnv`。
- `alipay` / `wechat_pay` 当前 refused。

本轮没有：

- 注册 Medusa payment provider。
- 读取真实支付密钥。
- 接 checkout runtime。
- 连接外部 DB。
- 执行 payment workflow。
- 改变 checkout、order、payment、refund、settlement、commission 或 permission 行为。

## 下一步

下一项可做 `mock-provider-runtime-gate-validation-plan`：

- 只规划 mock provider contract / registry / runtime gate / preprod DB gate 的组合验证。
- 不接 runtime。
- 不执行 payment workflow。

真实支付宝和微信支付仍不能开始实现，直到 mock provider runtime gate、disposable preprod DB execution、secret manager 和 test vectors 都具备。
