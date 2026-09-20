from calendar import monthrange
from datetime import date
from decimal import Decimal
from sqlalchemy import func, select
from app.models.expense import Expense
from app.models.income import Income
from app.models.category import Category
from app.models.budget import Budget

class AnalyticsService:
    def _expense_sum(self,db,uid,start,end): return db.scalar(select(func.coalesce(func.sum(Expense.amount),0)).where(Expense.user_id==uid,Expense.expense_date>=start,Expense.expense_date<=end)) or Decimal("0")
    def _income_sum(self,db,uid,start,end): return db.scalar(select(func.coalesce(func.sum(Income.amount),0)).where(Income.user_id==uid,Income.income_date>=start,Income.income_date<=end)) or Decimal("0")
    def summary(self,db,uid,start,end):
        expenses=self._expense_sum(db,uid,start,end); income=self._income_sum(db,uid,start,end)
        count=db.scalar(select(func.count(Expense.id)).where(Expense.user_id==uid,Expense.expense_date>=start,Expense.expense_date<=end)) or 0
        avg=db.scalar(select(func.avg(Expense.amount)).where(Expense.user_id==uid,Expense.expense_date>=start,Expense.expense_date<=end)) or Decimal("0")
        largest=db.scalar(select(func.max(Expense.amount)).where(Expense.user_id==uid,Expense.expense_date>=start,Expense.expense_date<=end))
        budget_total=db.scalar(select(func.coalesce(func.sum(Budget.amount),0)).where(Budget.user_id==uid,Budget.year==start.year,Budget.month==start.month)) or Decimal("0")
        util=(expenses/budget_total*100) if budget_total else None
        return dict(total_expenses=expenses,total_income=income,remaining_balance=income-expenses,savings=income-expenses,transaction_count=count,average_transaction_amount=avg,largest_expense=largest,budget_utilization=util)
    def categories(self,db,uid,start,end):
        total=self._expense_sum(db,uid,start,end)
        rows=db.execute(select(Category.id,Category.name,func.sum(Expense.amount)).join(Expense,Expense.category_id==Category.id).where(Expense.user_id==uid,Expense.expense_date>=start,Expense.expense_date<=end).group_by(Category.id,Category.name).order_by(func.sum(Expense.amount).desc())).all()
        return [dict(category_id=i,category_name=n,total=t,percentage=(t/total*100 if total else 0)) for i,n,t in rows]
    def monthly(self,db,uid,year):
        return [dict(year=year,month=m,total=self._expense_sum(db,uid,date(year,m,1),date(year,m,monthrange(year,m)[1]))) for m in range(1,13)]
    def comparison(self,db,uid,year,month):
        start=date(year,month,1);prev_year=year if month>1 else year-1;prev_month=month-1 if month>1 else 12
        current=self._expense_sum(db,uid,start,date(year,month,monthrange(year,month)[1]));previous=self._expense_sum(db,uid,date(prev_year,prev_month,1),date(prev_year,prev_month,monthrange(prev_year,prev_month)[1]));change=current-previous; pct=(change/previous*100 if previous else None)
        return dict(current_total=current,previous_total=previous,absolute_change=change,percentage_change=pct)
