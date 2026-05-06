# PR H Staging Commands: API Config Template And Seed Safety

日期：2026-05-05

本文档只列出 PR H 的显式 staging 命令。当前未执行 `git add`、未 commit、未 push。PR H 是 API 配置模板、seed 和 release boundary 审计批次，属于中风险 PR，必须单独 review。

## 原则

- 不使用 `git add .`。
- 不加入 `apps/**` UI 文件。
- 不加入 `packages/api/src/modules/china-service-providers/**`；Mock Provider skeleton 属于 PR G。
- 不写入真实 app id、merchant id、token、access key、secret、private key、证书或生产数据库地址。
- 不修改 payment、order、refund、payout、commission、permission 业务逻辑。
- 如果 staged diff 出现 provider 运行时注册、webhook route 或真实服务配置，必须单独说明开关、回滚和验证。

## 预检命令

```bash
git status --short -- \
  packages/api/.env.template \
  packages/api/medusa-config.ts \
  packages/api/src/scripts/seed.ts \
  docs/integration-config-and-release-boundary-audit.md \
  docs/integration-pr-h-api-config-preflight.md

git diff --check -- \
  packages/api/.env.template \
  packages/api/medusa-config.ts \
  packages/api/src/scripts/seed.ts \
  docs/integration-config-and-release-boundary-audit.md \
  docs/integration-pr-h-api-config-preflight.md

bunx tsc --noEmit --project packages/api/tsconfig.json
grep -R -n "PRODUCTION_CREDENTIAL_PLACEHOLDER" packages/api .env* || true
.codex/scripts/start-dev.sh status
```

## 推荐 PR H staging

```bash
git add -- packages/api/.env.template
git add -- packages/api/medusa-config.ts
git add -- packages/api/src/scripts/seed.ts
git add -- docs/integration-config-and-release-boundary-audit.md
git add -- docs/integration-pr-h-api-config-preflight.md
git add -- docs/integration-pr-h-api-config-staging-commands.md
```

## 明确排除

```bash
git restore --staged -- AGENTS.md 2>/dev/null || true
git restore --staged -- .codex 2>/dev/null || true
git restore --staged -- apps 2>/dev/null || true
git restore --staged -- packages/api/src/modules/china-service-providers 2>/dev/null || true
git restore --staged -- packages/api/.env 2>/dev/null || true
git restore --staged -- packages/api/.env.local 2>/dev/null || true
git restore --staged -- packages/api/src/api 2>/dev/null || true
git restore --staged -- packages/api/src/workflows 2>/dev/null || true
git restore --staged -- packages/api/src/subscribers 2>/dev/null || true
git restore --staged -- packages/api/src/jobs 2>/dev/null || true
git restore --staged -- packages/api/src/links 2>/dev/null || true
git restore --staged -- .mercur 2>/dev/null || true
```

说明：

- 以上命令只取消 staging，不改工作区内容。
- `.env.template` 只能保留模板和 mock/dev 占位，不能出现真实商户号、密钥、证书路径或生产域名。
- `supersecret`、localhost、mock callback 等开发占位必须在 PR 描述和 release gate 中明确，不可直接上线。

## staged 后检查

```bash
git diff --cached --name-status
git diff --cached --check
git diff --cached --name-only | grep -E '^(AGENTS\\.md|\\.codex/|apps/|\\.mercur/|packages/api/(\\.env|\\.env\\.local|src/(modules/china-service-providers|api|workflows|subscribers|jobs|links)/))' && exit 1 || true
git diff --cached --name-only | grep -E 'payment|order|refund|payout|commission|permission' && exit 1 || true
git diff --cached | grep -E 'PRODUCTION_CREDENTIAL_PLACEHOLDER|BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY' && exit 1 || true
git diff --cached | grep -E 'supersecret|localhost|127\\.0\\.0\\.1|mock' || true
```

预期 staged 文件只应属于：

```text
packages/api/.env.template
packages/api/medusa-config.ts
packages/api/src/scripts/seed.ts
docs/integration-config-and-release-boundary-audit.md
docs/integration-pr-h-api-config-preflight.md
docs/integration-pr-h-api-config-staging-commands.md
```

## commit 说明建议

如果用户明确要求 commit，建议提交信息：

```text
chore(api): document China config placeholders and seed safety
```

不要自动 commit；只有用户明确说“提交 PR H”或“commit PR H”时才执行。
