# Template System Validation

更新时间：2026-05-08 Asia/Shanghai

## 目标

验证第九十六轮 UI 模板系统工作合并后的主线状态。

覆盖 PR：

- `ui-template-system-plan`
- `storefront-template-contract-plan`
- `admin-template-contract-plan`
- `vendor-template-contract-plan`
- `template-registry-readonly-contract`

## 已执行验证

```bash
cd packages/api
bun run test:unit -- template-registry-readonly-contract.unit.spec.ts

cd ../..
./node_modules/.bin/tsc --noEmit -p packages/api/tsconfig.json

cd apps/admin
bun run lint

cd ../vendor
bun run lint

cd ../..
git diff --check
```

## 结果

- Template registry focused unit test：1 suite / 4 tests passed。
- API typecheck：通过。
- Admin lint：通过。
- Vendor lint：通过。
- `git diff --check`：通过。

备注：API typecheck 可能触发 `packages/api/.mercur/index.d.ts` generated diff，本验证已恢复该文件，未纳入 PR。

## 风险边界

本验证任务未修改：

- `apps/**`
- `packages/**`
- `package.json`
- `bun.lock`
- `.env`
- checkout、cart、order、payment、refund、settlement、commission、payout、permission 或 fulfillment runtime

## 结论

第九十六轮模板系统已完成主线收口：

- 三端模板系统规划已固化。
- Storefront / Admin / Vendor 模板合同已分别固化。
- Template registry 只读 TypeScript contract 已合并，并通过 focused unit test 和 API typecheck。

下一批建议可以继续做模板 view shape 细分，或进入 Storefront 首页 v2 / 店铺页 v2 的小范围可回滚模板实现。实现前仍应先定义模板 id、读取的 view model、隐藏的 B 端能力和不触碰的高风险链路。
