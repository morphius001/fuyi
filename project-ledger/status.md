# 项目状态 Ledger

更新时间：2026-05-18 Asia/Shanghai

## 当前活跃上下文

- 当前开发 worktree：`/home/codex/code/fuyi-pr-bx-workflow-runtime`
- 当前活跃分支：`china/pr-ui-refund-state-mutation-isolated-preprod-query-surface-fixture-registry-local-implementation`
- 当前代码层任务：`refund-state-mutation-isolated-preprod-query-surface-fixture-registry-local-implementation`
- 当前改动仍未 commit / push / 开 PR。
- 当前 `origin/main` 最新合并提交：`64ba1eb` `Merge pull request #545 from morphius001/china/pr-uh-refund-state-mutation-isolated-preprod-query-surface-fixture-registry-implementation-blocker-map-validation`

## 当前上线 Readiness 事实源

- summary：`/tmp/fuyi-preprod-close-gate-created-local-disposable-go/readiness-suite/summary.json`
- 自用范围 / 禁用 runtime 边界：`docs/self-use-launch-scope-and-disabled-runtime.md`
- 当前 worktree staging 分组清单：`docs/current-worktree-staging-manifest.md`
- 当前 worktree staging 只读 preflight：`.codex/scripts/current-worktree-staging-preflight.sh`
- verdict：`GO-FOR-CHECKED-SCOPE`
- external blockers：`[]`
- Admin 登录态视觉 QA：confirmed
- 高风险 runtime approval gate：confirmed
- preprod disposable DB rehearsal：confirmed
- preprod private env：`READY_TO_VALIDATE`
- placeholder keys：`[]`
- artifact secret scan：PASS

恢复入口只保留当前 close-gate 结论；历史过程查看 `project-ledger/changelog.md`。

## 最新完成内容

- 按用户要求直接创建当前可控 disposable DB：`fuyi_preprod_disposable_codex_20260517141000`。
- 将该 disposable DB 写入 gitignored private env：`.codex/private/preprod-disposable-db-rehearsal.env`。
- 补齐 localhost disposable preprod tunnel 确认。
- 执行并通过 close-gate：
  - `PAYMENT_REFUND_SETTLEMENT_RUNTIME_APPROVED=true CODEX_PREPROD_CLOSE_GATE_OUTPUT_DIR=/tmp/fuyi-preprod-close-gate-created-local-disposable-go ./.codex/scripts/china-preprod-disposable-db-rehearsal-close-gate.sh run`
- close-gate 完整链路已通过：
  - discovery
  - env-status
  - approval gate
  - from-env validate
  - guarded DB rehearsal
  - artifact suite
- 修复 close-gate / readiness suite 根因：
  - `from-env run` 只执行 guarded DB rehearsal，不再污染普通 readiness quick tests。
  - `refund-provider-inbox-route-config.ts` secret scan 改为扫描 env value，避免 env key 名误报。
  - artifact suite 在 preprod rehearsal confirmed 后不再硬编码真实 DB external blocker。

## 当前验证证据

- provider inbox focused tests：`41/41` 通过。
- quick gate 在 `PREPROD_DISPOSABLE_DB_REHEARSAL_CONFIRMED=true` 下为 `GO-FOR-CHECKED-SCOPE`。
- `preprod-env-discovery` / `preprod-env-status` / `preprod-db-local-script-test` confirmed 模式均为 `GO-FOR-CHECKED-SCOPE`。
- 完整 close-gate 输出目录：`/tmp/fuyi-preprod-close-gate-created-local-disposable-go`。
- close-gate artifact 目录未发现 `postgres://` / `postgresql://`。
- `git diff --check` 通过。
- private env 忽略规则已确认：
  - `.codex/private/preprod-disposable-db-rehearsal.env` 命中 `.codex/private/.gitignore`
  - `project-ledger/private/*` 命中 `project-ledger/private/.gitignore`
- 已补充自用上线范围文档，明确哪些链路可以内部联调、哪些仍只是只读 / mock / preview、哪些生产写路径仍禁止。
- 已补充当前 worktree staging 分组清单，按 close-gate 工具、refund query surface、单位权限、三端 UI、生成类型文件、必须排除产物拆分。
- 已新增当前 worktree staging 只读 preflight 脚本，用于 staging 前后检查 diff、ignore、artifact secret scan、staged private/artifact 风险和 staged 高风险关键词。
- 自用范围文档补充后已复验：
  - `git diff --check` 通过。
  - close-gate artifact secret scan 通过。
  - private env / artifact 目录 git ignore 命中。
- staging 分组清单补充后已复验：
  - `git diff --check` 通过。
  - close-gate artifact secret scan 通过。
  - private env / artifact 目录 git ignore 命中。
- staging preflight 脚本已复验：
  - `bash -n .codex/scripts/current-worktree-staging-preflight.sh` 通过。
  - `./.codex/scripts/current-worktree-staging-preflight.sh` 输出 `pass=10 warnings=0 no_go=0`。
  - 默认模式会断言 close-gate summary 为 `GO-FOR-CHECKED-SCOPE` 且 gates confirmed；stage 后可加 `--expect-staged`。
- 已精确 stage manifest 第 0/1 组：
  - staged files：`34`
  - 范围：close-gate / readiness 工具、private/artifact `.gitignore`、preprod runbook、自用 scope、staging manifest、ledger、learned rules。
  - 未 stage `apps/**` 或 `packages/**` 业务代码。
  - `./.codex/scripts/current-worktree-staging-preflight.sh --expect-staged` 输出 `pass=10 warnings=0 no_go=0`。
  - `git diff --cached --check` 通过。
- 已精确 stage manifest 第 2 组：
  - 当前 staged files：`95`。
  - 范围：refund review query surface、canonical registration、PG readers、fixtures、focused tests、local disposable DB smoke 脚本和对应文档。
  - 未 stage 单位权限组或三端 UI 组。
  - `bun test ...refund-review-query-surface...` focused tests：`55/55` 通过。
  - 本地 disposable DB Admin HTTP smoke 在 close-gate confirmed 环境下：`GO-FOR-CHECKED-SCOPE`，`pass=18 warnings=1 noGo=0`，cleanup 残留库 count 为 `0`。
  - `./.codex/scripts/current-worktree-staging-preflight.sh --expect-staged` 输出 `pass=9 warnings=1 no_go=0`；warning 为 staged 文件名包含 refund/payment 高风险关键词，符合第 2 组主题，需继续按只读 query surface 边界 review。
  - `git diff --cached --check` 通过。
- 已精确 stage manifest 第 3 组：
  - 当前 staged files：`123`。
  - 范围：经营单位权限 / 平台模块开关后端配置、Admin unit permissions/module switches routes、Vendor effective/authorize/preview routes、guard、PG repository、china-platform-ops module、Vendor unit permission client。
  - 未 stage 三端 UI 页面组。
  - 单测：`22/22` 通过。
  - `unit-permission-smoke`：`GO-FOR-CHECKED-SCOPE`，`pass=18 warnings=0 noGo=0`。
  - HTTP smoke 覆盖 Admin 保存 / effective preview、Vendor effective、authorize、read-only preview，以及 seafoodStallA12 / frozenMerchantB08 / deliverySupplierTeam / materialSupplierNorth 四类经营单位 full matrix。
  - `./.codex/scripts/current-worktree-staging-preflight.sh --expect-staged` 输出 `pass=9 warnings=1 no_go=0`；warning 为 staged 文件名包含 refund/payment/permission 高风险关键词，符合第 2/3 组主题，需继续按只读 query surface 与菜单可见性边界 review。
  - `git diff --cached --check` 通过。
- 已精确 stage manifest 第 4 组：
  - 当前 staged files：`139`。
  - 范围：Admin 中国平台首页 / 运营台视觉、Admin 页面壳和菜单文案、Vendor 单位权限可见性消费端、Storefront 中国首页 / footer 覆盖、自用 UI 决策与 storefront 覆盖文档。
  - 未扩展订单、支付、退款、结算、佣金、打款、履约、物流、RBAC enforcement 或 workflow runtime 写路径。
  - Admin：`cd apps/admin && bun run lint && bun run build` 通过；Vite 仅保留 chunk size warning。
  - Vendor：`cd apps/vendor && bun run lint && bun run build` 通过。
  - Storefront：`cd apps/storefront && bun run build` 通过；仅保留既有 React Hook dependency warnings。
  - `./.codex/scripts/current-worktree-staging-preflight.sh --expect-staged` 输出 `pass=9 warnings=1 no_go=0`；warning 仍为 staged 文件名包含 refund/payment/permission 高风险关键词，来自第 2/3 组已知范围。
  - `git diff --cached --check` 通过。
- 已精确 stage residual 第 5 组：
  - 当前 staged files：`146`。
  - 范围：开发服务入口统一走 `run-api-dev.sh`、refund provider inbox 阻断顺序回归测试、Vendor market context 查询结果防御、china market read-model repository adapter 行数组防御、`middlewares.ts` 格式整理。
  - `bash -n .codex/scripts/start-dev.sh` 通过。
  - `bun test src/api/china/refund-inbox/alipay/__tests__/route.unit.spec.ts src/api/china/refund-inbox/wechat-pay/__tests__/route.unit.spec.ts src/api/vendor/china/market-context/__tests__/helpers.unit.spec.ts`：`31/31` 通过。
  - `bun test src/modules/china-market-read-model/__tests__/repository-market-read-model-adapter.unit.spec.ts`：`2/2` 通过。
  - `bun run check-types` 可执行，但 turbo 当前没有实际 `check-types` task，输出 `Tasks: 0 successful, 0 total`；不能作为类型覆盖证据。
  - stage 后 `git diff --cached --check` 通过，unstaged modified 为 `0`，untracked non-ignored 为 `0`。
- staged 后最终证据核对：
  - high-risk staged 文件名清单只命中 refund review query surface / provider inbox / permission 相关受控范围，未命中 settlement、commission、payout、fulfillment、logistics、workflow 文件名。
  - staged diff 新增行扫描未发现 `refundSuccessState: true`、`runtimeMutationBlocked: false`、`stateMutationBlocked: false`、`productionExplicitlyEnabled: true`、`settlementMutationAllowed: true`、`commissionMutationAllowed: true` 或 `payoutMutationAllowed: true`。
  - staged diff 新增行中 `execute workflows` / `grant RBAC` 命中均为否定边界文案或测试断言。
  - staged private/artifact 路径只包含 `.gitignore`：`.codex/private/.gitignore`、`.codex/artifacts/.gitignore`、`project-ledger/private/.gitignore`、`project-ledger/artifacts/.gitignore`。
  - `ADMIN_LOGIN_VISUAL_QA_CONFIRMED=true PREPROD_DISPOSABLE_DB_REHEARSAL_CONFIRMED=true PAYMENT_REFUND_SETTLEMENT_RUNTIME_APPROVED=true ./.codex/scripts/china-launch-readiness-check.sh quick --json --output /tmp/fuyi-staged-final-quick.json || true` 输出 `GO-FOR-CHECKED-SCOPE`，`pass=17 warnings=0 noGo=0`。
- staged 后 full readiness 复验：
  - `ADMIN_LOGIN_VISUAL_QA_CONFIRMED=true PREPROD_DISPOSABLE_DB_REHEARSAL_CONFIRMED=true PAYMENT_REFUND_SETTLEMENT_RUNTIME_APPROVED=true ./.codex/scripts/china-launch-readiness-check.sh full --json --output /tmp/fuyi-staged-final-full.json || true` 输出 `GO-FOR-CHECKED-SCOPE`，`pass=18 warnings=0 noGo=0`。
  - 已覆盖 Admin / Vendor / Storefront build gates。
  - Storefront build 仍保留既有 React Hook dependency warnings；未升级为 blocking error。
- 当前 staging manifest 已同步到最终交付状态：
  - `docs/current-worktree-staging-manifest.md` 已更新为 2026-05-18。
  - 已记录 staged files `146`、unstaged modified `0`、untracked non-ignored `0`。
  - 已记录 quick / full readiness 最终输出和 residual 第 5 组范围。
- staged shell 脚本语法复验：
  - staged `.sh` files：`29`。
  - `bash -n` 全部通过，输出 `STAGED_SHELL_SYNTAX_OK`。
- staged API 单测集合复验：
  - staged API test files：`31`。
  - `xargs bun test < /tmp/fuyi-staged-api-tests-relative.txt` 在 `packages/api` 下通过。
  - 输出：`228 pass`，`0 fail`，`738 expect() calls`。
- staged API 后端构建复验：
  - 当前 WSL 非登录 shell 默认未加载 `/home/codex/.nvm`，直接 `bun run build` 会让 Bun 代跑 Medusa CLI，并触发 source-map-support / trace-mapping 的堆栈映射异常。
  - 按项目 Node 24 规则复跑：`source /home/codex/.nvm/nvm.sh && cd packages/api && node -v && node node_modules/.bin/medusa build`。
  - 输出：`v24.15.0`，`Types generated successfully`，`Backend build completed successfully (4.06s)`。
- staged 防误伤审查：
  - staged files：`146`。
  - 排除 generated `.mercur` type surface 后 reviewable files：`145`。
  - staged private / artifact 路径只包含四个目录 `.gitignore`。
  - runtime allow added-lines 未发现真实放开项；`execute workflow` / `grant RBAC` 命中均为否定边界文案或测试断言。
  - real secret shape added-lines 无命中。
- staged manifest 覆盖率审查：
  - group0 protection：`4`。
  - group1 readiness / ledger：`30`。
  - group2 refund query surface：`61`。
  - group3 unit permissions：`28`。
  - group4 UI scope：`16`。
  - group5 residual reviewed：`7`。
  - unclassified：`0`。
  - total：`146`。

## 当前边界

- 未连接 production DB。
- 未执行 production workflow。
- 未写 production refund success state。
- 未触发 settlement、commission、payout、permission enforcement、fulfillment 或 logistics mutation。
- 当前 approval 只代表 gate 已确认，不代表已执行任何高风险 runtime 写路径。
- private env 与 `/tmp/fuyi-*` 证据不进入 PR。

## 下一步建议

- 进入拆 PR / staging 准备。
- 第 0/1、2、3、4、5 组已进入 index；manifest、ledger、quick / full readiness、staged shell syntax、staged API tests 均已同步，不继续扩功能。
- 不继续扩 UI / Storefront / Vendor / Admin 新功能。
- 不把高风险串行任务混入本轮。
