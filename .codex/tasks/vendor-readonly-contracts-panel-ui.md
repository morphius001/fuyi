# vendor-readonly-contracts-panel-ui

## 目标

在 `apps/vendor` 增加“我的能力边界”只读面板，让商户理解当前角色、市场、档口、快速上架、店铺装修、履约/面单、提货卡和直播能力边界。

## 允许修改

- `apps/vendor/**`
- `.codex/tasks/vendor-readonly-contracts-panel-ui.md`
- `.codex/queue.md`
- `docs/vendor-readonly-contracts-panel-ui.md`
- `project-ledger/**`

## 禁止修改

- `packages/api/**`
- `apps/admin/**`
- `apps/storefront/**`
- 支付、订单、退款、结算、佣金、打款、权限、checkout、真实履约或真实 Provider runtime
- 真实保存、发布商品、初始化库存、确认发货、生成运单号、打印面单、开直播、兑换提货卡或提交结算
- 新依赖、真实密钥、真实商户号

## UI 要求

- 菜单位置：市场经营 / 我的能力边界。
- 页面必须明确“只读/未生效/待平台开通”。
- 商户可以看到当前角色、所属市场、档口号、消费者默认可见性和需要平台开通的事项。
- 快速上架和 AI 只能表达草稿边界。
- 店铺装修只表达公开快照和发布未接入。
- 履约与面单不生成真实发货或运单。
- 提货卡不展示卡密、不执行兑换、不创建支付或普通订单。
- 直播不接真实推流、IM、礼物、交易、支付或结算。

## 验证

- `cd apps/vendor && bun run lint`
- `cd apps/vendor && bun run build`
- `git diff --check`
- 后续可在 Vendor 本地页面点击“我的能力边界”做视觉 smoke。
