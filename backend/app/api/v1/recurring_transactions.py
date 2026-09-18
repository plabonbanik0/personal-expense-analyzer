from fastapi import APIRouter,Depends,HTTPException,Query
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.recurring_transaction import RecurringTransaction
from app.models.category import Category
from app.schemas.recurring_transaction import *
router=APIRouter(prefix="/recurring-transactions",tags=["Recurring Transactions"])
def get_owned(db,id,uid):
    o=db.scalar(select(RecurringTransaction).where(RecurringTransaction.id==id,RecurringTransaction.user_id==uid))
    if not o:raise HTTPException(404,"Recurring transaction not found")
    return o
@router.post("",response_model=RecurringTransactionResponse,status_code=201)
def create(data:RecurringTransactionCreate,db:Session=Depends(get_db),user=Depends(get_current_user)):
    category=db.scalar(select(Category).where(Category.id==data.category_id,(Category.user_id==user.id)|(Category.user_id.is_(None))))
    if not category:raise HTTPException(422,"Invalid category")
    if category.type.value != data.transaction_type.value:raise HTTPException(422,"Category type does not match transaction type")
    o=RecurringTransaction(user_id=user.id,**data.model_dump());db.add(o);db.commit();db.refresh(o);return o
@router.get("",response_model=list[RecurringTransactionResponse])
def list_recurring(page:int=Query(1,ge=1),limit:int=Query(50,ge=1,le=100),db:Session=Depends(get_db),user=Depends(get_current_user)):
    return list(db.scalars(select(RecurringTransaction).where(RecurringTransaction.user_id==user.id).offset((page-1)*limit).limit(limit)))
@router.patch("/{id}",response_model=RecurringTransactionResponse)
def update(id:int,data:RecurringTransactionUpdate,db:Session=Depends(get_db),user=Depends(get_current_user)):
    o=get_owned(db,id,user.id)
    changes=data.model_dump(exclude_unset=True)
    category_id=changes.get("category_id",o.category_id)
    transaction_type=changes.get("transaction_type",o.transaction_type)
    if "category_id" in changes or "transaction_type" in changes:
        category=db.scalar(select(Category).where(Category.id==category_id,(Category.user_id==user.id)|(Category.user_id.is_(None))))
        if not category:raise HTTPException(422,"Invalid category")
        if category.type.value != transaction_type.value:raise HTTPException(422,"Category type does not match transaction type")
    for k,v in changes.items():setattr(o,k,v)
    db.commit();db.refresh(o);return o
@router.delete("/{id}",status_code=204)
def delete(id:int,db:Session=Depends(get_db),user=Depends(get_current_user)):db.delete(get_owned(db,id,user.id));db.commit()
