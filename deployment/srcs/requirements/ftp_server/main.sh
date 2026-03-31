#!/usr/bin/dumb-init /bin/ash

# -e = exit on error, -u = undefined var = error
set -eu

: "${FTP_USERNAME:?FTP_USERNAME not set}"
: "${FTP_PASSWORD:?FTP_PASSWORD not set}"

# Create dirs
mkdir -p /var/ftp
mkdir -p /var/ftp/data
mkdir -p /var/ftp/website

# Create user with chroot = /var/ftp
if ! id "${FTP_USERNAME}" >/dev/null 2>&1; then
    adduser -D -h /var/ftp "${FTP_USERNAME}"
    echo "${FTP_USERNAME}:${FTP_PASSWORD}" | chpasswd
	echo "${FTP_USERNAME}" >> /etc/vsftpd.userlist
fi

# Chroot must be owned by root
chown root:root /var/ftp
chmod 755 /var/ftp

# User writable directory
chown "${FTP_USERNAME}:${FTP_USERNAME}" /var/ftp/data

exec vsftpd /etc/vsftpd/vsftpd.conf
