# PR G Staging Commands: Mock China Service Providers

日期：2026-05-05

本文档只列出 PR G 的显式 staging 命令。当前未执行 `git add`、未 commit、未 push。PR G 是 Mock Chat/SMS/Logistics/Live/AI Provider skeleton 批次，只提交 provider 边界、类型、mock 实现、单测和设计文档，不注册运行时，不接真实服务。

## 原则

- 不使用 `git add .`。
- 不加入 `apps/**` UI 文件。
- 不加入 `packages/api/medusa-config.ts`，除非后续独立任务明确允许运行时注册。
- 不加入 `.env`、真实应用编号、商户号、访问密钥、服务密钥、私钥、证书或生产凭证。
- 不接真实腾讯 IM、环信、阿里云短信、腾讯短信、快递100、菜鸟、直播或 AI 服务。
- 不修改 payment、order、refund、payout、commission、permission 业务逻辑。

## 预检命令

```bash
git status --short -- \
  packages/api/src/modules/china-service-providers \
  docs/mock-service-providers.md \
  docs/integration-pr-g-mock-provider-preflight.md

git diff --check -- \
  packages/api/src/modules/china-service-providers \
  docs/mock-service-providers.md \
  docs/integration-pr-g-mock-provider-preflight.md

bunx tsc --noEmit --project packages/api/tsconfig.json
PATH=/home/codex/.nvm/versions/node/v24.15.0/bin:/home/codex/.bun/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
  npm run test:unit -- src/modules/china-service-providers/__tests__/mock-service-providers.unit.spec.ts

grep -R -n "china-service-providers" packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links || true
.codex/scripts/start-dev.sh status
```

## 推荐 PR G staging

```bash
git add -- packages/api/src/modules/china-service-providers
git add -- docs/mock-service-providers.md
git add -- docs/integration-pr-g-mock-provider-preflight.md
git add -- docs/integration-pr-g-mock-provider-staging-commands.md
```

## 明确排除

```bash
git restore --staged -- AGENTS.md 2>/dev/null || true
git restore --staged -- .codex 2>/dev/null || true
git restore --staged -- apps 2>/dev/null || true
git restore --staged -- packages/api/medusa-config.ts 2>/dev/null || true
git restore --staged -- packages/api/.env 2>/dev/null || true
git restore --staged -- packages/api/.env.local 2>/dev/null || true
git restore --staged -- packages/api/.env.template 2>/dev/null || true
git restore --staged -- packages/api/src/api 2>/dev/null || true
git restore --staged -- packages/api/src/workflows 2>/dev/null || true
git restore --staged -- packages/api/src/subscribers 2>/dev/null || true
git restore --staged -- packages/api/src/jobs 2>/dev/null || true
git restore --staged -- packages/api/src/links 2>/dev/null || true
git restore --staged -- .mercur 2>/dev/null || true
```

说明：

- 以上命令只取消 staging，不改工作区内容。
- PR G 只能是 skeleton 和测试；一旦出现运行时注册、webhook route 或真实 provider 配置，就拆到后续 PR。

## staged 后检查

```bash
git diff --cached --name-status
git diff --cached --check
git diff --cached --name-only | grep -E '^(AGENTS\\.md|\\.codex/|apps/|\\.mercur/|packages/api/(medusa-config\\.ts|\\.env|\\.env\\.local|\\.env\\.template|src/(api|workflows|subscribers|jobs|links)/))' && exit 1 || true
git diff --cached --name-only | grep -E 'payment|order|refund|payout|commission|permission' && exit 1 || true
git diff --cached | grep -E 'PRODUCTION_CREDENTIAL_PLACEHOLDER' && exit 1 || true
```

预期 staged 文件只应属于：

```text
packages/api/src/modules/china-service-providers/**
docs/mock-service-providers.md
docs/integration-pr-g-mock-provider-preflight.md
docs/integration-pr-g-mock-provider-staging-commands.md
```

## commit 说明建议

如果用户明确要求 commit，建议提交信息：

```text
feat(api): add mock China service provider skeletons
```

不要自动 commit；只有用户明确说“提交 PR G”或“commit PR G”时才执行。
