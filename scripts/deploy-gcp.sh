#!/usr/bin/env bash
set -euo pipefail

# ============================================
# GCP Setup Script for SPMB AI
# Requires: gcloud CLI, jq
# ============================================

PROJECT_ID="${1:-spmb-ai}"
SERVICE_ACCOUNT_NAME="spmb-ai-sa"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
SPREADSHEET_TITLE="SPMB AI Data"

echo "=== Setting up GCP project: ${PROJECT_ID} ==="

# 1. Create or select project
if gcloud projects describe "${PROJECT_ID}" &>/dev/null; then
  echo "[OK] Project ${PROJECT_ID} exists"
else
  echo "[CREATE] Creating project ${PROJECT_ID}..."
  gcloud projects create "${PROJECT_ID}" --name="SPMB AI" --set-as-default
fi

gcloud config set project "${PROJECT_ID}"

# 2. Enable required APIs
echo ""
echo "=== Enabling APIs ==="
for api in sheets.googleapis.com drive.googleapis.com; do
  if gcloud services list --enabled --filter="name:${api}" --format="value(name)" | grep -q "${api}"; then
    echo "[OK] ${api} already enabled"
  else
    echo "[ENABLE] ${api}..."
    gcloud services enable "${api}"
  fi
done

# 3. Create service account
echo ""
echo "=== Service Account ==="
if gcloud iam service-accounts describe "${SERVICE_ACCOUNT_EMAIL}" &>/dev/null; then
  echo "[OK] Service account ${SERVICE_ACCOUNT_EMAIL} exists"
else
  echo "[CREATE] Creating service account ${SERVICE_ACCOUNT_NAME}..."
  gcloud iam service-accounts create "${SERVICE_ACCOUNT_NAME}" \
    --display-name="SPMB AI Service Account"
fi

# 4. Download service account key
echo ""
echo "=== Service Account Key ==="
KEY_FILE="./gcp-service-account-key.json"
if command -v gcloud &>/dev/null && gcloud iam service-accounts keys list --iam-account="${SERVICE_ACCOUNT_EMAIL}" --format="value(name)" 2>/dev/null | grep -q .; then
  echo "[SKIP] Key already exists"
elif command -v gcloud &>/dev/null && gcloud iam service-accounts keys create "${KEY_FILE}" --iam-account="${SERVICE_ACCOUNT_EMAIL}" 2>/dev/null; then
  echo "[CREATE] Key saved to ${KEY_FILE}"
else
  echo ""
  echo "╔══════════════════════════════════════════════════════════╗"
  echo "║  Key creation via CLI blocked by organization policy.   ║"
  echo "║                                                        ║"
  echo "║  Create key manually:                                   ║"
  echo "║  1. https://console.cloud.google.com/iam-admin/         ║"
  echo "║     serviceaccounts                                     ║"
  echo "║  2. Select ${SERVICE_ACCOUNT_EMAIL}              ║"
  echo "║  3. Tab Keys → Add Key → Create New Key → JSON         ║"
  echo "║  4. Save file as ${KEY_FILE}              ║"
  echo "╚══════════════════════════════════════════════════════════╝"
fi

# 5. Create Google Spreadsheet via Apps Script / Sheets API
echo ""
echo "=== Creating Spreadsheet ==="
python3 << 'PYEOF' 2>/dev/null || python << 'PYEOF'
import json, os, sys

# Use the downloaded key to create the spreadsheet
key_file = "./gcp-service-account-key.json"
if not os.path.exists(key_file):
    print("[ERROR] Service account key not found")
    sys.exit(1)

from google.oauth2 import service_account
from googleapiclient.discovery import build

creds = service_account.Credentials.from_service_account_file(
    key_file,
    scopes=['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive']
)

# Create the spreadsheet
sheets = build('sheets', 'v4', credentials=creds)
spreadsheet = sheets.spreadsheets().create(body={
    'properties': {'title': 'SPMB AI Data'},
    'sheets': [{'properties': {'title': 'Sekolah'}}]
}).execute()

spreadsheet_id = spreadsheet['spreadsheetId']
print(f"[CREATE] Spreadsheet created with ID: {spreadsheet_id}")

# Share with service account (it already has access as owner)
# Share with the user who ran the script
drive = build('drive', 'v3', credentials=creds)

# Save spreadsheet ID
with open('.spreadsheet-id', 'w') as f:
    f.write(spreadsheet_id)

print(f"[DONE] Spreadsheet ID saved to .spreadsheet-id")
print(f"[NEXT] Open https://docs.google.com/spreadsheets/d/{spreadsheet_id}/edit")
print(f"[NEXT] Run: npx tsx scripts/setup-sheets.ts {spreadsheet_id}")
PYEOF

# 6. Print summary
echo ""
echo "=========================================="
echo "  GCP Setup Complete!"
echo "=========================================="
echo ""
echo "Environment variables to add:"
echo ""
echo "  GOOGLE_SERVICE_ACCOUNT_KEY='$(cat ./gcp-service-account-key.json | base64 -w0)'"
echo "  GOOGLE_SPREADSHEET_ID=\"$(cat .spreadsheet-id 2>/dev/null || echo '<spreadsheet-id>')\""
echo "  GOOGLE_DRIVE_UPLOAD_FOLDER_ID=\"root\""
echo ""
echo "Next steps:"
echo "  1. Open the spreadsheet and share with your email (editor)"
echo "  2. Run: npx tsx scripts/setup-sheets.ts \$(cat .spreadsheet-id)"
echo "  3. Deploy to Vercel"
echo ""
