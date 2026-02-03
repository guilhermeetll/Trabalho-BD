from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from enum import Enum
from datetime import date

# Enums
class TipoParticipante(str, Enum):
    DOCENTE = "DOCENTE"
    DISCENTE = "DISCENTE"
    TECNICO = "TECNICO"

class SituacaoProjeto(str, Enum):
    EM_ANDAMENTO = "EM_ANDAMENTO"
    CONCLUIDO = "CONCLUIDO"
    CANCELADO = "CANCELADO"

# --- Participante Schemas ---
class ParticipanteBase(BaseModel):
    cpf: str = Field(..., min_length=11, max_length=11)
    nome: str
    email: EmailStr
    tipo: TipoParticipante

class ParticipanteCreate(ParticipanteBase):
    senha: str

class ParticipanteResponse(ParticipanteBase):
    criado_em: Optional[date] = None

    class Config:
        from_attributes = True

# --- Projeto Schemas ---
class ProjetoBase(BaseModel):
    codigo: str = Field(..., max_length=20)
    titulo: str
    descricao: Optional[str] = None
    data_inicio: date
    data_termino: Optional[date] = None
    situacao: SituacaoProjeto = SituacaoProjeto.EM_ANDAMENTO
    coordenador_cpf: str = Field(..., min_length=11, max_length=11)

class ProjetoCreate(ProjetoBase):
    pass

class ParticipanteResumo(BaseModel):
    nome: str
    cpf: str
    funcao: str

class ProjetoResponse(ProjetoBase):
    coordenador_nome: Optional[str] = None
    
    class Config:
        from_attributes = True

class ProjetoDetail(ProjetoResponse):
    participantes: List[ParticipanteResumo] = []
    financiamentos: List[dict] = [] # Simplificado para o exemplo


# --- Agencia & Financiamento ---
class AgenciaBase(BaseModel):
    sigla: str
    nome: str

class AgenciaCreate(AgenciaBase):
    pass

class AgenciaResponse(AgenciaBase):
    pass

class FinanciamentoBase(BaseModel):
    codigo_processo: str
    agencia_sigla: str
    tipo_fomento: str
    valor_total: float
    data_inicio: date
    data_fim: date

class FinanciamentoCreate(FinanciamentoBase):
    pass

class FinanciamentoResponse(FinanciamentoBase):
    pass

# --- Producao ---
class ProducaoBase(BaseModel):
    id_registro: str
    projeto_codigo: Optional[str] = None
    titulo: str
    tipo: str
    ano_publicacao: int
    meio_divulgacao: Optional[str] = None

class ProducaoCreate(ProducaoBase):
    pass

class ProducaoResponse(ProducaoBase):
    projeto_titulo: Optional[str] = None

