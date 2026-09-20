from typing import TypeVar, Generic, Type
from sqlalchemy.orm import Session
from app.db.base import Base

T = TypeVar("T", bound=Base)
class OwnedRepository(Generic[T]):
    def __init__(self, model: Type[T]): self.model = model
    def get(self, db: Session, item_id: int, user_id: int):
        from sqlalchemy import select
        return db.scalar(select(self.model).where(self.model.id == item_id, self.model.user_id == user_id))
    def list(self, db: Session, user_id: int, offset: int, limit: int):
        from sqlalchemy import select
        return list(db.scalars(select(self.model).where(self.model.user_id == user_id).offset(offset).limit(limit)))
