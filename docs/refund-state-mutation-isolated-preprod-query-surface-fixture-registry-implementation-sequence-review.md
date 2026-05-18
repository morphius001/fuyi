# Refund State Mutation Isolated Preprod Query Surface Fixture Registry Implementation Sequence Review

更新时间：2026-05-16 Asia/Shanghai

## 结论

当前仍然是 No-Go，但 implementation blocker map 已经可以转成串行推进顺序。未来如果进入实现，必须按波次推进，每一波只解除一个层级的 blocker，并且在下一波开始前保留 fail-closed、disabled-by-default、no workflow、no refund success state mutation 的边界。

本 review 只是 docs-only 顺序收口，不新增 route、不写 fixture registry implementation、不连接 production / preprod DB、不执行 workflow。

## Wave 0: 当前准入基线

目标：只确认当前机器证据、外部门禁和安全包装入口。

允许：

- 继续维护 readiness 脚本、artifact suite、preprod disposable DB rehearsal wrapper 和 ledger。
- 继续生成 `summary.json` / `summary.md` 这类机器与人读证据。
- 继续把真实预发 DB rehearsal 保持为外部 gate。

必须保留：

- 本地 disposable DB script-test 不能替代真实 preprod gate。
- 未设置 `PAYMENT_REFUND_SETTLEMENT_RUNTIME_APPROVED=true` 前，不得开启任何 payment / refund / settlement / commission / payout / permission / fulfillment runtime 写路径。
- wrapper 不能接受模板 env、repo 内非私有 env、shell 继承变量或 placeholder 值。

进入 Wave 1 前必须满足：

1. `git diff --check` 通过。
2. readiness suite 可复跑并仍准确汇总 NO-GO。
3. preprod rehearsal 仍保持未提供真实 DB 时 fail-closed。

## Wave 1: Fixture Registry Implementation Skeleton

目标：只实现 fixture registry 的本地数据结构、loader 和 redacted contract，不接 route runtime。

允许：

- 新增 registry 类型、fixture manifest loader、redacted payload shape builder。
- 新增 local-only fixture 文件或 test fixture。
- 新增 focused unit tests 覆盖 missing fixture、blocked fixture、incompatible fixture 和 redaction。

禁止：

- 不新增 operator route。
- 不新增 resolver executable runtime。
- 不连接 production / preprod DB。
- 不读取真实 refund / payment / order 数据。

必须验证：

1. fixture 缺失时 fail-closed。
2. fixture block reason 存在时 fail-closed。
3. payload redaction 不泄露 provider raw secret、payment credential、operator token。
4. 默认 registry mode 仍为 disabled。

## Wave 2: Builder Runtime Wiring

目标：把 builder 接到 fixture registry skeleton，但只允许 local fixture / disabled mode。

允许：

- 新增 builder 到 registry 的纯函数 wiring。
- 新增 cache key / pagination boundary 的本地单测。
- 新增 envelope shape tests，确认 blocked / missing / incompatible 输出一致。

禁止：

- 不新增 HTTP route。
- 不新增 isolated preprod repository resolver。
- 不执行 workflow。
- 不写 refund success state。

必须验证：

1. `disabled` mode 永远返回 blocked envelope。
2. `local_fixture` mode 只读本地 fixture，不读 DB。
3. cache / pagination 对 blocked response 不泄露 partial payload。
4. builder test 不能 mock 出真实成功 mutation。

## Wave 3: Resolver Runtime Implementation

目标：实现 resolver mode switch，但仍默认 disabled，并且 isolated preprod repository 只能在显式 rehearsal / smoke 条件下读取。

允许：

- 新增 resolver mode 枚举和 fail-closed selector。
- 新增 isolated preprod repository read-only resolver 的接口骨架。
- 新增 production-like env / DB scope fail-closed tests。

禁止：

- 不把 resolver 接到公开 route。
- 不执行 workflow。
- 不写 mutation approval、runtime attempt 或 terminal conflict 的新状态。
- 不触发 settlement、commission、payout、permission、fulfillment、logistics。

必须验证：

1. production / prod / staging / preprod 未显式隔离时 fail-closed。
2. DB host / name 不匹配 disposable allowlist 时，在查询前 fail-closed。
3. resolver 只能返回 read-only review payload。
4. disable path 可在不改 DB 的情况下立即生效。

## Wave 4: Operator Route Runtime

目标：在 operator-only、disabled-by-default 前提下暴露 route runtime。

允许：

- 新增 operator route，并默认只返回 disabled / blocked response。
- 新增 auth / role / operator audit metadata 的只读 envelope。
- 新增 route focused tests 覆盖 401 / 403 / disabled / missing fixture / blocked fixture。

禁止：

- route 不得写 refund success state。
- route 不得调用 refund workflow、payment workflow、settlement workflow 或 fulfillment workflow。
- route 不得把菜单可见性、Admin visual QA 或本地 smoke 当成 runtime approval。

必须验证：

1. 未登录和非 operator fail-closed。
2. 默认配置 route disabled。
3. route response 明确 `runtimeEnabled=false` 或等价 blocked state。
4. 所有异常路径不读 raw provider body、不打开写 transaction。

## Wave 5: Execution Evidence And Launch Review

目标：只有在 Wave 1-4 全部通过后，才补 execution evidence、rollback drill 和 launch review。

允许：

- 在 disposable preprod DB 上做 read-only query rehearsal。
- 记录 rollback / disable drill evidence。
- 更新 launch readiness review 和 validation。

禁止：

- 不用本地 script-test 替代真实 disposable preprod DB。
- 不把 read-only query evidence 外推成 payment / refund / settlement runtime approval。
- 不在同一个 PR 里混入真实 mutation 写路径。

必须验证：

1. 真实 disposable preprod DB rehearsal 有 operator、cleanup owner、备份/无需备份确认和清理证据。
2. rollback drill 能回到 disabled / blocked response。
3. launch review 仍列出 payment / refund / settlement / commission / payout / permission / fulfillment 高风险审批状态。
4. 所有证据可以从 artifact / log / ledger 追溯。

## Cross-Wave Fail-Closed Rules

以下规则每一波都不能放松：

- 默认 disabled。
- blocked / missing / incompatible fixture 必须 fail-closed。
- production-like 环境优先阻断。
- 不执行 workflow。
- 不写 refund success state。
- 不触发 settlement、commission、payout、permission、fulfillment、logistics。
- 不把 Admin UI、Vendor menu visibility、local smoke 或 docs-only review 当作 runtime authorization。

## Review Conclusion

未来 implementation 可以从 Wave 1 开始，但每一波都必须独立验证并单独 review。当前只完成 sequence review；没有解除任何 launch blocker，也没有新增可执行 runtime。

## Verification Plan

本轮需要运行：

```bash
git diff --check
git status --short --branch
```
