from app.models.income import Income
from app.repositories.base_repository import OwnedRepository
class IncomeRepository(OwnedRepository[Income]):
    def __init__(self): super().__init__(Income)
