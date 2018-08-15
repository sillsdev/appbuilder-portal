#!/usr/bin/env sh

if [ "$NGINX_CONF_DIR" = "" ]
then
	NGINX_CONF_DIR=/etc/nginx/conf.d
fi
envsubst '$$API_URL' < $NGINX_CONF_DIR/default.conf.template > $NGINX_CONF_DIR/default.conf

#nginx -g 'daemon off;'
