# backend/app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_session  # Cambiado de get_db a get_session
from ..models.user import User
from ..schemas.user import UserRead
from ..utils.security import get_current_user_id

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/{user_id}", response_model=UserRead)
async def get_user(user_id: int, db: AsyncSession = Depends(get_session), current_user_id: int = Depends(get_current_user_id)):  # Cambiado get_db a get_session
    # allow only if authenticated (current_user_id provided)
    q = await db.execute(select(User).where(User.id == user_id))
    user = q.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user