# Use Alpine as the base image
FROM alpine:3.21.4@sha256:b6a6be0ff92ab6db8acd94f5d1b7a6c2f0f5d10ce3c24af348d333ac6da80685

RUN apk update && apk upgrade \
    && apk add --no-cache nginx dumb-init curl
COPY nginx.conf /etc/nginx/nginx.conf

ARG OPENSSL_SUBJ
RUN test -n "$OPENSSL_SUBJ" \
    || (echo "OPENSSL_SUBJ should be defined with /C=../ST=../L=../O=../OU=../CN=.." && exit 1)

# Generate the .key and .crt for HTTPS
RUN apk add --no-cache openssl \
    && mkdir -p /etc/ssl/private/ /etc/ssl/certs/ \
    && openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/nginx-selfsigned.key \
    -out /etc/ssl/certs/nginx-selfsigned.crt \
    -subj "$OPENSSL_SUBJ" \
    && apk del openssl

COPY start.sh /start.sh
RUN chmod +x /start.sh

# Default HTTP port : automatically redirect on https port
# EXPOSE 80

# Default HTTPS port
EXPOSE 443

# Specify the start point of our image
ENTRYPOINT ["/start.sh"]
