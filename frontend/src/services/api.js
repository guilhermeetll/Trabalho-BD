import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('sigpesq_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Only redirect to login if it's NOT a login request itself
        if (error.response?.status === 401 && !error.config.url.includes('/login')) {
            // Token expired or invalid
            localStorage.removeItem('sigpesq_token');
            localStorage.removeItem('sigpesq_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Helper functions for API calls
export const participantesAPI = {
    getAll: (query = '', tipo = '') => api.get('/participantes/', { params: { query, tipo } }),
    getById: (id) => api.get(`/participantes/${id}`),
    create: (data) => api.post('/participantes/', data),
    update: (id, data) => api.put(`/participantes/${id}`, data),
    delete: (id) => api.delete(`/participantes/${id}`),
};

export const projetosAPI = {
    getAll: (query = '', situacao = '') => api.get('/projetos/', { params: { search: query, situacao } }), // Fixed query param name
    getById: (id) => api.get(`/projetos/${id}`),
    getDetails: (id) => api.get(`/projetos/${id}/detalhes`), // Added specific details endpoint
    create: (data) => api.post('/projetos/', data),
    update: (id, data) => api.put(`/projetos/${id}`, data),
    delete: (id) => api.delete(`/projetos/${id}`),
    addParticipante: (id, data) => api.post(`/projetos/${id}/participantes`, data),
    addFinanciamento: (id, data) => api.post(`/projetos/${id}/financiamentos`, data),
};

export const financiamentosAPI = {
    getAll: (query = '', tipo = '') => api.get('/financiamentos/', { params: { query, tipo } }),
    getById: (id) => api.get(`/financiamentos/${id}`),
    getTotal: () => api.get('/financiamentos/total'),
    create: (data) => api.post('/financiamentos/', data),
    update: (id, data) => api.put(`/financiamentos/${id}`, data),
    delete: (id) => api.delete(`/financiamentos/${id}`),
};

const cleanParams = (params) => {
    const cleaned = {};
    Object.keys(params).forEach(key => {
        if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
            cleaned[key] = params[key];
        }
    });
    return cleaned;
};

export const producoesAPI = {
    getAll: (query = '', tipo = '', ano = '') => api.get('/producoes/', { params: cleanParams({ query, tipo, ano }) }),
    getById: (id) => api.get(`/producoes/${id}`),
    create: (data) => api.post('/producoes/', data),
    update: (id, data) => api.put(`/producoes/${id}`, data),
    delete: (id) => api.delete(`/producoes/${id}`),
};

export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getRecentProjects: () => api.get('/dashboard/recent-projects'),
    getRecentProducoes: () => api.get('/dashboard/recent-producoes'),
};

export const consultasAPI = {
    getCoordenadores: () => api.get('/consultas/coordenadores'),
    getProjetosByCoordenador: (cpf) => api.get(`/consultas/projetos-por-coordenador/${cpf}`),
    getAgencias: () => api.get('/consultas/agencias'),
    getFinanciamentosByAgencia: (agencia) => api.get(`/consultas/financiamentos-por-agencia/${agencia}`),
    getAnos: () => api.get('/consultas/anos'),
    getProducoesByAno: (ano) => api.get(`/consultas/producoes-por-ano/${ano}`),
};

export default api;
