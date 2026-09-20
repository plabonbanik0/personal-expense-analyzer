from datetime import date
from decimal import Decimal
from pydantic import BaseModel, Field
from app.models.expense import PaymentMethod
from app.schemas.common import ORMModel

class ExpenseCreate(BaseModel):
    category_id: int = Field(gt=0)
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    description: str | None = Field(default=None, max_length=1000)
    expense_date: date
    payment_method: PaymentMethod

class ExpenseUpdate(BaseModel):
    category_id: int | None = Field(default=None, gt=0)
    amount: Decimal | None = Field(default=None, gt=0, max_digits=12, decimal_places=2)
    description: str | None = Field(default=None, max_length=1000)
    expense_date: date | None = None
    payment_method: PaymentMethod | None = None

class ExpenseResponse(ORMModel):
    id: int
    user_id: int
    category_id: int
    amount: Decimal
    description: str | None
    expense_date: date
    payment_method: PaymentMethod
