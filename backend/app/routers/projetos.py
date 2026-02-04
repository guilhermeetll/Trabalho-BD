from fastapi import APIRouter, HTTPException, Query
from app.schemas import ProjetoCreate, ProjetoResponse, ProjetoDetail
from app.repositories.projeto_repository import ProjetoRepository
from typing import List, Optional
from pydantic import BaseModel
from datetime import date

router = APIRouter()
repository = ProjetoRepository()

class VincularParticipanteRequest(BaseModel):
    participante_cpf: str
    funcao: str
    data_entrada: date
    data_saida: Optional[date] = None

class VincularFinanciamentoRequest(BaseModel):
    financiamento_codigo: str
    valor_alocado: float

@router.post("/", response_model=ProjetoResponse)
async def create_projeto(projeto: ProjetoCreate):
    try:
        await repository.create(projeto)
        return await repository.get_by_codigo(projeto.codigo)
    except Exception as e:
        if "Duplicate entry" in str(e):
            raise HTTPException(status_code=400, detail="Código de projeto já existe")
        if "Regra violada" in str(e) or "coordenador" in str(e).lower():
            raise HTTPException(status_code=400, detail="O coordenador deve ser um DOCENTE")
        raise HTTPException(status_code=400, detail=f"Erro ao criar projeto: {str(e)}")

@router.get("/", response_model=List[ProjetoResponse])
async def list_projetos(
    search: Optional[str] = Query(None, description="Buscar por título, código ou coordenador"),
    situacao: Optional[str] = Query(None, description="Filtrar por situação")
):
    return await repository.list_all(search=search, situacao=situacao)

@router.get("/{codigo}", response_model=ProjetoResponse)
async def get_projeto(codigo: str):
    projeto = await repository.get_by_codigo(codigo)
    if not projeto:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    return projeto

@router.get("/{codigo}/detalhes", response_model=ProjetoDetail)
async def get_projeto_detalhes(codigo: str):
    projeto = await repository.get_details(codigo)
    if not projeto:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    return projeto

@router.put("/{codigo}", response_model=ProjetoResponse)
async def update_projeto(codigo: str, projeto: ProjetoCreate):
    """Atualiza um projeto existente"""
    existing = await repository.get_by_codigo(codigo)
    if not existing:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    
    try:
        return await repository.update(codigo, projeto)
    except Exception as e:
        if "Regra violada" in str(e) or "coordenador" in str(e).lower():
            raise HTTPException(status_code=400, detail="O coordenador deve ser um DOCENTE")
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{codigo}")
async def delete_projeto(codigo: str):
    """Deleta um projeto"""
    existing = await repository.get_by_codigo(codigo)
    if not existing:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    
    try:
        await repository.delete(codigo)
        return {"success": True, "message": "Projeto deletado com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{codigo}/participantes")
async def vincular_participante(codigo: str, data: VincularParticipanteRequest):
    """Vincula um participante a um projeto"""
    projeto = await repository.get_by_codigo(codigo)
    if not projeto:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    
    try:
        await repository.add_participante(
            codigo, 
            data.participante_cpf, 
            data.funcao, 
            str(data.data_entrada),
            str(data.data_saida) if data.data_saida else None
        )
        return {"success": True, "message": "Participante vinculado com sucesso"}
    except Exception as e:
        if "Duplicate entry" in str(e):
            raise HTTPException(status_code=400, detail="Participante já vinculado a este projeto")
        if "foreign key constraint" in str(e).lower():
            raise HTTPException(status_code=400, detail="Participante não encontrado")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{codigo}/financiamentos")
async def vincular_financiamento(codigo: str, data: VincularFinanciamentoRequest):
    """Vincula um financiamento a um projeto"""
    projeto = await repository.get_by_codigo(codigo)
    if not projeto:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    
    try:
        await repository.add_financiamento(codigo, data.financiamento_codigo, data.valor_alocado)
        return {"success": True, "message": "Financiamento vinculado com sucesso"}
    except Exception as e:
        if "Duplicate entry" in str(e):
            raise HTTPException(status_code=400, detail="Financiamento já vinculado a este projeto")
        if "foreign key constraint" in str(e).lower():
            raise HTTPException(status_code=400, detail="Financiamento não encontrado")
        raise HTTPException(status_code=400, detail=str(e))
