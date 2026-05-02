# China Localization Worktree Plan

Use worktrees to isolate independent China localization work. Keep branches small and reviewable. Worktree directories below are suggestions; adjust only if the local Codex App workspace convention requires a different parent directory.

## Baseline

Before creating worktrees:

```bash
git status --short --branch
source ~/.nvm/nvm.sh && nvm use
bun --version
bun install
bun run check-types
bun run lint
```

If Bun is unavailable, install or expose Bun 1.3.13 in MyCustomWSL before running project scripts.

## Planned Worktrees

| Branch | Suggested directory | Scope | Parallel-safe |
| --- | --- | --- | --- |
| `china/storefront-ux` | `../fuyi-worktrees/storefront-ux` | Storefront zh-CN UX audit and later low-risk UI localization | Yes, after storefront location is confirmed |
| `china/admin-panel` | `../fuyi-worktrees/admin-panel` | Admin Panel menu, IA, copy, and operator UX | Yes |
| `china/seller-panel` | `../fuyi-worktrees/seller-panel` | Seller Panel menu, IA, copy, and merchant UX | Yes |
| `china/address` | `../fuyi-worktrees/address` | China address model/form audit and later implementation | Yes, with backend model changes reviewed carefully |
| `china/chat-provider` | `../fuyi-worktrees/chat-provider` | Mock ChatProvider and adapter boundary | Yes |
| `china/payment-mock` | `../fuyi-worktrees/payment-mock` | Mock China PaymentProvider and notification design | No for high-risk follow-ups; keep serial once state changes begin |

## Creation Commands

```bash
mkdir -p ../fuyi-worktrees
git worktree add ../fuyi-worktrees/storefront-ux -b china/storefront-ux
git worktree add ../fuyi-worktrees/admin-panel -b china/admin-panel
git worktree add ../fuyi-worktrees/seller-panel -b china/seller-panel
git worktree add ../fuyi-worktrees/address -b china/address
git worktree add ../fuyi-worktrees/chat-provider -b china/chat-provider
git worktree add ../fuyi-worktrees/payment-mock -b china/payment-mock
```

Create branches from a clean and up-to-date base. If a branch already exists, use `git worktree add <dir> <branch>` instead of `-b`.

## Parallelization Rules

Parallel-friendly:

- Copy and menu localization audits
- UI information architecture proposals
- Address form audit
- Mock chat adapter boundary design
- Documentation-only planning updates

Serial or tightly coordinated:

- Payment state transitions
- Payment notification persistence
- Refunds
- Reconciliation
- Merchant settlement
- Payouts
- Commission calculation
- Permission/RBAC behavior
- Shared data model migrations

## Merge Order

Suggested low-risk merge order:

1. `china/admin-panel`
2. `china/seller-panel`
3. `china/storefront-ux`
4. `china/address`
5. `china/chat-provider`

Suggested high-risk serial order:

1. `china/payment-mock`
2. Payment notification idempotency framework
3. Alipay Provider
4. WeChat Pay Provider
5. Refunds
6. Reconciliation
7. Merchant settlement

## Per-Worktree Checklist

- Confirm `pwd` is the intended worktree.
- Run `git status --short --branch`.
- Read `AGENTS.md`.
- Confirm task scope and non-goals.
- Avoid unrelated edits.
- Run task-specific verification.
- Return files changed, findings, risks, and next steps.

