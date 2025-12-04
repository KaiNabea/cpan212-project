import {createContext, useState, useEffect, useContext} from "react"

const AuthContext = createContext()

export function useAuth () {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider")
    }
    return context
}
export function AuthProvider({children}) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        const storedToken = sessionStorage.getItem("authToken")
        const storedUser = sessionStorage.getItem("user")
        if (storedToken && storedUser) {
            setToken(storedToken)
            setUser(JSON.parse(storedUser))
        }
        setLoading(false)
    }, [])
    function login (userData, authToken) {
        setUser(userData)
        setToken(authToken)
        sessionStorage.setItem("authToken", authToken)
        sessionStorage.setItem("user", JSON.stringify(userData))
    }
    function logout() {
        setUser(null)
        setToken(null)
        sessionStorage.removeItem("authToken")
        sessionStorage.removeItem("user")
    }
    function isAuthenticated() {
        return !!token && !!user
    }
    const value = {
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated
    }
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}