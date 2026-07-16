# Migrating from Docker Desktop to native Docker Engine (Linux)

Status: **not yet done** — this is a runbook for a planned migration, written after
diagnosing a live bug. Follow it when you're ready to make the switch; nothing here
has been applied to the machine yet.

## Why

`apps/web` is bind-mounted into the `web` container (`compose.yaml`: `./apps/web:/var/www/html`).
On this machine that mount is currently served by **Docker Desktop**, which — even on
Linux — runs the daemon inside a QEMU/KVM VM (`linuxkit`) and shares the host filesystem
into that VM via `virtiofsd --cache=auto`. The bind mount is therefore host → virtiofs →
VM → container, not a direct host mount.

This was diagnosed by reproducing the failure directly (2026-07-17):

| Host write pattern | Container reflects it? |
|---|---|
| New file created | Yes, within ~5s |
| In-place edit, same inode (`>>` append) | Yes, within ~5s |
| **Write-to-temp + `mv` over the original (inode changes)** | **No — stuck on stale content indefinitely, confirmed past 30s, only fixed by `docker compose restart web`** |

Confirmed with inode numbers (`stat -c '%i'`): the rename changed the host inode, and the
container kept serving the pre-rename content from the old inode until the container was
restarted and virtiofs re-did its mount lookup.

This matters because **write-temp-then-rename is the standard atomic-save pattern** used
by most editors and file-editing tools (avoids partial writes) — so in practice almost
every backend code change looked like it wasn't taking effect, not just an occasional one.
This is a known limitation class of virtiofs's `cache=auto` mode (dentry/attribute cache
not reliably invalidated across a host-side unlink+rename), not a misconfiguration in this
repo's `compose.yaml`.

Native Docker Engine (`dockerd` installed directly on the host, no VM) uses real host
bind mounts with no virtualized file-sharing layer in between, which removes this class of
bug entirely.

## Before you start

- **This machine has Docker Desktop volumes for other projects, not just equalsite** —
  confirmed via `docker volume ls`: `auth_sail-*`, `chronos_sail-*`,
  `discord-webhook-adapter_sail-*`, `laravel-example_sail-*`, `rentgo_sail-*`,
  `resolved-pipelineoptions_sail-*`, `sw-web_sail-*`, `swipr_sail-*`, `taskforge_sail-*`,
  `teamfi-core_sail-*`, etc. All of that data lives inside Docker Desktop's VM disk
  (`~/.docker/desktop/vms/0/data/Docker.raw`). If you uninstall Docker Desktop before
  migrating volumes for those other projects too, that data is gone. Either migrate what
  you need from each project first, or keep Docker Desktop installed (just stopped) until
  you've confirmed you don't need anything else out of it.
- This guide only migrates **equalsite**'s two stateful named volumes:
  `equalsite_mysql-data` and `equalsite_redis-data`. `equalsite_crawler-node-modules` and
  `equalsite_crawler-service-node-modules` are disposable build caches — no migration
  needed, `docker compose up` recreates them.
- You'll be running two Docker installations side by side for part of this (Desktop stays
  installed until you verify the native engine works), so there's no point of no return
  until the "Uninstall Docker Desktop" step.

## Step 1 — Back up equalsite's stateful volumes

Run from the repo root, with the stack up:

```bash
docker compose exec mysql sh -c 'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --all-databases' \
  > /tmp/equalsite-mysql-backup.sql

mkdir -p /tmp/equalsite-redis-backup
docker run --rm -v equalsite_redis-data:/data -v /tmp/equalsite-redis-backup:/backup \
  alpine cp /data/dump.rdb /backup/dump.rdb 2>/dev/null || \
  echo "no redis dump.rdb present — Redis here is used as a cache/queue, not persisted state, this is expected"
```

Verify the SQL dump isn't empty before moving on: `wc -l /tmp/equalsite-mysql-backup.sql`.

## Step 2 — Install Docker Engine (native)

For Ubuntu 24.04 (`noble`), following Docker's official apt repo instructions:

```bash
# Remove any conflicting old packages (safe no-op if none are installed)
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do
  sudo apt-get remove -y $pkg
done

# Add Docker's official GPG key and apt repo
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

# Install the engine, CLI, containerd, buildx, and the compose plugin
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

## Step 3 — Post-install setup

```bash
# Run docker without sudo
sudo groupadd docker 2>/dev/null || true
sudo usermod -aG docker "$USER"
# Log out and back in (or `newgrp docker` for the current shell) for the group to take effect

# Start on boot
sudo systemctl enable --now docker

# Sanity check
docker run --rm hello-world
```

If `docker run hello-world` works without `sudo`, the group membership took effect.

## Step 4 — Point the Docker CLI at the native engine

Docker Desktop registered its own context (`desktop-linux`) pointing at its VM socket. The
native engine listens on the standard Unix socket, which the pre-existing `default`
context already points at:

```bash
docker context ls
docker context use default
docker info   # "Server:" section should now say the native engine, no "Docker Desktop 4.x" line
```

## Step 5 — Restore equalsite's data into the native engine

The native engine starts with no volumes of its own — `equalsite_mysql-data` etc. don't
exist yet under it. Bring the stack up once to create them, then restore:

```bash
cd /home/kinbasco/devs/equalsite
docker compose up -d mysql redis
# wait for mysql's healthcheck to pass
docker compose ps mysql

docker compose exec -T mysql sh -c 'exec mysql -uroot -p"$MYSQL_ROOT_PASSWORD"' \
  < /tmp/equalsite-mysql-backup.sql

# only if Step 1 produced a dump.rdb
docker compose stop redis
docker run --rm -v equalsite_redis-data:/data -v /tmp/equalsite-redis-backup:/backup \
  alpine cp /backup/dump.rdb /data/dump.rdb
docker compose start redis
```

## Step 6 — Rebuild and bring up the full stack

```bash
docker compose up -d --build
docker compose exec web php artisan migrate
docker compose exec web php artisan crawler:listen   # separate terminal — see CLAUDE.md, this isn't automatic
```

Vite still runs on the host per existing project convention (`pnpm --filter @equalsite/web dev`) — that's unrelated to this migration.

## Step 7 — Verify the bind-mount bug is actually gone

Repeat the rename test that originally reproduced the bug:

```bash
FILE="apps/web/app/Http/Controllers/Settings/BillingController.php"
cp "$FILE" "$FILE.bak"
cp "$FILE" "$FILE.tmp" && printf "\n// nativeengine-sync-check\n" >> "$FILE.tmp" && mv "$FILE.tmp" "$FILE"
sleep 1
docker compose exec -T web tail -c 40 /var/www/html/app/Http/Controllers/Settings/BillingController.php
mv "$FILE.bak" "$FILE"
```

Expect to see `nativeengine-sync-check` immediately, with no restart needed. If it shows up,
the migration fixed the actual problem; if it's still stale, something's still routing
through Desktop (check `docker context show`) and needs troubleshooting before going
further.

Also re-run the test suite to confirm nothing else broke:

```bash
docker compose exec web vendor/bin/pint --dirty --format agent
docker compose exec web php artisan test --compact
```

## Step 8 — Uninstall Docker Desktop (once you're confident)

Only do this once Step 7 passes and you've confirmed (per "Before you start") that any
other project's Desktop-only volumes have been dealt with.

```bash
docker desktop stop
sudo apt-get remove -y docker-desktop
rm -rf ~/.docker/desktop
```

## Rollback

Until Step 8, Docker Desktop is untouched and still installed — `docker context use
desktop-linux` switches the CLI back to it at any point if something in Steps 1–7 goes
wrong. After Step 8, rollback means reinstalling Docker Desktop from
https://docs.docker.com/desktop/setup/install/linux/ and restoring from the same backups
used in Step 5, this time going the other direction.

## Known gotchas

- **Registry credentials**: `~/.docker/config.json` may have `"credsStore": "desktop"`
  (Docker Desktop's credential helper). After switching, private-registry `docker login`
  may need to be redone; native installs typically use `pass` or plain `auth` entries
  instead.
- **Memory/CPU limits**: Docker Desktop's Settings → Resources UI for capping VM
  memory/CPU no longer applies — the native engine uses the host's resources directly.
  Nothing to configure to get this; just be aware `docker stats` now reflects real host
  usage.
- **VS Code / IDE Docker integration**: if the IDE's Docker extension is pinned to the
  `desktop-linux` context, it needs to be switched to `default` too, independently of the
  CLI's `docker context use`.
- **`ioredis`/BullMQ, Playwright, and other unrelated pinned versions** in this repo are
  unaffected by this migration — this only changes *how* the containers see the host
  filesystem, not anything about the app stack itself.
