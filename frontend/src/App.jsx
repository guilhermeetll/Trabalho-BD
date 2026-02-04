import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import DashboardPage from './pages/DashboardPage'
import ProjetosPage from './pages/ProjetosPage'
import ParticipantesPage from './pages/ParticipantesPage'
import FinanciamentosPage from './pages/FinanciamentosPage'
import ProducoesPage from './pages/ProducoesPage'
import ConsultasPage from './pages/ConsultasPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import LoadingSpinner from './components/LoadingSpinner'
import ErrorBoundary from './components/ErrorBoundary'

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner fullScreen />
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// Layout with Sidebar
function Layout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        background: 'white',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '2rem 1.5rem',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          marginBottom: '2.5rem', 
          color: 'var(--primary)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          fontWeight: '700'
        }}>
          <span style={{ fontSize: '1.8rem' }}>🔬</span> SIGPesq
        </h2>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <Link
            to="/dashboard"
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              textDecoration: 'none',
              color: isActive('/dashboard') ? 'var(--primary)' : 'var(--text-muted)',
              background: isActive('/dashboard') ? '#eff6ff' : 'transparent',
              fontWeight: isActive('/dashboard') ? '600' : '400',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s'
            }}
          >
            <span>📊</span> Dashboard
          </Link>
          
          <Link
            to="/projetos"
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              textDecoration: 'none',
              color: isActive('/projetos') ? 'var(--primary)' : 'var(--text-muted)',
              background: isActive('/projetos') ? '#eff6ff' : 'transparent',
              fontWeight: isActive('/projetos') ? '600' : '400',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s'
            }}
          >
            <span>🚀</span> Projetos
          </Link>

          <Link
            to="/participantes"
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              textDecoration: 'none',
              color: isActive('/participantes') ? 'var(--primary)' : 'var(--text-muted)',
              background: isActive('/participantes') ? '#eff6ff' : 'transparent',
              fontWeight: isActive('/participantes') ? '600' : '400',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s'
            }}
          >
            <span>👥</span> Participantes
          </Link>
          
          <Link
            to="/financiamentos"
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              textDecoration: 'none',
              color: isActive('/financiamentos') ? 'var(--primary)' : 'var(--text-muted)',
              background: isActive('/financiamentos') ? '#eff6ff' : 'transparent',
              fontWeight: isActive('/financiamentos') ? '600' : '400',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s'
            }}
          >
            <span>💰</span> Financiamentos
          </Link>
          
          <Link
            to="/producoes"
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              textDecoration: 'none',
              color: isActive('/producoes') ? 'var(--primary)' : 'var(--text-muted)',
              background: isActive('/producoes') ? '#eff6ff' : 'transparent',
              fontWeight: isActive('/producoes') ? '600' : '400',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s'
            }}
          >
            <span>📚</span> Produções
          </Link>
          
          <Link
            to="/consultas"
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              textDecoration: 'none',
              color: isActive('/consultas') ? 'var(--primary)' : 'var(--text-muted)',
              background: isActive('/consultas') ? '#eff6ff' : 'transparent',
              fontWeight: isActive('/consultas') ? '600' : '400',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s'
            }}
          >
            <span>📋</span> Consultas
          </Link>
        </nav>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem' }}>
          <div style={{ 
            fontSize: '0.875rem', 
            fontWeight: '600', 
            marginBottom: '0.5rem',
            color: 'var(--secondary)'
          }}>
            {user?.name}
          </div>
          <div style={{ 
            fontSize: '0.75rem', 
            color: 'var(--text-muted)',
            marginBottom: '1rem'
          }}>
            {user?.email}
          </div>
          <button 
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              background: 'white',
              border: '1px solid #ef4444',
              borderRadius: '6px',
              color: '#ef4444',
              cursor: 'pointer',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              justifyContent: 'center'
            }}
          >
            <span>🚪</span> Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ 
        marginLeft: '260px', 
        flex: 1,
        minHeight: '100vh'
      }}>
        {children}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout><DashboardPage /></Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/projetos" element={
              <ProtectedRoute>
                <Layout><ProjetosPage /></Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/participantes" element={
              <ProtectedRoute>
                <Layout><ParticipantesPage /></Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/financiamentos" element={
              <ProtectedRoute>
                <Layout><FinanciamentosPage /></Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/producoes" element={
              <ProtectedRoute>
                <Layout><ProducoesPage /></Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/consultas" element={
              <ProtectedRoute>
                <Layout><ConsultasPage /></Layout>
              </ProtectedRoute>
            } />
            
            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
