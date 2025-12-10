from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..schemas.user import UserCreate, UserRead  # Cambiado UserResponse por UserRead
from ..models.user import User
from ..database import get_session
from ..utils.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


# ---------------------------- REGISTER --------------------------------------
@router.post("/register", response_model=UserRead)  # Cambiado UserResponse por UserRead
async def register(payload: UserCreate, db: AsyncSession = Depends(get_session)):
    query = select(User).where(User.email == payload.email)
    result = await db.execute(query)
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado.")

    new_user = User(
        name=payload.name,
        email=payload.email,
        farm_name=payload.farm_name,
        password=hash_password(payload.password),
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user


# ---------------------------- LOGIN --------------------------------------
@router.post("/login")
async def login(data: dict, db: AsyncSession = Depends(get_session)):
    email = data.get("email")
    password = data.get("password")

    # Validar email
    query = select(User).where(User.email == email)
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=400, detail="Correo o contraseña incorrectos")

    # Validar contraseña
    if not verify_password(password, user.password):
        raise HTTPException(status_code=400, detail="Correo o contraseña incorrectos")

    # Crear token
    access_token = create_access_token(subject=str(user.id))

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }