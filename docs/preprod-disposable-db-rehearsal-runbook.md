# Preprod Disposable DB Rehearsal Runbook

更新时间：2026-05-16 Asia/Shanghai

## 目标

这份 runbook 只用于真实 disposable preprod DB rehearsal。它把当前脚本入口、私有 env、redacted status、validate、run 和 artifact suite 串成固定顺序，避免把本地 script-test 或占位 env 误算作上线 gate。

当前结论仍是 No-Go：默认私有 env 草稿还含占位符，没有真实可删除、可重建、无生产数据的预发 DB 输入。

## 禁止事项

- 不要把本地 disposable DB script-test 当成预发 gate。
- 不要把 `.codex/private/preprod-disposable-db-rehearsal.env` 提交到 git。
- 不要在 repo 里写真实 DB URL、operator、cleanup owner、tunnel 信息或生产凭据。
- 不要在没有真实 disposable preprod DB 的情况下设置 `PREPROD_DISPOSABLE_DB_REHEARSAL_CONFIRMED=true`。
- 不要设置 `PAYMENT_REFUND_SETTLEMENT_RUNTIME_APPROVED=true`，除非已经有明确高风险串行批准。
- 不要执行 workflow、写 refund success state，或触发 settlement / commission / payout / permission / fulfillment / logistics 写路径。

## 文件与脚本

- 私有 env 草稿：`.codex/private/preprod-disposable-db-rehearsal.env`
- env 模板：`.codex/templates/preprod-disposable-db-rehearsal.env.example`
- 生成草稿：`.codex/scripts/china-preprod-disposable-db-rehearsal-init-env.sh`
- redacted 状态：`.codex/scripts/china-preprod-disposable-db-rehearsal-env-status.sh`
- validate / run wrapper：`.codex/scripts/china-preprod-disposable-db-rehearsal-from-env.sh`
- 私有 env 白名单解析 helper：`.codex/scripts/lib/preprod-disposable-env-safe-loader.sh`
- 底层 rehearsal：`.codex/scripts/china-preprod-disposable-db-rehearsal.sh`
- readiness 总控：`.codex/scripts/china-launch-readiness-check.sh`
- artifact suite：`.codex/scripts/china-launch-readiness-artifact-suite.sh`

## 操作顺序

1. 生成私有 env 草稿：

```bash
./.codex/scripts/china-preprod-disposable-db-rehearsal-init-env.sh
```

如果文件已存在，脚本会拒绝覆盖。当前默认草稿已经存在，权限应为 `600`。

2. 检查 redacted 状态：

```bash
./.codex/scripts/china-preprod-disposable-db-rehearsal-env-status.sh
```

当前占位草稿应返回 `verdict=NOT_READY`，并显示 `placeholders_present=yes`。
如需机器可读结果，可以追加 `--json --output <file>`；该 JSON 仍然不包含 DB URL。
当前状态检查还会输出 redacted preflight 结果：确认 token、备份确认、DB URL 形状、DB 名白名单、production-like 名称、localhost tunnel 确认都会在不连接数据库前检查。
`env-status` 同样不会 source 私有 env 文件；它通过 `.codex/scripts/lib/preprod-disposable-env-safe-loader.sh` 只接受白名单 `KEY=value` / `export KEY=value`，未知变量、非 assignment 行或 shell 命令都会保持 `NOT_READY`。

3. 由操作人编辑私有 env。

必须填入真实 disposable preprod DB URL，并确认：

- DB 可删除、可重建、无生产数据。
- 已备份或明确无需备份。
- 有 operator 或 ticket。
- 有 cleanup owner 或 ticket。
- 当前本地 WIP 被接受用于 rehearsal。

4. 只验证 env 文件，不连接 DB：

```bash
./.codex/scripts/china-preprod-disposable-db-rehearsal-from-env.sh \
  .codex/private/preprod-disposable-db-rehearsal.env validate
```

`validate` 通过只说明 env 文件形状可用，不满足 preprod gate。
`validate` 不 source 私有 env 文件，只通过同一份 safe loader 解析白名单 env assignment；不在白名单内的变量、非 `KEY=value` 行或 shell 命令都会 fail-closed。
`validate` 现在也会跑同一套非连接安全预检：确认 token、DB 名、localhost tunnel、自定义 allow regex 等必须在这一步先通过，避免真正 `run` 时才发现基础输入错误。

5. 确认 readiness 中的 env status：

```bash
ADMIN_LOGIN_VISUAL_QA_CONFIRMED=true \
./.codex/scripts/china-launch-readiness-check.sh preprod-env-status --json \
  --output /tmp/fuyi-readiness-preprod-env-status.json || true
```

只有 env 已填好且没有占位符时，`preprod-env-status` 才会出现 `READY_TO_VALIDATE` 相关 PASS。即使如此，它仍不会满足真实 preprod gate。
该 readiness JSON 会直接带上 redacted `preprodEnvStatus`，包括 `placeholdersPresent`、`syntaxOk`、`preflightOk`、`preflightReason` 和 env status verdict；不需要再翻 suite summary 才能判断卡点。

6. 执行真实 rehearsal：

```bash
./.codex/scripts/china-preprod-disposable-db-rehearsal-from-env.sh \
  .codex/private/preprod-disposable-db-rehearsal.env run
```

底层脚本只执行 migration / schema evidence，不执行 workflow，不写 refund success state，不触发 settlement / commission / payout / permission / fulfillment / logistics。
rehearsal 输出只打印 redacted target identity，例如 `host=... port=... database=... user=...`，不会把 `postgres://` 连接串写入 readiness suite 日志。

7. 跑完整 artifact suite：

```bash
ADMIN_LOGIN_VISUAL_QA_CONFIRMED=true \
./.codex/scripts/china-launch-readiness-artifact-suite.sh || true
```

suite 会输出 `/tmp/fuyi-readiness-suite-*` 目录，并更新 `/tmp/fuyi-readiness-suite-latest`。
`summary.json` / `summary.md` 会沿用同一份 redacted `preprodEnvStatus` 形状，包括 `placeholdersPresent`、`syntaxOk`、`preflightOk`、`preflightReason` 和当前 env status verdict。
suite 中的 `preprod-env-status.redacted.json` 由 `preprod-env-status.json` 里的 `preprodEnvStatus` 提取生成，避免 suite 和单独 readiness check 各跑一套 env status 逻辑。
suite 还会调用 `.codex/scripts/china-readiness-artifact-secret-scan.sh` 生成 `artifact-secret-scan.json`，扫描本轮证据目录中的 `postgres://` / `postgresql://` URL；如果任何 artifact 或 log 又写入连接串，suite 会把该机器项标成 `NO-GO`。这个扫描器也可单独用于检查既有 suite 目录：

```bash
./.codex/scripts/china-readiness-artifact-secret-scan.sh \
  /tmp/fuyi-readiness-suite-latest \
  --output /tmp/fuyi-readiness-suite-latest/artifact-secret-scan.json \
  --log /tmp/fuyi-readiness-suite-latest/artifact-secret-scan.log
```

## 验收证据

真实 Gate 3 至少需要：

- redacted env status artifact。
- wrapper validate 通过日志。
- guarded rehearsal run 日志。
- migration / schema table evidence。
- cleanup / rollback 证据。
- latest readiness suite summary。
- ledger 记录 operator、cleanup owner、artifact path 和剩余 No-Go。

## 当前默认状态

截至 2026-05-16 Asia/Shanghai：

- `.codex/private/preprod-disposable-db-rehearsal.env` 已生成。
- 文件权限为 `600`。
- 文件被 `.codex/private/.gitignore` 忽略。
- 文件仍含模板占位符。
- `preprod-env-status` 当前为 `NO-GO`。
- latest suite：`/tmp/fuyi-readiness-suite-evidence-split-202605162217`
- 当前仍缺真实 disposable preprod DB 和高风险 runtime approval。
