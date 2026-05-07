# Preprod Dry-Run Operator Pack

更新时间：2026-05-07 13:05 Asia/Shanghai

## 目的

本文把 `preprod-disposable-db-dry-run-execution` 执行前需要的操作包整理出来。

当前仍不执行任何预发或生产数据库命令。只有在用户明确提供可丢弃预发数据库、备份方案和回滚确认后，才能进入真实执行。

## Go / No-Go

### Go 条件

全部满足才允许执行：

- 目标库明确是 disposable preprod DB。
- 目标库不含生产用户、商户、订单、支付、退款、结算、佣金或权限数据。
- 用户给出 DB host、port、database、user，但不把密码写入仓库。
- 用户给出备份路径，或书面确认 disposable DB 无需备份。
- 用户确认 rollback 方式：down migration、drop disposable DB 或 restore backup。
- 执行窗口以 Asia/Shanghai 绝对时间记录。
- 执行人和复核人明确。

### No-Go 条件

任一命中就停止：

- 目标库是 production 或疑似 production。
- DB name、host 或 user 无法证明 disposable / preprod。
- 需要写入真实手机号、证照、订单号、支付单号、退款单号、物流单号或 provider credential。
- 任务要求注册真实 migration、运行 production seed、实现 Admin 写接口或让 runtime switch 生效。
- 没有回滚方案。

## 执行变量模板

不要把真实密码写入仓库。执行时只在本地 shell session 临时设置。

```bash
export FUYI_PREPROD_DB_HOST="REPLACE_WITH_HOST"
export FUYI_PREPROD_DB_PORT="5432"
export FUYI_PREPROD_DB_NAME="REPLACE_WITH_DISPOSABLE_DB"
export FUYI_PREPROD_DB_USER="REPLACE_WITH_USER"
export PGPASSWORD="REPLACE_WITH_LOCAL_SECRET_ONLY"
export FUYI_DRY_RUN_LOG_DIR="/tmp/fuyi-preprod-dry-run-$(date +%Y%m%d-%H%M%S)"
```

连接串只在本地临时拼接：

```bash
export FUYI_PREPROD_DATABASE_URL="postgres://${FUYI_PREPROD_DB_USER}:${PGPASSWORD}@${FUYI_PREPROD_DB_HOST}:${FUYI_PREPROD_DB_PORT}/${FUYI_PREPROD_DB_NAME}"
```

## 执行记录模板

```text
环境名称：
DB host：
DB port：
DB name：
DB user：
是否 disposable：
是否含生产数据：
备份路径或无需备份原因：
回滚方式：
执行窗口：
执行人：
复核人：
Go / No-Go 结论：
```

## 命令模板

以下命令是模板，不在本任务中执行。

### 1. 只读连通性

```bash
mkdir -p "$FUYI_DRY_RUN_LOG_DIR"

psql \
  -h "$FUYI_PREPROD_DB_HOST" \
  -p "$FUYI_PREPROD_DB_PORT" \
  -U "$FUYI_PREPROD_DB_USER" \
  -d "$FUYI_PREPROD_DB_NAME" \
  -v ON_ERROR_STOP=1 \
  -c "select current_database(), current_user, now();" \
  | tee "$FUYI_DRY_RUN_LOG_DIR/01-connectivity.log"
```

### 2. 生产风险否定检查

```bash
psql \
  -h "$FUYI_PREPROD_DB_HOST" \
  -p "$FUYI_PREPROD_DB_PORT" \
  -U "$FUYI_PREPROD_DB_USER" \
  -d "$FUYI_PREPROD_DB_NAME" \
  -v ON_ERROR_STOP=1 \
  -c "\\dt" \
  | tee "$FUYI_DRY_RUN_LOG_DIR/02-table-list-before.log"
```

人工检查日志，确认没有生产交易数据风险后才能继续。

### 3. Migration up

执行方式必须以最终 migration skeleton 的实际路径为准。当前不得假设生产 migration 已注册。

```bash
# 示例占位：真实执行前必须替换为当前 migration skeleton 的 up SQL 提取命令。
# bash .codex/scripts/market-membership-local-dry-run.sh --target "$FUYI_PREPROD_DATABASE_URL"
```

### 4. 结构检查

```bash
psql "$FUYI_PREPROD_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL' \
  | tee "$FUYI_DRY_RUN_LOG_DIR/04-structure-check.log"
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'china_market',
    'china_market_membership',
    'china_seller_role',
    'china_market_announcement',
    'china_market_business_hour',
    'china_market_delivery_profile'
  )
order by table_name;
SQL
```

必须看到 6 张表。

### 5. Dry-run fixture

只允许写入假数据，禁止真实手机号、证照、订单、支付、退款、物流或 provider credential。

```sql
-- 示例 id：
-- market_preprod_dry_run_001
-- sel_preprod_dry_run_001
-- role_preprod_dry_run_001
```

真实 SQL 在执行前单独生成并复核，不在本文档中硬编码。

### 6. Read model 验证

验证目标：

- repository ready。
- repository empty。
- required table missing fallback。
- seller-owned market filter。
- `checkoutImpact = none`。
- `runtimeEnabled = false`。

### 7. Admin / Storefront / Vendor 验证

Admin：

- 市场详情 ready。
- empty memberships。
- fallback/error。
- 无保存、发布、生效按钮。

Storefront：

- markets API ready。
- markets API empty。
- markets API fallback/error。
- 不影响 checkout。

Vendor：

- 当前 seller 有 membership 时进入 repository mode。
- 当前 seller 无 membership 时 fallback。
- 表缺失时 fallback。

### 8. Rollback

至少完成一种：

- down migration。
- drop disposable DB。
- restore backup。

Rollback 后必须记录：

- 6 张 dry-run 表不存在或已恢复。
- seller/product/order/payment/refund/settlement/commission/permission 相关表未受影响。
- API typecheck/build 可恢复。

## 日志目录要求

日志必须放在本地临时目录，不提交到仓库：

```text
/tmp/fuyi-preprod-dry-run-YYYYMMDD-HHMMSS/
```

建议文件：

- `01-connectivity.log`
- `02-table-list-before.log`
- `03-migration-up.log`
- `04-structure-check.log`
- `05-fixture.log`
- `06-read-model.log`
- `07-admin-storefront-vendor.log`
- `08-rollback.log`
- `09-table-list-after.log`

## 退出标准

全部满足才允许进入真实 migration registration 设计复核：

- Go 条件全部满足。
- migration up 成功。
- 6 张表存在且约束符合预期。
- dry-run fixture 成功。
- read model 三态成功。
- Admin / Storefront / Vendor 只读三态成功。
- rollback 成功。
- 没有支付、订单、退款、结算、佣金、权限或真实履约 diff。
- 日志路径已记录，但日志文件未提交仓库。

## 当前状态

`preprod-disposable-db-dry-run-execution` 仍为 `blocked-external`。

本 operator pack 完成后，下一步仍然不是自动执行数据库命令，而是等待用户明确给出 disposable preprod DB 和回滚确认。
