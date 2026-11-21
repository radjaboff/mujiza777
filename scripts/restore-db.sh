#!/usr/bin/env bash
# ==============================================================================
# MUJIZA 777 — Production PostgreSQL Restore Script
# Usage: ./scripts/restore-db.sh <path_to_backup_file.dump>
# ==============================================================================

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <path_to_backup.dump>"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "[ERROR] Backup file not found: ${BACKUP_FILE}" >&2
  exit 1
fi

# Source .env if present
if [ -f .env ]; then
  # shellcheck disable=SC2046
  export $(grep -v '^#' .env | xargs)
fi

DB_NAME="${DB_NAME:-mujiza_db}"
DB_USER="${DB_SUPERUSER:-postgres}"

echo "========================================================================"
echo "WARNING: YOU ARE ABOUT TO RESTORE THE DATABASE '${DB_NAME}'"
echo "FROM BACKUP: ${BACKUP_FILE}"
echo "ALL CURRENT DATA IN '${DB_NAME}' WILL BE OVERWRITTEN!"
echo "========================================================================"
read -r -p "Are you sure you want to proceed? Type 'RESTORE_NOW' to confirm: " CONFIRMATION

if [ "${CONFIRMATION}" != "RESTORE_NOW" ]; then
  echo "Restore cancelled by user."
  exit 0
fi

echo "[INFO] Terminating active database connections..."
docker compose exec -T postgres psql -U "${DB_USER}" -d postgres -c "
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();
" || true

echo "[INFO] Restoring database from dump..."
docker compose exec -T postgres pg_restore -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists --no-owner --no-privileges --exit-on-error < "${BACKUP_FILE}"
RESTORE_STATUS=$?

if [ ${RESTORE_STATUS} -ne 0 ]; then
  echo "[ERROR] Database restoration failed with exit code ${RESTORE_STATUS}!" >&2
  exit ${RESTORE_STATUS}
fi

echo "[INFO] Running VACUUM ANALYZE for query plan optimization..."
docker compose exec -T postgres psql -U "${DB_USER}" -d "${DB_NAME}" -c "VACUUM ANALYZE;"

echo "[SUCCESS] Database restoration completed successfully!"
