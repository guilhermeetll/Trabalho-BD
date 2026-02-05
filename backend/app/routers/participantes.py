from fastapi import APIRouter, HTTPException, Query, Depends
from app.schemas import ParticipanteCreate, ParticipanteResponse, ParticipanteUpdate
from app.repositories.participante_repostory import ParticipanteRepository
from app.security import get_current_user
from typing import List, Optional

router = APIRouter()
repository = ParticipanteRepository()

@router.post("/", response_model=ParticipanteResponse)
async def create_participante(participante: ParticipanteCreate, current_user: dict = Depends(get_current_user)):
    if current_user["type"] != "ADMIN":
        raise HTTPException(status_code=403, detail="Apenas administradores podem criar participantes")
    
    try:
        result = await repository.create(participante)
        return await repository.get_by_cpf(result.cpf)
    except Exception as e:
        if "Duplicate entry" in str(e):
            raise HTTPException(status_code=400, detail="CPF ou email já cadastrado")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[ParticipanteResponse])
async def list_participantes(
    search: Optional[str] = Query(None, description="Buscar por nome, email ou CPF"),
    tipo: Optional[str] = Query(None, description="Filtrar por tipo (DOCENTE, DISCENTE, TECNICO)"),
    current_user: dict = Depends(get_current_user)
):
    return await repository.list_all(search=search, tipo=tipo)

@router.get("/docentes", response_model=List[dict])
async def list_docentes(current_user: dict = Depends(get_current_user)):
    """Retorna apenas docentes para uso em selects"""
    return await repository.get_docentes()

@router.get("/{cpf}", response_model=ParticipanteResponse)
async def get_participante(cpf: str, current_user: dict = Depends(get_current_user)):
    participante = await repository.get_by_cpf(cpf)
    if not participante:
        raise HTTPException(status_code=404, detail="Participante não encontrado")
    return participante

@router.put("/{cpf}", response_model=ParticipanteResponse)
async def update_participante(cpf: str, participante: ParticipanteCreate, current_user: dict = Depends(get_current_user)):
    """Atualiza um participante existente"""
    if current_user["type"] != "ADMIN" and current_user["cpf"] != cpf:
        raise HTTPException(status_code=403, detail="Você não tem permissão para atualizar este perfil")

    existing = await repository.get_by_cpf(cpf)
    if not existing:
        raise HTTPException(status_code=404, detail="Participante não encontrado")
    
    # Apenas ADMIN pode alterar o tipo de um participante
    if current_user["type"] != "ADMIN" and participante.tipo != existing["tipo"]:
        raise HTTPException(status_code=403, detail="Apenas administradores podem alterar o tipo de perfil")
    
    try:
        return await repository.update(cpf, participante)
    except Exception as e:
        if "Duplicate entry" in str(e):
            raise HTTPException(status_code=400, detail="Email já cadastrado para outro participante")
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{cpf}")
async def delete_participante(cpf: str, current_user: dict = Depends(get_current_user)):
    """Deleta um participante"""
    if current_user["type"] != "ADMIN":
        raise HTTPException(status_code=403, detail="Apenas administradores podem deletar participantes")

    existing = await repository.get_by_cpf(cpf)
    if not existing:
        raise HTTPException(status_code=404, detail="Participante não encontrado")
    
    try:
        await repository.delete(cpf)
        return {"success": True, "message": "Participante deletado com sucesso"}
    except Exception as e:
        if "foreign key constraint" in str(e).lower() or "cannot delete" in str(e).lower():
            raise HTTPException(
                status_code=400, 
                detail="Não é possível deletar este participante pois está vinculado a projetos"
            )
        raise HTTPException(status_code=400, detail=str(e))
