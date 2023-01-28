import binascii
import hashlib
import json
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from Crypto.Util.Padding import pad, unpad

BLOCK_SIZE = 16

def encrypt_tests(message, passw):
    # Hay que hacer que el texto se pueda enviar en bloques de 16 bytes, sino no funciona
    message = pad(json.dumps(message).encode(),BLOCK_SIZE)
    # Proceso de generación de la key a partir del password
    key = hashlib.sha256(bytes(passw, "utf-8")).digest()

    iv_random = get_random_bytes(BLOCK_SIZE)

    cipher = AES.new(key, mode=AES.MODE_CFB, iv=iv_random, segment_size=128)
    encrypted = cipher.encrypt(message)

    return {
        "password": key.hex(),
        "iv": binascii.b2a_hex(iv_random),
        "encrypted_message": binascii.b2a_base64(encrypted).rstrip(),
    }


# TODO estos metodos no se usan pero supongo que lo usaron para debuggear si se encriptaba bien
def decrypt(message, in_iv, in_key):
    """
    Return encrypted string.
    @in_encrypted: Base64 encoded
    @key: hexified key
    @iv: hexified iv
    """
    key = binascii.a2b_hex(in_key)
    iv = binascii.a2b_hex(in_iv)
    aes = AES.new(key, AES.MODE_CFB, iv, segment_size=128)

    decrypted = aes.decrypt(binascii.a2b_base64(message).rstrip())
    return unpad(decrypted, BLOCK_SIZE).decode()