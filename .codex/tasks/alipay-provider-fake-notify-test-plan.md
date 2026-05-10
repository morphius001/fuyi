# alipay-provider-fake-notify-test-plan

## 目标

规划支付宝 fake notify / test vector 阶段，为后续在 disabled adapter 之后补纯函数验签和归一化测试做准备。

## 范围

- 测试向量文件边界。
- fake RSA key / fake public key / fake certificate reference 的安全约束。
- 参数 canonicalization、验签、归一化、幂等和失败矩阵。
- 后续 PR 拆分与 Go / No-Go。

## 非目标

- 不修改 `packages/**` 或 `apps/**` runtime。
- 不接支付宝 SDK。
- 不读取真实 app id、merchant id、private key、公钥、证书或 token。
- 不接 checkout，不执行 payment workflow。
- 不注册 migration，不连接 DB。
- 不处理退款、对账、结算、佣金、打款、分账、履约或物流。

## 验证

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
```

## 交付

- `docs/alipay-provider-fake-notify-test-plan.md`
- ledger / queue 更新
