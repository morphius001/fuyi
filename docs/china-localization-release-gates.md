# China Localization Release Gates

更新时间：2026-05-17 Asia/Shanghai

## 2026-05-17 当前 close-gate 口径

最新上线 readiness 事实源：

- `/tmp/fuyi-preprod-close-gate-created-local-disposable-go/readiness-suite/summary.json`
- verdict：`GO-FOR-CHECKED-SCOPE`
- external blockers：`[]`
- Admin 登录态视觉 QA：confirmed
- 高风险 runtime approval gate：confirmed
- disposable DB rehearsal：confirmed
- private env status：`READY_TO_VALIDATE`
- artifact secret scan：PASS

当前结论只代表 checked scope 可进入自用 / 内部联调基线，不代表整个平台生产写路径全部完成。真实支付、退款成功状态写入、对账、结算、佣金、打款、RBAC enforcement、履约、物流和直播 / IM 仍是后续高风险串行任务。

当前自用范围和禁用 runtime 详见 `docs/self-use-launch-scope-and-disabled-runtime.md`。下面的 Gate 0-6 保留为历史门禁结构；如果和上面的 close-gate 事实冲突，以上面的 2026-05-17 summary 为准。

## 目标

给 Fuyi 中国本地化后续上线前建立门禁，避免“本地改得能看，上线不知道哪里生效”的问题。

## Gate 0：文档和队列一致

必须满足：

- `.codex/queue.md` 没有误标 done 的任务。
- `blocked-manual` 任务明确阻塞原因和恢复条件。
- 每个任务有 task 文件或报告。
- 每个 PR 有验证步骤和风险说明。

当前状态：

- passed。
- 剩余 `admin-market-membership-browser-qa` 是 `blocked-manual`，原因明确。

## Gate 1：本地只读链路

必须满足：

- API 单测覆盖 repository adapter、Vendor builder、Vendor route helper。
- 本地 disposable DB dry-run 能 up/down/cleanup。
- 不写 production seed。
- 不注册生产 migration。

当前状态：

- passed。
- 第三十一轮验证：3 suites / 16 tests passed，local dry-run passed。

## Gate 2：Admin 登录态视觉 QA

必须满足：

- 用户已登录 Admin。
- 截图 ready / empty / fallback 三态。
- 确认市场详情只读页没有保存、发布、生效、创建订单、创建配送规则或支付配置入口。

当前状态：

- blocked-manual。

## Gate 3：预发 disposable DB dry-run

必须满足：

- 用户明确提供可删除、可重建、无生产数据的预发 DB。
- 先备份或确认无需备份。
- 按 `docs/preprod-disposable-db-rehearsal-runbook.md` 执行当前脚本化流程。
- 私有 env 必须先通过 redacted status 和 validate，且不得提交到 git。
- 执行 guarded preprod DB rehearsal，只允许 migration / schema evidence。
- 验证 payment / refund query surface / unit permission 相关表。
- 记录 cleanup / rollback 证据。
- 输出完整日志和回滚结果。

当前状态：

- blocked：默认私有 env 草稿已生成但仍含占位符；真实 disposable preprod DB 尚未提供。

## Gate 4：真实 migration 注册

必须满足：

- Gate 1、Gate 2、Gate 3 全部通过。
- 单独 PR。
- 明确 rollback。
- 不和 Admin 写接口、生产 seed、支付、订单、退款、结算、权限混在同一 PR。

当前状态：

- blocked by Gate 2 and Gate 3。

## Gate 5：写接口和模块开关

必须满足：

- 只读模型稳定。
- Admin 操作需要权限、审计、幂等和回滚策略。
- 模块开关先只影响展示，再逐步进入业务能力。
- 不影响现有 RBAC。

当前状态：

- not started。

## Gate 6：交易和履约高风险区

以下内容必须串行、单独设计、单独验证：

- 支付成功状态。
- 支付异步通知。
- 退款。
- 对账。
- 商家结算。
- 佣金。
- 权限。
- 真实物流履约。
- 快递打印。

当前状态：

- not started。

## 不允许的上线捷径

- 直接把 mock 数据当生产 seed。
- 直接把前端跳转当支付成功。
- 在没有 Admin 登录态截图时标记浏览器 QA done。
- 在没有 disposable DB 验证时注册真实 migration。
- 在一个 PR 里混合 migration、写接口、支付、退款、结算或权限。
- 写入真实密钥到 repo。

## 下一步推荐

1. 先完成 Admin 登录态浏览器 QA。
2. 再做预发 disposable DB checklist。
3. 再做本地 DB integration test。
4. 最后才评审真实 migration registration。
