from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from app.repositories.participante_repostory import ParticipanteRepository
from app.security import verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from app.schemas import ParticipanteCreate, TipoParticipante
from datetime import timedelta

router = APIRouter()
repository = ParticipanteRepository()

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    nome: str
    email: EmailStr
    cpf: str
    tipo: TipoParticipante
    senha: str

class SimpleRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_name: str
    user_type: str
    user_cpf: str

@router.post("/register", response_model=Token)
async def register(form_data: SimpleRegisterRequest):
    """Registra um novo usuário no sistema (versão simplificada)"""
    try:
        # Gerar CPF temporário baseado no timestamp
        import time
        temp_cpf = str(int(time.time() * 1000))[-11:]  # Últimos 11 dígitos do timestamp
        
        # Criar participante com tipo padrão Discente
        participante_data = ParticipanteCreate(
            nome=form_data.name,
            email=form_data.email,
            cpf=temp_cpf,
            tipo=TipoParticipante.DISCENTE,
            senha=form_data.password
        )
        
        await repository.create(participante_data)
        
        # Fazer login automático após registro
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": temp_cpf, "name": form_data.name, "type": "Discente"},
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_name": form_data.name,
            "user_type": "Discente",
            "user_cpf": temp_cpf
        }
    except Exception as e:
        if "Duplicate entry" in str(e) or "duplicate" in str(e).lower():
            raise HTTPException(status_code=400, detail="Email já cadastrado")
        raise HTTPException(status_code=400, detail=str(e))

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
