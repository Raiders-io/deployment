# Use Alpine as the base image
FROM alpine:3.21.4@sha256:b6a6be0ff92ab6db8acd94f5d1b7a6c2f0f5d10ce3c24af348d333ac6da80685

RUN apk update && apk upgrade \
&& apk add --no-cache vsftpd lftp dumb-init

RUN mkdir -p /usr/share/empty
COPY ["vsftpd.conf", "/etc/vsftpd/"]
COPY ["main.sh", "/"]
RUN chmod +x /main.sh

# Default SFTP port
EXPOSE 21

# Specify the start point of our image
CMD ["/main.sh"]
