# Payment Provider Production Hardening Plan

更新时间：2026-05-10 Asia/Shanghai

## 资料来源

本计划只引用官方或官方代码库资料，且不实现真实 provider：

- 微信支付商户文档：支付成功回调通知说明，通知通过 `notify_url` POST 到商户回调地址，回调数据密文需用 APIv3 密钥解密。  
  https://pay.wechatpay.cn/doc/v3/merchant/4012791861
- 微信支付 API v3 官方 Go SDK：包含请求签名、应答验签、回调通知验签和解密、平台证书下载等能力说明。  
  https://github.com/wechatpay-apiv3/wechatpay-go
- 支付宝开放平台：网页/移动应用接入需要创建应用、完成密钥和网关等开发配置，并提交审核上线。  
  https://open.alipay.com/module/webApp
- 支付宝开放平台工具：官方提供 SDK 和生成密钥、签名、验签、格式转换、密钥匹配等开发工具。  
  https://open.alipay.com/tool
- 支付宝 / Antom 签名文档：接收通知时必须验证 Alipay request signature。  
  https://iopenhome.alipay.com/docs/ac/ams/digital_signature?pageVersion=30

## 结论

真实支付宝 / 微信支付 Provider 不能直接进入 production。上线顺序必须是：

```text
mock adapter
-> provider adapter registry disabled-by-default
-> sandbox / test config
-> fake notify + official signature verification tests
-> DB-backed notification runtime rehearsal
-> workflow execution adapter
-> limited pilot
-> production enablement
```

任何步骤都不能绕过后端异步通知、验签、幂等、重试、审计和回滚。

## 配置与密钥

必须使用环境变量或 secret manager，禁止写入 repo：

- provider enable flag。
- runtime mode。
- app id。
- merchant id。
- private key reference。
- platform public key / certificate reference。
- API v3 key reference。
- notify URL base。
- return URL base。
- sandbox / production mode。
- certificate serial number。

禁止记录到日志：

- private key。
- API v3 key。
- provider secret。
- raw signature。
- full certificate content。
- DB URL。
- 未脱敏 raw payload。

## Notify URL / Return URL

`notify_url`：

- server-to-server。
- 支付状态推进的唯一候选入口。
- 必须验签、解密或校验原始报文。
- 必须写入 inbox / event log。
- 必须幂等。
- 必须可重试。

`return_url`：

- 只能展示 pending / waiting confirmation。
- 不能完成订单。
- 不能设置支付成功。
- 不能触发 refund / settlement / commission。

## 微信支付 Hardening

进入 sandbox / disabled provider 前必须定义：

- APIv3 key 的加载和轮换方式。
- 商户证书和平台证书的加载、更新、序列号校验。
- 回调报文验签。
- 回调密文解密。
- provider event id / transaction id 到 idempotency key 的映射。
- `SUCCESS` / failure response strategy。
- provider timeout / retry / duplicate handling。
- raw payload digest，而不是 raw payload 明文。

No-Go：

- 用商户证书替代平台证书验签。
- 解密失败仍推进状态。
- 未校验金额、币种、商户订单号、payment session。
- 前端微信返回页直接完成订单。

## 支付宝 Hardening

进入 sandbox / disabled provider 前必须定义：

- 应用私钥和支付宝公钥 / 证书的加载和轮换方式。
- RSA2 签名和验签配置。
- 异步通知参数 canonicalization。
- `notify_url` 通知验签。
- success acknowledgement 策略。
- provider trade_no / out_trade_no 到 idempotency key 的映射。
- sandbox 网关和 production 网关配置隔离。
- SDK 版本和官方工具验签对照。

No-Go：

- 使用应用公钥验支付宝通知。
- 忽略 sign_type。
- 未校验金额、币种、商户订单号、seller / app id。
- 同步跳转页直接完成订单。

## 发布门禁

真实 provider PR 必须满足：

- 单 provider 单 PR。
- production 默认 disabled。
- sandbox / mock smoke 先通过。
- fake notify tests 覆盖验签成功、验签失败、重复通知、金额不匹配、币种不匹配、provider mismatch。
- DB-backed inbox rehearsal 通过。
- workflow execution adapter 已通过单独 PR。
- RBAC / resource ownership / audit 已通过。
- rollback plan 明确。

## 回滚

最低回滚方式：

- env flag 关闭 provider。
- provider registry 回退 mock / disabled。
- notify route 保持只读 inbox 或返回受控失败。
- 不删除 event log。
- 不删除 provider refs。
- 不修改历史订单或支付状态。

## 下一步

推荐：

1. `payment-runtime-external-readiness-review`
   - 继续确认 disposable preprod DB 外部阻塞。

2. `alipay-provider-sandbox-contract`
   - docs-only 或 contract-only。
   - 不接 checkout。

3. `wechat-pay-provider-sandbox-contract`
   - docs-only 或 contract-only。
   - 不接 checkout。

4. `provider-secret-config-template`
   - 只写 env template key 名，不写值。

## 本 PR 验证

```bash
git diff --check
```

预期：无输出。

