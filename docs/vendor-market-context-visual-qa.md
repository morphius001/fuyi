# Vendor Market Context Visual QA

更新时间：2026-05-07 Asia/Shanghai

## 范围

本轮对 Vendor 市场上下文接入后的四个页面做视觉 QA 清单和自动构建验证：

- 首页：市场 / 档口 / 公告 / 配送摘要
- 店铺资料页：市场归属只读块
- 物流页：delivery profiles 只读区
- 客服页：商户侧市场公告只读区

本轮不修改 `apps/vendor` UI 代码，只记录 QA 结果和后续人工验收清单。

## 自动验证结果

验证 worktree：

```text
/home/codex/code/fuyi-pr-av-vendor-market-visual-qa-cn
```

通过项：

```bash
cd apps/vendor && bun run lint
cd apps/vendor && bun run build
git diff --check
```

Vendor build 输出摘要：

```text
33 modules transformed
dist/assets/index-DiFLjgzx.js 221.12 kB gzip 73.83 kB
built in 601ms
```

## 三态验收清单

### API 可用

预期：

- 首页显示 `Vendor 市场上下文已读取`。
- 首页市场摘要展示主市场、档口号、多市场经营、配送展示能力、模块开通提示。
- 店铺资料页展示市场归属，不出现保存、编辑或提交按钮。
- 物流页展示 delivery profile，并明确 `checkoutImpact: none`、`runtimeEnabled: false`。
- 客服页展示商户侧市场公告，不提供发布、推送短信、IM 或站内信入口。

必须确认：

- 商户端不显示其它商户的档口、公告或配送信息。
- `market_id` 只改变当前 seller 上下文过滤，不影响订单、库存、发货或结算。
- 页面提示不暗示配送规则已经在 checkout 生效。

### API 返回空上下文

预期：

- 首页、店铺资料、物流、客服页继续可用。
- 文案说明暂无市场上下文或暂无市场归属。
- 不出现错误崩溃、空白屏或无限 loading。
- 现有静态 mock 表格继续作为工作台兜底展示。

必须确认：

- 空状态不诱导商户自行编辑市场归属、档口号或商户类型。
- 空状态不影响快速上架、店铺装修、客服、物流 mock 页面基本浏览。

### API 不可用 / 未登录 / 网络失败

预期：

- Client 返回 `vendor_market_context_fallback`。
- 页面显示只读 fallback，不阻断商户后台。
- 错误 note 只作为展示说明，不暴露密钥、token、内部堆栈或数据库信息。

必须确认：

- 未登录状态由上游 Vendor auth 处理，不在本页绕过登录。
- fallback 不改变 checkout、订单、支付、退款、结算、佣金、权限或真实履约。

## 页面逐项检查

| 页面 | 检查点 | 结果 |
| --- | --- | --- |
| Vendor 首页 | 市场上下文区不挤压快速上架和 AI 草稿入口 | 待已登录浏览器确认 |
| Vendor 首页 | 多市场、档口、公告、配送能力都是只读语义 | 待已登录浏览器确认 |
| 店铺资料页 | 市场归属只读块不出现保存动作 | 待已登录浏览器确认 |
| 物流页 | delivery profiles 不被误解为真实发货规则 | 待已登录浏览器确认 |
| 客服页 | 市场公告不提供发布和推送动作 | 待已登录浏览器确认 |

## 未执行截图说明

本 PR 是 QA 文档 PR，没有启动已登录 Vendor 浏览器会话。由于 Vendor 页面需要登录态，自动 headless 截图容易落到登录页而不是目标页面。

后续如果要做截图验收，应在本地确认：

```text
Backend API: http://127.0.0.1:9000
Vendor Panel: http://127.0.0.1:7001
目标页面：首页、店铺资料、物流管理、客服管理
```

并使用已登录 Vendor 会话分别截图 API 可用、empty context、fallback 三态。

## 安全边界复核

本轮未修改：

- `apps/vendor/**`
- `packages/api/**`
- `apps/admin/**`
- `apps/storefront/**`
- `package.json`
- `bun.lock`
- `.env*`
- 支付、订单、退款、结算、佣金、权限、真实履约逻辑
- 真实短信、IM、物流、直播、AI、支付 provider

## 下一步建议

第二十八轮建议：

1. `vendor-market-context-post-api-validation`：对 PR AS-AU 合并后的 API + Vendor 总验证。
2. `vendor-market-context-authenticated-browser-qa`：在用户已登录 Vendor 后做真实浏览器截图 QA。
3. `vendor-market-context-next-data-plan`：规划从 static adapter 过渡到真实 market membership 数据源。
