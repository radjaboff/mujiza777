#!/bin/sh
set -eu

if [ "$DB_USERNAME" = "$POSTGRES_USER" ]; then
  echo "DB_USERNAME must be different from DB_SUPERUSER" >&2
  exit 1
fi

psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  --set=ON_ERROR_STOP=1 \
  --set=app_user="$DB_USERNAME" \
  --set=app_password="$DB_PASSWORD" <<'SQL'
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'app_user', :'app_password') \gexec
SELECT format('ALTER DATABASE %I OWNER TO %I', current_database(), :'app_user') \gexec
SQL
