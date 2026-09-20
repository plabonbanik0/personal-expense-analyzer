from decimal import Decimal
from pydantic import BaseModel

class CategoryTotal(BaseModel):
    category_id: int
    category_name: str
    total: Decimal
    percentage: Decimal

class MonthlyTotal(BaseModel):
    year: int
    month: int
    total: Decimal

class AnalyticsSummary(BaseModel):
    total_expenses: Decimal
    total_income: Decimal
    remaining_balance: Decimal
    savings: Decimal
    transaction_count: int
    average_transaction_amount: Decimal
    largest_expense: Decimal | None
    budget_utilization: Decimal | None

class MonthlyComparison(BaseModel):
    current_total: Decimal
    previous_total: Decimal
    absolute_change: Decimal
    percentage_change: Decimal | None
