# wechat-pay-provider-fake-notify-test-plan

## 目标

规划微信支付 fake notify / test vector 阶段，为后续在 disabled adapter 之后补纯函数验签、解密和归一化测试做准备。

## 范围

- 测试向量文件边界。
- fake platform key / fake APIv3 key 的安全约束。
- 验签、解密、归一化、幂等和失败矩阵。
- 后续 PR 拆分与 Go / No-Go。

## 非目标

- 不修改 `packages/**` 或 `apps/**` runtime。
- 不接微信支付 SDK。
- 不读取真实 app id、mch id、private key、APIv3 key、平台证书、公钥或 token。
- 不接 checkout，不执行 payment workflow。
- 不注册 migration，不连接 DB。
- 不处理退款、对账、结算、佣金、打款、分账、履约或物流。

## 验证

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
```

## 交付

- `docs/wechat-pay-provider-fake-notify-test-plan.md`
- ledger / queue 更新
