import ssl
import sys
import requests
import hashlib
import urllib3
import urllib3.connectionpool
from urllib3.connection import HTTPSConnection
from urllib3.poolmanager import PoolManager, ProxyManager
from requests.adapters import HTTPAdapter
from cryptography import x509
from cryptography.hazmat.primitives import serialization
from urllib3.exceptions import SSLError

# Using a dummy SPKI hash that should fail if pinning actually works
PINNED_SPKI_HASH = "0000000000000000000000000000000000000000000000000000000000000000"

class PinnedHTTPSConnection(HTTPSConnection):
    def connect(self):
        super().connect()
        try:
            der_cert = self.sock.getpeercert(binary_form=True)
            cert_obj = x509.load_der_x509_certificate(der_cert)
            pub_key = cert_obj.public_key()
            spki_bytes = pub_key.public_bytes(
                encoding=serialization.Encoding.DER,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            )
            spki_hash = hashlib.sha256(spki_bytes).hexdigest()
            if spki_hash != PINNED_SPKI_HASH:
                raise ssl.SSLError(f"SPKI Pinning Validation Failed! Expected {PINNED_SPKI_HASH}, got {spki_hash}")
        except Exception as e:
            self.close()
            raise ssl.SSLError(f"SSL SPKI verification failed: {e}")

class PinnedHTTPSConnectionPool(urllib3.connectionpool.HTTPSConnectionPool):
    ConnectionCls = PinnedHTTPSConnection

class PinnedPoolManager(PoolManager):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.pool_classes_by_scheme["https"] = PinnedHTTPSConnectionPool

class SPKIPinnedCertificateAdapter(HTTPAdapter):
    def init_poolmanager(self, *args, **kwargs):
        context = ssl.create_default_context()
        context.verify_mode = ssl.CERT_REQUIRED
        context.check_hostname = True
        kwargs["ssl_context"] = context
        self.poolmanager = PinnedPoolManager(*args, **kwargs)

    def proxy_manager_for(self, proxy, **proxy_kwargs):
        if proxy in self.proxy_manager:
            return self.proxy_manager[proxy]
        manager = super().proxy_manager_for(proxy, **proxy_kwargs)
        manager.pool_classes_by_scheme["https"] = PinnedHTTPSConnectionPool
        self.proxy_manager[proxy] = manager
        return manager

def call_secure_licensing_api(url, payload):
    if not url.lower().startswith("https://"):
        raise ValueError("Enforce HTTPS: Connection must be secure (HTTPS)")
    session = requests.Session()
    session.mount("https://", SPKIPinnedCertificateAdapter())
    try:
        response = session.post(url, json=payload, timeout=10, allow_redirects=False)
        return response.json()
    except (SSLError, requests.exceptions.SSLError) as e:
        print(f"SECURITY EXCEPTION: TLS SPKI Pinning Check Failed! {e}", file=sys.stderr)
        raise e
    except Exception as e:
        print(f"Network Connection Error: {e}", file=sys.stderr)
        raise e

if __name__ == "__main__":
    try:
        # Call a public HTTPS endpoint, e.g., postman-echo or google
        url = "https://postman-echo.com/post"
        print(f"Calling {url}...")
        res = call_secure_licensing_api(url, {"test": "data"})
        print(f"Success! Response: {res}")
    except Exception as e:
        print(f"Failed with exception: {e}")
