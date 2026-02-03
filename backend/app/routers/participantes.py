from fastapi import APIRouter, HTTPException
from app.schemas import ParticipanteCreate, ParticipanteResponse
from app.repositories.participante_repostory import ParticipanteRepository
from typing import List

router = APIRouter()
repository = ParticipanteRepository()

@router.post("/", response_model=ParticipanteCreate)
async def create_participante(participante: ParticipanteCreate):
    try:
        return await repository.create(participante)
    except Exception as e:
        # Simplificação de erro (ex: duplicidade de chave)
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[ParticipanteResponse])
async def list_participantes():
    return await repository.list_all()

@router.get("/{cpf}", response_model=ParticipanteResponse)
async def get_participante(cpf: str):
    participante = await repository.get_by_cpf(cpf)
    if not participante:
        raise HTTPException(status_code=404, detail="Participante não encontrado")
    return participante
