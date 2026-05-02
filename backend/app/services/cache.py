import time
import threading


class CacheService:
    """Thread-safe in-memory cache with TTL support."""

    def __init__(self):
        self._store: dict = {}
        self._lock = threading.Lock()

    def get(self, key: str):
        with self._lock:
            entry = self._store.get(key)
            if entry is None:
                return None
            if time.time() > entry["expires_at"]:
                del self._store[key]
                return None
            return entry["value"]

    def set(self, key: str, value, ttl: int = 900):
        with self._lock:
            self._store[key] = {
                "value": value,
                "expires_at": time.time() + ttl,
            }

    def delete(self, key: str):
        with self._lock:
            self._store.pop(key, None)

    def clear(self):
        with self._lock:
            self._store.clear()

    def size(self) -> int:
        return len(self._store)


# Module-level singleton
_cache = CacheService()


def get_cache() -> CacheService:
    return _cache
