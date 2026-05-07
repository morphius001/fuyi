# mock-webhook-handler-composition-plan

## 目标

规划未来 mock payment webhook inbox-only handler 的组合顺序，把已经存在的纯函数合同串成一个明确的设计，不写 handler 代码。

本任务只写文档和 ledger，不新增 route，不接 runtime，不写 DB，不调用 payment workflow。

## 允许修改

- `.codex/tasks/mock-webhook-handler-composition-plan.md`
- `docs/mock-webhook-handler-composition-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/**`
- `package.json`
- `bun.lock`
- `.env` 或真实密钥

## 必须覆盖

- handler 的输入来源：raw body、headers、env config、receivedAt。
- 默认 disabled 的 runtime gate。
- request contract：raw body/header/secret 到 normalizer input。
- normalizer：payload parse、mock signature verify、envelope。
- inbox repository：receive、duplicate replay、event log。
- state guard：只产出允许/阻断结论。
- command mapper：只准备 DTO，不执行 workflow。
- response mapper：disabled、accepted、duplicate、rejected。
- 错误码和 retry 语义。
- 安全 metadata，禁止回包或日志暴露 raw payload、secret、完整签名。
- 后续 PR 拆分。

## 禁止实现

- 不新增 API route。
- 不新增 handler 函数。
- 不注册 module 或 migration。
- 不连接数据库。
- 不执行 workflow command。
- 不接支付宝、微信支付或任何真实支付 Provider。

## 验证命令

```bash
git diff --check
git diff --name-only
git grep -n -e 'china-payment-notification' -- packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links || true
```

## 完成后

如果用户已允许 push/PR，可在 diff 范围安全后提交、push 并创建 PR。
