# Task: mock-service-providers

## Goal

设计 `MockChatProvider`、`MockSmsProvider`、`MockLogisticsProvider` 边界。优先产出 docs，可以做轻量 skeleton，但不接真实服务。

## Read First

- `AGENTS.md`
- 本文件 `.codex/tasks/mock-service-providers.md`
- `docs/china-localization-task-list.md`

## Preferred Scope

- 优先修改 `docs/**`
- 如确有必要，可添加轻量 provider skeleton，但必须保持 mock-only

## Forbidden Changes

- 禁止接入真实腾讯 IM
- 禁止接入真实环信
- 禁止接入真实阿里云短信
- 禁止接入真实腾讯短信
- 禁止接入真实快递100
- 禁止接入真实菜鸟
- 禁止修改支付、订单、退款、结算、佣金、权限逻辑
- 禁止写真实密钥
- 不要自动提交
- 不要 push

## Provider Boundaries

MockChatProvider:

- 会话创建
- 消息发送 mock
- 未读数 mock
- 用户身份映射
- 错误映射

MockSmsProvider:

- 验证码发送 mock
- 模板短信 mock
- 频率限制设计
- 幂等和重试语义
- 错误映射

MockLogisticsProvider:

- 运单创建 mock
- 轨迹查询 mock
- 取消运单 mock
- 签收状态 mock
- 错误映射

## Requirements

- 保留 TalkJS、Resend、Algolia 等既有路径。
- mock provider 必须可替换为真实 provider。
- provider 配置必须环境变量驱动，但不得写入真实密钥。
- 文档必须说明未来真实 provider 的签名、回调、重试、错误映射和审计要求。

## Verification

文档优先任务：

```bash
git diff -- docs .codex/tasks/mock-service-providers.md
```

如添加 skeleton：

```bash
bun run check-types
bun run lint
```

人工确认：

- 没有真实服务 SDK 或真实调用。
- 没有修改支付、订单、退款、结算、佣金、权限逻辑。
- 没有真实密钥。

## Output

完成后只输出：

- 修改文件
- 验证结果
- 风险点
- 下一步建议

