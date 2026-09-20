from datetime import date
from decimal import Decimal
from pydantic import BaseModel, Field
from app.schemas.common import ORMModel

class IncomeCreate(BaseModel):
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    source: str = Field(min_length=1, max_length=100)
    income_date: date
    description: str | None = Field(default=None, max_length=1000)

class IncomeUpdate(BaseModel):
    amount: Decimal | None = Field(default=None, gt=0, max_digits=12, decimal_places=2)
    source: str | None = Field(default=None, min_length=1, max_length=100)
    income_date: date | None = None
    description: str | None = Field(default=None, max_length=1000)

class IncomeResponse(ORMModel):
    id: int
    user_id: int
    amount: Decimal
    source: str
    income_date: date
    description: str | None
