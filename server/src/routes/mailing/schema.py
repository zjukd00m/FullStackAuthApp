from pydantic import BaseModel
from typing import List
from enum import Enum


class MailingService(str, Enum):
    ACCOUNT_CONFIRMATION = "ACCOUNT_CONFIRMATION"


class MailingDetails(BaseModel):
    emails: List[str]
