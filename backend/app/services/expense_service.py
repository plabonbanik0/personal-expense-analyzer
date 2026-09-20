from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.category import Category, CategoryType
from app.models.expense import Expense
from app.repositories.expense_repository import ExpenseRepository

class ExpenseService:
    repo = ExpenseRepository()
    @staticmethod
    def _category(db, category_id, user_id):
        c = db.scalar(select(Category).where(Category.id==category_id, (Category.user_id==user_id)|(Category.user_id.is_(None)), Category.type==CategoryType.EXPENSE))
        if not c: raise HTTPException(422, "Invalid expense category")
        return c
    def create(self, db, user_id, data):
        self._category(db,data.category_id,user_id); obj=Expense(user_id=user_id,**data.model_dump()); db.add(obj); db.commit(); db.refresh(obj); return obj
    def get(self, db,id,user_id):
        obj=self.repo.get(db,id,user_id)
        if not obj: raise HTTPException(404,"Expense not found")
        return obj
    def list(self, db,user_id,date_from=None,date_to=None,category=None,payment_method=None,offset=0,limit=20,sort_by="expense_date",sort_order="desc"):
        q=select(Expense).where(Expense.user_id==user_id)
        if date_from: q=q.where(Expense.expense_date>=date_from)
        if date_to: q=q.where(Expense.expense_date<=date_to)
        if category: q=q.where(Expense.category_id==category)
        if payment_method: q=q.where(Expense.payment_method==payment_method)
        col=getattr(Expense, sort_by, Expense.expense_date); q=q.order_by(col.desc() if sort_order=="desc" else col.asc()).offset(offset).limit(limit)
        return list(db.scalars(q))
    def update(self,db,id,user_id,data):
        obj=self.get(db,id,user_id); values=data.model_dump(exclude_unset=True)
        if "category_id" in values:self._category(db,values["category_id"],user_id)
        for k,v in values.items():setattr(obj,k,v)
        db.commit();db.refresh(obj);return obj
    def delete(self,db,id,user_id):
        obj=self.get(db,id,user_id);db.delete(obj);db.commit()
