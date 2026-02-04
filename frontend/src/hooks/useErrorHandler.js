import { useState, useCallback } from 'react'

export function useErrorHandler() {
  const [error, setError] = useState(null)

  const handleError = useCallback((err) => {
    console.error('Error:', err)
    
    let message = 'Ocorreu um erro inesperado'
    
    if (err.response) {
      // Erro de resposta da API
      const detail = err.response.data?.detail
      
      if (typeof detail === 'string') {
        message = detail
      } else if (Array.isArray(detail)) {
        // Erros de validação do Pydantic
        message = detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join(', ')
      } else if (err.response.status === 404) {
        message = 'Recurso não encontrado'
      } else if (err.response.status === 401) {
        message = 'Não autorizado. Faça login novamente'
      } else if (err.response.status === 403) {
        message = 'Acesso negado'
      } else if (err.response.status === 500) {
        message = 'Erro interno do servidor'
      }
    } else if (err.request) {
      // Erro de rede
      message = 'Erro de conexão. Verifique sua internet'
    } else if (err.message) {
      message = err.message
    }
    
    setError(message)
    return message
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return { error, handleError, clearError }
}

export default useErrorHandler
