from app.models.expense import Expense
from app.repositories.base_repository import OwnedRepository
class ExpenseRepository(OwnedRepository[Expense]):
    def __init__(self): super().__init__(Expense)
