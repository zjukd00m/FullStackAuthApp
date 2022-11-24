import re


def validate_password(password: str) -> bool:
    """
    The password must have at least:
    - 8 characters
    - 2 uppercase letters
    - 2 special characters
    - 2 numbers

    Args:
        password (str): The password to be validated

    Returns:
        bool: Whether the password meets the requirements
    """
    special = 0
    uppercase = 0
    numbers = 0

    for c in password:
        if re.fullmatch("\d", c):
            numbers += 1
        elif re.fullmatch("[\$\^\\#_~+-/]", c):
            special += 1
        elif re.fullmatch("[A-Z]", c):
            uppercase += 1

    if numbers >= 2 and special >= 2 and uppercase >= 2 and len(password) >= 8:
        return True

    return False
