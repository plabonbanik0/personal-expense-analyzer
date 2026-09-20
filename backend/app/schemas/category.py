from app.models.category import CategoryType
from pydantic import BaseModel, Field
from app.schemas.common import ORMModel

class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    type: CategoryType

class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    type: CategoryType | None = None

class CategoryResponse(ORMModel):
    id: int
    name: str
    type: CategoryType
    user_id: int | None
