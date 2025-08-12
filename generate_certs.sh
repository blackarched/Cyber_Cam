#!/bin/bash
#
# Generates a self-signed SSL certificate for local development.
# This is required by NGINX for HTTPS.

# --- CONFIGURATION ---
CERT_DIR="./certs"
DAYS_VALID=365
COUNTRY="US"
STATE="Florida"
LOCATION="The Villages"
ORGANIZATION="NEXUS Development Team"
COMMON_NAME="localhost"
# --- END CONFIGURATION ---

# Check if OpenSSL is installed
if ! [ -x "$(command -v openssl)" ]; then
  echo "Error: openssl is not installed. Please install it to continue." >&2
  exit 1
fi

# Create certificate directory if it doesn't exist
mkdir -p "$CERT_DIR"
echo "Certificate directory '$CERT_DIR' created."

# Define file paths
KEY_FILE="$CERT_DIR/key.pem"
CERT_FILE="$CERT_DIR/cert.pem"

# Generate the private key and certificate
openssl req -x509 -nodes -newkey rsa:2048 -keyout "$KEY_FILE" -out "$CERT_FILE" -days "$DAYS_VALID" \
-subj "/C=$COUNTRY/ST=$STATE/L=$LOCATION/O=$ORGANIZATION/CN=$COMMON_NAME"

echo "✅ SSL key and certificate generated successfully:"
echo "   Key:         $KEY_FILE"
echo "   Certificate: $CERT_FILE"

exit 0