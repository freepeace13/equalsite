# Server bootstrap & first deploy

One-time steps to take a fresh Ubuntu 24.04 Vultr instance to a running
Equalsite production stack. See `docs/deployment.md` for the architecture
this implements.

## 1. DNS

Before touching the server, point two DNS records at its IP (Cloudflare,
DNS-only/grey-cloud to start — switch the app record to proxied/orange-cloud
once TLS is confirmed working, per `docs/deployment.md` §5):

- `app.example.com` → A record → server IP
- `ws.example.com` → A record → server IP

## 2. Install Docker Engine

SSH into the box as the Vultr-provided user, then:

    sudo apt-get update
    sudo apt-get install -y ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo usermod -aG docker $USER

Note: this stack's `.env` relies on nested variable interpolation
(`APP_URL=https://${APP_DOMAIN}`), which requires Docker Compose **v2.24.0
or newer**. The steps above install the latest version from Docker's own
apt repo, which satisfies this — but if you provision Docker a different
way, confirm with `docker compose version` before proceeding.

Log out and back in for the group change to take effect, then verify:

    docker run --rm hello-world

## 3. Firewall

    sudo apt-get install -y ufw
    sudo ufw allow OpenSSH
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw --force enable
    sudo ufw status

## 4. Clone the repo and configure secrets

    git clone <repo-url> equalsite
    cd equalsite
    cp .env.production.example .env

Edit `.env` and fill in every blank value:

- `APP_DOMAIN` / `SOKETI_DOMAIN` — the two domains from step 1
- `APP_KEY` — generate on any machine with the repo checked out:
  `php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"`
- `DB_PASSWORD` — `openssl rand -base64 32`
- `CRAWLER_SECRET` — `openssl rand -hex 32`
- `PUSHER_APP_KEY` / `PUSHER_APP_SECRET` — `openssl rand -hex 16` each
- Backblaze B2: create a bucket + application key in the B2 dashboard,
  fill `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET`,
  `AWS_ENDPOINT` (the bucket's S3-compatible endpoint, e.g.
  `https://s3.us-west-004.backblazeb2.com`)
- Resend: create an API key in the Resend dashboard, set `MAIL_PASSWORD`
  to it
- Leave `PADDLE_*` blank / `PADDLE_SANDBOX=true` until the Paddle vendor
  account is live (`docs/monetization.md` §4) — billing isn't required
  for the stack to come up

## 5. Build and start

    docker compose -f compose.prod.yaml build
    docker compose -f compose.prod.yaml up -d
    docker compose -f compose.prod.yaml ps

Expected: every service shows `Up` (or `Up (healthy)` for the ones with a
healthcheck — `web`, `crawler-api`, `mysql`, `redis`). If `web`, `horizon`,
or `crawler-listen` crash-loop, check `docker compose -f compose.prod.yaml
logs web` first — the most likely cause at this stage is a missing/blank
`.env` value from step 4.

## 6. First-time database setup

    docker compose -f compose.prod.yaml exec web php artisan migrate --force

## 7. Verify end-to-end

- `curl -I https://app.example.com/up` → expect `HTTP/2 200` (confirms
  Caddy issued a TLS cert and is proxying to `web`)
- Open `https://app.example.com` in a browser, register an account,
  confirm the verification email arrives (Resend)
- Submit a URL for an audit, confirm progress updates appear live in the
  browser (confirms `crawler-api` → Redis Stream → `crawler-listen` →
  Soketi → `wss://ws.example.com` is wired end to end)
- `docker compose -f compose.prod.yaml logs horizon --tail 50` → confirm
  no repeated connection errors, and that the audit's queued jobs
  (`ProcessAuditArtifacts` etc.) show as processed

If live progress doesn't reach the browser but the audit still completes,
check the WebSocket connection specifically per `docs/deployment.md` §5 —
Cloudflare's free tier does support WS, but proxied (orange-cloud) mode is
the first thing to rule out if `ws.example.com` misbehaves; fall back to
DNS-only (grey-cloud) for that hostname if so.
