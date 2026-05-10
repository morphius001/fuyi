# alipay-provider-sandbox-contract

## 目标

定义支付宝 Provider sandbox contract，为后续 contract-only 或 disabled-by-default adapter 做输入输出、验签、通知归一化、错误映射和测试矩阵准备。

## 范围

- 支付宝 create payment / query / close / notify normalize / verify 的合同。
- sandbox / production 配置隔离。
- notify_url / return_url 边界。
- RSA2 / 证书或公钥 reference 要求。
- fake notify tests。

## 非目标

- 不修改 `apps/**` 或 `packages/**` runtime。
- 不接支付宝 SDK。
- 不接 checkout。
- 不写真实 app id、商户号、私钥、公钥、证书或 token。
- 不执行 payment workflow，不注册 migration，不连接外部 DB。

## 验证

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
```

## 交付

- `docs/alipay-provider-sandbox-contract.md`
- ledger / queue 更新

