# syntax=docker/dockerfile:1

FROM composer:2 AS composer-deps
WORKDIR /app
COPY apps/web/composer.json apps/web/composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --optimize-autoloader --ignore-platform-reqs
COPY apps/web ./
RUN composer dump-autoload --optimize --no-dev
RUN php artisan wayfinder:generate --with-form


FROM node:24-bookworm AS frontend-build
WORKDIR /workspace

RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

# The @laravel/vite-plugin-wayfinder Vite plugin unconditionally shells out to
# `php artisan wayfinder:generate` during `vite build`. This stage has no PHP
# runtime; the actual generation happens in the composer-deps stage (which has
# PHP 8.5 CLI via the composer:2 base image plus a full vendor/ install) and its
# output is copied in below. This stub makes the plugin's build-time invocation
# a harmless no-op instead of a hard failure.
RUN printf '#!/bin/sh\nexit 0\n' > /usr/local/bin/php && chmod +x /usr/local/bin/php

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/tsconfig/package.json ./packages/tsconfig/package.json

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY packages/types ./packages/types
COPY packages/ui ./packages/ui
COPY packages/tsconfig ./packages/tsconfig
COPY apps/web ./apps/web
COPY --from=composer-deps /app/resources/js/actions ./apps/web/resources/js/actions
COPY --from=composer-deps /app/resources/js/routes ./apps/web/resources/js/routes
COPY --from=composer-deps /app/resources/js/wayfinder ./apps/web/resources/js/wayfinder

ARG VITE_APP_NAME
ARG VITE_PUSHER_APP_KEY
ARG VITE_PUSHER_HOST
ARG VITE_PUSHER_PORT
ARG VITE_PUSHER_SCHEME
ENV VITE_APP_NAME=$VITE_APP_NAME \
    VITE_PUSHER_APP_KEY=$VITE_PUSHER_APP_KEY \
    VITE_PUSHER_HOST=$VITE_PUSHER_HOST \
    VITE_PUSHER_PORT=$VITE_PUSHER_PORT \
    VITE_PUSHER_SCHEME=$VITE_PUSHER_SCHEME

RUN pnpm --filter @equalsite/types build && pnpm --filter @equalsite/ui build
RUN pnpm --filter @equalsite/web build


FROM php:8.5-fpm-bookworm AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
        nginx supervisor curl gosu \
        libpq-dev libzip-dev libicu-dev libonig-dev \
    && docker-php-ext-install pdo_mysql bcmath intl zip pcntl \
    && pecl install redis && docker-php-ext-enable redis \
    && apt-get purge -y --auto-remove libpq-dev libzip-dev libicu-dev libonig-dev \
    && apt-get install -y --no-install-recommends libzip4 \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /run/php /var/log/supervisor

RUN groupadd www && useradd -ms /bin/bash --no-user-group -g www www

# Debian's default nginx.conf runs worker processes as www-data, but the
# php-fpm socket below is owned by www:www (mode 0660) to match the pool's
# `user`/`group` and the gosu-run artisan commands in start-container. Align
# nginx's worker user with that instead of pulling in the unrelated
# www-data user, or nginx can't connect to the socket (502 Bad Gateway).
RUN sed -i 's/^user www-data;/user www;/' /etc/nginx/nginx.conf

WORKDIR /var/www/html

COPY --from=composer-deps --chown=www:www /app /var/www/html
COPY --from=frontend-build --chown=www:www /workspace/apps/web/public/build /var/www/html/public/build

COPY apps/web/docker/production/nginx.conf /etc/nginx/sites-enabled/default
COPY apps/web/docker/production/php-fpm-pool.conf /usr/local/etc/php-fpm.d/zz-www.conf
COPY apps/web/docker/production/php.ini /usr/local/etc/php/conf.d/99-production.ini
COPY apps/web/docker/production/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY apps/web/docker/production/start-container /usr/local/bin/start-container
RUN chmod +x /usr/local/bin/start-container \
    && rm -f /etc/nginx/sites-enabled/default.conf 2>/dev/null; true \
    && chown -R www:www storage bootstrap/cache

EXPOSE 80
ENTRYPOINT ["start-container"]
