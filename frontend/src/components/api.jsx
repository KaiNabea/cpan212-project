const API_BASE_URL = ""

export const getFilms = async() => {
    const response = await fetch("/films")
    if (!response.ok) {
        throw new Error ("Failed to fetch films.")
    }
    return response.json()
}

export const getFilmsById = async(id) => {
    const response = await fetch(`/films/${id}`)
    if (!response.ok) {
        throw new Error ("Failed to fetch film.")
    }
    return response.json()
}

export const addFilms = async(filmData) => {
    const response = await fetch("/films", {
        method: "POST",
        headers: {"content-type": "application/json"},
        body: JSON.stringify(filmData)
    })
    if (!response.ok) {
        throw new Error ("Failed to fetch films.")
    }
    return response.json()
}