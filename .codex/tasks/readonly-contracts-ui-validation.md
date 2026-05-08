# readonly-contracts-ui-validation

## 目标

验证第九十五轮只读合同 UI PR 合并后的三端构建状态：

- Admin 平台能力只读总览
- Vendor 我的能力边界
- Storefront 消费者侧展示文案 polish

## 范围

允许修改：

- `docs/readonly-contracts-ui-validation.md`
- `.codex/queue.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`
- `project-ledger/changelog.md`

禁止修改：

- `apps/**`
- `packages/**`
- `package.json`
- `bun.lock`
- `.env`
- 真实密钥

## 验证命令

```bash
cd apps/admin && bun run lint && bun run build
cd apps/vendor && bun run lint && bun run build
cd apps/storefront && bun run build
git diff --check
```

## 验收标准

- Admin lint/build 通过。
- Vendor lint/build 通过。
- Storefront build 通过。
- 仅允许记录既有 React Hook lint warning，不在本任务修复。
- 不产生业务代码 diff。
- 不修改 checkout、cart、order、payment、refund、settlement、commission、payout、permission 或 fulfillment runtime。

## 提交规则

- 本任务可在验证通过后提交、推送并创建 PR。
- PR 只应包含任务文件、验证报告和 ledger/queue 状态更新。
