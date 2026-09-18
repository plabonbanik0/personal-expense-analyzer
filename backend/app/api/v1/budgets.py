from fastapi import APIRouter,Depends,Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.schemas.budget import BudgetCreate,BudgetUpdate,BudgetResponse
from app.services.budget_service import BudgetService
router=APIRouter(prefix="/budgets",tags=["Budgets"]);service=BudgetService()
@router.post("",response_model=BudgetResponse,status_code=201)
def create(data:BudgetCreate,db:Session=Depends(get_db),user=Depends(get_current_user)):return service.create(db,user.id,data)
@router.get("",response_model=list[BudgetResponse])
def list_budgets(page:int=Query(1,ge=1),limit:int=Query(50,ge=1,le=100),db:Session=Depends(get_db),user=Depends(get_current_user)):return service.list(db,user.id,(page-1)*limit,limit)
@router.get("/{id}",response_model=BudgetResponse)
def get(id:int,db:Session=Depends(get_db),user=Depends(get_current_user)):return service.get(db,id,user.id)
@router.patch("/{id}",response_model=BudgetResponse)
def update(id:int,data:BudgetUpdate,db:Session=Depends(get_db),user=Depends(get_current_user)):return service.update(db,id,user.id,data)
@router.delete("/{id}",status_code=204)
def delete(id:int,db:Session=Depends(get_db),user=Depends(get_current_user)):service.delete(db,id,user.id)
