import React, {useState} from "react"
import {useNavigate} from "react-router-dom"
import {useAuth} from "./AuthContext" 
import "./Login.css"

export default function Login() {
    const navigate = useNavigate()
    const {login: authContextLogin} = useAuth()
    const [step, setStep] = useState(1)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [otp, setOtp] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const handleLoginStep = async (e) => {
        console.log("API URL:", import.meta.env.VITE_API_URL)
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            console.log('Attempting login to:', `${import.meta.env.VITE_API_URL}/users/login`)
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/login`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({email, password})
            })
            console.log('Response status:', response.status)
            console.log('Response ok:', response.ok)
            const contentType = response.headers.get("content-type")
            console.log('Content-Type:', contentType)
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text()
                console.log('Non-JSON response:', text)
                throw new Error('Server returned non-JSON response')
            }
            const data = await response.json()
            console.log('Response data:', data)
            if (response.ok) {
                alert("OTP has been sent to your email. Please verify.")
                setStep(2)
            } else {
                setError(data.errorMessage || "Login failed")
            }
        } catch (err) {
            setError("Network error. Please try again.")
            console.error("Login step error:", err)
        } finally {
            setLoading(false)
        }
    }
    const handleOtpStep = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/verify-login`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, otp})
            })
            const data = await response.json()
            if (response.ok) {
                authContextLogin(data.user, data.token) 
                navigate("/mainpage")
            } else {
                let errorMessage = "OTP verification failed. Please try again."
                if (data && data.errorMessage) {
                    errorMessage = data.errorMessage
                } else if (data && data.error_message) {
                    errorMessage = data.error_message
                } else if (typeof data === 'string') {
                    errorMessage = data
                }
                setError(errorMessage) 
            }
        } catch (err) {
            setError("Network error. Please try again.")
            console.error("OTP verification error:", err)
        } finally {
            setLoading(false)
        }
    }
    if (step === 1) {
        return (
            <div className="login-container">
                <div className="login-box">
                    <div className="login-header">
                        <h1>THE BACKLOG - LOGIN</h1>
                    </div>
                    <div className="login-form">
                        {error && <div className="error-message">{error}</div>}
                        <form onSubmit={handleLoginStep}>
                        <label>Email:</label>
                        <input
                            type="text"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <br />
                        <label>Password:</label>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <br />
                        <button type="submit" disabled={loading}>
                            {loading ? "Sending OTP..." : "Login"}
                        </button>
                        </form>
                        <br/>
                        <a href="/register">Click here to register.</a>
                    </div>
                </div>
            </div>
        )
    }
    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <div className="login-header-h1">
                    <h1>THE BACKLOG - VERIFY OTP</h1>
                    </div>
                    <div className="login-header-p">
                    <p>An OTP has been sent to **{email}**. Please check your email.</p>
                    </div>
                </div>
                <div className="login-form">
                    {error && <div className="error-message">{error}</div>}
                    <form onSubmit={handleOtpStep}>
                        <label>OTP:</label>
                        <input
                            type="text"
                            placeholder="6-Digit Code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength="6"
                            required
                        />
                        <br />
                        <button type="submit" disabled={loading}>
                            {loading ? "Verifying..." : "Verify Login"}
                        </button>
                    </form>
                    <br/>
                    <button onClick={() => setStep(1)} disabled={loading} style={{background: 'gray'}}>
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    )
}