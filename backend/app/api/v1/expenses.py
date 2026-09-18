from datetime import date
from fastapi import APIRouter,Depends,Query,status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.expense import PaymentMethod
from app.schemas.expense import ExpenseCreate,ExpenseUpdate,ExpenseResponse
from app.services.expense_service import ExpenseService
from app.utils.validators import validate_date_range
router=APIRouter(prefix="/expenses",tags=["Expenses"]); service=ExpenseService()
@router.post("",response_model=ExpenseResponse,status_code=201)
def create(data:ExpenseCreate,db:Session=Depends(get_db),user=Depends(get_current_user)):return service.create(db,user.id,data)
@router.get("",response_model=list[ExpenseResponse])
def list_expenses(date_from:date|None=None,date_to:date|None=None,category:int|None=Query(None,gt=0),payment_method:PaymentMethod|None=None,page:int=Query(1,ge=1),limit:int=Query(20,ge=1,le=100),sort_by:str=Query("expense_date",pattern="^(expense_date|amount|created_at)$"),sort_order:str=Query("desc",pattern="^(asc|desc)$"),db:Session=Depends(get_db),user=Depends(get_current_user)):
    validate_date_range(date_from,date_to);return service.list(db,user.id,date_from,date_to,category,payment_method,(page-1)*limit,limit,sort_by,sort_order)
@router.get("/{id}",response_model=ExpenseResponse)
def get(id:int,db:Session=Depends(get_db),user=Depends(get_current_user)):return service.get(db,id,user.id)
@router.patch("/{id}",response_model=ExpenseResponse)
def update(id:int,data:ExpenseUpdate,db:Session=Depends(get_db),user=Depends(get_current_user)):return service.update(db,id,user.id,data)
@router.delete("/{id}",status_code=204)
def delete(id:int,db:Session=Depends(get_db),user=Depends(get_current_user)):service.delete(db,id,user.id)
