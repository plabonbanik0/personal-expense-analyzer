from pydantic import EmailStr, Field, field_validator
from app.schemas.common import ORMModel

class UserUpdate(ORMModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    email: EmailStr | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Name cannot be blank")
        return value

class UserResponse(ORMModel):
    id: int
    name: str
    email: EmailStr
    is_active: bool
