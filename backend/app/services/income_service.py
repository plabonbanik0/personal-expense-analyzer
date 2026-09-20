from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.income import Income
from app.repositories.income_repository import IncomeRepository
class IncomeService:
    repo=IncomeRepository()
    def create(self,db,user_id,data): obj=Income(user_id=user_id,**data.model_dump());db.add(obj);db.commit();db.refresh(obj);return obj
    def get(self,db,id,user_id):
        obj=self.repo.get(db,id,user_id)
        if not obj:raise HTTPException(404,"Income not found")
        return obj
    def list(self,db,user_id,date_from=None,date_to=None,offset=0,limit=20):
        q=select(Income).where(Income.user_id==user_id)
        if date_from:q=q.where(Income.income_date>=date_from)
        if date_to:q=q.where(Income.income_date<=date_to)
        return list(db.scalars(q.order_by(Income.income_date.desc()).offset(offset).limit(limit)))
    def update(self,db,id,user_id,data):
        obj=self.get(db,id,user_id)
        for k,v in data.model_dump(exclude_unset=True).items():setattr(obj,k,v)
        db.commit();db.refresh(obj);return obj
    def delete(self,db,id,user_id):obj=self.get(db,id,user_id);db.delete(obj);db.commit()
