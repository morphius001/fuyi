# PR G Preflight: Mock China Service Providers

日期：2026-05-05

本文档记录 `china/integration-localization` worktree 第七批 PR G 的预检结果。PR G 目标是提交未注册运行时的 Mock China Service Providers：Chat、SMS、Logistics、Live、AI Listing 的 provider skeleton、类型、README 和单元测试。PR G 不接真实腾讯 IM、环信、阿里云短信、腾讯短信、快递100、菜鸟、直播、AI 或支付服务。

## 建议纳入 PR G

```text
packages/api/src/modules/china-service-providers/**
docs/mock-service-providers.md
docs/integration-pr-g-mock-provider-preflight.md
```

## 建议排除 PR G

```text
packages/api/medusa-config.ts
packages/api/.env.template
packages/api/src/scripts/seed.ts
apps/**
AGENTS.md
.codex/**
docs/integration-pr-a-preflight.md
docs/integration-pr-b-preflight.md
docs/integration-pr-c-admin-preflight.md
docs/integration-pr-d-vendor-preflight.md
docs/integration-pr-e-storefront-discovery-preflight.md
docs/integration-pr-f-storefront-checkout-detail-preflight.md
.mercur/**
.env
.env.local
真实密钥或证书
```

说明：

- `packages/api/medusa-config.ts` 当前虽有其它改动，但没有注册 `china-service-providers`；配置模板和 seed 安全边界属于 PR H。
- PR G 应保持 mock provider 未注册运行时，因此不会改变真实业务路径。
- 如后续要注册 Provider，必须单独开 PR，提供环境开关、审计、错误处理和回滚说明。

## 当前 Provider 覆盖

| Provider | 文件 | 边界 |
| --- | --- | --- |
| `MockChatProvider` | `providers/mock-chat-provider.ts` | mock 会话和消息，不接真实 IM，不发送真实消息。 |
| `MockSmsProvider` | `providers/mock-sms-provider.ts` | mock 短信、脱敏手机号、幂等和频控，不发送真实短信。 |
| `MockLogisticsProvider` | `providers/mock-logistics-provider.ts` | mock 发货和轨迹，不改订单/退款/结算状态。 |
| `MockLiveProvider` | `providers/mock-live-provider.ts` | mock 直播会话和预览 object key，不返回真实推流 URL。 |
| `MockAiListingProvider` | `providers/mock-ai-listing-provider.ts` | mock 上架草稿建议，必须商户确认，不创建真实商品。 |
| 类型/工具 | `types.ts`、`utils.ts`、`index.ts` | provider 输入输出、错误映射、脱敏和幂等工具。 |
| 测试 | `__tests__/mock-service-providers.unit.spec.ts` | 覆盖幂等、错误码、频控、mock live、AI 草稿确认边界。 |

## 运行时注册检查

已扫描：

```bash
grep -R -n "china-service-providers" \
  packages/api/medusa-config.ts \
  packages/api/src/api \
  packages/api/src/workflows \
  packages/api/src/subscribers \
  packages/api/src/jobs \
  packages/api/src/links
```

结果：无命中。

结论：当前 provider skeleton 未注册到运行时、API routes、workflows、subscribers、jobs 或 links。

## 密钥和真实凭证扫描

已对 PR G 范围扫描：

- 生产支付密钥样式
- 生产公钥样式
- 第三方应用密钥样式
- 私钥字段样式
- 访问密钥字段样式
- 服务密钥字段样式
- 真实商户号字段样式
- 真实凭证描述
- 私钥描述
- 证书描述

命中均为 README/文档中的“不要写真实凭证”规则，未发现真实密钥、真实商户号、真实 provider 凭证、真实私钥或证书。

## 已执行验证

```bash
/home/codex/.bun/bin/bunx tsc --noEmit --project packages/api/tsconfig.json
git diff --check -- packages/api/src/modules/china-service-providers docs/mock-service-providers.md
PATH=/home/codex/.nvm/versions/node/v24.15.0/bin:/home/codex/.bun/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
  npm run test:unit -- src/modules/china-service-providers/__tests__/mock-service-providers.unit.spec.ts
```

结果：

- API typecheck：通过。
- `git diff --check`：通过。
- Mock provider unit test：通过，8/8。

注意：

- `bun --cwd packages/api test ...` 失败，因为 `packages/api` 没有 `test` script。
- `bun run test:unit ...` 在当前环境触发 Jest runtime `Attempted to assign to readonly property`，测试尚未执行。
- 使用 Node 24 的 `npm run test:unit -- ...` 可以正常运行 Jest 并通过。后续复跑单测建议使用上面的显式 `PATH=... npm run test:unit -- ...` 命令，避免非登录 shell 找不到 `npm`。

## 风险边界

PR G 允许：

- Mock provider 类型、接口、错误码和 README。
- 幂等、频控、脱敏、错误映射的 mock 测试。
- Live 和 AI Listing 的 mock skeleton。

PR G 禁止：

- 注册真实 provider。
- 注册到 `medusa-config.ts` 并改变运行时业务路径。
- 新增 API routes、workflows、subscribers、jobs 或 links 去触发真实行为。
- 发送真实短信、IM、物流请求、直播推流或 AI 请求。
- 改订单、支付、退款、结算、佣金、权限逻辑。

## 当前结论

PR G 可以进入准备阶段。它应作为未注册 mock provider skeleton 提交；配置模板和 seed 改动应留给 PR H 单独 review。
