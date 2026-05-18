# Self-use Launch Scope And Disabled Runtime

更新时间：2026-05-17 Asia/Shanghai

## 当前结论

当前可作为自用 / 内部联调的 checked scope 基线，但不能解释为“整个平台所有生产功能已经完成”。

事实源：

- `/tmp/fuyi-preprod-close-gate-created-local-disposable-go/readiness-suite/summary.json`
- verdict：`GO-FOR-CHECKED-SCOPE`
- external blockers：`[]`
- Admin 登录态视觉 QA：confirmed
- 高风险 runtime approval gate：confirmed
- disposable DB rehearsal：confirmed
- private env status：`READY_TO_VALIDATE`
- artifact secret scan：PASS

这份结论只覆盖本轮明确验证过的范围：只读查询面、Admin / Vendor 可见性链路、mock / dry-run / shadow 验证、local disposable DB rehearsal 和 readiness artifact suite。

## 可以自用验证的范围

### Admin 平台运营后台

- 中国运营后台首页和运营待办卡片式布局。
- 模块开关与经营单位权限页面。
- 经营单位级菜单可见性配置保存链路：
  - Admin 保存 API。
  - PG-first / server-memory fallback 配置读取。
  - 变更事件记录。
  - Admin 端 effective preview。
- Admin 登录态视觉 QA 脚本与截图产物。

### Vendor 商户 / 供应方后台

- Vendor 菜单按经营单位 effective view 显示 / 隐藏。
- 隐藏模块点击后走后端 authorize 阻断。
- 已接入的自定义 Vendor module surface preview 只读接口。
- 店铺装修、物料供应、配送供应、上游货源、物流、财务等入口可以做菜单和预览联调。

### Refund Review Query Surface

- Admin 只读查询面可走 canonical registration / repository / PG fallback 主线。
- 当前验证覆盖：
  - focused tests。
  - local disposable DB HTTP smoke。
  - readiness suite summary。
- 该查询面只负责 review / query，不写 refund success state。

### Readiness / 证据链

- close-gate 脚本固定顺序：
  - discovery
  - env-status
  - high-risk approval env gate
  - from-env validate
  - guarded DB rehearsal
  - artifact suite
- 证据目录已做 artifact secret scan。
- private env 和本地证据目录保持 gitignored。

## 只能当只读 / 预览的范围

以下功能可以展示、筛选、预览或跑 mock / dry-run，但不能当作真实生产能力：

- 支付 provider、支付成功状态和支付通知状态流转。
- refund success state mutation。
- settlement、commission、payout、对账和真实打款。
- Mercur / Medusa RBAC enforcement。
- 订单履约状态写入、发货、配送状态修改。
- 快递打印、电子面单、真实物流 API、真实运单号。
- 直播、IM、客服消息、推流或回放管理。
- AI 一句话正式上架；当前只能生成草稿 / 预览并等待商户确认。
- Storefront checkout shipping options、cart total、order ownership 的真实生产影响。

## 不能越线的高风险边界

- 不连接 production DB。
- 不执行 production workflow。
- 不写 production refund success state。
- 不触发 settlement / commission / payout。
- 不把菜单可见性冒充为真实 RBAC。
- 不用 mock provider / local provider 代替真实微信支付、支付宝、短信、IM、物流或直播。
- 不把 local disposable DB rehearsal 当成生产迁移或生产发布证据。
- 不提交 `.codex/private/**`、`project-ledger/private/**`、`/tmp/fuyi-*`、截图产物或任何真实连接串。

## 自用复验命令

查看当前 close-gate summary：

```bash
bun -e "const s=require('/tmp/fuyi-preprod-close-gate-created-local-disposable-go/readiness-suite/summary.json'); console.log(JSON.stringify({verdict:s.verdict,externalBlockers:s.externalBlockers,derivedGateConfirmations:s.derivedGateConfirmations,preprodEnvStatus:s.preprodEnvStatus}, null, 2))"
```

重新跑 checked scope close-gate 时必须使用新的输出目录，不覆盖旧证据：

```bash
PAYMENT_REFUND_SETTLEMENT_RUNTIME_APPROVED=true \
CODEX_PREPROD_CLOSE_GATE_OUTPUT_DIR=/tmp/fuyi-preprod-close-gate-rerun-$(date +%Y%m%d%H%M%S) \
./.codex/scripts/china-preprod-disposable-db-rehearsal-close-gate.sh run
```

提交前最小检查：

```bash
git diff --check
./.codex/scripts/china-readiness-artifact-secret-scan.sh \
  /tmp/fuyi-preprod-close-gate-created-local-disposable-go \
  --output /tmp/fuyi-self-use-artifact-secret-scan.json \
  --log /tmp/fuyi-self-use-artifact-secret-scan.log
git check-ignore -v .codex/private/preprod-disposable-db-rehearsal.env project-ledger/private/anything.env
```

## 上线前仍要单独完成

- 按 PR / staging 主题拆分大 worktree，不能 `git add .`。
- 生产环境变量、CORS、cookie/session 域名、provider adapter 开关审计。
- 真实支付 provider、退款、结算、佣金、打款、履约、物流、RBAC enforcement 独立设计、独立验证、独立发布。
- 从 mock / preview 升级到真实写路径前，必须补审计、幂等、回滚、权限、失败原因和人工复核入口。
