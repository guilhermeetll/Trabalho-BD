from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.repositories.participante_repostory import ParticipanteRepository
from app.security import verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta

router = APIRouter()
repository = ParticipanteRepository()

class LoginRequest(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_name: str
    user_type: str
    user_cpf: str

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: LoginRequest):
    user = await repository.get_by_email(form_data.email)
    if not user or not verify_password(form_data.password, user['senha_hash']):
        raise HTTPException(
            status_code=401,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    # Payload do token: CPF é o identificador principal (subject)
    access_token = create_access_token(
        data={"sub": user['cpf'], "name": user['nome'], "type": user['tipo']},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_name": user['nome'],
        "user_type": user['tipo'],
        "user_cpf": user['cpf']
    }
