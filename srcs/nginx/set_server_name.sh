#!/bin/sh

NGINX_DIR="srcs/nginx"

use_hostname ()
{
	export HOSTNAME=$(hostname)
	# Update nginx.conf and index.html with the new HOSTNAME
	sed -i -E "s|(server_name\s+)(www\.)?[^;]*|\1\2${HOSTNAME}|g" ${NGINX_DIR}/nginx.conf
}

use_domain ()
{
	export HOSTNAME="ENTER_YOUR_DOMAIN_HERE"

	sed -i -E "s|(server_name\s+)(www\.)?[^;]*|\1\2${HOSTNAME}|g" ${NGINX_DIR}/nginx.conf
}

# Revert
revert ()
{
	sed -i -E "s|(server_name\s+)(www\.)?[^;]*|\1\2user|g" ${NGINX_DIR}/nginx.conf

	# Extreme : restore the file using git restore
	if [ "$1" = "force" ] || [ "$1" = "-f" ]; then
		git restore ./html/index.html
		git restore ${NGINX_DIR}/nginx.conf
	fi
}

main ()
{
	SERVICE="$1"
	if [ $# -gt 0 ]; then
		shift
	else
		echo "Usage: $0 {use_hostname|use_domain|revert}"
		exit 1
	fi
	if [ "$SERVICE" = "interactive" ]; then
		read -p "Please choose between {use_hostname|use_domain|revert}: " choice
		choice=${choice:-use_hostname} # Default to 'use_hostname' if no input is provided
		export SERVICE="$choice"
	fi
	if [ "$SERVICE" = "use_hostname" ]; then
		use_hostname "$@"
	elif [ "$SERVICE" = "use_domain" ]; then
		use_domain "$@"
	elif [ "$SERVICE" = "revert" ] || [ "$SERVICE" = "-r" ] || [ "$SERVICE" = "--revert" ]; then
		revert "$@"
	else
		echo "Usage: $0 {use_hostname|use_domain|revert}"
		exit 1
	fi
}

main "$@"
