from datetime import date
from fastapi import APIRouter,Depends,Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.schemas.analytics import AnalyticsSummary,CategoryTotal,MonthlyTotal,MonthlyComparison
from app.services.analytics_service import AnalyticsService
from app.utils.validators import validate_date_range
router=APIRouter(prefix="/analytics",tags=["Analytics"]);service=AnalyticsService()
@router.get("/summary",response_model=AnalyticsSummary)
def summary(date_from:date|None=None,date_to:date|None=None,db:Session=Depends(get_db),user=Depends(get_current_user)):
    today=date.today();date_from=date_from or today.replace(day=1);date_to=date_to or today;validate_date_range(date_from,date_to);return service.summary(db,user.id,date_from,date_to)
@router.get("/monthly",response_model=list[MonthlyTotal])
def monthly(year:int=Query(date.today().year,ge=2000,le=2100),db:Session=Depends(get_db),user=Depends(get_current_user)):return service.monthly(db,user.id,year)
@router.get("/categories",response_model=list[CategoryTotal])
def categories(date_from:date|None=None,date_to:date|None=None,db:Session=Depends(get_db),user=Depends(get_current_user)):
    today=date.today();date_from=date_from or today.replace(day=1);date_to=date_to or today;validate_date_range(date_from,date_to);return service.categories(db,user.id,date_from,date_to)
@router.get("/trends",response_model=MonthlyComparison)
def trends(year:int=Query(date.today().year,ge=2000,le=2100),month:int=Query(date.today().month,ge=1,le=12),db:Session=Depends(get_db),user=Depends(get_current_user)):return service.comparison(db,user.id,year,month)
