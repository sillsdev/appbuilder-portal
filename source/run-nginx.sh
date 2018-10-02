#!/usr/bin/env sh

env

if [ "$NGINX_CONF_DIR" = "" ]
then
	NGINX_CONF_DIR=/etc/nginx/conf.d
fi
envsubst '$$API_URL' < $NGINX_CONF_DIR/default.conf.template > $NGINX_CONF_DIR/default.conf

echo "Starting NGINX"
nginx -g 'daemon off;'
