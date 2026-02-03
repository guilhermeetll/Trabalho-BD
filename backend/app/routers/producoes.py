from fastapi import APIRouter, HTTPException
from app.schemas import ProducaoCreate, ProducaoResponse
from app.repositories.producao_repository import ProducaoRepository
from typing import List

router = APIRouter()
repository = ProducaoRepository()

@router.post("/", response_model=ProducaoCreate)
async def create_producao(prod: ProducaoCreate):
    try:
        return await repository.create(prod)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[ProducaoResponse])
async def list_producoes():
    return await repository.list_all()
