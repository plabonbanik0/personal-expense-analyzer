from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from app.core.config import settings
from app.api.v1.router import api_router

app = FastAPI(title=settings.app_name, version="1.0.0", description="REST API for Personal Expense Analyzer")
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(api_router)

@app.get("/api/v1/health", tags=["Health"])
def health():
    return {"status": "ok"}

@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError):
    return JSONResponse(status_code=409, content={"detail": "The requested operation violates a data constraint"})

@app.exception_handler(SQLAlchemyError)
async def database_error_handler(request: Request, exc: SQLAlchemyError):
    return JSONResponse(status_code=500, content={"detail": "A database error occurred"})
