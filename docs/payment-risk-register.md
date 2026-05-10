# Payment Risk Register

更新时间：2026-05-10 Asia/Shanghai

## 结论

支付、退款、对账、结算、佣金和权限可以继续推进上线准备，但当前不能进入真实 provider 或资金状态修改。原因是 payment runtime 仍受以下硬门禁阻塞：

- 没有用户明确提供 disposable preprod DB。
- 没有备份 owner、回滚 owner、操作 owner 和连接窗口。
- migration skeleton 尚未注册。
- payment notification runtime 尚未完成 DB rehearsal。
- payment workflow execution adapter 尚未进入 runtime。
- 支付宝 / 微信支付真实 provider 尚未完成 sandbox、验签、证书、回调、错误映射和回滚设计。

因此，下一步只能继续做风险消减、mock / local rehearsal、权限矩阵和 runbook。任何真实资金状态推进都必须等待对应门禁通过。

## 风险登记表

| ID | 域 | 风险 | 严重性 | 当前状态 | Go 条件 | No-Go |
| --- | --- | --- | --- | --- | --- | --- |
| PAY-01 | 支付成功 | 前端返回页或按钮状态被当作支付成功 | blocker | blocked | 后端异步通知验签、幂等、重试、DB inbox、workflow adapter 全通过 | 任何前端直接完成订单 |
| PAY-02 | 支付通知 | 通知重复、乱序或伪造导致重复完成/错单 | blocker | partial skeleton | idempotency key 唯一约束、event log、signature result、retry count、manual review | 无验签或无唯一约束 |
| PAY-03 | migration | 未经 disposable DB rehearsal 注册真实 migration | high | skeleton only | local + disposable preprod up/down/rollback 全通过 | 未授权外部 DB 或无法回滚 |
| PAY-04 | Provider 配置 | 密钥、证书、商户号写入 repo 或日志 | blocker | not started | env / secret manager、masking、日志 allowlist | repo 出现真实 secret |
| PAY-05 | 支付宝 | 真实 provider 验签、证书轮换、回调失败处理不完整 | high | not started | sandbox provider + fake notify + official contract review | 直接接 production |
| PAY-06 | 微信支付 | 真实 provider 验签、平台证书、回调解密不完整 | high | not started | sandbox / mock equivalent、证书轮换、回调重试 | 直接接 production |
| REF-01 | 退款 | 退款成功未以后端 provider 通知为准 | blocker | contract only | refund notification inbox、idempotency、manual review | 前端点击即改退款成功 |
| REF-02 | 退款金额 | 部分退款、重复退款、超额退款 | high | not started | refund command guard、amount invariant、audit | 无金额约束 |
| REC-01 | 对账 | provider 流水与本地订单/支付不一致 | high | not started | statement parser、差异分类、人工处理 | 自动补单/自动退款 |
| SET-01 | 结算 | 未扣除退款、争议、佣金就进入商家结算 | blocker | not started | settlement batch lock、reconciliation passed、manual approval | 自动结算 |
| COM-01 | 佣金 | 佣金规则错误或跨商户串账 | high | not started | pure function tests、seller/order ownership guard、audit | 与 payment provider 同 PR |
| PAYOUT-01 | 打款 | 自动打款无人工复核或回滚 | blocker | not started | payout disabled-by-default、manual approval、provider mock smoke | 生产自动打款 |
| PERM-01 | 权限 | capability view 被当成 RBAC，放大 Admin/Vendor 权限 | blocker | not started | 后端 RBAC + resource ownership + market ownership guard | 前端隐藏替代权限 |
| PERM-02 | 商户归属 | 商户能访问其他商户订单、退款、结算 | blocker | not started | seller ownership tests、negative tests | 无归属校验 |
| LOG-01 | 审计日志 | 资金状态变更缺少 operator、原因、前后差异 | high | partial docs | audit event schema、metadata allowlist | raw payload / secret 入日志 |

## 串行顺序

### 1. Payment Runtime External Readiness

目标：确认外部 disposable preprod DB 条件是否具备。

允许：

- `--print-plan`
- `--validate-inputs-only`
- docs-only Go / No-Go review

禁止：

- 未授权连接外部 DB。
- 注册 migration。
- 接真实 provider。

### 2. Payment Notification DB Runtime Rehearsal

进入条件：

- 用户明确提供 disposable preprod DB。
- 有备份 owner / 回滚 owner / 操作 owner。
- 本地 idempotency harness 和 mock webhook smoke 全通过。

允许：

- mock notification DB runtime rehearsal。
- inbox + event log transaction test。

禁止：

- 执行 payment workflow。
- 改订单、支付、退款、结算、佣金或权限状态。

### 3. Payment Workflow Execution Adapter

进入条件：

- DB-backed runtime rehearsal 通过。
- guard result 到 workflow command 的映射测试通过。
- manual review 和 audit event 已覆盖。

禁止：

- 同 PR 接支付宝 / 微信支付。
- 同 PR 做退款、对账、结算或佣金。

### 4. Real Provider Sandbox

顺序：

1. 支付宝 sandbox / disabled-by-default。
2. 微信支付 sandbox / disabled-by-default。

每个 provider 单独 PR。必须包含：

- 验签。
- 证书 / key 管理。
- 回调幂等。
- 重试。
- 错误映射。
- secret masking。
- rollback。

### 5. Refund Gate

退款必须在支付成功链路稳定后单独推进。

必须包含：

- refund command guard。
- provider refund request idempotency。
- refund notification idempotency。
- partial refund amount invariant。
- manual review fallback。

### 6. Reconciliation Gate

对账先读，不自动写资金状态。

必须包含：

- provider statement parser。
- local payment/order/refund join。
- mismatch classification。
- operator review。
- export / audit。

### 7. Settlement Commission Payout Gate

结算、佣金、打款最后推进。

必须包含：

- settlement batch lock。
- refund / dispute / reconciliation passed 条件。
- commission pure function tests。
- seller ownership guard。
- payout disabled-by-default。
- manual approval。

### 8. Permission Gate

权限不是独立最后补丁，而是每个资金/订单/履约写接口的前置条件。

必须包含：

- Admin RBAC。
- Vendor user role。
- seller ownership。
- market ownership。
- resource ownership。
- negative tests。
- audit trail。

## 当前 Blockers

外部阻塞：

- 缺 disposable preprod DB host / port / user / db name。
- 缺备份 owner。
- 缺回滚 owner。
- 缺操作 owner。
- 缺明确连接授权。
- 缺 DB 可丢弃或可回滚确认。

内部阻塞：

- payment workflow execution adapter 未接 runtime。
- provider adapter 真实验签未实现。
- refund / reconciliation / settlement / commission / payout 仍只有设计边界。
- permission / RBAC launch matrix 尚未形成。

## 不允许的上线捷径

- 支付成功以前端返回页为准。
- 支付通知不验签。
- 支付通知不幂等。
- refund 点击后直接成功。
- 对账差异自动改订单或退款。
- 结算/佣金/打款与 payment provider 同 PR。
- capability view 替代 RBAC。
- 真实 secret 写 repo。
- 无 disposable DB rehearsal 注册 migration。

## 下一步

推荐继续：

1. `permission-rbac-launch-matrix`
   - 先把 Admin/Vendor/商户归属和资金写操作权限矩阵写清楚。

2. `payment-provider-production-hardening-plan`
   - 真实支付宝 / 微信支付前的密钥、证书、验签、回调、日志、rollback plan。

3. `payment-runtime-external-readiness-review`
   - 在用户提供 DB 前，只做外部 readiness review，不连接 DB。

4. `fulfillment-logistics-runtime-gate-plan`
   - 履约和物流单独 gate，不混入支付/结算。

## 本 PR 验证

```bash
git diff --check
```

预期：无输出。

