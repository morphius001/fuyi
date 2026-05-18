#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$root"

if [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck source=/dev/null
  source "$HOME/.nvm/nvm.sh"
  nvm use 24 >/tmp/fuyi-nvm-use-refund-review-smoke.log
fi

mode="${1:-all}"

fail() {
  echo "FAIL $*" >&2
  exit 1
}

case "$mode" in
  all | disabled | resolved | blocked) ;;
  *)
    fail "Usage: $0 [all|disabled|resolved|blocked]"
    ;;
esac

run_case() {
  local case_name="$1"

  SMOKE_CASE="$case_name" bun --eval '
    import { GET } from "./packages/api/src/api/admin/china/refund-review-query-surface/route"

    const smokeCase = process.env.SMOKE_CASE
    const originalEnv = { ...process.env }

    const makeResponse = () => {
      const response = {
        statusCode: undefined,
        body: undefined,
        status(code) {
          this.statusCode = code
          return this
        },
        json(payload) {
          this.body = payload
          return this
        },
      }

      return response
    }

    const assert = (condition, message) => {
      if (!condition) {
        throw new Error(message)
      }
    }

    const run = async () => {
      if (smokeCase === "disabled") {
        process.env = {
          ...originalEnv,
          CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED: "",
          CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE: "",
          CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV: "",
          APP_ENV: "development",
        }

        const req = { query: {}, text() { throw new Error("route should not read body") } }
        const res = makeResponse()

        await GET(req, res)

        assert(res.statusCode === 503, `disabled expected 503, got ${res.statusCode}`)
        assert(res.body?.status === "disabled", `disabled expected status=disabled, got ${JSON.stringify(res.body)}`)
        assert(res.body?.code === "REFUND_REVIEW_QUERY_SURFACE_DISABLED", `disabled expected disabled code, got ${JSON.stringify(res.body)}`)
        return
      }

      if (smokeCase === "resolved") {
        process.env = {
          ...originalEnv,
          CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED: "true",
          CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE: " local_fixture ",
          CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV: " local ",
          APP_ENV: " test ",
        }

        const req = {
          query: {
            selector_mode: "scenario_default",
            scenario_type: "operator_review_ready",
            query_kind: "platform_refund_id",
            platform_refund_id: "refund_platform_001",
          },
          text() { throw new Error("route should not read body") },
        }
        const res = makeResponse()

        await GET(req, res)

        assert(res.statusCode === 200, `resolved expected 200, got ${res.statusCode}`)
        assert(res.body?.status === "resolved", `resolved expected status=resolved, got ${JSON.stringify(res.body)}`)
        assert(res.body?.mode === "local_fixture", `resolved expected local_fixture mode, got ${JSON.stringify(res.body)}`)
        assert(!("bundle" in (res.body?.result?.selectorResolution ?? {})), "resolved response leaked selector bundle")
        assert(JSON.stringify(res.body).includes("reviewInput") === false, "resolved response leaked reviewInput")
        return
      }

      if (smokeCase === "blocked") {
        process.env = {
          ...originalEnv,
          CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED: "true",
          CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE: "local_fixture",
          CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV: "local",
          APP_ENV: "development",
        }

        const req = {
          query: {
            selector_mode: "explicit_source_key",
            fixture_source_key: "operator_review_ready_fixture_missing",
            query_kind: "platform_refund_id",
            platform_refund_id: "refund_platform_001",
          },
          text() { throw new Error("route should not read body") },
        }
        const res = makeResponse()

        await GET(req, res)

        assert(res.statusCode === 400, `blocked expected 400, got ${res.statusCode}`)
        assert(res.body?.status === "blocked", `blocked expected status=blocked, got ${JSON.stringify(res.body)}`)
        assert(res.body?.code === "fixture_selector_invalid", `blocked expected fixture_selector_invalid, got ${JSON.stringify(res.body)}`)
        assert(JSON.stringify(res.body).includes("reviewInput") === false, "blocked response leaked reviewInput")
        return
      }

      throw new Error(`Unsupported smoke case: ${smokeCase}`)
    }

    try {
      await run()
      console.log(`PASS ${smokeCase}`)
    } finally {
      process.env = originalEnv
    }
  '
}

if [ "$mode" = "all" ]; then
  run_case disabled
  run_case resolved
  run_case blocked
else
  run_case "$mode"
fi

echo "PASS refund review query surface local smoke completed in mode: $mode"
