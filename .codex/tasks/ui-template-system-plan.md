# ui-template-system-plan

## 目标

规划中国本地化三端 UI 模板系统，让 Storefront、Admin、Vendor 后续可以更换版式和主题，但不破坏已经固化的只读数据合同、交易链路和高风险边界。

## 背景

当前三端已经有一批中国本地化展示壳、只读合同和能力边界页面。用户确认：

- 界面后续可以继续做模板。
- 前端、后端、商户端模板都可以替换。
- 真正关键是数据跑通、合同稳定、上线时知道在哪里改。

## 允许修改

- `docs/ui-template-system-plan.md`
- `.codex/queue.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`
- `project-ledger/changelog.md`

## 禁止修改

- `apps/**`
- `packages/**`
- `package.json`
- `bun.lock`
- `.env`
- 真实密钥
- checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment runtime

## 输出要求

文档必须说明：

- 三端模板的边界：Storefront 消费者模板、Admin 运营后台模板、Vendor 商户后台模板。
- 模板只消费稳定 view model，不直接改业务模型。
- 市场、商户、档口、商品、提货卡、直播、配送和物料供应商在模板层的展示边界。
- 哪些能力可以模板化，哪些能力必须走串行高风险任务。
- 后续 PR 拆分和验证顺序。

## 验证

```bash
git diff --check
git diff --name-only
```

验收时确认没有 `apps/**` 或 `packages/**` 修改。

## 提交规则

- 本任务可在验证通过后提交、推送并创建 PR。
- 不创建真实模板运行时，不新增依赖，不修改业务代码。
