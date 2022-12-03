from typing import Optional
from sqlmodel import Session, select
from src.models import Settings
from src.utils.db import engine


def get_user_settings(user_id: int) -> Optional[Settings]:
    with Session(engine) as sess:
        query = select(Settings).where(Settings.user_id == user_id)
        user_settings: Optional[Settings] = sess.exec(query).first()

        if not user_settings:
            return None

        return user_settings
