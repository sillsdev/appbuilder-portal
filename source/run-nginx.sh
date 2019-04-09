#!/usr/bin/env sh

env

export NGINX_PORT=${NGINX_LISTEN_PORT:-80}
export AUTH0_DOMAIN_HOST=$(basename ${AUTH0_DOMAIN})

sed -i -r 's/(clientId:")([^"]+)?"/\1'"${AUTH0_CLIENT_ID}"'"/' /usr/share/nginx/html/app-*.js
sed -i -r 's/(domain:")([^"]+)?"/\1'"${AUTH0_DOMAIN_HOST}"'"/' /usr/share/nginx/html/app-*.js

echo "nginx will listen on port: ${NGINX_PORT}"

if [ "$NGINX_CONF_DIR" = "" ]
then
	NGINX_CONF_DIR=/etc/nginx/conf.d
fi

export VARS_TO_REPLACE='$API_URL:$NGINX_PORT:$DWKIT_UI_HOST'
envsubst "$VARS_TO_REPLACE" < $NGINX_CONF_DIR/default.conf.template > $NGINX_CONF_DIR/default.conf
envsubst "$VARS_TO_REPLACE" < $NGINX_CONF_DIR/dwkit.conf.template > $NGINX_CONF_DIR/dwkit.conf

echo "Starting NGINX"
nginx -g 'daemon off;'
# nginx-debug -g 'daemon off;'
