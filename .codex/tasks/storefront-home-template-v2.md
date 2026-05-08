# storefront-home-template-v2

## 目标

按 `storefront-home-template-v2-plan` 落地消费者首页 v2 的第一版可视化模板，让首页从“堆模块”收口为“选市场、找档口、看今日鲜货”的本地生鲜/海鲜消费路径。

## 允许修改

- `apps/storefront/src/app/[locale]/(main)/page.tsx`
- `docs/storefront-home-template-v2.md`
- `.codex/queue.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`
- `project-ledger/changelog.md`

## 禁止修改

- `packages/api/**`
- `apps/admin/**`
- `apps/vendor/**`
- `package.json`
- `bun.lock`
- `.env`
- 真实密钥
- checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment runtime

## 实现要求

- 桌面端第一屏保留市场类目、市场主视觉、登录/入驻辅助区。
- 桌面端下方突出推荐档口和今日上新，减少重复搜索、重复类目标题和解释性文案。
- 移动端改成短首页：市场头部、搜索、横滑类目、推荐档口、今日鲜货。
- 消费者首页不放物料供应商、配送供应商、养殖户/种植户、种苗供应商和外地批发商入口。
- 提货卡继续保持独立入口，不进入首页主业务流。
- 直播最多作为店铺状态，当前不接真实直播。
- 配送/自提能力归属档口或结算确认，不在商品卡上写成强制能力。

## 验证

```bash
cd apps/storefront && bun run build
cd apps/storefront && bun run lint
git diff --check
curl -s -o /tmp/fuyi-home.html -w "%{http_code}\n" http://127.0.0.1:3101/cn
```

还需要保存桌面和移动端截图到 `docs/visual-qa-artifacts/`，但截图产物不纳入提交。

## 提交规则

验证通过后可以提交、推送并创建 PR。PR 必须说明本轮未改交易链路和高风险业务逻辑。
