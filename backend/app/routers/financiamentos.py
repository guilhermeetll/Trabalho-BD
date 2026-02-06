from fastapi import APIRouter, HTTPException, Query, Depends
from app.schemas import AgenciaCreate, AgenciaResponse, FinanciamentoCreate, FinanciamentoResponse
from app.repositories.financiamento_repository import FinanciamentoRepository
from app.security import get_current_user
from typing import List, Optional

router = APIRouter()
repository = FinanciamentoRepository()

@router.post("/agencias", response_model=AgenciaResponse)
async def create_agencia(agencia: AgenciaCreate, current_user: dict = Depends(get_current_user)):
    if current_user["type"] not in ["ADMIN", "DOCENTE"]:
        raise HTTPException(status_code=403, detail="Apenas administradores ou docentes podem cadastrar agências")
    
    try:
        return await repository.create_agencia(agencia)
    except Exception as e:
        if "Duplicate entry" in str(e):
            raise HTTPException(status_code=400, detail="Agência já cadastrada")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/agencias", response_model=List[AgenciaResponse])
async def list_agencias(current_user: dict = Depends(get_current_user)):
    return await repository.list_agencias()

@router.get("/agencias-distinct", response_model=List[dict])
async def list_agencias_distinct(current_user: dict = Depends(get_current_user)):
    """Retorna agências que possuem financiamentos"""
    return await repository.get_agencias_distinct()

@router.post("/", response_model=FinanciamentoResponse)
async def create_financiamento(fin: FinanciamentoCreate, current_user: dict = Depends(get_current_user)):
    if current_user["type"] not in ["ADMIN", "DOCENTE"]:
        raise HTTPException(status_code=403, detail="Apenas administradores ou docentes podem cadastrar financiamentos")

    # Validar valor positivo
    if fin.valor_total <= 0:
        raise HTTPException(status_code=400, detail="O valor do financiamento deve ser positivo")
    
    try:
        await repository.create_financiamento(fin)
        return await repository.get_by_codigo(fin.codigo_processo)
    except Exception as e:
        if "Duplicate entry" in str(e):
            raise HTTPException(status_code=400, detail="Código de processo já existe")
        if "foreign key constraint" in str(e).lower():
            raise HTTPException(status_code=400, detail="Agência não encontrada")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[FinanciamentoResponse])
async def list_financiamentos(
    search: Optional[str] = Query(None, description="Buscar por agência ou processo"),
    tipo: Optional[str] = Query(None, description="Filtrar por tipo de fomento"),
    current_user: dict = Depends(get_current_user)
):
    return await repository.list_financiamentos(search=search, tipo=tipo)

@router.get("/total")
async def get_total_financiamentos(current_user: dict = Depends(get_current_user)):
    """Retorna o valor total de todos os financiamentos"""
    total = await repository.get_total()
    return {"total": float(total)}

@router.get("/{codigo_processo}", response_model=FinanciamentoResponse)
async def get_financiamento(codigo_processo: str, current_user: dict = Depends(get_current_user)):
    financiamento = await repository.get_by_codigo(codigo_processo)
    if not financiamento:
        raise HTTPException(status_code=404, detail="Financiamento não encontrado")
    return financiamento

@router.put("/{codigo_processo}", response_model=FinanciamentoResponse)
async def update_financiamento(codigo_processo: str, fin: FinanciamentoCreate, current_user: dict = Depends(get_current_user)):
    """Atualiza um financiamento existente"""
    if current_user["type"] != "ADMIN":
        raise HTTPException(status_code=403, detail="Apenas administradores podem atualizar financiamentos")

    # Validar valor positivo
    if fin.valor_total <= 0:
        raise HTTPException(status_code=400, detail="O valor do financiamento deve ser positivo")
    
    existing = await repository.get_by_codigo(codigo_processo)
    if not existing:
        raise HTTPException(status_code=404, detail="Financiamento não encontrado")
    
    try:
        return await repository.update(codigo_processo, fin)
    except Exception as e:
        if "foreign key constraint" in str(e).lower():
            raise HTTPException(status_code=400, detail="Agência não encontrada")
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{codigo_processo}")
async def delete_financiamento(codigo_processo: str, current_user: dict = Depends(get_current_user)):
    """Deleta um financiamento"""
    if current_user["type"] != "ADMIN":
        raise HTTPException(status_code=403, detail="Apenas administradores podem deletar financiamentos")

    existing = await repository.get_by_codigo(codigo_processo)
    if not existing:
        raise HTTPException(status_code=404, detail="Financiamento não encontrado")
    
    try:
        await repository.delete(codigo_processo)
        return {"success": True, "message": "Financiamento deletado com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
