from decimal import Decimal
from pydantic import BaseModel, Field
from app.schemas.common import ORMModel

class BudgetCreate(BaseModel):
    category_id: int = Field(gt=0)
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    month: int = Field(ge=1, le=12)
    year: int = Field(ge=2000, le=2100)

class BudgetUpdate(BaseModel):
    category_id: int | None = Field(default=None, gt=0)
    amount: Decimal | None = Field(default=None, gt=0, max_digits=12, decimal_places=2)
    month: int | None = Field(default=None, ge=1, le=12)
    year: int | None = Field(default=None, ge=2000, le=2100)

class BudgetResponse(ORMModel):
    id: int
    user_id: int
    category_id: int
    amount: Decimal
    month: int
    year: int
