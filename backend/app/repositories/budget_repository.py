from app.models.budget import Budget
from app.repositories.base_repository import OwnedRepository
class BudgetRepository(OwnedRepository[Budget]):
    def __init__(self): super().__init__(Budget)
