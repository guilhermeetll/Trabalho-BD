from fastapi import APIRouter
from app.repositories.dashboard_repository import DashboardRepository
from typing import List

router = APIRouter()
repository = DashboardRepository()

@router.get("/stats")
async def get_stats():
    """Retorna estatísticas gerais do sistema"""
    return await repository.get_stats()

@router.get("/recent-projects")
async def get_recent_projects():
    """Retorna os 5 projetos mais recentes"""
    return await repository.get_recent_projects(limit=5)

@router.get("/recent-producoes")
async def get_recent_producoes():
    """Retorna as 5 produções mais recentes"""
    return await repository.get_recent_producoes(limit=5)
