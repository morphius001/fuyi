# Storefront 搜索页 View Model Adapter 计划

更新时间：2026-05-08 Asia/Shanghai

## 目标

下一步搜索页真正绑定 mapper 前，应先新增一个 Storefront 侧 adapter。这个 adapter 只负责把搜索参数、discovery、products、market context 和 static fallback 整理成 `buildChinaStorefrontSearchView()` 的输入，不改页面布局。

本计划只写边界，不新增代码。

## 建议文件位置

后续实现 PR 可考虑：

```text
apps/storefront/src/app/[locale]/(main)/data/china-search-view-model.ts
apps/storefront/src/app/[locale]/(main)/data/__tests__/china-search-view-model.test.ts
```

如果当前 Storefront 没有前端单测基础，可以先放纯函数并用 build + HTTP smoke 验证，避免引入新依赖。

## Adapter 输入

### Query Input

来源：

- URL search params
- 首页搜索框
- 类目 / 市场入口传入的关键词

用途：

- 传给 mapper 的 `query`
- 生成 `normalizedQuery`
- 空结果提示

失败策略：

- 空 query 不触发错误。
- 空 query 可以返回默认消费者找货结果，仍过滤 B-side 内容。

### Discovery Input

来源：

- `/store/china/discovery`

用途：

- 匹配类目
- 匹配店铺 / 档口
- market context

失败策略：

- discovery 失败时返回 static fallback discovery 或空结果 view。
- 不向消费者展示 API / fallback / mock 文案。

### Product Input

来源：

- `/store/products`
- 后续 search API / discovery bridge

用途：

- 匹配商品卡

限制：

- 商品卡只展示规格、价格、库存提示。
- 不占库存。
- 不创建 cart。
- 不创建 order。
- 不决定 shipping option。

### Market Context

来源：

- URL search params
- market switch
- discovery markets

用途：

- 搜索过滤和展示提示。

限制：

- 不写配送规则。
- 不写 checkout shipping options。
- 不写履约、物流或面单。

### Static Fallback

来源：

- 当前搜索页静态展示数据。

用途：

- discovery / products 不可用时保持页面可读。
- 空搜索、无结果时给消费者提示。

限制：

- 不把静态数据当生产商品、生产库存或生产价格。

## Adapter 输出

输出应直接是：

```ts
ChinaStorefrontSearchView
```

并保持：

- `templateId = storefront-search-market-results-v1`
- `readOnly = true`
- `runtimeEnabled = false`
- `canWriteBusinessState = false`
- `locale = zh-CN`
- `currency = CNY`
- `timezone = Asia/Shanghai`

## 合成顺序

建议顺序：

1. 从 URL 读取 query、marketName、category 等展示参数。
2. 读取 discovery。
3. 读取 Store API products 或搜索结果 products。
4. 标准化 product card 展示字段。
5. 过滤 B-side supplier / procurement / upstream 内容。
6. 调用 search mapper。
7. 如果 discovery / products 均不可用，传入 static fallback。
8. 返回 view model 给页面。

## 特殊场景

### 空 Query

建议：

- 允许返回默认找货结果。
- 保留市场、类目、店铺和商品分组。
- 不展示 B-side 供应商主路径。

### 无结果

建议：

- 返回空 result groups。
- 显示“没有找到匹配内容，可以换个关键词或切换市场。”
- 不自动发起询价、补货、客服或订单。

### Market Context 缺失

建议：

- 保留 query。
- marketContext 标记 fallback。
- 不影响配送、库存或交易事实。

### B-side 内容

默认过滤：

- 物料供应商
- 配送供应商
- 上游供给
- 种苗批发
- 外地批发商

真实上线前应补结构化 `audience` / `business_type`，不要长期依赖关键词。

## 错误处理

adapter 不应让搜索页整体崩溃。

建议策略：

- discovery 失败：返回空或 fallback discovery。
- products 失败：返回空 products。
- query 解析失败：当作空 query。

消费者文案：

- 可以写“没有找到匹配内容，可以换个关键词或切换市场。”
- 不写“API 失败”。
- 不写“fallback”。
- 不写“mock”。

## 测试建议

若不引入新依赖，先做：

- 纯函数输入输出单测，如果现有 Storefront test runner 可用。
- 否则在实现 PR 中跑 `cd apps/storefront && bun run build`。
- 页面绑定 PR 再补浏览器截图。

核心测试场景：

- query + discovery + products 成功。
- 空 query。
- 无结果。
- market context 缺失。
- B-side 内容过滤。

## 禁止事项

adapter PR 不允许：

- 改搜索页布局。
- 接真实排序 / 广告 / 竞价 / 推荐系统。
- 改购物车。
- 改结算。
- 改订单。
- 改支付。
- 改退款。
- 改结算、佣金、打款。
- 改权限。
- 改履约、物流、面单。
- 接真实 Provider。

## 验收

实现 PR 最低验收：

- `cd apps/storefront && bun run build`
- `git diff --check`
- `/cn/search` 页面仍可打开。
- 空 query 和无结果可读。
- 搜索结果不出现 B-side 供应商主路径。

## 回滚

adapter 实现必须保留旧静态搜索数据分支。若线上 discovery 或 products 数据异常，可以快速切回静态 fallback，不影响 cart、checkout、order 或 payment。
