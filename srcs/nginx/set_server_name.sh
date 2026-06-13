#!/bin/sh

if [ -z "$URL" ]; then
    echo "URL should be defined as username.domain.country-code"
    exit 1
fi

sed -i -E "s/(server_name\s+)(www\.)?user[^\s;]*/\1\2${URL}/g" ./nginx.conf
