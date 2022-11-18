import secrets
from typing import Optional
from datetime import datetime, timedelta
from base64 import b64encode, b64decode


def generate_random_code(length: int):
    if length <= 0:
        raise ValueError("The code length must be greater than 0")
    return secrets.token_urlsafe(length)


def add_expiration_time(seconds: int, time: Optional[datetime] = None):
    """
    Add the expiration time (in seconds) to the given time timestamp (in milliseconds).
    If the time is not given, the current time is used
    """
    if time and not isinstance(time, float):
        raise ValueError("Timestamp must be in miliseconds")
    if not time:
        time = datetime.now()

    expired_time = time + timedelta(seconds=seconds)

    return expired_time

    # expired_time_ms = expired_time.timestamp() * 1000

    # return expired_time_ms


def validate_token(token: str):
    """
    Validate a jwt token:
    - exp_time
    """
    exp_time = float(b64decode(token).decode("utf-8"))

    current_time = datetime.now()
    exp_time = datetime.fromtimestamp(exp_time)

    time_diff = exp_time.timestamp() - current_time.timestamp()

    print(f"The time difference is: {time_diff}")

    if time_diff <= 0:
        return False

    return True


def generate_email_code() -> str:
    """
    Generate an unique random email code to be used in every email
    template sent to the user.

    Returns:
        str: the unique random email code
    """
    return secrets.token_hex(10)
