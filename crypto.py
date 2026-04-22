import os
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

def generate_key():
    # AES-256 requires a 32 byte key
    # os.urandom generates cryptographically secure random bytes
    # this is important because regular random() is NOT secure for crypto
    return os.urandom(32)

def save_key(key, path="vault.key"):
    # encode key as base64 so it's safe to store as text
    # never store raw bytes directly in a file
    with open(path, 'wb') as f:
        f.write(base64.b64encode(key))

def load_key(path="vault.key"):
    # load and decode the key
    with open(path, 'rb') as f:
        return base64.b64decode(f.read())

def encrypt(data: str, key: bytes) -> str:
    # AES-GCM mode for authenticated encryption
    aesgcm = AESGCM(key)
    
    # nonce which means number used once
    # must be unique for every encryption operation
    # if you reuse a nonce with the same key, AES-GCM is broken
    # os.urandom(12) gives us a fresh random nonce every time
    nonce = os.urandom(12)
    
    # encrypt the data
    # AES-GCM also produces an authentication tag automatically
    # this tag lets us verify the data wasn't tampered with on decryption
    ciphertext = aesgcm.encrypt(nonce, data.encode(), None)
    
    # store nonce + ciphertext together
    # we need the nonce to decrypt later
    # base64 encode so we can store as a string
    return base64.b64encode(nonce + ciphertext).decode()

def decrypt(encrypted_data: str, key: bytes) -> str:
    # decode from base64
    raw = base64.b64decode(encrypted_data.encode())
    
    # split nonce and ciphertext
    # nonce is always first 12 bytes
    nonce = raw[:12]
    ciphertext = raw[12:]
    
    # decrypt and verify authentication tag
    # if data was tampered with this will raise an exception
    aesgcm = AESGCM(key)
    return aesgcm.decrypt(nonce, ciphertext, None).decode()