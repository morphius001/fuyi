# vendor-market-context-authenticated-browser-qa

## 目标

在用户已登录 Vendor 后做真实浏览器截图 QA。

## 当前状态

`blocked-manual`

主 agent 不能伪造登录态截图；没有已登录 Vendor session 时，只能生成执行说明和验收清单。

## 允许修改

- `docs/vendor-market-context-authenticated-browser-qa.md`
- `.codex/tasks/vendor-market-context-authenticated-browser-qa.md`
- `.codex/queue.md`
- 后续真正执行截图时可写入 `docs/visual-qa-artifacts/**`

## 禁止修改

- `apps/**`
- `packages/**`
- `package.json`
- `bun.lock`
- `.env*`
- 支付、订单、退款、结算、佣金、权限、真实履约逻辑
- 真实短信、IM、物流、直播、AI、支付 provider

## 验证要求

```bash
git diff --check
```

真正截图 QA 时还需要：

- Vendor 首页截图
- 店铺资料页截图
- 物流管理页截图
- 客服管理页截图
- API ready / empty / fallback 三态说明
