#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
# shellcheck source=.codex/scripts/lib/preprod-disposable-env-safe-loader.sh
source "$root/.codex/scripts/lib/preprod-disposable-env-safe-loader.sh"

env_file=""
output_format="text"
output_path=""

usage() {
  cat <<'USAGE'
Usage:
  ./.codex/scripts/china-preprod-disposable-db-rehearsal-env-status.sh [private-env-file] [--json] [--output <file>]

Default:
  .codex/private/preprod-disposable-db-rehearsal.env

This prints a redacted local status summary. It does not source the env file,
does not print database URLs, and does not connect to any database.
USAGE
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    -h|--help|help)
      usage
      exit 0
      ;;
    --json|json)
      output_format="json"
      ;;
    --output)
      shift
      if [ -z "${1:-}" ]; then
        echo "--output requires a file path." >&2
        exit 2
      fi
      output_path="$1"
      ;;
    *)
      env_file="$1"
      ;;
  esac
  shift
done

env_file="${env_file:-"$root/.codex/private/preprod-disposable-db-rehearsal.env"}"

if [ -n "$output_path" ] && [ "$output_format" != "json" ]; then
  echo "--output requires --json or json mode." >&2
  exit 2
fi

env_file_dir="$(cd "$(dirname "$env_file")" 2>/dev/null && pwd || true)"
if [ -n "$env_file_dir" ]; then
  env_file_abs="${env_file_dir}/$(basename "$env_file")"
else
  env_file_abs="$env_file"
fi

required_names=("${codex_preprod_env_required_names[@]}")

confirm_disposable_token="I_CONFIRM_THIS_IS_DISPOSABLE_PREPROD_DB"
backup_confirm_token="BACKUP_DONE_OR_NOT_NEEDED"
custom_regex_confirm_token="I_ACCEPT_CUSTOM_DB_NAME_ALLOW_REGEX"
localhost_preprod_tunnel_confirm_token="I_CONFIRM_LOCALHOST_ENDPOINT_IS_DISPOSABLE_PREPROD_TUNNEL"

exists="no"
private_path="no"
mode=""
mode_ok="no"
git_ignored="no"
placeholders_present="no"
syntax_ok="no"
syntax_reason="env file is missing"
preflight_ok="no"
preflight_reason="env file is missing"
verdict="NOT_READY"
next="run init-env script to create a private draft"
declared_json=""
placeholder_keys=()
placeholder_keys_json="[]"

json_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

json_bool() {
  if [ "$1" = "yes" ]; then
    printf 'true'
  else
    printf 'false'
  fi
}

json_string_array() {
  local json="["
  local item

  for item in "$@"; do
    if [ "$json" != "[" ]; then
      json+=","
    fi
    json+="\"$(json_escape "$item")\""
  done

  json+="]"
  printf '%s' "$json"
}

validate_private_env_syntax() {
  codex_preprod_env_validate_syntax "$env_file_abs" syntax_reason
}

extract_env_value() {
  local name="$1"
  codex_preprod_env_extract_value "$env_file_abs" "$name" || true
}

reject_production_like_token() {
  local value="$1"
  local lowered

  lowered="$(printf '%s' "$value" | tr '[:upper:]' '[:lower:]')"

  if [[ "$lowered" =~ (^|[-_.])production($|[-_.]) ]] ||
    [[ "$lowered" =~ (^|[-_.])prod($|[-_.]) ]] ||
    [[ "$lowered" =~ (^|[-_.])(live|master|primary)($|[-_.]) ]]; then
    return 1
  fi

  return 0
}

parse_database_url_redacted() {
  local url="$1"
  local rest
  local userinfo
  local hostpath
  local hostport
  local database
  local username
  local host

  case "$url" in
    postgres://*|postgresql://*)
      ;;
    *)
      return 1
      ;;
  esac

  rest="${url#*://}"

  if [ "$rest" = "${rest#*@}" ]; then
    return 1
  fi

  userinfo="${rest%%@*}"
  hostpath="${rest#*@}"
  username="${userinfo%%:*}"
  [ -n "$username" ] || return 1

  if [ "$hostpath" = "${hostpath#*/}" ]; then
    return 1
  fi

  hostport="${hostpath%%/*}"
  database="${hostpath#*/}"
  database="${database%%\?*}"
  database="${database%%#*}"
  [ -n "$database" ] || return 1

  case "$hostport" in
    \[*\]*)
      host="${hostport#\[}"
      host="${host%%\]*}"
      ;;
    *)
      host="${hostport%%:*}"
      ;;
  esac
  [ -n "$host" ] || return 1

  printf '%s\n%s\n%s\n' "$host" "$database" "$username"
}

run_redacted_preflight() {
  local db_url
  local db_confirm
  local backup_confirm
  local operator
  local cleanup_owner
  local allow_regex
  local custom_regex_confirm
  local localhost_tunnel_confirm
  local db_parts
  local parsed_db_url=()
  local db_host
  local db_name
  local db_user
  local lowered_name

  db_url="$(extract_env_value CODEX_PREPROD_DISPOSABLE_DATABASE_URL)"
  db_confirm="$(extract_env_value CODEX_PREPROD_DISPOSABLE_DB_CONFIRM)"
  backup_confirm="$(extract_env_value CODEX_PREPROD_DISPOSABLE_DB_BACKUP_CONFIRM)"
  operator="$(extract_env_value CODEX_PREPROD_DISPOSABLE_DB_OPERATOR)"
  cleanup_owner="$(extract_env_value CODEX_PREPROD_DISPOSABLE_DB_CLEANUP_OWNER)"
  allow_regex="$(extract_env_value CODEX_PREPROD_DISPOSABLE_DB_NAME_ALLOW_REGEX)"
  custom_regex_confirm="$(extract_env_value CODEX_PREPROD_DISPOSABLE_DB_NAME_ALLOW_REGEX_CONFIRM)"
  localhost_tunnel_confirm="$(extract_env_value CODEX_PREPROD_DISPOSABLE_DB_LOCALHOST_PREPROD_TUNNEL_CONFIRM)"

  if [ "$db_confirm" != "$confirm_disposable_token" ]; then
    preflight_reason="disposable confirmation token is missing or invalid"
    return 1
  fi

  if [ "$backup_confirm" != "$backup_confirm_token" ]; then
    preflight_reason="backup confirmation token is missing or invalid"
    return 1
  fi

  if [ -z "$operator" ] || [ -z "$cleanup_owner" ]; then
    preflight_reason="operator or cleanup owner is missing"
    return 1
  fi

  if ! db_parts="$(parse_database_url_redacted "$db_url")"; then
    preflight_reason="database URL shape is invalid"
    return 1
  fi

  mapfile -t parsed_db_url <<<"$db_parts"
  db_host="${parsed_db_url[0]:-}"
  db_name="${parsed_db_url[1]:-}"
  db_user="${parsed_db_url[2]:-}"

  if ! reject_production_like_token "$db_host"; then
    preflight_reason="database host looks production-like"
    return 1
  fi

  if ! reject_production_like_token "$db_name"; then
    preflight_reason="database name looks production-like"
    return 1
  fi

  case "$db_host" in
    localhost|127.0.0.1|::1)
      if [ "$localhost_tunnel_confirm" != "$localhost_preprod_tunnel_confirm_token" ]; then
        preflight_reason="localhost target needs explicit disposable preprod tunnel confirmation"
        return 1
      fi
      ;;
  esac

  case "$db_name" in
    *[!A-Za-z0-9_]*)
      preflight_reason="database name contains unsupported characters"
      return 1
      ;;
  esac

  lowered_name="$(printf '%s' "$db_name" | tr '[:upper:]' '[:lower:]')"
  case "$lowered_name" in
    postgres|template0|template1|medusa|mercur|fuyi|production|prod|main|primary|live|master)
      preflight_reason="database name is reserved or production-like"
      return 1
      ;;
  esac

  allow_regex="${allow_regex:-^fuyi_preprod_disposable_[A-Za-z0-9_]+$}"
  if grep -Eq "^[[:space:]]*(export[[:space:]]+)?CODEX_PREPROD_DISPOSABLE_DB_NAME_ALLOW_REGEX=" "$env_file_abs" &&
    [ "$custom_regex_confirm" != "$custom_regex_confirm_token" ]; then
    preflight_reason="custom database name allow regex needs explicit confirmation"
    return 1
  fi

  if ! [[ "$db_name" =~ $allow_regex ]]; then
    preflight_reason="database name does not match allow regex"
    return 1
  fi

  case "$lowered_name" in
    *disposable*|*dry_run*|*dryrun*) ;;
    *)
      preflight_reason="database name must clearly indicate disposable or dry-run use"
      return 1
      ;;
  esac

  case "$db_user" in
    *[!A-Za-z0-9_@.-]*)
      preflight_reason="database user contains unsupported characters"
      return 1
      ;;
  esac

  preflight_reason="target passed redacted non-connecting safety preflight"
  return 0
}

emit_summary() {
  if [ "$output_format" = "json" ]; then
    local mode_json
    if [ -n "$mode" ]; then
      mode_json="\"$(json_escape "$mode")\""
    else
      mode_json="null"
    fi

    local json
    json="$(printf '{"path":"%s","exists":%s,"privatePath":%s,"mode":%s,"modeOk":%s,"gitIgnored":%s,"declared":%s,"placeholdersPresent":%s,"placeholderKeys":%s,"syntaxOk":%s,"syntaxReason":"%s","preflightOk":%s,"preflightReason":"%s","verdict":"%s","next":"%s"}\n' \
      "$(json_escape "$env_file_abs")" \
      "$(json_bool "$exists")" \
      "$(json_bool "$private_path")" \
      "$mode_json" \
      "$(json_bool "$mode_ok")" \
      "$(json_bool "$git_ignored")" \
      "$declared_json" \
      "$(json_bool "$placeholders_present")" \
      "$placeholder_keys_json" \
      "$(json_bool "$syntax_ok")" \
      "$(json_escape "$syntax_reason")" \
      "$(json_bool "$preflight_ok")" \
      "$(json_escape "$preflight_reason")" \
      "$(json_escape "$verdict")" \
      "$(json_escape "$next")")"

    if [ -n "$output_path" ]; then
      printf '%s' "$json" >"$output_path"
    fi
    printf '%s' "$json"
    return
  fi

  printf 'PREPROD_REHEARSAL_ENV_STATUS\n'
  printf 'path=%s\n' "$env_file_abs"
  printf 'exists=%s\n' "$exists"

  if [ "$exists" = "yes" ]; then
    printf 'private_path=%s\n' "$private_path"
    printf 'mode=%s\n' "$mode"
    printf 'mode_ok=%s\n' "$mode_ok"
    printf 'git_ignored=%s\n' "$git_ignored"

    local name
    for name in "${required_names[@]}"; do
      if grep -q "\"$name\":true" <<<"$declared_json"; then
        printf 'declared.%s=yes\n' "$name"
      else
        printf 'declared.%s=no\n' "$name"
      fi
    done

    printf 'placeholders_present=%s\n' "$placeholders_present"
    if [ "${#placeholder_keys[@]}" -gt 0 ]; then
      local placeholder_keys_csv
      placeholder_keys_csv="$(IFS=,; printf '%s' "${placeholder_keys[*]}")"
      printf 'placeholder_keys=%s\n' "$placeholder_keys_csv"
    else
      printf 'placeholder_keys=none\n'
    fi
    printf 'syntax_ok=%s\n' "$syntax_ok"
    printf 'syntax_reason=%s\n' "$syntax_reason"
    printf 'preflight_ok=%s\n' "$preflight_ok"
    printf 'preflight_reason=%s\n' "$preflight_reason"
  fi

  printf 'verdict=%s\n' "$verdict"
  printf 'next=%s\n' "$next"
}

if [ ! -f "$env_file_abs" ]; then
  declared_json="{}"
  emit_summary
  exit 0
fi

exists="yes"

case "$env_file_abs" in
  "$root/.codex/private/"*|"$root/project-ledger/private/"*)
    private_path="yes"
    ;;
  *)
    private_path="no"
    ;;
esac

mode="$(stat --printf=%a "$env_file_abs")"
if [ "$mode" = "600" ]; then
  mode_ok="yes"
else
  mode_ok="no"
fi

if git -C "$root" check-ignore -q "$env_file_abs"; then
  git_ignored="yes"
else
  git_ignored="no"
fi

missing=0
declared_args=()
for name in "${required_names[@]}"; do
  if grep -Eq "^[[:space:]]*(export[[:space:]]+)?${name}=" "$env_file_abs"; then
    declared_args+=("$name=true")
  else
    declared_args+=("$name=false")
    missing=1
  fi
done
declared_json="{"
for entry in "${declared_args[@]}"; do
  name="${entry%%=*}"
  value="${entry#*=}"
  if [ "$declared_json" != "{" ]; then
    declared_json+=","
  fi
  declared_json+="\"$(json_escape "$name")\":$value"
done
declared_json+="}"

for name in "${codex_preprod_env_allowed_names[@]}"; do
  if value="$(extract_env_value "$name")"; then
    case "$value" in
      *replace-with*|*placeholder*|*YYYYMMDD*|*preprod-host.example*)
        placeholder_keys+=("$name")
        ;;
    esac
  fi
done
placeholder_keys_json="$(json_string_array "${placeholder_keys[@]}")"

if [ "${#placeholder_keys[@]}" -gt 0 ]; then
  placeholders_present="yes"
  placeholder_ready=0
else
  placeholders_present="no"
  placeholder_ready=1
fi

if validate_private_env_syntax; then
  syntax_ok="yes"
else
  syntax_ok="no"
fi

if [ "$syntax_ok" != "yes" ]; then
  preflight_reason="$syntax_reason"
elif [ "$missing" != "0" ]; then
  preflight_reason="preflight skipped because required declarations are missing"
elif [ "$placeholder_ready" != "1" ]; then
  preflight_reason="preflight skipped because placeholders are still present"
elif run_redacted_preflight; then
  preflight_ok="yes"
else
  preflight_ok="no"
fi

if [ "$mode" = "600" ] &&
  git -C "$root" check-ignore -q "$env_file_abs" &&
  [ "$missing" = "0" ] &&
  [ "$placeholder_ready" = "1" ] &&
  [ "$syntax_ok" = "yes" ] &&
  [ "$preflight_ok" = "yes" ]; then
  verdict="READY_TO_VALIDATE"
  next="run from-env validate, then run only with a disposable preprod DB"
else
  verdict="NOT_READY"
  next="fill placeholders, pass redacted preflight, and keep mode 600 under .codex/private or project-ledger/private"
fi

emit_summary
