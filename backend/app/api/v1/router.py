from fastapi import APIRouter
from app.api.v1 import auth,users,expenses,income,categories,budgets,recurring_transactions,analytics
api_router=APIRouter(prefix="/api/v1")
for router in (auth.router,users.router,expenses.router,income.router,categories.router,budgets.router,recurring_transactions.router,analytics.router):api_router.include_router(router)
