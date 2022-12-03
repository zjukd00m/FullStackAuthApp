from typing import List, Optional
from sqlmodel import Session, select
from src.utils.db import engine
from src.models import Settings, UserGroup, Group
from src.enums import GroupType


def get_user_settings(user_id: int) -> Optional[Settings]:
    with Session(engine) as sess:
        query = select(Settings).where(Settings.user_id == user_id)
        settings: Optional[Settings] = sess.exec(query).first()

        if not settings:
            return None

        return settings


def get_user_roles(user_id: int) -> List[GroupType]:
    with Session(engine) as sess:
        query = select(UserGroup, Group).where(UserGroup.user_id == user_id)
        user_groups = sess.exec(query).fetchall()

        user_groups = list(map(lambda user_group: user_group[1].name, user_groups))

        return user_groups
