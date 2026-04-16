# Use Alpine as the base image
FROM alpine:3.21.4@sha256:b6a6be0ff92ab6db8acd94f5d1b7a6c2f0f5d10ce3c24af348d333ac6da80685

# Copy the main shell script to image
COPY ["main.sh", "/usr/local/bin/"]
RUN apk add --no-cache mariadb mariadb-client dumb-init \
    && chmod +x /usr/local/bin/main.sh

COPY mariadb-server.cnf /etc/my.cnf.d/mariadb-server.cnf

# Specify the start point of our image
ENTRYPOINT ["dumb-init", "--", "main.sh"]
