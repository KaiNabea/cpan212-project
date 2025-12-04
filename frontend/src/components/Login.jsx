import React, {useState, useEffect, createContext} from "react"
import {useNavigate} from "react-router-dom"
import "./Login.css"

export default function Login() {
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            const response = await fetch("http://localhost:3000/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({email, password})
            })
            const data = await response.json()
            if (response.ok) {
                sessionStorage.setItem("authToken", data.token)
                sessionStorage.setItem("user", JSON.stringify(data.user))
                navigate("/users/mainpage")
            } else {
                setError(data.errorMessage || "Login failed")
            }
        } catch (err) {
            setError("Network error. Please try again.")
            console.error("Login error:", err)
        } finally {
            setLoading(false)
        }
    }
    return (
        <div>
            <h1>
                THE BACKLOG - LOGIN
            </h1>
            <form onSubmit = {handleSubmit}>
                <label>
                    Email:
                </label>
                <input
                    type = "text"
                    placeholder = "Email"
                    value = {email}
                    onChange = {(e) => setEmail(e.target.value)}
                    required
                />
                <br />
                <label>
                    Password:
                </label>
                <input
                    type = "password"
                    placeholder = "Password"
                    value = {password}
                    onChange = {(e) => setPassword(e.target.value)}
                    required
                />
                <br />
                <button
                    type = "submit"
                    disabled = {loading}
                >
                    Submit
                </button>
            </form>
            <br/>
            <a href="/users/register">
                Click here to register.
            </a>
        </div>
    )
}