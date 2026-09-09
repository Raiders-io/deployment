#!/bin/bash

# This script tests the Nginx server configuration by performing various checks, including verifying gzip compression, cache control headers, and ETag functionality.
# As cache control reduce the number of requests to the server, it is important to test that the server is correctly configured to handle caching and compression.

set -euo pipefail

abort() {
	echo -e "\nError: test-nginx.sh failed"
	exit 1
}

clean() {
	# echo -e "\nCleaning up..."
	rm -f curl_headers.txt
}

trap 'abort' ERR
trap 'clean' 0

# Sans compression (taille brute)
curl --insecure -s -o /dev/null -w "Size without gzip: %{size_download} bytes\n" https://localhost:4443

# Avec compression (envoie Accept-Encoding: gzip)
curl --insecure -s -H "Accept-Encoding: gzip" -o /dev/null -w "Size with gzip: %{size_download} bytes\n" https://localhost:4443

echo ""

# Vérification des en-têtes
curl -I --insecure -s https://localhost:4443/ > curl_headers.txt

# Search for cache control headers in the response
grep --ignore-case "Cache-Control" curl_headers.txt
grep --ignore-case "Expires" curl_headers.txt
# Search for ETag header in the response (hash for cache validation)
grep --ignore-case "ETag" curl_headers.txt

# Vérification de la réponse 304 Not Modified
echo ""
ETAG=$(sed -n 's/.*ETag: *"\([^"]*\)".*/\1/p' curl_headers.txt)
curl --insecure -s -I -H "If-None-Match: \"$ETAG\"" https://localhost:4443/ | grep "304 Not Modified"
