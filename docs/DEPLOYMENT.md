# Production deploy

## What this Compose stack provides

- PostgreSQL 16 with a persistent volume and startup health check.
- Spring Boot in the `prod` profile. The backend and database have no public host ports.
- Next.js, with `/api/*` streamed through its proxy route and `/uploads/*` reverse proxied to the backend over the private Compose network.
- Caddy on ports 80 and 443 for automatic HTTPS. SSE is proxied through the same public origin.
- Persistent database, local uploads, and TLS certificate volumes.
- Next.js 15.5.29 with React 19 and Node.js 24 LTS; the frontend runtime and framework are pinned to supported, patched versions.

## First deployment

1. Point the apex and `www` DNS A/AAAA records to the server. Allow inbound TCP 80/443 (and optionally UDP 443) in the firewall.
2. Install Docker Engine with the Compose plugin and clone/copy the project to the server.
3. Copy `.env.example` to `.env`. Set the real domain and matching public URLs. Generate unique secrets, for example `openssl rand -base64 48`, for `DB_ADMIN_PASSWORD`, `DB_PASSWORD`, and `JWT_SECRET`; choose a unique `ADMIN_PASSWORD`. Do not use example values in production. `DB_SUPERUSER` is only used by the database container; the backend connects as the restricted `DB_USERNAME` role.
4. Set `CORS_ALLOWED_ORIGINS` to the real browser origins. It must not contain localhost in production.
5. Start the stack with `docker compose up -d --build` and follow startup with `docker compose logs -f postgres backend frontend caddy`.
6. Open `https://<PUBLIC_DOMAIN>/` and sign in to `/admin`. Change the initial admin password after first login.

On a fresh PostgreSQL volume, the init script creates the restricted app role and grants it database ownership so Flyway can manage the schema. Changing this initialization later does not alter an existing PostgreSQL volume; migrate roles manually before deploying that change to a populated database. The first backend start applies Flyway migrations. Keep the PostgreSQL volume and back it up before upgrades. `docker compose down -v` deletes the database and uploaded files; do not use `-v` for routine deploys.

## Capacity and scaling

The checked-in values (`DB_POOL_MAX=20`, 100 Tomcat request threads, 2,000 queued notification tasks and bounded image processing) are a conservative single-node starting point, not a promise of 1,000 simultaneous checkouts. Capacity depends on server CPU/RAM, database storage, request mix, network latency, image traffic, and the external Telegram/S3 services. The order phone lock intentionally serializes order creation for the same phone; unrelated customers can proceed in parallel, subject to database capacity.

Before announcing capacity, run a load test against a staging copy with realistic catalog data and PostgreSQL. Include concurrent checkout/idempotency, product reads, SSE connections, uploads, and slow downstream services; monitor p95/p99 latency, error rate, CPU, heap/GC, DB pool wait time, and PostgreSQL locks. Increase pool/thread limits only after measurement. The current rate limiter and SSE registry are per backend process; if you add backend replicas, move rate limiting to a shared store and provide shared SSE/event delivery. Use S3/R2 for media in a multi-instance deployment.

CI runs H2 unit/application tests, a separate production-profile smoke test against PostgreSQL (including Flyway and advisory-lock SQL), plus frontend typecheck and build. CI does not replace staging load tests or production backups/monitoring.
