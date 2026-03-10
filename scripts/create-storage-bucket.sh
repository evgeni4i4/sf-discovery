#!/usr/bin/env bash
#
# Create the "spot-photos" public bucket in Supabase Storage.
# Run once during project setup.
#
# Usage:
#   ./scripts/create-storage-bucket.sh
#
# Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL from .env.local

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Load env vars
if [ -f "$PROJECT_DIR/.env.local" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$PROJECT_DIR/.env.local"
  set +a
fi

: "${NEXT_PUBLIC_SUPABASE_URL:?Set NEXT_PUBLIC_SUPABASE_URL in .env.local}"
: "${SUPABASE_SERVICE_ROLE_KEY:?Set SUPABASE_SERVICE_ROLE_KEY in .env.local}"

echo "Creating spot-photos bucket..."

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/bucket" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"id": "spot-photos", "name": "spot-photos", "public": true}')

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ] || echo "$BODY" | grep -q "already exists"; then
  echo "Bucket 'spot-photos' is ready."
else
  echo "Error (HTTP $HTTP_CODE): $BODY"
  exit 1
fi
