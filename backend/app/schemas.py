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
    senha: str = Field(..., min_length=6, max_length=50)

class ParticipanteUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    tipo: Optional[TipoParticipante] = None
    senha: Optional[str] = Field(None, min_length=6, max_length=50)

from datetime import date, datetime

class ParticipanteResponse(ParticipanteBase):
    criado_em: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Projeto Schemas ---
class ProjetoBase(BaseModel):
    codigo: str = Field(..., max_length=20)
    titulo: str
    descricao: Optional[str] = None
    data_inicio: datetime # Changed from date
    data_termino: Optional[datetime] = None # Changed from date
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
    data_inicio: datetime # Changed from date
    data_fim: Optional[datetime] = None # Changed from date
    
class FinanciamentoCreate(FinanciamentoBase):
    pass

class FinanciamentoResponse(FinanciamentoBase):
    pass

# --- Producao ---
class AutorInput(BaseModel):
    participante_cpf: str
    ordem: int

class ProducaoBase(BaseModel):
    id_registro: str
    projeto_codigo: Optional[str] = None
    titulo: str
    tipo: str
    ano_publicacao: int
    meio_divulgacao: Optional[str] = None

class ProducaoCreate(ProducaoBase):
    autores: Optional[List[AutorInput]] = []

class ProducaoResponse(ProducaoBase):
    projeto_titulo: Optional[str] = None
    autores: Optional[List[dict]] = []

