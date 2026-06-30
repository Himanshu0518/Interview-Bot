from slowapi import Limiter
from slowapi.util import get_remote_address

# Single shared limiter instance.
# main.py assigns this to app.state.limiter so slowapi's middleware
# and every @limiter.limit() decorator all reference the same object.
limiter = Limiter(key_func=get_remote_address)
