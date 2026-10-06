#!/usr/bin/env bash
# Run on the API server: bash scripts/check-staging-api.sh
set -euo pipefail

cd "$(dirname "$0")/.."

echo "=== .env critical values ==="
grep -E '^(PORT|SKIP_REDIS|CORS_ORIGINS|API_URL|DASHBOARD_URL)=' .env 2>/dev/null || echo "(no .env found)"

PORT_VAL=$(grep -E '^PORT=' .env 2>/dev/null | tail -1 | cut -d= -f2- | tr -d '[:space:]' || true)
PORT_VAL=${PORT_VAL:-5000}
echo
echo "=== App listen port (from .env / default) = ${PORT_VAL} ==="

echo
echo "=== Listening sockets ==="
ss -tlnp | grep -E ":${PORT_VAL}\\b|:5000\\b|:3000\\b" || echo "(nothing on 3000/5000)"

echo
echo "=== forever ==="
forever list || true

echo
echo "=== Local OPTIONS (must include Access-Control-Allow-Origin) ==="
curl -sS -i -X OPTIONS "http://127.0.0.1:${PORT_VAL}/api/home/" \
  -H "Origin: https://ecdemo.indiprotechnologies.com" \
  -H "Access-Control-Request-Method: GET" | head -n 25 || true

echo
echo "=== Public OPTIONS via nginx/domain ==="
curl -sS -i -X OPTIONS "https://ecdemoapi.indiprotechnologies.com/api/home/" \
  -H "Origin: https://ecdemo.indiprotechnologies.com" \
  -H "Access-Control-Request-Method: GET" | head -n 25 || true

echo
echo "=== nginx proxy_pass for ecdemoapi ==="
grep -RIn "ecdemoapi\|proxy_pass" /etc/nginx/sites-enabled /etc/nginx/conf.d 2>/dev/null | head -n 40 || echo "(no nginx matches)"
