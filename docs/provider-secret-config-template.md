# Provider Secret Config Template

更新时间：2026-05-10 Asia/Shanghai

## 目的

本模板只记录中国本地支付 Provider 后续需要的配置 key 名和 secret reference 边界。它不是可直接启用的 `.env` 文件，也不代表支付宝或微信支付 Provider 已经接入 checkout。

本轮不修改 `packages/api/.env.template`，避免把尚未实现、尚未验签演练、尚未 DB-backed rehearsal 的真实支付配置误导为可用 runtime。

## 配置原则

- 所有真实密钥必须放在 secret manager 或部署平台 secret 中。
- repo 里只能出现 key 名、`<secret-ref>`、`<url>` 或显式 disabled 默认值。
- production Provider 必须默认 disabled。
- `notify_url` 是支付状态推进的唯一候选入口。
- `return_url` 只能展示 pending / waiting confirmation。
- 前端 public env 不得携带 app id、商户号、私钥、公钥、APIv3 key、证书、签名 token 或 webhook secret。
- 禁止把 Stripe、Algolia、Resend、TalkJS 删除或覆盖；中国本地 Provider 必须是 additive / switchable。

## Shared Runtime Gate Keys

这些 key 只作为未来 disabled-by-default adapter / runtime gate 的候选模板，不在本 PR 生效：

```text
CHINA_PAYMENT_PROVIDER_REGISTRY_MODE=disabled
CHINA_PAYMENT_PROVIDER_RUNTIME_ENABLED=false
CHINA_PAYMENT_PROVIDER_RUNTIME_MODE=disabled
CHINA_PAYMENT_PROVIDER_ACTIVE_ID=none
CHINA_PAYMENT_NOTIFY_URL_BASE=<url>
CHINA_PAYMENT_RETURN_URL_BASE=<url>
```

说明：

- `disabled` 是默认值。
- `CHINA_PAYMENT_PROVIDER_ACTIVE_ID` 不能在 production 直接设为 `alipay` 或 `wechat_pay`，除非 release gate 已通过。
- `NOTIFY_URL_BASE` 必须是后端可接收 server-to-server 回调的域名。
- `RETURN_URL_BASE` 只能用于用户回到前端后的 pending 展示。

## Alipay Keys

```text
CHINA_PAYMENT_PROVIDER_ALIPAY_ENABLED=false
CHINA_PAYMENT_PROVIDER_ALIPAY_MODE=sandbox
CHINA_PAYMENT_ALIPAY_APP_ID_REF=<secret-ref>
CHINA_PAYMENT_ALIPAY_MERCHANT_ID_REF=<secret-ref>
CHINA_PAYMENT_ALIPAY_PRIVATE_KEY_REF=<secret-ref>
CHINA_PAYMENT_ALIPAY_PUBLIC_KEY_REF=<secret-ref>
CHINA_PAYMENT_ALIPAY_APP_CERT_SN_REF=<secret-ref>
CHINA_PAYMENT_ALIPAY_ROOT_CERT_SN_REF=<secret-ref>
CHINA_PAYMENT_ALIPAY_NOTIFY_URL_BASE=<url>
CHINA_PAYMENT_ALIPAY_RETURN_URL_BASE=<url>
```

要求：

- `*_REF` 只能保存 secret reference，不保存明文值。
- `PRIVATE_KEY_REF` 指向应用私钥 secret。
- `PUBLIC_KEY_REF` / certificate refs 指向支付宝验签所需材料。
- `NOTIFY_URL_BASE` 指向后端异步通知入口。
- `RETURN_URL_BASE` 不得触发 `placeOrder()` 或 payment success。

## WeChat Pay Keys

```text
CHINA_PAYMENT_PROVIDER_WECHAT_PAY_ENABLED=false
CHINA_PAYMENT_PROVIDER_WECHAT_PAY_MODE=sandbox
CHINA_PAYMENT_WECHAT_PAY_APP_ID_REF=<secret-ref>
CHINA_PAYMENT_WECHAT_PAY_MCH_ID_REF=<secret-ref>
CHINA_PAYMENT_WECHAT_PAY_PRIVATE_KEY_REF=<secret-ref>
CHINA_PAYMENT_WECHAT_PAY_MERCHANT_CERT_SERIAL_NO_REF=<secret-ref>
CHINA_PAYMENT_WECHAT_PAY_API_V3_KEY_REF=<secret-ref>
CHINA_PAYMENT_WECHAT_PAY_PLATFORM_CERT_REF=<secret-ref>
CHINA_PAYMENT_WECHAT_PAY_PUBLIC_KEY_ID_REF=<secret-ref>
CHINA_PAYMENT_WECHAT_PAY_NOTIFY_URL_BASE=<url>
CHINA_PAYMENT_WECHAT_PAY_RETURN_URL_BASE=<url>
```

要求：

- `PRIVATE_KEY_REF` 指向商户私钥 secret。
- `API_V3_KEY_REF` 指向回调 resource 解密密钥 secret。
- `PLATFORM_CERT_REF` 或 `PUBLIC_KEY_ID_REF` 必须能支持按 `Wechatpay-Serial` 验签。
- 微信前端调起参数只能由后端 create payment 返回的短期 `clientPayload` 生成，不能从 public env 拼接。

## Environment Matrix

本地开发：

- 默认 registry / runtime disabled。
- 可使用 mock provider local smoke，但不得接真实支付宝或微信支付。
- 不允许把本地 `localhost` notify URL 当成 production 配置。

Sandbox / Test：

- 只能在 disabled adapter skeleton、fake notify tests、signature verification tests 和 DB-backed rehearsal 就绪后开启 sandbox。
- 所有 `*_REF` 必须指向测试 secret，不得使用 production secret。
- 验签失败、解密失败、金额不匹配和重复通知必须能被审计。

Production：

- 默认 disabled。
- 必须先完成 payment notification runtime gate、workflow execution adapter、RBAC / ownership guard、rollback plan 和 limited pilot。
- production enable 必须单 provider 单 PR，不得与退款、对账、结算、佣金、打款或履约混在一起。

## Logging And Masking

禁止记录：

- private key。
- APIv3 key。
- provider secret。
- raw signature。
- full certificate content。
- DB URL。
- 未脱敏 raw payload。
- app id / merchant id 与订单、用户、手机号组合后的完整关联日志。

允许记录：

- provider id。
- environment mode。
- config key 是否存在。
- secret reference 是否配置，且只允许布尔值或短 hash。
- raw payload digest。
- idempotency key。
- verification / decryption status。
- provider event id / transaction id 的脱敏值。

## Rotation And Rollback

轮换要求：

- secret reference 应支持版本化或别名切换。
- platform certificate / public key 更新必须先通过 sandbox fake notify。
- 旧证书退役前要保留 provider notification replay 窗口。
- 轮换 PR 不能同时修改 checkout、refund、settlement、commission 或 fulfillment。

回滚方式：

- 将 provider enabled flag 设回 `false`。
- 将 registry active id 设回 `none` 或 mock disabled。
- notify route 保持 rejected / inbox-only 受控响应。
- 不删除 inbox / event log。
- 不改历史 payment、order、refund、settlement 或 commission 状态。

## No-Go

任一命中停止：

- 需要在 repo 写真实 app id、mch id、merchant id、private key、APIv3 key、证书、公钥、token 或 DB URL。
- 需要直接修改 `.env` 或 production deployment secret。
- 需要直接接 checkout。
- 需要前端 return_url 完成订单或推进 payment success。
- 需要未验签 / 未解密通知推进 payment/order。
- 需要与退款、对账、结算、佣金、打款、分账、履约或物流同 PR。

## 下一步

推荐：

1. `wechat-pay-provider-disabled-adapter-skeleton`
2. `alipay-provider-disabled-adapter-skeleton`
3. `provider-secret-config-template-validation`

上述 adapter skeleton 仍必须默认 disabled，不读取真实 secret，不接 checkout，不执行 payment workflow。

## 本 PR 验证

```bash
git diff --check
```

预期：无输出。
