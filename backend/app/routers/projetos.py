from fastapi import APIRouter, HTTPException
from app.schemas import ProjetoCreate, ProjetoResponse, ProjetoDetail
from app.repositories.projeto_repository import ProjetoRepository
from typing import List

router = APIRouter()
repository = ProjetoRepository()

@router.post("/", response_model=ProjetoCreate)
async def create_projeto(projeto: ProjetoCreate):
    try:
        return await repository.create(projeto)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar projeto: {str(e)}")

@router.get("/", response_model=List[ProjetoResponse])
async def list_projetos():
    return await repository.list_all()

@router.get("/{codigo}", response_model=ProjetoResponse)
async def get_projeto(codigo: str):
    projeto = await repository.get_by_codigo(codigo)
    if not projeto:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    return projeto

@router.get("/{codigo}/detalhes", response_model=ProjetoDetail)
async def get_projeto_detadres(codigo: str):
    projeto = await repository.get_details(codigo)
    if not projeto:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    return projeto
