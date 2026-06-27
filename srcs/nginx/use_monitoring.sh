#!/bin/bash

while [[ $# -gt 0 ]]; do
    case $1 in
        (--yes|yes|-y|y)
            CONFIRM=true
            shift
            ;;
        (--no|no|-n|n)
            CONFIRM=false
            shift
            ;;
        *)
            echo "Option inconnue: $1"
			echo "Usage: $0 [--yes|--no]"
            exit 1
            ;;
    esac
done

# Si pas d'argument en ligne de commande
if [ -z "$CONFIRM" ]; then
	echo "Do you want to use the monitoring configuration to nginx.conf ?"
    read -p "Continuer? (y/N): " response
    [[ $response == [yY] || $response == [yY][eE][sS] ]] && CONFIRM=true || CONFIRM=false
fi

if [ "$CONFIRM" = false ]; then
	echo "Removing the monitoring configuration from nginx.conf"
	sed -i '/#__MONITORING_TOOLS__/,/#__END_MONITORING_TOOLS__/{//!{/#__END_MONITORING_TOOLS__/!d}}' nginx.conf
	exit 0
fi

echo "Adding the monitoring configuration to nginx.conf"

cat << EOF > tmp
#__MONITORING_TOOLS__
	location /grafana/ {
		proxy_pass http://grafana:9000/grafana/;
		proxy_set_header Host \$host;
		proxy_set_header X-Real-IP \$remote_addr;
		proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
		allow 172.18.0.0/16;
		deny all;
	}

	location /nginx_status {
		stub_status on;
		allow 172.0.0.0/8;
		deny all;
	}
#__END_MONITORING_TOOLS__
EOF

awk '
/#__MONITORING_TOOLS__/ {
    system("cat tmp")
    skip=1
    next
}
/#__END_MONITORING_TOOLS__/ {
    skip=0
    next
}
!skip
' nginx.conf > nginx.conf.new && mv nginx.conf.new nginx.conf
