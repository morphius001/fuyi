#!/usr/bin/env bash
set -euo pipefail

api_url="${1:-http://127.0.0.1:9000}"
email="${2:-codex-refund-review-admin@example.com}"
password="${3:-Codex123456!}"
work_dir="${TMPDIR:-/tmp}/fuyi-admin-login-smoke"
body_file="$work_dir/body.json"
headers_file="$work_dir/headers.txt"
response_file="$work_dir/response.json"

mkdir -p "$work_dir"

cat >"$body_file" <<JSON
{"email":"$email","password":"$password"}
JSON

status="$(
  curl -sS -o "$response_file" -D "$headers_file" \
    -X POST "${api_url}/auth/user/emailpass" \
    -H "content-type: application/json" \
    --data-binary @"$body_file" \
    -w '%{http_code}'
)"

echo "HTTP ${status}"
cat "$headers_file"
echo "---"
cat "$response_file"
