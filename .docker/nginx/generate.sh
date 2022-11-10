# exit when any command fails
set -e

if [ "$#" -ne 1 ]
then
  echo "Usage: Must supply a domain"
  exit 1
fi

DOMAIN=$1

mkdir -p ssl
cd ssl

echo -e "\033[33mCA authority \033[0m"
echo -e "\033[32mGenerating Root Certificate... \033[0m"
openssl genrsa -out myCA.key 2048
openssl req -x509 -new -nodes -key myCA.key -sha256 -days 1825 -out myCA.pem -subj "/C=ES/ST=Madrid/L=Madrid/O=Qwizer/CN=www.qwizer.com"

echo -e "\033[33mCertificate Signing Request \033[0m"
openssl genrsa -out $DOMAIN.key 2048
openssl req -new -key $DOMAIN.key -out $DOMAIN.csr -subj "/C=ES/ST=Madrid/L=Madrid/O=Qwizer/CN=www.qwizer.com"

cat > $DOMAIN.ext << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names
[alt_names]
DNS.1 = $DOMAIN
EOF

echo -e "\033[32mCreating CA-Signed Certificate... \033[0m"
openssl x509 -req -in $DOMAIN.csr -CA ./myCA.pem -CAkey ./myCA.key -CAcreateserial \
-out $DOMAIN.crt -days 365 -sha256 -extfile $DOMAIN.ext

rm $DOMAIN.ext $DOMAIN.csr myCA.key
mv $DOMAIN.crt site.crt
mv $DOMAIN.key site.key
echo -e "\033[32mCreated successfully \033[0m"

# Only for fedora
read -p "Press Y to trust the CA (only fedora)" -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "\033[31mTRUSTING CERTIFICATE \033[0m"
  sudo cp myCA.pem /etc/pki/ca-trust/source/anchors/myCA.pem
  sudo update-ca-trust
else
  echo -e "\033[31mTRUST myCA.pem on your OS \033[0m"
fi
