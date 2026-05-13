# Refund State Mutation Isolated Preprod Query Surface Fixture Registry Summary Block Contract Plan

## 任务

在 operator hint contract validation 之后，规划 `summary` 区块里的 reviewCaseId、scenarioType、caseStatus、refundReference、marketContext 和 sellerContext 合同。

## 范围

- 只允许修改 docs / queue / ledger / task 文件。
- 只允许规划 summary 字段、上下文显示合同、redacted context 和 case status 语义。

## 非目标

- 不新增 summary implementation。
- 不新增 operator hint implementation。
- 不新增 route。
- 不连接 production / preprod DB。
- 不执行 workflow。
- 不写 refund success state。

## 验证

- `git diff --check`
- `git status --short --branch`
