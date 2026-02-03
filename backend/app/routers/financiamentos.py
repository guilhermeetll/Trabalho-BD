from fastapi import APIRouter, HTTPException
from app.schemas import AgenciaCreate, AgenciaResponse, FinanciamentoCreate, FinanciamentoResponse
from app.repositories.financiamento_repository import FinanciamentoRepository
from typing import List

router = APIRouter()
repository = FinanciamentoRepository()

@router.post("/agencias", response_model=AgenciaCreate)
async def create_agencia(agencia: AgenciaCreate):
    try:
        return await repository.create_agencia(agencia)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/agencias", response_model=List[AgenciaResponse])
async def list_agencias():
    return await repository.list_agencias()

@router.post("/", response_model=FinanciamentoCreate)
async def create_financiamento(fin: FinanciamentoCreate):
    try:
        return await repository.create_financiamento(fin)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[FinanciamentoResponse])
async def list_financiamentos():
    return await repository.list_financiamentos()
