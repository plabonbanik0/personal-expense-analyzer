from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.user import User

class UserRepository:
    @staticmethod
    def get_by_email(db: Session, email: str): return db.scalar(select(User).where(User.email == email.lower()))
    @staticmethod
    def get(db: Session, user_id: int): return db.get(User, user_id)
    @staticmethod
    def create(db: Session, **kwargs):
        user = User(**kwargs); db.add(user); db.commit(); db.refresh(user); return user
