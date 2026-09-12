#!/usr/bin/env bash
# Despliega veia-landing al VPS (producción: https://veia.com.mx).
# Requisitos:
#   - Clave SSH /home/mantis/.ssh/hostinger-vps con acceso a debian@2.25.128.172
#   - sudo sin contraseña en el VPS (rsync remoto como root y chown a www-data)
set -euo pipefail

KEY="${1:-/home/mantis/.ssh/hostinger-vps}"
HOST="debian@2.25.128.172"
WEBROOT="/var/www/veia"
SSH_OPTS="-i ${KEY} -o IdentitiesOnly=yes"

echo "▶ Build con base en raíz (/) para veia.com.mx"
ASTRO_BASE=/ npm run build

echo "▶ Sincronizando dist/ → ${HOST}:${WEBROOT}/ (sin --delete: conserva images/ y plantillas/ extras)"
rsync -avz --rsync-path="sudo rsync" -e "ssh ${SSH_OPTS}" dist/ "${HOST}:${WEBROOT}/"

echo "▶ Ajustando propietario y permisos"
ssh ${SSH_OPTS} "${HOST}" "sudo chown -R www-data:www-data ${WEBROOT}"

echo "▶ Verificación"
ssh ${SSH_OPTS} "${HOST}" "sha256sum ${WEBROOT}/favicon.png"
curl -fsS -o /dev/null -w 'veia.com.mx=%{http_code}\n' https://veia.com.mx/
