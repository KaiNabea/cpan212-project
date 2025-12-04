const API_BASE_URL = "http://localhost:3000"

export const fetchWithAuth = async (endpoint, options = {}) => {
    const token = sessionStorage.getItem("authToken")
    const config = {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    }
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`
    }
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
        const data = await response.json()
        if (response.status === 401) {
            sessionStorage.removeItem("authToken")
            sessionStorage.removeItem("user")
            window.location.href = "/users/login"
            throw new Error("Session expired. Please login again.")
        }
        return {response, data}
    } catch (error) {
        console.error("API Error:", error)
        throw error
    }
}

export const getUserProfile = async (userId) => {
    const {response, data} = await fetchWithAuth(`/users/${userId}`)
    if (!response.ok) {
        throw new Error(data.errorMessage || "Failed to fetch user profile.")
    }
    return data
}

export const loginUser = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, password})
    })
    const data = await response.json()
    return {response, data}
}

export const registerUser = async (userData) => {
    const response = await fetch (`${API_BASE_URL}/users/register`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(userData)
    })
    const data = await response.json()
    return {response, data}
}

// export const getFilms = async() => {
//     const response = await fetch("/film")
//     if (!response.ok) {
//         throw new Error ("Failed to fetch films.")
//     }
//     return response.json()
// }

// export const getFilmsById = async(id) => {
//     const response = await fetch(`/film/${id}`)
//     if (!response.ok) {
//         throw new Error ("Failed to fetch film.")
//     }
//     return response.json()
// }

// export const addFilms = async(filmData) => {
//     const response = await fetch("/film", {
//         method: "POST",
//         headers: {"content-type": "application/json"},
//         body: JSON.stringify(filmData)
//     })
//     if (!response.ok) {
//         throw new Error ("Failed to add film.")
//     }
//     return response.json()
// }