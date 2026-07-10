# =========================================================
# EqualSite Monorepo Makefile
# =========================================================

.DEFAULT_GOAL := help

DOCKER := docker compose

# =========================================================
# Help
# =========================================================

.PHONY: help

help: ## Show available commands
	@echo ""
	@echo "EqualSite Monorepo Commands"
	@echo "==========================="
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z0-9_-]+:.*##/ { printf "  \033[36m%-24s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""

# =========================================================
# Core Docker
# =========================================================

up: ## Start all containers
	$(DOCKER) up -d

build: ## Build and start containers
	$(DOCKER) up -d --build

down: ## Stop all containers
	$(DOCKER) down

restart: ## Restart all containers
	$(DOCKER) restart

logs: ## Tail all container logs
	$(DOCKER) logs -f

ps: ## Show running containers
	$(DOCKER) ps

destroy: ## Stop containers and remove volumes
	$(DOCKER) down -v

prune: ## Remove unused docker resources
	docker system prune -af

# =========================================================
# Shell Access
# =========================================================

shell: ## Open Laravel container shell
	$(DOCKER) exec web bash

crawler-shell: ## Open crawler container shell
	$(DOCKER) exec crawler bash

mysql-shell: ## Open MySQL container shell
	$(DOCKER) exec mysql bash

redis-shell: ## Open Redis container shell
	$(DOCKER) exec redis sh

# =========================================================
# Laravel Commands
# =========================================================

tinker: ## Enter artisan tinker
	$(DOCKER) exec web php artisan tinker

artisan: ## Run artisan command (usage: make artisan cmd="migrate")
	$(DOCKER) exec web php artisan $(cmd)

migrate: ## Run database migrations
	$(DOCKER) exec web php artisan migrate

fresh: ## Fresh migrate with seed
	$(DOCKER) exec web php artisan migrate:fresh --seed

seed: ## Seed database
	$(DOCKER) exec web php artisan db:seed

rollback: ## Rollback migrations
	$(DOCKER) exec web php artisan migrate:rollback

test: ## Run Laravel tests
	$(DOCKER) exec web php artisan test

queue: ## Start Horizon
	$(DOCKER) exec web php artisan horizon

queue-work: ## Run Laravel queue worker
	$(DOCKER) exec web php artisan queue:work

pint: ## Run Laravel Pint formatter
	$(DOCKER) exec web ./vendor/bin/pint

# =========================================================
# Lint Helpers
# =========================================================

lint-fix: ## Run eslint with auto-fix
	pnpm lint --fix

web-lint-fix: ## Fix web app lint issues
	pnpm --filter @equalsite/web lint --fix

crawler-lint-fix: ## Fix crawler lint issues
	pnpm --filter @equalsite/playwright-spider lint --fix

typecheck: ## Run TypeScript type checking
	pnpm turbo run typecheck

web-typecheck: ## Run web TypeScript type checking
	pnpm --filter @equalsite/web exec tsc --noEmit

crawler-typecheck: ## Run crawler TypeScript type checking
	pnpm --filter @equalsite/playwright-spider exec tsc --noEmit

# =========================================================
# Composer
# =========================================================

composer-exec: ## Execute composer command
	$(DOCKER) exec web composer $(cmd)

composer-require: ## Install new composer dependency
	@if [ -z "$(pkg)" ]; then \
		echo "Usage: make composer-require pkg=\"vendor/package\""; \
		exit 1; \
	fi
	$(DOCKER) exec web composer require $(pkg)

composer-remove: ## Remove composer dependency
	@if [ -z "$(pkg)" ]; then \
		echo "Usage: make composer-remove pkg=\"vendor/package\""; \
		exit 1; \
	fi
	$(DOCKER) exec web composer remove $(pkg)

composer-install: ## Install composer dependencies
	$(DOCKER) exec web composer install

composer-update: ## Update composer dependencies
	$(DOCKER) exec web composer Update

composer-dump: ## Dump composer autoload
	$(DOCKER) exec web composer dump-autoload

# =========================================================
# PNPM Workspace
# =========================================================

pnpm-install: ## Install pnpm workspace dependencies
	pnpm install

dev: ## Run all dev services through turbo
	pnpm dev

build-assets: ## Build all workspace assets
	pnpm build

lint: ## Run workspace linting
	pnpm lint

test-js: ## Run workspace tests
	pnpm test

# =========================================================
# Web App
# =========================================================

web-dev: ## Run web Vite dev server
	pnpm --filter @equalsite/web dev

web-build: ## Build web assets
	pnpm --filter @equalsite/web build

web-lint: ## Lint web app
	pnpm --filter @equalsite/web lint

# =========================================================
# Playwright Spider
# =========================================================

crawler-dev: ## Run crawler dev watcher
	pnpm --filter @equalsite/playwright-spider dev

crawler-pnpm: ## Add crawler dependency
	$(DOCKER) exec crawler-api pnpm $(cmd) --filter @equalsite/playwright-spider

crawler-build: ## Build crawler
	pnpm --filter @equalsite/playwright-spider build

crawler-test: ## Test crawler
	pnpm --filter @equalsite/playwright-spider test

crawler-lint: ## Lint crawler
	pnpm --filter @equalsite/playwright-spider lint

crawler-secret: ## Generate crawler secret env
	@SECRET=$$(openssl rand -hex 32); \
	if grep -q '^CRAWLER_SECRET=' .env; then \
		VALUE=$$(grep '^CRAWLER_SECRET=' .env | cut -d '=' -f2-); \
		if [ -z "$$VALUE" ]; then \
			sed -i "s|^CRAWLER_SECRET=.*|CRAWLER_SECRET=$$SECRET|" .env; \
			echo "Filled empty CRAWLER_SECRET"; \
		else \
			echo "CRAWLER_SECRET already exists"; \
		fi; \
	else \
		echo "\nCRAWLER_SECRET=$$SECRET" >> .env; \
		echo "Added CRAWLER_SECRET"; \
	fi

# =========================================================
# UI Package (Storybook)
# =========================================================

ui-storybook: ## Run Storybook dev server for @equalsite/ui
	pnpm --filter @equalsite/ui storybook

ui-build-storybook: ## Build static Storybook site for @equalsite/ui
	pnpm --filter @equalsite/ui build-storybook

ui-build: ## Build @equalsite/ui package
	pnpm --filter @equalsite/ui build

ui-lint: ## Lint @equalsite/ui
	pnpm --filter @equalsite/ui lintcheck

ui-typecheck: ## Typecheck @equalsite/ui
	pnpm --filter @equalsite/ui typecheck

# =========================================================
# Project Setup
# =========================================================

setup: ## Initial project setup
	cp .env.example .env || true
	pnpm install
	$(DOCKER) up -d --build
	sleep 10
	$(DOCKER) exec web composer install
	$(DOCKER) exec web php artisan key:generate
	$(DOCKER) exec web php artisan migrate
	crawler-secret

# =========================================================
# Helpers
# =========================================================

fix-permissions: ## Fix Laravel storage permissions
	sudo chmod -R 777 apps/web/storage
	sudo chmod -R 777 apps/web/bootstrap/cache

# =========================================================
# PHONY
# =========================================================

.PHONY: \
	crawler-secret \
	lint lint-fix \
	web-lint web-lint-fix \
	crawler-lint crawler-lint-fix \
	typecheck web-typecheck crawler-typecheck \
	help \
	up build down restart logs ps destroy prune \
	shell crawler-shell mysql-shell redis-shell \
	tinker artisan migrate fresh seed rollback test queue queue-work pint \
	composer-require composer-remove composer-install composer-update composer-dump \
	pnpm-install dev build-assets lint test-js \
	web-dev web-build web-lint \
	crawler-dev crawler-build crawler-test crawler-lint \
	ui-storybook ui-build-storybook ui-build ui-lint ui-typecheck \
	setup fix-permissions
