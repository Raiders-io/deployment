#!/bin/sh

use_hostname ()
{
	export HOSTNAME=$(hostname)

	# Update nginx.conf and index.html with the new HOSTNAME
	sed -i -E "s|(server_name\s+)(www\.)?user[^\s;]*|\1\2${HOSTNAME}|g" ./nginx.conf
	sed -i -E "s|127.0.0.1|${HOSTNAME}|g" ./html/index.html
}

use_domain ()
{
	export HOSTNAME="ENTER_YOUR_DOMAIN_HERE"

	sed -i -E "s|127.0.0.1|${HOSTNAME}|g" ./html/index.html
	sed -i -E "s|:4443||g" ./html/index.html
	sed -i -E "s|(server_name\s+)(www\.)?user[^\s;]*|\1\2${HOSTNAME}|g" ./nginx.conf
}

# Revert
revert ()
{
	sed -i -E "s|https://[^/]+/|https://127.0.0.1:4443/|g" ./html/index.html
	sed -i -E "s|(server_name\s+)(www\.)?user[^\s;]*|\1\2user|g" ./nginx.conf

	# Extreme : restore the file using git restore
	if [ "$1" = "force" ] || [ "$1" = "-f" ]; then
		git restore ./html/index.html
		git restore ./nginx.conf
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
