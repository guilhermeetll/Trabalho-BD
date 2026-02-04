from fastapi import APIRouter, HTTPException
from app.repositories.consulta_repository import ConsultaRepository
from app.repositories.participante_repostory import ParticipanteRepository
from app.repositories.financiamento_repository import FinanciamentoRepository
from app.repositories.producao_repository import ProducaoRepository

router = APIRouter()
consulta_repo = ConsultaRepository()
participante_repo = ParticipanteRepository()
financiamento_repo = FinanciamentoRepository()
producao_repo = ProducaoRepository()

@router.get("/coordenadores")
async def list_coordenadores():
    """Retorna lista de docentes para usar como coordenadores"""
    return await participante_repo.get_docentes()

@router.get("/projetos-por-coordenador/{coordenador_cpf}")
async def get_projetos_by_coordenador(coordenador_cpf: str):
    """Retorna todos os projetos de um coordenador"""
    projetos = await consulta_repo.get_projetos_by_coordenador(coordenador_cpf)
    return projetos

@router.get("/agencias")
async def list_agencias():
    """Retorna lista de agências que possuem financiamentos"""
    return await financiamento_repo.get_agencias_distinct()

@router.get("/financiamentos-por-agencia/{agencia_sigla}")
async def get_financiamentos_by_agencia(agencia_sigla: str):
    """Retorna financiamentos de uma agência com total"""
    return await consulta_repo.get_financiamentos_by_agencia(agencia_sigla)

@router.get("/anos")
async def list_anos():
    """Retorna lista de anos distintos de produções"""
    return await producao_repo.get_anos()

@router.get("/producoes-por-ano/{ano}")
async def get_producoes_by_ano(ano: int):
    """Retorna produções de um ano agrupadas por tipo"""
    return await consulta_repo.get_producoes_by_ano(ano)
