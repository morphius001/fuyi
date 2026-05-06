# vendor-market-context-post-merge-validation

## 目标

对 PR AL-AP 合并后的 Vendor 市场上下文只读接入做总验证报告。

范围包括：

- Vendor market context client
- Vendor 首页市场上下文摘要
- Vendor 店铺资料市场归属只读块
- Vendor 物流页 delivery profiles 只读区
- Vendor 客服页市场公告只读区

## 允许修改

- `docs/vendor-market-context-post-merge-validation.md`
- `.codex/tasks/vendor-market-context-post-merge-validation.md`
- `.codex/queue.md`

## 禁止修改

- `apps/**`
- `packages/**`
- `package.json`
- `bun.lock`
- `.env*`
- 真实密钥和真实 provider 配置

## 验证命令

```bash
cd apps/vendor && bun run lint
cd apps/vendor && bun run build
git diff --check
```

## 完成后

- 记录验证结果。
- 记录 fallback 和只读边界。
- 记录高风险边界是否被触碰。
- 记录下一步建议。
