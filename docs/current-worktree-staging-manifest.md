# Current Worktree Staging Manifest

更新时间：2026-05-18 Asia/Shanghai

## 目的

本清单只服务当前 worktree：

- `/home/codex/code/fuyi-pr-bx-workflow-runtime`
- branch：`china/pr-ui-refund-state-mutation-isolated-preprod-query-surface-fixture-registry-local-implementation`
- 最新 close-gate 事实源：`/tmp/fuyi-preprod-close-gate-created-local-disposable-go/readiness-suite/summary.json`

当前 worktree 不是干净小 diff。提交或拆 staging 前必须按本清单分组审查，禁止 `git add .`。

## 当前 staged 结论

截至 2026-05-18 Asia/Shanghai：

- 已按本清单 stage 第 0/1、2、3、4、5 组。
- staged files：`146`
- unstaged modified：`0`
- untracked non-ignored：`0`
- private / artifact staged 路径只包含目录 `.gitignore`。
- 当前最终证据：
  - `/tmp/fuyi-staged-final-quick.json`：`GO-FOR-CHECKED-SCOPE`，`pass=17 warnings=0 noGo=0`
  - `/tmp/fuyi-staged-final-full.json`：`GO-FOR-CHECKED-SCOPE`，`pass=18 warnings=0 noGo=0`
- final staged preflight：
  - `./.codex/scripts/current-worktree-staging-preflight.sh --expect-staged`
  - `pass=9 warnings=1 no_go=0`
  - 唯一 warning 为 staged 文件名包含 refund / payment / permission；已核对为 refund review query surface、provider inbox 测试和单位权限可见性受控范围。
- staged shell syntax：
  - staged `.sh` files：`29`
  - `bash -n` 全部通过。
- staged API tests：
  - staged API test files：`31`
  - `228 pass / 0 fail`
- API backend build：
  - `source /home/codex/.nvm/nvm.sh && cd packages/api && node -v && node node_modules/.bin/medusa build`
  - `v24.15.0`
  - `Backend build completed successfully`
  - 说明：直接 `bun run build` 会因当前非登录 WSL shell 未加载 Node，改由项目要求的 Node 24 调用 Medusa CLI；Bun 触发的是 source-map-support / trace-mapping 工具链异常，不作为代码构建失败证据。
- 最终防误伤审查：
  - staged files：`146`
  - reviewable files excluding generated `.mercur` type surface：`145`
  - private / artifact staged 路径只包含四个目录 `.gitignore`
  - runtime allow added-lines 扫描未发现真实放开项；`execute workflow` / `grant RBAC` 命中均为否定边界文案或测试断言
  - real secret shape added-lines 扫描无命中
- manifest 覆盖率审查：
  - staged files：`146`
  - group0 protection：`4`
  - group1 readiness / ledger：`30`
  - group2 refund query surface：`61`
  - group3 unit permissions：`28`
  - group4 UI scope：`16`
  - group5 residual reviewed：`7`
  - unclassified：`0`

## 当前文件规模

初始检查口径：

- modified tracked files：`38`
- untracked non-ignored files：`108`
- private / artifact ignored entries：`10`

当前 staged 后检查口径：

- modified tracked files：`0`
- untracked non-ignored files：`0`
- staged files：`146`

重新统计命令：

```bash
git diff --name-only | wc -l
git ls-files --others --exclude-standard | wc -l
git status --ignored --short .codex/private .codex/artifacts project-ledger/private project-ledger/artifacts
```

也可以直接跑当前 worktree 只读 preflight：

```bash
./.codex/scripts/current-worktree-staging-preflight.sh
```

如果已经 stage 了某个分组，使用严格 staged 模式：

```bash
./.codex/scripts/current-worktree-staging-preflight.sh --expect-staged
```

## Staging 顺序

### 0. 永远先排除

这些只允许留在本机或只提交目录内 `.gitignore`：

- `.codex/private/preprod-disposable-db-rehearsal.env`
- `.codex/artifacts/**`
- `project-ledger/private/**`
- `project-ledger/artifacts/**`
- `/tmp/fuyi-*`

只允许进入 Git 的保护文件：

- `.codex/private/.gitignore`
- `.codex/artifacts/.gitignore`
- `project-ledger/private/.gitignore`
- `project-ledger/artifacts/.gitignore`

验证：

```bash
git check-ignore -v \
  .codex/private/preprod-disposable-db-rehearsal.env \
  project-ledger/private/anything.env \
  .codex/artifacts/admin-visual-qa-test/summary.json \
  project-ledger/artifacts/test/summary.json
```

### 1. Close-gate / readiness 工具与 ledger

目标：先把恢复入口、私有 env 防误提交、readiness suite、admin visual QA、preprod disposable DB rehearsal 和 self-use scope 固化。

候选文件：

```text
.codex/queue.md
.codex/scripts/admin-login-smoke.sh
.codex/scripts/china-admin-logged-in-visual-qa.sh
.codex/scripts/china-launch-readiness-artifact-suite.sh
.codex/scripts/china-launch-readiness-check.sh
.codex/scripts/china-platform-module-switch-admin-http-smoke.sh
.codex/scripts/china-preprod-disposable-db-rehearsal-apply-current-env.sh
.codex/scripts/china-preprod-disposable-db-rehearsal-close-gate.sh
.codex/scripts/china-preprod-disposable-db-rehearsal-env-discover.sh
.codex/scripts/china-preprod-disposable-db-rehearsal-env-status.sh
.codex/scripts/china-preprod-disposable-db-rehearsal-from-env.sh
.codex/scripts/china-preprod-disposable-db-rehearsal-init-env.sh
.codex/scripts/china-preprod-disposable-db-rehearsal-local-script-test.sh
.codex/scripts/china-preprod-disposable-db-rehearsal.sh
.codex/scripts/china-readiness-artifact-secret-scan.sh
.codex/scripts/china-unit-permission-admin-vendor-http-smoke.sh
.codex/scripts/lib/preprod-disposable-env-safe-loader.sh
.codex/scripts/run-api-dev.sh
.codex/templates/preprod-disposable-db-rehearsal.env.example
.codex/private/.gitignore
.codex/artifacts/.gitignore
project-ledger/private/.gitignore
project-ledger/artifacts/.gitignore
docs/preprod-disposable-db-rehearsal-runbook.md
docs/self-use-launch-scope-and-disabled-runtime.md
docs/china-localization-release-gates.md
project-ledger/status.md
project-ledger/tasks.md
project-ledger/handoff.md
project-ledger/changelog.md
project-ledger/handoff-2026-05-15-refund-review-query-surface-context-reset.md
memory/learned-rules.md
```

验证：

```bash
git diff --check -- .codex docs/preprod-disposable-db-rehearsal-runbook.md docs/self-use-launch-scope-and-disabled-runtime.md docs/china-localization-release-gates.md project-ledger memory/learned-rules.md
./.codex/scripts/china-readiness-artifact-secret-scan.sh /tmp/fuyi-preprod-close-gate-created-local-disposable-go --output /tmp/fuyi-self-use-artifact-secret-scan.json --log /tmp/fuyi-self-use-artifact-secret-scan.log
```

### 2. Refund review query surface

目标：只读 refund review query surface 主线、canonical registration、PG readers、fixtures、focused tests、local disposable DB smoke。

候选文件：

```text
packages/api/medusa-config.ts
packages/api/.mercur/index.d.ts
packages/api/src/api/admin/china/refund-review-query-surface/**
packages/api/src/modules/china-payment-notification/**
.codex/scripts/refund-review-query-surface-*.sh
.codex/scripts/refund-review-query-surface-repository-route-pg-smoke.ts
.codex/tasks/refund-state-mutation-isolated-preprod-query-surface-fixture-registry-implementation-sequence-validation.md
docs/refund-state-mutation-isolated-preprod-query-surface-fixture-registry-implementation-sequence-review.md
docs/refund-state-mutation-isolated-preprod-query-surface-fixture-registry-implementation-sequence-validation.md
```

边界：

- 只允许 query / review / dry-run / shadow-only 验证。
- 不写 refund success state。
- 不执行 production workflow。
- 不触发 payment、settlement、commission、payout。

验证：

```bash
cd packages/api
bun test src/modules/china-payment-notification/__tests__/refund-review-query-surface-repository-registration.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-state-mutation-review-query-surface-composition.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-state-mutation-review-query-surface-repository-resolver.unit.spec.ts \
  src/api/admin/china/refund-review-query-surface/__tests__/route.unit.spec.ts
cd ../..
PAYMENT_REFUND_SETTLEMENT_RUNTIME_APPROVED=true ADMIN_LOGIN_VISUAL_QA_CONFIRMED=true ./.codex/scripts/china-launch-readiness-check.sh refund-smoke-local-db --json --output /tmp/fuyi-refund-smoke-local-db-staging.json || true
```

### 3. 经营单位权限 / 平台模块开关

目标：Admin 单位级可见性保存、effective preview、Vendor 菜单过滤、authorize guard、module surface preview 和 PG-first / fallback 配置读取。

候选文件：

```text
packages/api/src/modules/china-platform-ops/**
packages/api/src/lib/china-platform-module-switch-config.ts
packages/api/src/lib/china-platform-module-switch-pg-repository.ts
packages/api/src/lib/china-unit-permission-access-guard.ts
packages/api/src/lib/china-unit-permission-config.ts
packages/api/src/lib/china-unit-permission-pg-repository.ts
packages/api/src/lib/__tests__/china-platform-module-switch-pg-repository.unit.spec.ts
packages/api/src/lib/__tests__/china-unit-permission-access-guard.unit.spec.ts
packages/api/src/lib/__tests__/china-unit-permission-pg-repository.unit.spec.ts
packages/api/src/api/admin/china/module-switches/**
packages/api/src/api/admin/china/unit-permissions/**
packages/api/src/api/china/unit-permissions/**
packages/api/src/api/vendor/china/unit-permissions/**
packages/api/src/api/vendor/china/module-surfaces/**
apps/vendor/src/lib/china-vendor-unit-permissions-client.ts
```

边界：

- 这是菜单可见性、Admin 配置和自定义 Vendor API guard。
- 不是 Mercur / Medusa RBAC enforcement。
- 不改变订单、支付、退款、结算、佣金、打款、履约或物流写路径。

验证：

```bash
cd packages/api
bun test src/lib/__tests__/china-unit-permission-access-guard.unit.spec.ts \
  src/lib/__tests__/china-unit-permission-pg-repository.unit.spec.ts \
  src/lib/__tests__/china-platform-module-switch-pg-repository.unit.spec.ts \
  src/api/admin/china/unit-permissions/__tests__/admin-vendor-propagation.unit.spec.ts \
  src/api/vendor/china/unit-permissions/authorize/__tests__/route.unit.spec.ts \
  src/api/vendor/china/module-surfaces/preview/__tests__/route.unit.spec.ts
cd ../..
ADMIN_LOGIN_VISUAL_QA_CONFIRMED=true ./.codex/scripts/china-launch-readiness-check.sh unit-permission-smoke --json --output /tmp/fuyi-unit-permission-smoke-staging.json || true
```

### 4. 三端 UI / 自用可见范围

目标：只提交已经和后端只读 / preview 边界对齐的 UI，不在这里塞新的业务 runtime。

候选文件：

```text
apps/admin/src/components/ChinaAdminDashboard.tsx
apps/admin/src/components/ChinaAdminOperationsConsole.tsx
apps/admin/src/components/ChinaAdminPageShell.tsx
apps/admin/src/components/china-ops/OperationPrimitives.tsx
apps/admin/src/components/china-ops/operationsData.ts
apps/admin/src/i18n/en.json
apps/admin/src/i18n/zh-CN.json
apps/admin/src/lib/china-admin-dashboard-data.ts
apps/admin/src/lib/china-admin-menu.ts
apps/vendor/src/App.tsx
apps/vendor/src/styles.css
apps/vendor/src/lib/china-vendor-unit-permissions-client.ts
apps/storefront/src/app/[locale]/(main)/page.tsx
apps/storefront/src/components/organisms/Footer/Footer.tsx
apps/storefront/src/data/footerLinks.ts
docs/storefront-china-page-coverage.md
memory/ui-decisions.md
```

边界：

- Admin / Vendor 入口可见性必须和单位权限链路对齐。
- Storefront 只能做展示 / 本地化，不把前端跳转当支付成功。
- 不新增真实订单、支付、退款、结算、履约写路径。

验证：

```bash
cd apps/admin && bun run lint && bun run build
cd ../vendor && bun run lint && bun run build
cd ../storefront && bun run build
```

### 5. 需要单独审查的生成 / 类型文件

候选文件：

```text
packages/api/.mercur/index.d.ts
```

处理方式：

- 不要因为它出现在 worktree 就默认 stage。
- 如果 API route / module typing 需要它，先运行或记录对应 codegen 证据。
- 如果 codegen 重跑无 diff，再随 API 相关 PR 进入；否则单独说明为什么需要更新。

当前处理：

- `packages/api/.mercur/index.d.ts` 已随第 2 组进入 index。
- review 时仍需注意它是 generated type surface；不要把它误判为 refund query surface 业务主逻辑。

### 6. Residual safety / config 收口

目标：收掉 stage 后剩余的 7 个 modified tracked 文件，避免工作树留尾巴。

候选文件：

```text
.codex/scripts/start-dev.sh
packages/api/src/api/china/refund-inbox/alipay/__tests__/route.unit.spec.ts
packages/api/src/api/china/refund-inbox/wechat-pay/__tests__/route.unit.spec.ts
packages/api/src/api/middlewares.ts
packages/api/src/api/vendor/china/market-context/__tests__/helpers.unit.spec.ts
packages/api/src/api/vendor/china/market-context/helpers.ts
packages/api/src/modules/china-market-read-model/repository-market-read-model-adapter.ts
```

边界：

- `start-dev.sh` 只统一开发 API 入口到 `run-api-dev.sh`。
- refund inbox 只补阻断顺序回归测试，不放开 refund success state。
- market context / read-model 只补查询结果 shape 防御。
- `middlewares.ts` 仅格式整理。

验证：

```bash
bash -n .codex/scripts/start-dev.sh
cd packages/api
bun test src/api/china/refund-inbox/alipay/__tests__/route.unit.spec.ts \
  src/api/china/refund-inbox/wechat-pay/__tests__/route.unit.spec.ts \
  src/api/vendor/china/market-context/__tests__/helpers.unit.spec.ts
bun test src/modules/china-market-read-model/__tests__/repository-market-read-model-adapter.unit.spec.ts
```

已验证：

- `bash -n .codex/scripts/start-dev.sh` 通过。
- focused tests：`31/31` 通过。
- read-model adapter tests：`2/2` 通过。
- `bun run check-types` 可执行，但 turbo 当前没有实际 `check-types` task，不能作为类型覆盖证据。

## 最终 readiness 复验

当前 staged 包最终复验命令：

```bash
ADMIN_LOGIN_VISUAL_QA_CONFIRMED=true PREPROD_DISPOSABLE_DB_REHEARSAL_CONFIRMED=true PAYMENT_REFUND_SETTLEMENT_RUNTIME_APPROVED=true ./.codex/scripts/china-launch-readiness-check.sh quick --json --output /tmp/fuyi-staged-final-quick.json || true
ADMIN_LOGIN_VISUAL_QA_CONFIRMED=true PREPROD_DISPOSABLE_DB_REHEARSAL_CONFIRMED=true PAYMENT_REFUND_SETTLEMENT_RUNTIME_APPROVED=true ./.codex/scripts/china-launch-readiness-check.sh full --json --output /tmp/fuyi-staged-final-full.json || true
```

结果：

- quick：`GO-FOR-CHECKED-SCOPE`，`pass=17 warnings=0 noGo=0`
- full：`GO-FOR-CHECKED-SCOPE`，`pass=18 warnings=0 noGo=0`

保留说明：

- Storefront build 仍保留既有 React Hook dependency warnings，未阻断 build。
- Admin build 仍保留 Vite chunk size warning，未阻断 build。
- `PAYMENT_REFUND_SETTLEMENT_RUNTIME_APPROVED=true` 只是 gate confirmation，不代表执行了 production refund / payment / settlement runtime 写路径。

## 最终脚本语法复验

当前 staged 包包含 `29` 个 shell 脚本，已逐个执行 `bash -n`：

```bash
git diff --cached --name-only | grep -E '\.sh$' | tee /tmp/fuyi-staged-shell-scripts.txt
wc -l /tmp/fuyi-staged-shell-scripts.txt
xargs -a /tmp/fuyi-staged-shell-scripts.txt -I{} bash -n {}
```

结果：

- `29 /tmp/fuyi-staged-shell-scripts.txt`
- `STAGED_SHELL_SYNTAX_OK`

## 最终 staged API 单测复验

当前 staged 包包含 `31` 个 API test 文件，已作为一个集合运行：

```bash
git diff --cached --name-only | grep -E '^packages/api/src/.+(__tests__/.+\.spec\.ts|\.unit\.spec\.ts)$' | sort | tee /tmp/fuyi-staged-api-tests.txt
sed 's#^packages/api/##' /tmp/fuyi-staged-api-tests.txt > /tmp/fuyi-staged-api-tests-relative.txt
cd packages/api
xargs bun test < /tmp/fuyi-staged-api-tests-relative.txt
```

结果：

- staged API test files：`31`
- `228 pass`
- `0 fail`
- `738 expect() calls`

## 最终 API 后端构建复验

当前 API 包存在独立构建脚本 `build: medusa build`。当前 WSL 非登录 shell 默认没有加载 `/home/codex/.nvm`，直接 `bun run build` 会让 Bun 代跑 Medusa CLI 并触发 `@cspotcode/source-map-support` / `@jridgewell/trace-mapping` 的堆栈映射异常：

```text
error: `column` must be greater than or equal to 0 (columns start at column 0)
```

按项目 Node 24 规则复跑：

```bash
source /home/codex/.nvm/nvm.sh
cd packages/api
node -v
node node_modules/.bin/medusa build
```

结果：

- `v24.15.0`
- `Types generated successfully`
- `Backend build completed successfully (4.06s)`
- Admin build 在 `medusa-config.ts` 中禁用，符合当前 API build 输出。

## 最终防误伤审查

当前 staged 包已补做防误伤扫描：

```bash
git diff --cached --name-only > /tmp/fuyi-staged-names-final-review.txt
git diff --cached --diff-filter=AM --name-only | grep -v '^packages/api/.mercur/index.d.ts$' > /tmp/fuyi-staged-reviewable-names.txt
git diff --cached --unified=0 -- > /tmp/fuyi-staged-diff-u0-final-review.patch
```

结果：

- staged files：`146`
- reviewable files excluding generated `.mercur` type surface：`145`
- staged private / artifact 路径只包含：
  - `.codex/artifacts/.gitignore`
  - `.codex/private/.gitignore`
  - `project-ledger/artifacts/.gitignore`
  - `project-ledger/private/.gitignore`
- `runtime allow added-lines` 未发现真实放开项：
  - 未发现 `refundSuccessState: true`
  - 未发现 `runtimeMutationBlocked: false`
  - 未发现 `stateMutationBlocked: false`
  - 未发现 `productionExplicitlyEnabled: true`
  - 未发现 `settlementMutationAllowed: true`
  - 未发现 `commissionMutationAllowed: true`
  - 未发现 `payoutMutationAllowed: true`
  - `execute workflow` / `grant RBAC` 命中均为否定边界文案或测试断言
- `real secret shape added-lines` 无命中。
- 最终 `./.codex/scripts/current-worktree-staging-preflight.sh --expect-staged` 仍为 `pass=9 warnings=1 no_go=0`。

## Manifest 覆盖率审查

当前 staged 包已按本 manifest 的分组规则做覆盖率核对，输出文件为 `/tmp/fuyi-staged-manifest-coverage.tsv`。

结果：

- group0 protection：`4`
- group1 readiness / ledger：`30`
- group2 refund query surface：`61`
- group3 unit permissions：`28`
- group4 UI scope：`16`
- group5 residual reviewed：`7`
- unclassified：`0`
- total：`146`

结论：当前 staged 文件均能落到本清单的既定分组，没有清单外 staged 文件。

## 最小 pre-stage 检查

在任何一组 `git add -- <files>` 前先跑：

```bash
git diff --check
git status --short --ignored .codex/private .codex/artifacts project-ledger/private project-ledger/artifacts
git diff --name-only
git ls-files --others --exclude-standard
```

在 staging 后必须跑：

```bash
./.codex/scripts/current-worktree-staging-preflight.sh
git diff --cached --name-only
git diff --cached --check
```

检查 staged 文件不得包含：

- private env。
- artifact screenshot / summary。
- `/tmp/fuyi-*` 证据。
- production DB URL。
- 真实 app id、secret、merchant id、private key、webhook token。
- payment success / refund success / settlement / commission / payout / fulfillment / logistics production write path。
