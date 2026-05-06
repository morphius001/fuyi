# vendor-market-context-visual-qa

## 目标

四个 Vendor 页面做 API 状态视觉 QA。

## 允许修改

- `docs/vendor-market-context-visual-qa.md`
- `.codex/tasks/vendor-market-context-visual-qa.md`
- `.codex/queue.md`

## 禁止修改

- `apps/**`
- `packages/**`
- `package.json`
- `bun.lock`
- `.env*`
- 支付、订单、退款、结算、佣金、权限、真实履约逻辑
- 真实短信、IM、物流、直播、AI、支付 provider

## 必须覆盖

- API 可用状态
- API 返回空上下文状态
- API 不可用 / 未登录 / 网络失败 fallback 状态
- 首页、店铺资料页、物流页、客服页
- 截图未执行时必须明确说明原因

## 验证命令

```bash
cd apps/vendor && bun run lint
cd apps/vendor && bun run build
git diff --check
```

## 完成边界

- 本任务默认只做 QA 文档。
- 不为了 QA 修改 UI。
- 不伪造已登录截图结果。
