#!/bin/sh

export HOSTNAME=$(hostname)

# Update nginx.conf and index.html with the new HOSTNAME
sed -i -E "s/(server_name\s+)(www\.)?user[^\s;]*/\1\2${HOSTNAME}/g" ./nginx.conf
sed -i -E "s/127.0.0.1/${HOSTNAME}/g" ./html/index.html

# Revert
# sed -i -E "s/${HOSTNAME}/127.0.0.1/g" ./html/index.html
