from fastapi import HTTPException
from sqlalchemy import select
from app.models.budget import Budget
from app.models.category import Category, CategoryType
from app.repositories.budget_repository import BudgetRepository
class BudgetService:
    repo=BudgetRepository()
    def _category(self,db,cid,uid):
        c=db.scalar(select(Category).where(Category.id==cid,(Category.user_id==uid)|(Category.user_id.is_(None)),Category.type==CategoryType.EXPENSE))
        if not c:raise HTTPException(422,"Invalid budget category")
    def create(self,db,uid,data):
        self._category(db,data.category_id,uid)
        if db.scalar(select(Budget).where(Budget.user_id==uid,Budget.category_id==data.category_id,Budget.month==data.month,Budget.year==data.year)):raise HTTPException(409,"Budget already exists for this category and period")
        o=Budget(user_id=uid,**data.model_dump());db.add(o);db.commit();db.refresh(o);return o
    def get(self,db,id,uid):
        o=self.repo.get(db,id,uid)
        if not o:raise HTTPException(404,"Budget not found")
        return o
    def list(self,db,uid,offset=0,limit=50):return self.repo.list(db,uid,offset,limit)
    def update(self,db,id,uid,data):
        o=self.get(db,id,uid);v=data.model_dump(exclude_unset=True)
        if "category_id" in v:self._category(db,v["category_id"],uid)
        for k,x in v.items():setattr(o,k,x)
        db.commit();db.refresh(o);return o
    def delete(self,db,id,uid):o=self.get(db,id,uid);db.delete(o);db.commit()
