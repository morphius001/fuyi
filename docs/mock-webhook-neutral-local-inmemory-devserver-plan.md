# Mock Webhook Neutral Local In-Memory Dev Server Plan

更新时间：2026-05-07 19:25 Asia/Shanghai

## 目标

规划如何完整运行：

```bash
.codex/scripts/mock-webhook-neutral-route-smoke.sh local-inmemory
```

当前 smoke 脚本不会修改已经运行中的 API 进程 env，因此 `local-inmemory` 必须由一个临时 API dev server 提供。

本轮只做计划，不新增脚本，不启动服务。

## 原则

- 不影响现有 `http://localhost:9000` API 服务。
- 使用单独端口，例如 `9100`。
- 使用临时 mock env。
- 不修改 `.env`。
- 不写真实密钥。
- 不连接预发或生产 DB。
- 不执行 payment workflow。
- 不接支付宝或微信支付。

## 建议流程

### 1. 选择单独端口

默认：

```text
MOCK_WEBHOOK_DEVSERVER_PORT=9100
MOCK_WEBHOOK_BASE_URL=http://localhost:9100
```

如果端口占用，脚本应退出，不自动 kill 进程。

### 2. 启动临时 API 进程

工作目录：

```text
packages/api
```

临时 env：

```text
CODEX_DATABASE_URL=postgres://$USER@127.0.0.1:15432/mercur
CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED=true
CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE=mock_inbox_only
CHINA_PAYMENT_NOTIFICATION_PROVIDER=mock_china_pay
CHINA_PAYMENT_NOTIFICATION_LOCAL_INMEMORY=true
CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET=local_neutral_smoke_secret_not_real
NODE_ENV=development
PORT=9100
```

启动命令应使用本地已安装的 Medusa dev binary，不安装依赖：

```bash
packages/api/node_modules/.bin/medusa develop
```

注意：如果 Medusa dev server 端口配置不是 `PORT`，后续脚本需要先确认项目当前启动参数。

### 3. 等待 health

轮询：

```text
GET http://localhost:9100/health
```

等待上限建议 60 秒。失败时输出日志尾部并关闭临时进程。

### 4. 运行 smoke

```bash
MOCK_WEBHOOK_BASE_URL=http://localhost:9100 \
CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET=local_neutral_smoke_secret_not_real \
.codex/scripts/mock-webhook-neutral-route-smoke.sh local-inmemory
```

预期：

- accepted case 通过。
- missing signature case 通过。
- malformed payload case 通过。
- DB residual query 为空。

### 5. 清理

- 只关闭脚本自己启动的临时进程。
- 不关闭现有 9000 API。
- 不删除 worktree。
- 不删除本地数据库。
- 不修改 `.env`。

## 风险点

- Medusa dev server 的端口 env 需要确认；如果 `PORT=9100` 无效，不能盲目 kill 9000 服务。
- 使用 `CODEX_DATABASE_URL` 指向本地 `mercur`，但 route 当前只用 in-memory repository，不应写数据库。
- 本 smoke 仍不覆盖 DB-backed inbox 幂等，也不覆盖 payment workflow。

## 后续 PR 拆分

1. `mock-webhook-neutral-local-inmemory-devserver-script`
   - 新增临时 dev server smoke wrapper。
   - 不接真实 Provider。

2. `mock-webhook-neutral-local-inmemory-smoke-validation`
   - 记录 local-inmemory smoke 结果。

3. `mock-webhook-admin-route-deprecation-plan`
   - 规划 Admin route 保留/降级。

4. `mock-webhook-db-backed-route-plan`
   - 再规划 DB-backed inbox route。

## 验证计划

本轮 docs-only：

```bash
git diff --check
git diff --name-only
```

后续脚本 PR：

```bash
bash -n .codex/scripts/mock-webhook-neutral-local-inmemory-devserver-smoke.sh
.codex/scripts/mock-webhook-neutral-local-inmemory-devserver-smoke.sh
.codex/scripts/payment-notification-idempotency-harness.sh
```

## 结论

下一步可以写临时 dev server smoke wrapper，但它必须只管理自己启动的临时 API 进程。

真实 DB-backed inbox、支付宝、微信支付、退款、对账和商家结算继续后移。
