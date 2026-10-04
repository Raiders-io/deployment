#!/bin/bash

SRCS_DIR="srcs"
ENV_FILE="${SRCS_DIR}/.env"
NGINX_DIR="${SRCS_DIR}/nginx"

create_env()
{
	if [ -f "${ENV_FILE}" ]; then
		echo ""${ENV_FILE}" file already exists. Do you want to overwrite it?"
		read -p "Continue? (Y/n): " confirm
		confirm=${confirm:-y} # Default to 'y' if no input is provided
		if ! [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
			echo "Not replacing the file."
			# echo "Setup cancelled."
			exit 1
		fi
	fi
	cp "${ENV_FILE}".example "${ENV_FILE}"
}

configure_nginx()
{
	chmod +x "${NGINX_DIR}/generate_certs.sh"
	chmod +x "${NGINX_DIR}/set_server_name.sh"
	"${NGINX_DIR}/generate_certs.sh"
    # "${NGINX_DIR}/set_server_name.sh" interactive
    "${NGINX_DIR}/set_server_name.sh" use_hostname
}

configure_grafana()
{
	sed -i "s|^\(GF_ADMIN_USER=\).*|\1$(openssl rand -base64 50 | tr -dc '[:alnum:]' | head -c 50 )|" "${ENV_FILE}"
	sed -i "s|^\(GF_ADMIN_PASSWORD=\).*|\1$(openssl rand -base64 50 | tr -dc '[:alnum:]' | head -c 50 )|" "${ENV_FILE}"
}

configure_frontend_api_url()
{
	sed -i "s|^\(VITE_API_URL=https://\)[^/]*\(:[^/]*\)|\1$(hostname)\2|" "${ENV_FILE}"
}

configure_prometheus()
{
	GARAGE_ENV="../ObjectStorage/.env"
	if [ -f "${GARAGE_ENV}" ]; then
		GARAGE_METRICS_TOKEN=$(grep '^GARAGE_METRICS_TOKEN=' "${GARAGE_ENV}" | cut -d'=' -f2-)
	fi
	if [ -z "${GARAGE_METRICS_TOKEN}" ]; then
		echo "Error: GARAGE_METRICS_TOKEN not found in ${GARAGE_ENV}"
		echo "Please ensure ../ObjectStorage/.env contains GARAGE_METRICS_TOKEN."
		exit 1
	fi
	export GARAGE_METRICS_TOKEN
	envsubst < "${SRCS_DIR}/prometheus.template.yml" > "${SRCS_DIR}/prometheus.yml"
	echo "Prometheus configuration generated from template."
}

create_env
configure_nginx
configure_grafana
configure_frontend_api_url

echo "Environment setup complete. Please review the "${ENV_FILE}" file and make any necessary adjustments."
