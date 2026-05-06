# Task: storefront-real-discovery-bridge

## 目标

规划 Storefront 首页、搜索页、店铺页从 mock/read-only 数据继续过渡到真实市场/商户/商品发现数据的桥接方案。本任务优先写设计和拆 PR，不直接重做 UI。

核心目标：

- 让消费者先找市场/店铺，再看今日鲜货和商品。
- 首页、搜索、店铺主页都应逐步读取真实市场、商户、类目和商品数据。
- 提货卡继续保持独立入口，不塞进首页主信息流。
- 直播只在店铺/档口或单位状态中轻量标记，不作为首页主模块。
- 物料采购、配送供应商、自提配送设置属于商户/后台能力，不放到消费者首页前排。

## 允许修改

- `docs/storefront-real-discovery-bridge.md`
- `docs/storefront-location-plan.md`
- `docs/storefront-zhcn-baseline.md`
- `project-ledger/**`
- `.codex/queue.md`

## 禁止修改

- 禁止修改 `apps/**`
- 禁止修改 `packages/**`
- 禁止新增依赖
- 禁止修改 checkout、cart total、shipping options、payment、order、refund、settlement、commission、permission 逻辑
- 禁止接入真实客服、直播、物流、支付或 AI 服务

## 要求

- 先读取 `AGENTS.md`、`.codex/queue.md`、`project-ledger/status.md`、`docs/post-merge-validation-report.md`、`docs/china-ux-spec.md`、`docs/storefront-location-plan.md`。
- 输出 Storefront 数据桥接阶段图：
  - 当前 mock/read-only 状态
  - 下一步真实 discovery API
  - 商品/商户/市场关系
  - 首页、搜索、店铺页的读模型
- 明确哪些 UI 模板后续可随意替换，哪些数据合同不能乱改。

## 验证

```bash
git diff --check -- docs/storefront-real-discovery-bridge.md docs/storefront-location-plan.md docs/storefront-zhcn-baseline.md project-ledger .codex/queue.md
git diff --name-status
```

## 输出

- 修改文件
- 验证结果
- 风险点
- 下一步建议
