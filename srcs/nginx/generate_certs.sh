#!/bin/sh

ENV_FILE="$(dirname "$0")/../.env"
NGINX_DIR="srcs/nginx"

if [ -f "$ENV_FILE" ]; then
    OPENSSL_SUBJ=$(grep '^OPENSSL_SUBJ=' "$ENV_FILE" | cut -d '=' -f2-)
else
    echo "Erreur: fichier .env introuvable"
    exit 1
fi

if [ -z "$OPENSSL_SUBJ" ]; then
    echo "OPENSSL_SUBJ should be defined with /C=../ST=../L=../O=../OU=../CN=.." 
    exit 1
fi

mkdir -p ${NGINX_DIR}/certs ${NGINX_DIR}/private

echo "Generating self-signed certificate for Nginx..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ${NGINX_DIR}/private/nginx-selfsigned.key -out ${NGINX_DIR}/certs/nginx-selfsigned.crt -subj "$OPENSSL_SUBJ"
if [ $? -ne 0 ]; then
    echo "Error while generating self-signed certificate."
    exit 1
fi
