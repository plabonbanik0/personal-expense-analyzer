from datetime import date
from fastapi import APIRouter,Depends,Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.schemas.income import IncomeCreate,IncomeUpdate,IncomeResponse
from app.services.income_service import IncomeService
from app.utils.validators import validate_date_range
router=APIRouter(prefix="/income",tags=["Income"]);service=IncomeService()
@router.post("",response_model=IncomeResponse,status_code=201)
def create(data:IncomeCreate,db:Session=Depends(get_db),user=Depends(get_current_user)):return service.create(db,user.id,data)
@router.get("",response_model=list[IncomeResponse])
def list_income(date_from:date|None=None,date_to:date|None=None,page:int=Query(1,ge=1),limit:int=Query(20,ge=1,le=100),db:Session=Depends(get_db),user=Depends(get_current_user)):
    validate_date_range(date_from,date_to);return service.list(db,user.id,date_from,date_to,(page-1)*limit,limit)
@router.get("/{id}",response_model=IncomeResponse)
def get(id:int,db:Session=Depends(get_db),user=Depends(get_current_user)):return service.get(db,id,user.id)
@router.patch("/{id}",response_model=IncomeResponse)
def update(id:int,data:IncomeUpdate,db:Session=Depends(get_db),user=Depends(get_current_user)):return service.update(db,id,user.id,data)
@router.delete("/{id}",status_code=204)
def delete(id:int,db:Session=Depends(get_db),user=Depends(get_current_user)):service.delete(db,id,user.id)
