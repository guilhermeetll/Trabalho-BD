import { createContext, useState, useEffect, useContext } from 'react'
import api from '../services/api'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check local storage on boot
        const storedUser = localStorage.getItem('sigpesq_user')
        const token = localStorage.getItem('sigpesq_token')

        if (storedUser && token) {
            setUser(JSON.parse(storedUser))
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }
        setLoading(false)
    }, [])

    const login = async (email, password) => {
        try {
            const response = await api.post('/login', { email, password })
            const { access_token, user_name, user_type, user_cpf } = response.data

            const userData = { name: user_name, type: user_type, cpf: user_cpf }

            localStorage.setItem('sigpesq_token', access_token)
            localStorage.setItem('sigpesq_user', JSON.stringify(userData))

            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
            setUser(userData)
            return true
        } catch (error) {
            console.error("Login failed", error)
            return false
        }
    }

    const logout = () => {
        localStorage.removeItem('sigpesq_token')
        localStorage.removeItem('sigpesq_user')
        delete api.defaults.headers.common['Authorization']
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
