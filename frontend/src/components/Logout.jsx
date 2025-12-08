import {useNavigate} from "react-router-dom"
import {useAuth} from "./AuthContext"
import {useEffect} from "react"

export default function Logout() {
    const navigate = useNavigate()
    const {logout} = useAuth()
    useEffect(() => {
        logout()
        navigate("/login", {replace: true})
    }, [logout, navigate])
    return (
        <div>
            Logging out...
        </div>
    )
}