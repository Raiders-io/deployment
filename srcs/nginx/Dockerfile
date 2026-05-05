# Use Alpine as the base image
FROM alpine:3.21.4@sha256:b6a6be0ff92ab6db8acd94f5d1b7a6c2f0f5d10ce3c24af348d333ac6da80685 AS build-stage

RUN apk update && apk upgrade \
    && apk add --no-cache openssl

ARG OPENSSL_SUBJ
RUN test -n "$OPENSSL_SUBJ" \
    || (echo "OPENSSL_SUBJ should be defined with /C=../ST=../L=../O=../OU=../CN=.." && exit 1)

# Generate the .key and .crt for HTTPS
RUN mkdir -p /etc/ssl/private/ /etc/ssl/certs/ \
    && openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /nginx-selfsigned.key \
    -out /nginx-selfsigned.crt \
    -subj "$OPENSSL_SUBJ" \
    && apk del openssl

FROM alpine:3.21.4@sha256:b6a6be0ff92ab6db8acd94f5d1b7a6c2f0f5d10ce3c24af348d333ac6da80685 AS final-stage

RUN apk update && apk upgrade \
    && apk add --no-cache nginx dumb-init curl

COPY --from=build-stage /nginx-selfsigned.key /etc/ssl/private/nginx-selfsigned.key
COPY --from=build-stage /nginx-selfsigned.crt /etc/ssl/certs/nginx-selfsigned.crt

COPY nginx.conf /etc/nginx/nginx.conf

COPY ./html /var/www/html

COPY start.sh /start.sh
RUN chmod +x /start.sh

# Default HTTPS port
EXPOSE 443

# Specify the start point of our image
ENTRYPOINT ["/start.sh"]
