from starlette.authentication import BaseUser


class CustomUser(BaseUser):
    def __init__(self, id: int, email: str):
        self.id = id
        self.email = email

    @property
    def is_authenticated(self) -> bool:
        return True

    @property
    def display_name(self) -> str:
        return self.email
