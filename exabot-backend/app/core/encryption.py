from cryptography.fernet import Fernet
from app.config import settings


def _fernet() -> Fernet:
    return Fernet(settings.ENCRYPTION_KEY.encode())


def encrypt(plain_text: str) -> str:
    return _fernet().encrypt(plain_text.encode()).decode()


def decrypt(cipher_text: str) -> str:
    return _fernet().decrypt(cipher_text.encode()).decode()


def mask_key(plain_key: str) -> str:
    """Return something like sk-...xxxx (last 4 chars visible)."""
    if len(plain_key) <= 8:
        return "****"
    return plain_key[:4] + "..." + plain_key[-4:]
