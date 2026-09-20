from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.core.security import create_access_token, hash_password, verify_password
from app.repositories.user_repository import UserRepository

class AuthService:
    @staticmethod
    def register(db: Session, name: str, email: str, password: str):
        if UserRepository.get_by_email(db, email): raise HTTPException(409, "Email is already registered")
        return UserRepository.create(db, name=name, email=email.lower(), hashed_password=hash_password(password))
    @staticmethod
    def login(db: Session, email: str, password: str):
        user = UserRepository.get_by_email(db, email)
        if not user or not verify_password(password, user.hashed_password): raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password", headers={"WWW-Authenticate":"Bearer"})
        return create_access_token(str(user.id))
