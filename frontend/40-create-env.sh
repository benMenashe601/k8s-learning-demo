#!/bin/sh
set -eu

: "${APP_NAME:=Kubernetes Lab}"
: "${WELCOME_MESSAGE:=Frontend, Backend and Database are connected.}"
: "${API_URL:=http://localhost:4000}"
: "${THEME_COLOR:=#7c5cff}"

export APP_NAME WELCOME_MESSAGE API_URL THEME_COLOR
envsubst '${APP_NAME} ${WELCOME_MESSAGE} ${API_URL} ${THEME_COLOR}' \
  < /usr/share/nginx/html/env.template.js \
  > /usr/share/nginx/html/env.js
