#!/usr/bin/env bash
# deploy.sh — Build locally and deploy standalone bundle to EC2
# Usage: ./deploy.sh
# Optional: SKIP_BUILD=1 ./deploy.sh

set -euo pipefail

EC2_HOST="ec2-13-53-175-145.eu-north-1.compute.amazonaws.com"
EC2_USER="ubuntu"
APP_DIR="/var/www/devamitkumar"
PEM_KEY="${HOME}/.ssh/jaipurfedora.pem"
APP_NAME="iamamitkumar"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-https://iamamitkumar.dev}"
HEALTHCHECK_ATTEMPTS="${HEALTHCHECK_ATTEMPTS:-5}"
HEALTHCHECK_DELAY_SECONDS="${HEALTHCHECK_DELAY_SECONDS:-3}"
BACKUP_KEEP_COUNT="${BACKUP_KEEP_COUNT:-5}"
DEPLOY_ID="$(date -u +%Y%m%d%H%M%S)"
BACKUP_ROOT="${APP_DIR}/.deploy-backups"
BACKUP_DIR="${BACKUP_ROOT}/${DEPLOY_ID}"

SSH_OPTS=(
  -i "${PEM_KEY}"
  -o StrictHostKeyChecking=accept-new
)

RSYNC_SSH="ssh ${SSH_OPTS[*]}"

require_command() {
  local cmd="$1"
  if ! command -v "${cmd}" >/dev/null 2>&1; then
    echo "❌ Missing required command: ${cmd}" >&2
    exit 1
  fi
}

run_remote() {
  ssh "${SSH_OPTS[@]}" "${EC2_USER}@${EC2_HOST}" "$@"
}

restart_remote_pm2() {
  run_remote bash <<'REMOTE'
set -euo pipefail
APP_DIR="/var/www/devamitkumar"
APP_NAME="iamamitkumar"
cd "${APP_DIR}"
mkdir -p logs

if ! command -v pm2 >/dev/null 2>&1; then
  echo "❌ pm2 is not installed on server." >&2
  exit 1
fi

if pm2 describe "${APP_NAME}" >/dev/null 2>&1; then
  pm2 restart "${APP_NAME}" --update-env
else
  pm2 start ecosystem.config.js
  pm2 save
fi

pm2 status "${APP_NAME}"
REMOTE
}

run_health_check() {
  echo "▶ Running post-deploy health check..."
  for i in $(seq 1 "${HEALTHCHECK_ATTEMPTS}"); do
    if curl -fsS --max-time 10 "${HEALTHCHECK_URL}" >/dev/null; then
      echo "✅ Health check passed at ${HEALTHCHECK_URL}"
      return 0
    fi
    echo "  Health check attempt ${i}/${HEALTHCHECK_ATTEMPTS} failed; retrying in ${HEALTHCHECK_DELAY_SECONDS}s..."
    sleep "${HEALTHCHECK_DELAY_SECONDS}"
  done
  return 1
}

prepare_remote_backup() {
  echo "▶ Creating remote rollback backup: ${BACKUP_DIR}"
  run_remote "APP_DIR='${APP_DIR}' BACKUP_ROOT='${BACKUP_ROOT}' BACKUP_DIR='${BACKUP_DIR}' BACKUP_KEEP_COUNT='${BACKUP_KEEP_COUNT}' bash -s" <<'REMOTE'
set -euo pipefail
mkdir -p "${BACKUP_DIR}"

if [[ -d "${APP_DIR}/.next" ]]; then
  rsync -a --delete "${APP_DIR}/.next/" "${BACKUP_DIR}/.next/"
fi

if [[ -d "${APP_DIR}/public" ]]; then
  rsync -a --delete "${APP_DIR}/public/" "${BACKUP_DIR}/public/"
fi

for file in server.js package.json pnpm-lock.yaml ecosystem.config.js; do
  if [[ -f "${APP_DIR}/${file}" ]]; then
    cp -a "${APP_DIR}/${file}" "${BACKUP_DIR}/${file}"
  fi
done

mkdir -p "${BACKUP_ROOT}"
mapfile -t backups < <(find "${BACKUP_ROOT}" -mindepth 1 -maxdepth 1 -type d | sort)
if (( ${#backups[@]} > BACKUP_KEEP_COUNT )); then
  remove_count=$(( ${#backups[@]} - BACKUP_KEEP_COUNT ))
  for old_backup in "${backups[@]:0:remove_count}"; do
    rm -rf -- "${old_backup}"
  done
fi
REMOTE
}

rollback_remote() {
  echo "⚠ Restoring previous release from backup: ${BACKUP_DIR}"
  run_remote "APP_DIR='${APP_DIR}' BACKUP_DIR='${BACKUP_DIR}' bash -s" <<'REMOTE'
set -euo pipefail

if [[ ! -d "${BACKUP_DIR}" ]]; then
  echo "❌ Rollback backup not found: ${BACKUP_DIR}" >&2
  exit 1
fi

mkdir -p "${APP_DIR}" "${APP_DIR}/.next" "${APP_DIR}/public" "${APP_DIR}/logs"

if [[ -d "${BACKUP_DIR}/.next" ]]; then
  rsync -a --delete "${BACKUP_DIR}/.next/" "${APP_DIR}/.next/"
fi

if [[ -d "${BACKUP_DIR}/public" ]]; then
  rsync -a --delete "${BACKUP_DIR}/public/" "${APP_DIR}/public/"
fi

for file in server.js package.json pnpm-lock.yaml ecosystem.config.js; do
  if [[ -f "${BACKUP_DIR}/${file}" ]]; then
    cp -a "${BACKUP_DIR}/${file}" "${APP_DIR}/${file}"
  fi
done
REMOTE

  restart_remote_pm2
}

echo "▶ Running deploy preflight checks..."
require_command pnpm
require_command rsync
require_command ssh
require_command curl

if [[ ! -f "${PEM_KEY}" ]]; then
  echo "❌ SSH key not found: ${PEM_KEY}" >&2
  exit 1
fi

if [[ "${SKIP_BUILD:-0}" != "1" ]]; then
  echo "▶ Type-checking before deploy..."
  pnpm exec tsc --noEmit

  echo "▶ Building Next.js production standalone bundle locally..."
  pnpm build
else
  echo "⚠ SKIP_BUILD=1 set, skipping local checks and build."
fi

if [[ ! -f ".next/standalone/server.js" ]]; then
  echo "❌ Missing standalone build artifact: .next/standalone/server.js" >&2
  exit 1
fi

echo "▶ Verifying SSH access to ${EC2_USER}@${EC2_HOST}..."
run_remote "echo 'SSH OK'"

echo "▶ Ensuring remote app directories exist..."
run_remote "mkdir -p '${APP_DIR}/.next'"

prepare_remote_backup

echo "▶ Syncing standalone server bundle..."
rsync -avz --delete \
  --exclude '.env' \
  --exclude '.env.*' \
  --exclude '.deploy-backups/' \
  --exclude 'logs/' \
  --exclude 'public/' \
  -e "${RSYNC_SSH}" \
  .next/standalone/ \
  "${EC2_USER}@${EC2_HOST}:${APP_DIR}/"

echo "▶ Syncing static assets..."
rsync -avz --delete \
  -e "${RSYNC_SSH}" \
  public/ \
  "${EC2_USER}@${EC2_HOST}:${APP_DIR}/public/"

echo "▶ Syncing Next.js static files..."
rsync -avz --delete \
  --exclude '*.map' \
  -e "${RSYNC_SSH}" \
  .next/static/ \
  "${EC2_USER}@${EC2_HOST}:${APP_DIR}/.next/static/"

echo "▶ Removing any existing client source maps from server..."
run_remote "find '${APP_DIR}/.next/static' -type f -name '*.map' -delete || true"

echo "▶ Syncing runtime metadata and process config..."
rsync -avz \
  -e "${RSYNC_SSH}" \
  package.json pnpm-lock.yaml ecosystem.config.js deploy.sh push-env.sh \
  "${EC2_USER}@${EC2_HOST}:${APP_DIR}/"

echo "▶ Hardening env file permissions on server..."
run_remote "if [[ -f '${APP_DIR}/.env' ]]; then chmod 600 '${APP_DIR}/.env'; fi"

echo "▶ Restarting PM2 process..."
restart_remote_pm2

if run_health_check; then
  echo "✅ Deploy completed professionally."
  exit 0
fi

echo "❌ Deploy failed health check at ${HEALTHCHECK_URL}; initiating rollback..." >&2
rollback_remote

if run_health_check; then
  echo "⚠ Rollback completed and service health is restored."
  exit 1
fi

echo "❌ Rollback attempted but health check is still failing. Manual intervention required." >&2
exit 1
