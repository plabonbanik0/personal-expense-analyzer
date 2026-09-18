from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy import func,select
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.category import Category
from app.schemas.category import CategoryCreate,CategoryUpdate,CategoryResponse
router=APIRouter(prefix="/categories",tags=["Categories"])
def owned(db,id,uid):
    o=db.scalar(select(Category).where(Category.id==id,Category.user_id==uid));
    if not o:raise HTTPException(404,"Category not found")
    return o
@router.post("",response_model=CategoryResponse,status_code=201)
def create(data:CategoryCreate,db:Session=Depends(get_db),user=Depends(get_current_user)):
    if db.scalar(select(Category).where(Category.user_id==user.id,func.lower(Category.name)==data.name.lower(),Category.type==data.type)):raise HTTPException(409,"Category already exists")
    o=Category(user_id=user.id,**data.model_dump());db.add(o);db.commit();db.refresh(o);return o
@router.get("",response_model=list[CategoryResponse])
def list_categories(db:Session=Depends(get_db),user=Depends(get_current_user)):return list(db.scalars(select(Category).where((Category.user_id==user.id)|(Category.user_id.is_(None))).order_by(Category.name)))
@router.patch("/{id}",response_model=CategoryResponse)
def update(id:int,data:CategoryUpdate,db:Session=Depends(get_db),user=Depends(get_current_user)):
    o=owned(db,id,user.id)
    changes=data.model_dump(exclude_unset=True)
    if "type" in changes and changes["type"] != o.type:
        if o.expenses or o.budgets or o.recurring_transactions:
            raise HTTPException(409, "Cannot change category type when the category is already referenced")
    if "name" in changes or "type" in changes:
        name = changes.get("name", o.name)
        category_type = changes.get("type", o.type)
        if db.scalar(select(Category).where(
            Category.user_id == user.id,
            func.lower(Category.name) == name.lower(),
            Category.type == category_type,
            Category.id != id,
        )):
            raise HTTPException(409, "Category already exists")
    for k,v in changes.items():setattr(o,k,v)
    db.commit();db.refresh(o);return o
@router.delete("/{id}",status_code=204)
def delete(id:int,db:Session=Depends(get_db),user=Depends(get_current_user)):db.delete(owned(db,id,user.id));db.commit()
