from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.schemas.auth import RegisterRequest, LoginRequest, Token, UserResponse
from app.services.auth_service import AuthService

router=APIRouter(prefix="/auth",tags=["Authentication"])
@router.post("/register",response_model=UserResponse,status_code=status.HTTP_201_CREATED)
def register(data:RegisterRequest,db:Session=Depends(get_db)):return AuthService.register(db,**data.model_dump())
@router.post("/login",response_model=Token)
def login(data:LoginRequest,db:Session=Depends(get_db)):return Token(access_token=AuthService.login(db,data.email,data.password))
@router.get("/me",response_model=UserResponse)
def me(user=Depends(get_current_user)):return user
