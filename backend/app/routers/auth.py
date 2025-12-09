# backend/app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..models.user import User
from ..schemas.user import UserCreate, UserRead, Token
from ..utils.security import hash_password, verify_password, create_access_token
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", status_code=201)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    q = await db.execute(select(User).where(User.email == user.email))
    existing = q.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    new = User(name=user.name, email=user.email, password=hash_password(user.password))
    db.add(new)
    await db.commit()
    await db.refresh(new)
    return {"msg": "User created", "user_id": new.id}

@router.post("/token", response_model=Token)
async def login_token(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    q = await db.execute(select(User).where(User.email == form_data.username))
    user = q.scalar_one_or_none()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect credentials")
    token = create_access_token(str(user.id))
    return {"access_token": token, "token_type": "bearer"}
