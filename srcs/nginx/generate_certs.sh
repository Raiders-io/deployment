#!/bin/sh

if [ -z "$OPENSSL_SUBJ" ]; then
    echo "OPENSSL_SUBJ should be defined with /C=../ST=../L=../O=../OU=../CN=.." 
    exit 1
fi

mkdir -p ./certs ./private

echo "Generating self-signed certificate for Nginx..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./private/nginx-selfsigned.key -out ./certs/nginx-selfsigned.crt -subj "$OPENSSL_SUBJ"
if [ $? -ne 0 ]; then
    echo "Error while generating self-signed certificate."
    exit 1
fi
