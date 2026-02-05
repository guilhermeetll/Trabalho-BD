from fastapi import APIRouter, HTTPException, Query, Depends
from app.schemas import ProducaoCreate, ProducaoResponse
from app.repositories.producao_repository import ProducaoRepository
from app.repositories.projeto_repository import ProjetoRepository
from app.security import get_current_user
from typing import List, Optional
from datetime import datetime

router = APIRouter()
repository = ProducaoRepository()
projeto_repository = ProjetoRepository()

@router.post("/", response_model=ProducaoResponse)
async def create_producao(prod: ProducaoCreate, current_user: dict = Depends(get_current_user)):
    # Validar ano não futuro
    ano_atual = datetime.now().year
    if prod.ano_publicacao > ano_atual:
        raise HTTPException(
            status_code=400, 
            detail=f"O ano de publicação não pode ser maior que {ano_atual}"
        )
    
    try:
        await repository.create(prod)
        
        # Adicionar autores se fornecidos
        if prod.autores:
            for autor in prod.autores:
                await repository.add_autor(prod.id_registro, autor.participante_cpf, autor.ordem)
        
        return await repository.get_by_id(prod.id_registro)
    except Exception as e:
        if "Duplicate entry" in str(e):
            raise HTTPException(status_code=400, detail="ID de registro já existe")
        if "foreign key constraint" in str(e).lower():
            raise HTTPException(status_code=400, detail="Projeto ou participante não encontrado")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[ProducaoResponse])
async def list_producoes(
    search: Optional[str] = Query(None, description="Buscar por título ou veículo"),
    tipo: Optional[str] = Query(None, description="Filtrar por tipo"),
    ano: Optional[int] = Query(None, description="Filtrar por ano"),
    current_user: dict = Depends(get_current_user)
):
    return await repository.list_all(search=search, tipo=tipo, ano=ano)

@router.get("/anos", response_model=List[int])
async def list_anos(current_user: dict = Depends(get_current_user)):
    """Retorna lista de anos distintos para filtro"""
    return await repository.get_anos()

@router.get("/{id_registro:path}", response_model=ProducaoResponse)
async def get_producao(id_registro: str, current_user: dict = Depends(get_current_user)):
    producao = await repository.get_by_id(id_registro)
    if not producao:
        raise HTTPException(status_code=404, detail="Produção não encontrada")
    return producao

@router.put("/{id_registro:path}", response_model=ProducaoResponse)
async def update_producao(id_registro: str, prod: ProducaoCreate, current_user: dict = Depends(get_current_user)):
    """Atualiza uma produção existente"""
    # Validar ano não futuro
    ano_atual = datetime.now().year
    if prod.ano_publicacao > ano_atual:
        raise HTTPException(
            status_code=400, 
            detail=f"O ano de publicação não pode ser maior que {ano_atual}"
        )
    
    existing = await repository.get_by_id(id_registro)
    if not existing:
        raise HTTPException(status_code=404, detail="Produção não encontrada")
    
    # Verificar permissão
    is_admin = current_user["type"] == "ADMIN"
    is_coordenador = False
    if existing["projeto_codigo"]:
        projeto = await projeto_repository.get_by_codigo(existing["projeto_codigo"])
        if projeto and projeto["coordenador_cpf"] == current_user["cpf"]:
            is_coordenador = True
    
    is_autor = any(autor["cpf"] == current_user["cpf"] for autor in existing["autores"])
    
    if not (is_admin or is_coordenador or is_autor):
        raise HTTPException(status_code=403, detail="Você não tem permissão para atualizar esta produção")
    
    try:
        # Atualizar produção
        await repository.update(id_registro, prod)
        
        # Atualizar autores
        await repository.remove_autores(id_registro)
        if prod.autores:
            for autor in prod.autores:
                await repository.add_autor(id_registro, autor.participante_cpf, autor.ordem)
        
        return await repository.get_by_id(id_registro)
    except Exception as e:
        if "foreign key constraint" in str(e).lower():
            raise HTTPException(status_code=400, detail="Projeto ou participante não encontrado")
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{id_registro:path}")
async def delete_producao(id_registro: str, current_user: dict = Depends(get_current_user)):
    """Deleta uma produção"""
    existing = await repository.get_by_id(id_registro)
    if not existing:
        raise HTTPException(status_code=404, detail="Produção não encontrada")
    
    # Verificar permissão (apenas Admin ou Coordenador do projeto)
    is_admin = current_user["type"] == "ADMIN"
    is_coordenador = False
    if existing["projeto_codigo"]:
        projeto = await projeto_repository.get_by_codigo(existing["projeto_codigo"])
        if projeto and projeto["coordenador_cpf"] == current_user["cpf"]:
            is_coordenador = True
            
    if not (is_admin or is_coordenador):
        raise HTTPException(status_code=403, detail="Apenas o administrador ou o coordenador do projeto podem deletar a produção")
    
    try:
        await repository.delete(id_registro)
        return {"success": True, "message": "Produção deletada com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
