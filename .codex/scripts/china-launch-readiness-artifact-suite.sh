#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
timestamp="$(date +%Y%m%d%H%M%S)"
output_dir="${CODEX_READINESS_SUITE_OUTPUT_DIR:-${TMPDIR:-/tmp}/fuyi-readiness-suite-${timestamp}}"
latest_link="${CODEX_READINESS_SUITE_LATEST_LINK:-${TMPDIR:-/tmp}/fuyi-readiness-suite-latest}"
modes=(
  admin-visual-qa
  frontend
  refund-smoke
  refund-smoke-local-db
  unit-permission-smoke
  platform-module-switch-smoke
  runtime-mock-suite
  preprod-env-discovery
  preprod-env-status
  preprod-db-local-script-test
)

load_runtime() {
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    # shellcheck source=/dev/null
    source "$NVM_DIR/nvm.sh"
    nvm use >/tmp/fuyi-nvm-use-readiness-suite.log
  fi

  export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
  export PATH="$BUN_INSTALL/bin:$PATH"

  command -v node >/dev/null || {
    echo "node not found after loading runtime." >&2
    exit 1
  }
}

usage() {
  cat <<'USAGE'
Usage:
  ./.codex/scripts/china-launch-readiness-artifact-suite.sh

Runs the local launch-readiness evidence modes that can be verified without a
real disposable preprod database:
- admin-visual-qa
- frontend
- refund-smoke
- refund-smoke-local-db
- unit-permission-smoke
- platform-module-switch-smoke
- runtime-mock-suite
- preprod-env-discovery
- preprod-env-status
- preprod-db-local-script-test

Each mode writes a JSON artifact under CODEX_READINESS_SUITE_OUTPUT_DIR, or a
timestamped /tmp/fuyi-readiness-suite-* directory by default. Each mode also
writes a matching log file in the same directory. The suite writes summary.json,
summary.md, and updates /tmp/fuyi-readiness-suite-latest by default.

This suite does not satisfy the real disposable preprod DB launch gate and does
not approve high-risk payment/refund/settlement runtime writes.
USAGE
}

case "${1:-}" in
  -h|--help|help)
    usage
    exit 0
    ;;
  "")
    ;;
  *)
    echo "Unknown argument: $1" >&2
    usage >&2
    exit 2
    ;;
esac

mkdir -p "$output_dir"
load_runtime

printf 'READINESS_SUITE_OUTPUT_DIR=%s\n' "$output_dir"

statuses=()
for mode in "${modes[@]}"; do
  artifact="${output_dir}/${mode}.json"
  log_file="${output_dir}/${mode}.log"
  printf 'RUN readiness mode=%s artifact=%s log=%s\n' "$mode" "$artifact" "$log_file"
  if [ "$mode" = "admin-visual-qa" ]; then
    if (
      cd "$root"
      CODEX_ADMIN_VISUAL_QA_OUTPUT_DIR="${output_dir}/admin-visual-qa-screenshots" \
        ./.codex/scripts/china-launch-readiness-check.sh "$mode" --json --output "$artifact"
    ) >"$log_file" 2>&1; then
      statuses+=("${mode}:0")
    else
      status=$?
      statuses+=("${mode}:${status}")
    fi
  elif (
    cd "$root"
    ./.codex/scripts/china-launch-readiness-check.sh "$mode" --json --output "$artifact"
  ) >"$log_file" 2>&1; then
    statuses+=("${mode}:0")
  else
    status=$?
    statuses+=("${mode}:${status}")
  fi

  if [ "$mode" = "admin-visual-qa" ] && [ -f "$artifact" ]; then
    if node - "$artifact" <<'NODE' >/dev/null 2>&1
const fs = require("fs")
const artifact = JSON.parse(fs.readFileSync(process.argv[2], "utf8"))
process.exit(artifact.passItems?.includes("Admin logged-in visual QA script passes") ? 0 : 1)
NODE
    then
      export ADMIN_LOGIN_VISUAL_QA_CONFIRMED=true
    fi
  fi

  if [ "$mode" = "preprod-env-discovery" ]; then
    redacted_discovery_artifact="${output_dir}/preprod-env-discovery.redacted.json"
    if [ -f "$artifact" ]; then
      node - "$artifact" "$redacted_discovery_artifact" <<'NODE' >>"$log_file" 2>&1 || true
const fs = require("fs")
const [artifactPath, outputPath] = process.argv.slice(2)

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"))
if (!artifact.preprodEnvDiscovery) {
  throw new Error("preprodEnvDiscovery missing from readiness artifact")
}

fs.writeFileSync(outputPath, `${JSON.stringify(artifact.preprodEnvDiscovery)}\n`)
process.stdout.write(`EXTRACTED preprodEnvDiscovery artifact=${outputPath}\n`)
NODE
    fi
  fi

  if [ "$mode" = "preprod-env-status" ]; then
    redacted_env_artifact="${output_dir}/preprod-env-status.redacted.json"
    if [ -f "$artifact" ]; then
      node - "$artifact" "$redacted_env_artifact" <<'NODE' >>"$log_file" 2>&1 || true
const fs = require("fs")
const [artifactPath, outputPath] = process.argv.slice(2)

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"))
if (!artifact.preprodEnvStatus) {
  throw new Error("preprodEnvStatus missing from readiness artifact")
}

fs.writeFileSync(outputPath, `${JSON.stringify(artifact.preprodEnvStatus)}\n`)
process.stdout.write(`EXTRACTED preprodEnvStatus artifact=${outputPath}\n`)
NODE
    fi
  fi

  if [ -f "$artifact" ]; then
    node - "$mode" "$artifact" "$log_file" <<'NODE'
const fs = require("fs")
const [mode, artifactPath, logPath] = process.argv.slice(2)
let artifact = null
try {
  artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"))
} catch {
  artifact = null
}

const counts = artifact?.counts
const countsText = counts
  ? `pass=${counts.pass} warnings=${counts.warnings} noGo=${counts.noGo}`
  : "counts=missing"

process.stdout.write(
  `DONE readiness mode=${mode} verdict=${artifact?.verdict ?? "MISSING"} ${countsText} artifact=${artifactPath} log=${logPath}\n`
)
NODE
  else
    printf 'DONE readiness mode=%s verdict=MISSING artifact=%s log=%s\n' "$mode" "$artifact" "$log_file"
  fi
done

artifact_secret_scan_artifact="${output_dir}/artifact-secret-scan.json"
artifact_secret_scan_log="${output_dir}/artifact-secret-scan.log"
set +e
(
  cd "$root"
  ./.codex/scripts/china-readiness-artifact-secret-scan.sh \
    "$output_dir" \
    --output "$artifact_secret_scan_artifact" \
    --log "$artifact_secret_scan_log"
)
artifact_secret_scan_status=$?
set -e
statuses+=("artifact-secret-scan:${artifact_secret_scan_status}")
printf 'DONE readiness mode=artifact-secret-scan verdict=%s artifact=%s log=%s\n' \
  "$([ "$artifact_secret_scan_status" = "0" ] && printf 'GO-FOR-CHECKED-SCOPE' || printf 'NO-GO')" \
  "$artifact_secret_scan_artifact" \
  "$artifact_secret_scan_log"

node - "$output_dir" "$latest_link" "${statuses[@]}" <<'NODE'
const fs = require("fs")
const path = require("path")

const [outputDir, latestLink, ...statuses] = process.argv.slice(2)
const results = statuses.map((entry) => {
  const [mode, statusText] = entry.split(":")
  const artifactPath = path.join(outputDir, `${mode}.json`)
  let artifact = null
  try {
    artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"))
  } catch {
    artifact = null
  }

  return {
    mode,
    exitCode: Number(statusText),
    artifactPath,
    logPath: path.join(outputDir, `${mode}.log`),
    verdict: artifact?.verdict ?? "MISSING",
    counts: artifact?.counts ?? null,
    passItems: artifact?.passItems ?? [],
    warningItems: artifact?.warningItems ?? [],
    noGoItems: artifact?.noGoItems ?? [],
  }
})

const hasPass = (result, text) => result.passItems.some((item) => item.includes(text))
const screenshotsSummaryPath = path.join(outputDir, "admin-visual-qa-screenshots", "summary.json")
let adminVisualQaScreenshots = []
try {
  const visualSummary = JSON.parse(fs.readFileSync(screenshotsSummaryPath, "utf8"))
  adminVisualQaScreenshots = visualSummary.screenshots ?? []
} catch {
  adminVisualQaScreenshots = []
}

const preprodEnvStatusPath = path.join(outputDir, "preprod-env-status.redacted.json")
let preprodEnvStatus = null
try {
  const status = JSON.parse(fs.readFileSync(preprodEnvStatusPath, "utf8"))
  preprodEnvStatus = {
    artifactPath: preprodEnvStatusPath,
    exists: status.exists ?? false,
    privatePath: status.privatePath ?? false,
    mode: status.mode ?? null,
    modeOk: status.modeOk ?? false,
    gitIgnored: status.gitIgnored ?? false,
    declared: status.declared ?? {},
    placeholdersPresent: status.placeholdersPresent ?? null,
    placeholderKeys: Array.isArray(status.placeholderKeys)
      ? status.placeholderKeys.filter((key) => typeof key === "string")
      : [],
    syntaxOk: status.syntaxOk ?? null,
    syntaxReason: status.syntaxReason ?? null,
    preflightOk: status.preflightOk ?? null,
    preflightReason: status.preflightReason ?? null,
    verdict: status.verdict ?? null,
    next: status.next ?? null,
  }
} catch {
  preprodEnvStatus = null
}

const preprodEnvDiscoveryPath = path.join(outputDir, "preprod-env-discovery.redacted.json")
let preprodEnvDiscovery = null
try {
  const discovery = JSON.parse(fs.readFileSync(preprodEnvDiscoveryPath, "utf8"))
  preprodEnvDiscovery = {
    artifactPath: preprodEnvDiscoveryPath,
    root: discovery.root ?? null,
    defaultPrivateEnvDatabaseUrl: discovery.defaultPrivateEnvDatabaseUrl ?? null,
    currentEnvCandidateCount: Number(discovery.currentEnvCandidateCount ?? 0),
    currentEnvCandidateKeys: Array.isArray(discovery.currentEnvCandidateKeys)
      ? discovery.currentEnvCandidateKeys.filter((key) => typeof key === "string")
      : [],
    envFileCandidates: Array.isArray(discovery.envFileCandidates)
      ? discovery.envFileCandidates.filter((item) => typeof item === "string")
      : [],
    keyReferences: Array.isArray(discovery.keyReferences)
      ? discovery.keyReferences.filter((item) => item && typeof item === "object")
      : [],
    verdict: discovery.verdict ?? null,
  }
} catch {
  preprodEnvDiscovery = null
}

const localEvidence = results.map((result) => {
  const evidenceChecks = {
    "admin-visual-qa": hasPass(result, "Admin logged-in visual QA script passes"),
    frontend: hasPass(result, "Admin/Vendor/Storefront build gates pass"),
    "refund-smoke": hasPass(result, "main API refund review query surface HTTP smoke passes"),
    "refund-smoke-local-db": hasPass(result, "disposable local DB refund review query surface Admin HTTP smoke passes"),
    "unit-permission-smoke": hasPass(result, "Admin to Vendor unit permission HTTP smoke passes"),
    "platform-module-switch-smoke": hasPass(result, "Admin platform module switch HTTP smoke passes"),
    "runtime-mock-suite":
      hasPass(result, "runtime mock, dry-run, shadow, and read-only contract tests pass") &&
      hasPass(result, "main API refund review query surface HTTP smoke passes") &&
      hasPass(result, "Admin to Vendor unit permission HTTP smoke passes") &&
      hasPass(result, "preprod DB rehearsal local script-test passes"),
    "preprod-env-discovery": hasPass(result, "preprod rehearsal env discovery completed"),
    "preprod-env-status": hasPass(result, "preprod rehearsal private env is ready to validate"),
    "preprod-db-local-script-test": hasPass(result, "preprod DB rehearsal local script-test passes"),
    "artifact-secret-scan": hasPass(result, "readiness suite artifacts contain no database connection URL patterns"),
  }

  return {
    mode: result.mode,
    passed: evidenceChecks[result.mode] ?? (result.verdict !== "NO-GO" && result.verdict !== "MISSING"),
    artifactPath: result.artifactPath,
    logPath: result.logPath,
  }
})

const highRiskRuntimeApprovalConfirmed = results.some((result) =>
  hasPass(result, "payment/refund/settlement runtime approval gate confirmed by env")
)
const preprodDbRehearsalConfirmed = results.some((result) =>
  hasPass(result, "preprod disposable DB rehearsal gate confirmed by env")
)

const derivedGateConfirmations = {
  adminLoggedInVisualQa:
    localEvidence.some((entry) => entry.mode === "admin-visual-qa" && entry.passed) ||
    results.some((result) => hasPass(result, "Admin logged-in visual QA gate confirmed by env")),
  highRiskRuntimeApproval: highRiskRuntimeApprovalConfirmed,
  preprodDisposableDbRehearsal: preprodDbRehearsalConfirmed,
}

const externalBlockers = []

if (!preprodDbRehearsalConfirmed) {
  externalBlockers.push("real disposable preprod DB rehearsal is not satisfied by local script-test")
}

const privateEnvNotReady = results.some((result) => result.noGoItems.some((item) => item.includes("private env is not ready")))

if (privateEnvNotReady) {
  externalBlockers.unshift("private disposable preprod DB env is not ready to validate")
}

if (!highRiskRuntimeApprovalConfirmed) {
  externalBlockers.push("high-risk payment/refund/settlement/commission/payout/permission/fulfillment runtime approval is still required")
}

const placeholderKeysText = preprodEnvStatus?.placeholderKeys?.length
  ? preprodEnvStatus.placeholderKeys.join(", ")
  : null
const noDiscoveredEnvCandidate = preprodEnvDiscovery?.currentEnvCandidateCount === 0
const discoveryNextAction = noDiscoveredEnvCandidate
  ? "No current process DB env candidate was discovered; fill CODEX_PREPROD_DISPOSABLE_DATABASE_URL in the private env explicitly."
  : "Review preprod-env-discovery.redacted.json and copy only an approved disposable preprod DB endpoint into the private env."
const applyCurrentEnvNextAction =
  "After an approved endpoint is available in the current shell, run: CODEX_PREPROD_DISPOSABLE_DATABASE_URL=<approved-redacted-url> ./.codex/scripts/china-preprod-disposable-db-rehearsal-apply-current-env.sh"
const closeGateNextAction =
  "PAYMENT_REFUND_SETTLEMENT_RUNTIME_APPROVED=true ./.codex/scripts/china-preprod-disposable-db-rehearsal-close-gate.sh run"

const nextActions = privateEnvNotReady
  ? [
      placeholderKeysText
        ? `Fill placeholder keys in .codex/private/preprod-disposable-db-rehearsal.env: ${placeholderKeysText}.`
        : "Fill .codex/private/preprod-disposable-db-rehearsal.env with a disposable preprod DB only.",
      discoveryNextAction,
      applyCurrentEnvNextAction,
      "./.codex/scripts/china-preprod-disposable-db-rehearsal-env-status.sh",
      "./.codex/scripts/china-preprod-disposable-db-rehearsal-from-env.sh .codex/private/preprod-disposable-db-rehearsal.env validate",
      "./.codex/scripts/china-preprod-disposable-db-rehearsal-from-env.sh .codex/private/preprod-disposable-db-rehearsal.env run",
      closeGateNextAction,
    ]
  : [
      closeGateNextAction,
      ...(highRiskRuntimeApprovalConfirmed
        ? []
        : ["Do not set PAYMENT_REFUND_SETTLEMENT_RUNTIME_APPROVED=true without explicit high-risk approval."]),
    ]

const summary = {
  outputDir,
  latestLink,
  verdict: results.some((result) => result.verdict === "NO-GO" || result.exitCode !== 0)
    ? "NO-GO"
    : "GO-FOR-CHECKED-SCOPE",
  results,
  externalBlockers,
  nextActions,
  localEvidence,
  derivedGateConfirmations,
  adminVisualQaScreenshots,
  preprodEnvDiscovery,
  preprodEnvStatus,
}

const summaryPath = path.join(outputDir, "summary.json")
const summaryMarkdownPath = path.join(outputDir, "summary.md")
summary.summaryPath = summaryPath
summary.summaryMarkdownPath = summaryMarkdownPath

const countsText = (counts) => {
  if (!counts) {
    return "missing"
  }

  return `pass=${counts.pass} warnings=${counts.warnings} noGo=${counts.noGo}`
}

const rows = results.map((result) => {
  const evidence = localEvidence.find((entry) => entry.mode === result.mode)
  return `| ${result.mode} | ${result.verdict} | ${evidence?.passed ? "PASS" : "NO-GO"} | ${countsText(result.counts)} | ${result.artifactPath} | ${result.logPath} |`
})

const evidenceRows = localEvidence.map((entry) => {
  return `| ${entry.mode} | ${entry.passed ? "PASS" : "NO-GO"} | ${entry.artifactPath} |`
})
const blockerLines = summary.externalBlockers.map((item) => `- ${item}`)
const nextActionLines = summary.nextActions.map((item) => `- ${item}`)
const adminVisualScreenshotLines = adminVisualQaScreenshots.length > 0
  ? adminVisualQaScreenshots.map((item) => `- ${item}`)
  : ["- none"]
const preprodEnvDiscoveryLines = preprodEnvDiscovery
  ? [
      `- Artifact: \`${preprodEnvDiscovery.artifactPath}\``,
      `- Verdict: \`${preprodEnvDiscovery.verdict ?? "missing"}\``,
      `- Default private env DB URL: \`${preprodEnvDiscovery.defaultPrivateEnvDatabaseUrl ?? "missing"}\``,
      `- Current env candidate count: \`${preprodEnvDiscovery.currentEnvCandidateCount}\``,
      `- Current env candidate keys: \`${preprodEnvDiscovery.currentEnvCandidateKeys.length ? preprodEnvDiscovery.currentEnvCandidateKeys.join(", ") : "none"}\``,
      `- Env file candidates: \`${preprodEnvDiscovery.envFileCandidates.length ? preprodEnvDiscovery.envFileCandidates.join(", ") : "none"}\``,
    ]
  : ["- none"]
const preprodEnvStatusLines = preprodEnvStatus
  ? [
      `- Artifact: \`${preprodEnvStatus.artifactPath}\``,
      `- Verdict: \`${preprodEnvStatus.verdict}\``,
      `- Exists: \`${preprodEnvStatus.exists}\``,
      `- Private path: \`${preprodEnvStatus.privatePath}\``,
      `- Mode: \`${preprodEnvStatus.mode ?? "missing"}\``,
      `- Mode OK: \`${preprodEnvStatus.modeOk}\``,
      `- Git ignored: \`${preprodEnvStatus.gitIgnored}\``,
      `- Placeholders present: \`${preprodEnvStatus.placeholdersPresent}\``,
      `- Placeholder keys: \`${preprodEnvStatus.placeholderKeys?.length ? preprodEnvStatus.placeholderKeys.join(", ") : "none"}\``,
      `- Syntax OK: \`${preprodEnvStatus.syntaxOk}\``,
      `- Syntax reason: \`${preprodEnvStatus.syntaxReason ?? "missing"}\``,
      `- Preflight OK: \`${preprodEnvStatus.preflightOk}\``,
      `- Preflight reason: \`${preprodEnvStatus.preflightReason ?? "missing"}\``,
      `- Next: \`${preprodEnvStatus.next ?? "missing"}\``,
    ]
  : ["- none"]

const markdown = [
  "# China Launch Readiness Suite",
  "",
  `- Output directory: \`${outputDir}\``,
  `- Latest link: \`${latestLink}\``,
  `- Verdict: \`${summary.verdict}\``,
  "",
  "## Mode Results",
  "",
  "| Mode | Verdict | Local Evidence | Counts | Artifact | Log |",
  "| --- | --- | --- | --- | --- | --- |",
  ...rows,
  "",
  "## Local Evidence",
  "",
  "| Mode | Evidence | Artifact |",
  "| --- | --- | --- |",
  ...evidenceRows,
  "",
  "## Derived Gate Confirmations",
  "",
  `- Admin logged-in visual QA: \`${summary.derivedGateConfirmations.adminLoggedInVisualQa ? "confirmed" : "not confirmed"}\``,
  `- High-risk runtime approval: \`${summary.derivedGateConfirmations.highRiskRuntimeApproval ? "confirmed" : "not confirmed"}\``,
  `- Preprod disposable DB rehearsal: \`${summary.derivedGateConfirmations.preprodDisposableDbRehearsal ? "confirmed" : "not confirmed"}\``,
  "",
  "## Admin Visual QA Screenshots",
  "",
  ...adminVisualScreenshotLines,
  "",
  "## Preprod Env Discovery",
  "",
  ...preprodEnvDiscoveryLines,
  "",
  "## Preprod Env Status",
  "",
  ...preprodEnvStatusLines,
  "",
  "## External Blockers",
  "",
  ...blockerLines,
  "",
  "## Next Actions",
  "",
  ...nextActionLines,
  "",
].join("\n")

fs.writeFileSync(summaryPath, `${JSON.stringify(summary)}\n`)
fs.writeFileSync(summaryMarkdownPath, markdown)
process.stdout.write(`${JSON.stringify(summary)}\n`)
NODE

ln -sfn "$output_dir" "$latest_link"
printf 'SUMMARY json=%s markdown=%s latest=%s\n' \
  "$output_dir/summary.json" \
  "$output_dir/summary.md" \
  "$latest_link"

summary_status=0
for entry in "${statuses[@]}"; do
  status="${entry##*:}"
  if [ "$status" != "0" ]; then
    summary_status=1
  fi
done

exit "$summary_status"
