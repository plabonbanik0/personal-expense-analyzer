from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
router=APIRouter(prefix="/users",tags=["Users"])
@router.get("/me",response_model=UserResponse)
def get_me(user=Depends(get_current_user)):return user
@router.patch("/me",response_model=UserResponse)
def update_me(data:UserUpdate,db:Session=Depends(get_db),user=Depends(get_current_user)):
    values=data.model_dump(exclude_unset=True)
    if "email" in values:
        existing=db.query(User).filter(User.email==values["email"].lower(),User.id!=user.id).first()
        if existing:raise HTTPException(409,"Email is already registered")
        values["email"]=values["email"].lower()
    for k,v in values.items():setattr(user,k,v)
    db.commit();db.refresh(user);return user
