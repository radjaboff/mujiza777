#!/usr/bin/env bash
# ==============================================================================
# MUJIZA 777 — Production PostgreSQL Automated Backup Script
# Usage: ./scripts/backup-db.sh
# Cron example (every night at 03:00):
# 0 3 * * * cd /opt/mujiza && ./scripts/backup-db.sh >> /var/log/mujiza-backup.log 2>&1
# ==============================================================================

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/mujiza_db_${TIMESTAMP}.dump"

mkdir -p "${BACKUP_DIR}"

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Starting automated database backup..."

# Source .env if present
if [ -f .env ]; then
  # shellcheck disable=SC2046
  export $(grep -v '^#' .env | xargs)
fi

DB_NAME="${DB_NAME:-mujiza_db}"
DB_USER="${DB_SUPERUSER:-postgres}"

# Check if Docker compose is running
if docker compose ps --services --filter "status=running" | grep -q "postgres"; then
  echo "[INFO] Running pg_dump inside Docker container 'postgres'..."
  docker compose exec -T postgres pg_dump -U "${DB_USER}" -d "${DB_NAME}" -Fc -Z 6 > "${BACKUP_FILE}"
else
  echo "[INFO] Running local pg_dump..."
  pg_dump -U "${DB_USER}" -d "${DB_NAME}" -Fc -Z 6 -f "${BACKUP_FILE}"
fi

# Verify backup integrity
if [ -s "${BACKUP_FILE}" ]; then
  FILE_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
  echo "[SUCCESS] Backup created successfully: ${BACKUP_FILE} (${FILE_SIZE})"
else
  echo "[ERROR] Backup file is empty or was not created!" >&2
  exit 1
fi

# Rotate backups older than RETENTION_DAYS
echo "[INFO] Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "mujiza_db_*.dump" -type f -mtime +"${RETENTION_DAYS}" -exec rm -f {} +

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Backup completed successfully."
