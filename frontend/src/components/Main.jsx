import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import "./Main.css"

export default function Main() {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [appliedSearchTerm, setAppliedSearchTerm] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const handleSearchClick = (e) => {
        e.preventDefault()
        setAppliedSearchTerm(searchTerm)
    }
    const fetchFilms = useCallback(async () => {
        if (!appliedSearchTerm && searchTerm) {}
        setLoading(true)
        setError(null)
        const url = appliedSearchTerm
            ? `${import.meta.env.VITE_API_URL}/films?search=${encodeURIComponent(appliedSearchTerm)}`
            : `${import.meta.env.VITE_API_URL}/films`
        try {
            const response = await fetch(url, {
                method: "GET",
            })
            if (!response.ok) {
                throw new Error('Search failed on the server.')
            }
            const data = await response.json()
            setResults(data.data)
        } catch (err) {
            setError('Could not fetch search results.')
            setResults([])
        } finally {
            setLoading(false)
        }
    }, [appliedSearchTerm])
    useEffect(() => {
        fetchFilms()
    }, [fetchFilms])
    const handleResultClick = (filmId) => {
        navigate(`/films/${filmId}`)
        setSearchTerm('')
        setAppliedSearchTerm('')
        setResults([])
    }
    return (
        <div className="main-page-container">
            <h1>Welcome to THE BACKLOG</h1>
            <div className="search-bar-container">
                <form onSubmit={handleSearchClick} className="search-form">
                    <input
                        type="text"
                        placeholder="Search for a film by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" disabled={loading} className="search-button">
                        Search
                    </button>
                </form>
                {loading && <p>Loading results...</p>}
                {error && <p className="error-message">{error}</p>}
                {!loading && results.length > 0 && (
                    <ul className="search-results-dropdown">
                        {results.map((film) => (
                            <li 
                                key={film._id} 
                                onClick={() => handleResultClick(film._id)}
                            >
                                {film.title} ({film.release_date ? film.release_date.substring(0, 4) : 'N/A'})
                            </li>
                        ))}
                    </ul>
                )}
                {!loading && appliedSearchTerm && results.length === 0 && !error && (
                    <p>No films found matching "{appliedSearchTerm}".</p>
                )}
            </div>
        </div>
    )
}