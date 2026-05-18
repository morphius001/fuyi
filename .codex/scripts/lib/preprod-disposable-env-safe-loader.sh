#!/usr/bin/env bash

codex_preprod_env_required_names=(
  CODEX_PREPROD_DISPOSABLE_DATABASE_URL
  CODEX_PREPROD_DISPOSABLE_DB_CONFIRM
  CODEX_PREPROD_DISPOSABLE_DB_BACKUP_CONFIRM
  CODEX_PREPROD_DISPOSABLE_DB_OPERATOR
  CODEX_PREPROD_DISPOSABLE_DB_CLEANUP_OWNER
)

codex_preprod_env_allowed_names=(
  "${codex_preprod_env_required_names[@]}"
  CODEX_PREPROD_DISPOSABLE_WORKTREE_ACK
  CODEX_PREPROD_DISPOSABLE_DB_LOCALHOST_PREPROD_TUNNEL_CONFIRM
  CODEX_PREPROD_DISPOSABLE_DB_NAME_ALLOW_REGEX
  CODEX_PREPROD_DISPOSABLE_DB_NAME_ALLOW_REGEX_CONFIRM
  CODEX_PREPROD_REHEARSAL_OUTPUT_PATH
)

codex_preprod_env_is_allowed_name() {
  local candidate="$1"
  local allowed

  for allowed in "${codex_preprod_env_allowed_names[@]}"; do
    if [ "$candidate" = "$allowed" ]; then
      return 0
    fi
  done

  return 1
}

codex_preprod_env_trim_line() {
  local value="$1"
  value="${value%$'\r'}"
  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"
  printf '%s' "$value"
}

codex_preprod_env_strip_assignment_value() {
  local line="$1"
  line="$(codex_preprod_env_trim_line "$line")"

  case "$line" in
    export[[:space:]]*)
      line="${line#export}"
      line="$(codex_preprod_env_trim_line "$line")"
      ;;
  esac

  line="${line#*=}"
  line="$(codex_preprod_env_trim_line "$line")"

  case "$line" in
    \"*\")
      line="${line#\"}"
      line="${line%\"}"
      ;;
    \'*\')
      line="${line#\'}"
      line="${line%\'}"
      ;;
  esac

  printf '%s' "$line"
}

codex_preprod_env_validate_syntax() {
  local env_file_abs="$1"
  local reason_var="${2:-}"
  local line
  local trimmed
  local assignment
  local name
  local reason="private env syntax passed safe assignment whitelist"

  while IFS= read -r line || [ -n "$line" ]; do
    trimmed="$(codex_preprod_env_trim_line "$line")"

    case "$trimmed" in
      ""|\#*)
        continue
        ;;
      export[[:space:]]*)
        assignment="${trimmed#export}"
        assignment="$(codex_preprod_env_trim_line "$assignment")"
        ;;
      *)
        assignment="$trimmed"
        ;;
    esac

    case "$assignment" in
      *=*)
        name="${assignment%%=*}"
        ;;
      *)
        reason="private env file contains unsupported non-assignment line"
        [ -n "$reason_var" ] && printf -v "$reason_var" '%s' "$reason"
        return 1
        ;;
    esac

    if ! [[ "$name" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
      reason="private env file contains unsupported assignment name: $name"
      [ -n "$reason_var" ] && printf -v "$reason_var" '%s' "$reason"
      return 1
    fi

    if ! codex_preprod_env_is_allowed_name "$name"; then
      reason="private env file contains unsupported env name: $name"
      [ -n "$reason_var" ] && printf -v "$reason_var" '%s' "$reason"
      return 1
    fi
  done <"$env_file_abs"

  [ -n "$reason_var" ] && printf -v "$reason_var" '%s' "$reason"
  return 0
}

codex_preprod_env_extract_value() {
  local env_file_abs="$1"
  local name="$2"
  local line

  line="$(grep -E "^[[:space:]]*(export[[:space:]]+)?${name}=" "$env_file_abs" | tail -n 1 || true)"
  [ -n "$line" ] || return 1
  codex_preprod_env_strip_assignment_value "$line"
}
