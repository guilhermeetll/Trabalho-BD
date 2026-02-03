import { useState, useEffect } from 'react'
import DashboardPage from './pages/DashboardPage'
import ProjetosPage from './pages/ProjetosPage'
import ParticipantesPage from './pages/ParticipantesPage'
import FinanciamentosPage from './pages/FinanciamentosPage'
import ProducoesPage from './pages/ProducoesPage'
import LoginPage from './pages/LoginPage'
import { AuthProvider, useAuth } from './context/AuthContext'

import RegisterPage from './pages/RegisterPage'

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [authView, setAuthView] = useState('login')
  const { user, loading, logout } = useAuth()

  if (loading) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Carregando...</div>

  if (!user) {
    if (authView === 'register') {
      return <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
    }
    return <LoginPage onSwitchToRegister={() => setAuthView('register')} />
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardPage />
      case 'projetos': return <ProjetosPage />
      case 'participantes': return <ParticipantesPage />
      case 'financiamentos': return <FinanciamentosPage />
      case 'producoes': return <ProducoesPage />
      default: return <DashboardPage />
    }
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '2.5rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.8rem' }}>⚡</span> SIGPesq
        </h2>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <button
            className={`btn-nav ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`btn-nav ${activeTab === 'projetos' ? 'active' : ''}`}
            onClick={() => setActiveTab('projetos')}
          >
            🚀 Projetos
          </button>
          <button
            className={`btn-nav ${activeTab === 'participantes' ? 'active' : ''}`}
            onClick={() => setActiveTab('participantes')}
          >
            👥 Participantes
          </button>
          <button
            className={`btn-nav ${activeTab === 'financiamentos' ? 'active' : ''}`}
            onClick={() => setActiveTab('financiamentos')}
          >
            💰 Financiamentos
          </button>
          <button
            className={`btn-nav ${activeTab === 'producoes' ? 'active' : ''}`}
            onClick={() => setActiveTab('producoes')}
          >
            📚 Produções
          </button>
        </nav>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>{user.name}</div>
          <button onClick={logout} className="btn-nav" style={{ color: '#ef4444', paddingLeft: 0 }}>
            🚪 Sair
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
