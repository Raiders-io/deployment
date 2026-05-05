#!/usr/bin/dumb-init /bin/sh

set -eu

: "${URL:?URL not set}"

test -n "$URL" || (echo "URL should be defined as username.domain.country-code" && exit 1)
sed -i -E "s/(server_name\s+)(www\.)?user[^\s;]*/\1\2${URL}/g" /etc/nginx/nginx.conf

# Start Nginx
exec nginx -g "daemon off;" 
