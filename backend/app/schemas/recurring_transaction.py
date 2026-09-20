from datetime import date
from decimal import Decimal
from pydantic import BaseModel, Field
from app.models.recurring_transaction import Frequency, TransactionType
from app.schemas.common import ORMModel

class RecurringTransactionCreate(BaseModel):
    category_id: int = Field(gt=0)
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    transaction_type: TransactionType
    frequency: Frequency
    next_date: date

class RecurringTransactionUpdate(BaseModel):
    category_id: int | None = Field(default=None, gt=0)
    amount: Decimal | None = Field(default=None, gt=0, max_digits=12, decimal_places=2)
    transaction_type: TransactionType | None = None
    frequency: Frequency | None = None
    next_date: date | None = None
    is_active: bool | None = None

class RecurringTransactionResponse(ORMModel):
    id: int
    user_id: int
    category_id: int
    amount: Decimal
    transaction_type: TransactionType
    frequency: Frequency
    next_date: date
    is_active: bool
