# Handoff

更新时间：2026-05-18 Asia/Shanghai

## 当前上下文

- Worktree：`/home/codex/code/fuyi-pr-bx-workflow-runtime`
- Branch：`china/pr-ui-refund-state-mutation-isolated-preprod-query-surface-fixture-registry-local-implementation`
- 当前任务：`refund-state-mutation-isolated-preprod-query-surface-fixture-registry-local-implementation`
- 当前改动仍未 commit / push / 开 PR。
- 当前事实源：`/tmp/fuyi-preprod-close-gate-created-local-disposable-go/readiness-suite/summary.json`
- 当前自用范围 / 禁用 runtime 边界：`docs/self-use-launch-scope-and-disabled-runtime.md`
- 当前 worktree staging 分组清单：`docs/current-worktree-staging-manifest.md`
- 当前 worktree staging 只读 preflight：`.codex/scripts/current-worktree-staging-preflight.sh`

## 当前结论

- close-gate verdict：`GO-FOR-CHECKED-SCOPE`
- external blockers：`[]`
- `derivedGateConfirmations.adminLoggedInVisualQa=true`
- `derivedGateConfirmations.highRiskRuntimeApproval=true`
- `derivedGateConfirmations.preprodDisposableDbRehearsal=true`
- `preprodEnvStatus.verdict=READY_TO_VALIDATE`
- `preprodEnvStatus.placeholderKeys=[]`
- artifact secret scan：PASS，证据目录未发现 `postgres://` / `postgresql://`

恢复入口只保留当前 close-gate 结论；历史过程查看 `project-ledger/changelog.md`。

## 本轮已完成

- 已创建并使用当前可控 disposable DB：`fuyi_preprod_disposable_codex_20260517141000`。
- 已写入 gitignored private env：`.codex/private/preprod-disposable-db-rehearsal.env`。
- private env 当前只可 redacted 检查，不可打印连接串，不可提交。
- 已补齐 localhost disposable preprod tunnel 确认。
- 已执行：
  - `PAYMENT_REFUND_SETTLEMENT_RUNTIME_APPROVED=true CODEX_PREPROD_CLOSE_GATE_OUTPUT_DIR=/tmp/fuyi-preprod-close-gate-created-local-disposable-go ./.codex/scripts/china-preprod-disposable-db-rehearsal-close-gate.sh run`
- close-gate 顺序已固定：
  - discovery
  - env-status
  - high-risk approval env gate
  - READY_TO_VALIDATE gate
  - from-env validate
  - guarded DB rehearsal
  - readiness artifact suite
- 已修复 close-gate 后 suite 误报根因：
  - `from-env run` 不再把 private DB env 带进普通 readiness quick tests。
  - refund provider inbox route config 的 secret scan 改为只扫描 env value，不扫 env key 名。
  - artifact suite 在 `PREPROD_DISPOSABLE_DB_REHEARSAL_CONFIRMED=true` 后不再保留真实 DB rehearsal blocker。
- 已进入拆 PR / staging 准备，并按 manifest 精确 stage 第 0/1、2、3、4 组：
  - 第 0/1 组：close-gate / readiness 工具、private/artifact ignore、runbook、自用 scope、staging manifest、ledger、learned rules。
  - 第 2 组：refund review query surface、canonical registration、PG readers、fixtures、focused tests、local disposable DB smoke。
  - 第 3 组：经营单位权限 / 平台模块开关后端配置、Admin / Vendor routes、guard、PG repository、china-platform-ops module、Vendor unit permission client。
  - 第 4 组：Admin / Vendor / Storefront UI 自用可见面、storefront 覆盖文档、UI 决策。
- 已继续 stage residual 第 5 组：
  - 开发服务入口统一走 `run-api-dev.sh`。
  - refund provider inbox 阻断顺序回归测试。
  - Vendor market context 查询结果防御。
  - china market read-model repository adapter 行数组防御。
  - `middlewares.ts` 格式整理。
- 当前 staged files：`146`。
- 第 4 组验证已完成：
  - Admin lint/build 通过；Vite 仅 chunk size warning。
  - Vendor lint/build 通过。
  - Storefront build 通过；仅既有 React Hook dependency warnings。
  - staging preflight：`pass=9 warnings=1 no_go=0`。
  - `git diff --cached --check` 通过。
- 第 5 组验证已完成：
  - `bash -n .codex/scripts/start-dev.sh` 通过。
  - refund provider inbox + Vendor market context focused tests：`31/31` 通过。
  - china market read-model repository adapter focused tests：`2/2` 通过。
  - `bun run check-types` 可执行，但 turbo 当前没有实际 `check-types` task，不能作为类型覆盖证据。
  - stage 后 unstaged modified 为 `0`，untracked non-ignored 为 `0`。
- staged 后最终证据核对已完成：
  - high-risk staged 文件名只命中 refund review query surface / provider inbox / permission 受控范围。
  - staged diff 新增行未发现放开 refund success state、runtime mutation、production explicit enablement、settlement / commission / payout mutation 的代码。
  - staged private/artifact 路径只包含目录 `.gitignore`。
  - quick readiness：`GO-FOR-CHECKED-SCOPE`，`pass=17 warnings=0 noGo=0`，输出 `/tmp/fuyi-staged-final-quick.json`。
- staged 后 full readiness 也已完成：
  - full readiness：`GO-FOR-CHECKED-SCOPE`，`pass=18 warnings=0 noGo=0`，输出 `/tmp/fuyi-staged-final-full.json`。
  - Admin / Vendor / Storefront build gates 通过。
  - Storefront build 仍有既有 React Hook dependency warnings，未阻断 build。
- `docs/current-worktree-staging-manifest.md` 已同步到最终交付状态：
  - staged files：`146`
  - unstaged modified：`0`
  - untracked non-ignored：`0`
  - 已记录 residual 第 5 组和 quick / full readiness 证据。
- staged shell 脚本语法复验已完成：
  - staged `.sh` files：`29`
  - `bash -n` 全部通过，输出 `STAGED_SHELL_SYNTAX_OK`。
- staged API 单测集合复验已完成：
  - staged API test files：`31`
  - `228 pass`
  - `0 fail`
  - `738 expect() calls`
- staged API 后端构建复验已完成：
  - 当前 WSL 非登录 shell 默认没有加载 `/home/codex/.nvm`，所以 `bun run build` 会让 Bun 代跑 Medusa CLI 并触发 source-map-support / trace-mapping 的堆栈映射异常。
  - 已按项目 Node 24 规则复跑：`source /home/codex/.nvm/nvm.sh && cd packages/api && node -v && node node_modules/.bin/medusa build`。
  - 输出：`v24.15.0`、`Types generated successfully`、`Backend build completed successfully (4.06s)`。
- staged 防误伤审查已完成：
  - staged files：`146`
  - 排除 generated `.mercur` type surface 后 reviewable files：`145`
  - staged private / artifact 路径只包含四个目录 `.gitignore`
  - runtime allow added-lines 未发现真实放开项；`execute workflow` / `grant RBAC` 命中均为否定边界文案或测试断言
  - real secret shape added-lines 无命中
- staged manifest 覆盖率审查已完成：
  - group0 protection：`4`
  - group1 readiness / ledger：`30`
  - group2 refund query surface：`61`
  - group3 unit permissions：`28`
  - group4 UI scope：`16`
  - group5 residual reviewed：`7`
  - unclassified：`0`
  - total：`146`

## 当前代码边界

- 仍未连接 production DB。
- 仍未执行 production workflow。
- 仍未写 production refund success state。
- 仍未触发 settlement、commission、payout、permission enforcement、fulfillment 或 logistics mutation。
- `PAYMENT_REFUND_SETTLEMENT_RUNTIME_APPROVED=true` 只是 approval gate 证据，不等于已经执行高风险 runtime 写路径。
- 当前 close-gate 结论是 checked scope readiness，不是生产写路径放行。
- 当前自用可验范围与仍禁用的生产 runtime 已汇总到 `docs/self-use-launch-scope-and-disabled-runtime.md`。

## 私有与提交边界

- `.codex/private/preprod-disposable-db-rehearsal.env` 必须保持 gitignored。
- `.codex/private/.gitignore` 与 `project-ledger/private/.gitignore` 只允许目录内 `.gitignore` 进入 Git，其余私有 env / 私有证据继续忽略。
- `/tmp/fuyi-*` 是本机运行证据目录，不纳入 PR。
- `packages/api/.mercur/index.d.ts` 仍在工作树里，恢复时不要误判为本条 close-gate 的核心改动。

## 恢复顺序

1. 先读本文件。
2. 再读 `project-ledger/status.md`。
3. 再读 `project-ledger/tasks.md`。
4. 再读 `memory/learned-rules.md`。
5. 需要复验证据时，优先读当前 summary：
   - `/tmp/fuyi-preprod-close-gate-created-local-disposable-go/readiness-suite/summary.json`
6. 如需判断“哪些可以自用、哪些还只是只读 / 预览”，读：
   - `docs/self-use-launch-scope-and-disabled-runtime.md`
7. 如需拆 staging / PR 范围，读：
   - `docs/current-worktree-staging-manifest.md`
8. staging 前后可跑只读 preflight：
   - `./.codex/scripts/current-worktree-staging-preflight.sh`
9. 如需重新产证据，使用新的输出目录，不覆盖旧证据：
   - `PAYMENT_REFUND_SETTLEMENT_RUNTIME_APPROVED=true CODEX_PREPROD_CLOSE_GATE_OUTPUT_DIR=/tmp/fuyi-preprod-close-gate-rerun-<timestamp> ./.codex/scripts/china-preprod-disposable-db-rehearsal-close-gate.sh run`

## 下一步

- 不继续扩三端功能。
- 不继续补新的高风险 runtime 写路径。
- 优先做拆 PR / staging 准备、证据包核对、提交范围清理。
- 剩余 7 个 modified tracked 文件已作为 residual 第 5 组 review 并进入 index。
- 最终 staged quick / full readiness、manifest、shell syntax 与 staged API tests 均已同步；下一步不继续扩功能，只进入人工 review / commit / PR 决策。
- staging 前先明确排除：
  - `.codex/private/preprod-disposable-db-rehearsal.env`
  - `/tmp/fuyi-*`
  - 本地 disposable DB 运行产物
