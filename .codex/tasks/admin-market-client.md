# admin-market-client

## 目标

为 `apps/admin` 新增中国市场只读 API client，供后续后台“市场配置 / 市场详情”页面读取 `/admin/china/markets*`。

本任务只做数据层封装，不改页面、不改菜单、不改权限、不保存配置。

## 允许修改

- `apps/admin/src/lib/**`
- `.codex/tasks/admin-market-client.md`
- `.codex/queue.md`

## 禁止修改

- `packages/api/**`
- `apps/storefront/**`
- `apps/vendor/**`
- Admin 页面、菜单、路由和认证逻辑
- 支付、订单、退款、结算、佣金、权限、履约和真实配送逻辑

## 实现要求

- 复用 Admin 现有 `apps/admin/src/lib/client.ts`。
- 读取：
  - `GET /admin/china/markets`
  - `GET /admin/china/markets/:id`
- 返回只读 view model。
- API 不可用时提供空 fallback，避免后续页面白屏。
- fallback 必须明确标记 read-only，不允许触发保存或运行时生效。
- 不新增依赖，不写真实密钥，不写生产域名。

## 验证命令

```bash
cd apps/admin && bun run lint
cd apps/admin && bun run build
git diff --check
```

## 非目标

- 不实现市场保存。
- 不实现商户市场绑定编辑。
- 不实现公告发布。
- 不实现配送规则生效。
- 不影响 checkout、订单、支付、退款、结算、佣金、权限或履约。

## 完成后

- 记录修改文件。
- 记录验证结果。
- 说明风险和下一步。
- 不自动 commit、push 或创建 PR，除非用户当前指令明确允许。
