import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Login.css"

export default function Register() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.")
            return
        }
        setLoading(true)
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                })
            })
            const data = await response.json()
            if (response.ok) {
                alert("Registration successful! Please login.")
                navigate("/users/login")
            } else {
                setError(data.errorMessage || "Registration failed.")
            }
        } catch (err) {
            setError("Network error. Please try again.")
            console.error("Registration error:", err)
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="register-container">
            <div className="register-box">
                <div className="register-header">
                    <div className="regiser-header-h1">
                        <h1>
                            THE BACKLOG - Register
                        </h1>
                    </div>
                </div>
                <div className="register-form">
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div id="error">
                                {error}
                            </div>
                        )}
                        <label>
                            Name:
                        </label>
                        <input
                            name="name"
                            type="text"
                            placeholder="Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                        <br />
                        <label>
                            Email:
                        </label>
                        <input
                            name="email"
                            type="text"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <br />
                        <label>
                            Password:
                        </label>
                        <input
                            name="password"
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <br />
                        <label>
                            Confirm Password:
                        </label>
                        <input
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                        <br />
                        <button type="submit">
                            {loading ? "Registering..." : "Register"}
                        </button>
                    </form>
                    <br />
                    <a href="/users/login">
                        Click here to login.
                    </a>
                </div>
            </div>
        </div>
    )
}