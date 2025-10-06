#!/usr/bin/env bash

set -euo pipefail

# ==== CONFIG ====
ENV_FILE=".env"
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "unknown/repo")

# ==== COLORS ====
bold=$(tput bold)
normal=$(tput sgr0)
green=$(tput setaf 2)
red=$(tput setaf 1)
yellow=$(tput setaf 3)
blue=$(tput setaf 4)

# ==== UTILS ====
function log() {
  echo "${green}✔${normal} $*"
}

function warn() {
  echo "${yellow}⚠${normal} $*"
}

function err() {
  echo "${red}✘${normal} $*"
}

function title() {
  echo -e "\n${bold}${blue}🔐 $*${normal}\n"
}

function help() {
  cat <<EOF
${bold}GitHub Secrets Manager${normal}

Usage:
  ./manage-secrets.sh [command]

Commands:
  ${bold}add${normal}           Add secrets from ${ENV_FILE} to ${REPO}
  ${bold}list${normal}          List all secrets in the repository
  ${bold}delete <key...>${normal}  Delete specific secret(s)
  ${bold}delete --all${normal}  Delete all secrets
  ${bold}sync${normal}          Delete all secrets, then add from ${ENV_FILE}
  ${bold}help${normal}          Show this help message

Examples:
  ./manage-secrets.sh add
  ./manage-secrets.sh list
  ./manage-secrets.sh delete DB_USER DB_PASS
  ./manage-secrets.sh delete --all
  ./manage-secrets.sh sync
EOF
}

# ==== CORE ====
function add_secrets() {
  if [[ ! -f "$ENV_FILE" ]]; then
    err "ENV file '$ENV_FILE' not found."
    exit 1
  fi

  title "Adding secrets from $ENV_FILE to $REPO"

while IFS='=' read -r key value; do
  [[ -z "$key" || "$key" =~ ^# || ! "$key" =~ ^[A-Z0-9_]+$ ]] && continue

  # Handle multiline quoted values
  if [[ "$value" =~ ^\" ]]; then
    value="${value#\"}"  # remove opening quote
    while ! [[ "$value" =~ \"$ ]]; do
      read -r next_line || break
      value+=$'\n'"$next_line"
    done
    value="${value%\"}"  # remove closing quote
  fi

  log "Adding $key"
  gh secret set "$key" --repo "$REPO" --body "$value"
done < "$ENV_FILE"

}

function list_secrets() {
  title "Listing secrets in $REPO"
  gh secret list --repo "$REPO"
}

function delete_secret() {
  local key=$1
  log "Deleting $key"
  gh secret delete "$key" --repo "$REPO" || warn "Failed to delete $key"
}

function delete_secrets() {
  shift
  for key in "$@"; do
    delete_secret "$key"
  done
}

function delete_all_secrets() {
  title "Deleting all secrets from $REPO"
  mapfile -t secrets < <(gh secret list --repo "$REPO" --json name -q '.[].name')
  if [[ ${#secrets[@]} -eq 0 ]]; then
    warn "No secrets found."
    return
  fi
  for secret in "${secrets[@]}"; do
    delete_secret "$secret"
  done
}

function sync_secrets() {
  delete_all_secrets
  add_secrets
}

# ==== ENTRYPOINT ====
case "${1:-}" in
  add)
    add_secrets
    ;;
  list)
    list_secrets
    ;;
  delete)
    shift
    if [[ "${1:-}" == "--all" ]]; then
      delete_all_secrets
    else
      delete_secrets "$@"
    fi
    ;;
  sync)
    sync_secrets
    ;;
  help|-h|--help)
    help
    ;;
  *)
    err "Invalid or missing command."
    help
    exit 1
    ;;
esac
