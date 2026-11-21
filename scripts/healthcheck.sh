#!/usr/bin/env bash
# ==============================================================================
# MUJIZA 777 — Production System Health Check
# Usage: ./scripts/healthcheck.sh
# ==============================================================================

set -euo pipefail

echo "========================================================================"
echo "MUJIZA 777 PRODUCTION HEALTH STATUS"
echo "Timestamp: $(date +'%Y-%m-%d %H:%M:%S %Z')"
echo "========================================================================"

echo ""
echo "--- 1. Container Status ---"
docker compose ps

echo ""
echo "--- 2. Backend Health Endpoint ---"
if curl -sf http://127.0.0.1:8081/actuator/health > /dev/null 2>&1; then
  echo "Backend (/actuator/health): [UP - OK]"
else
  echo "Backend (/actuator/health): [DOWN / UNHEALTHY]" >&2
fi

echo ""
echo "--- 3. Frontend Next.js Status ---"
if curl -sf -o /dev/null -w "%{http_code}" http://127.0.0.1:3000 | grep -q "200\|307\|308"; then
  echo "Frontend (port 3000): [UP - OK]"
else
  echo "Frontend (port 3000): [DOWN / UNHEALTHY]" >&2
fi

echo ""
echo "--- 4. Memory & Disk Space ---"
echo "Disk Space:"
df -h / | awk 'NR==1 || NR==2'

echo ""
echo "Memory:"
free -m 2>/dev/null || true

echo "========================================================================"
