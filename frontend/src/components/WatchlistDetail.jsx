import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function WatchlistDetail() {
    const { watchlistId } = useParams()
    const navigate = useNavigate()
    const { user, token } = useAuth()
    const [watchlist, setWatchlist] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchWatchlist = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch(`http://localhost:3000/watchlists/${watchlistId}`)
            if (!response.ok) throw new Error('Watchlist not found.')
            const data = await response.json()
            setWatchlist(data)
        } catch (err) {
            console.error('Fetch error:', err)
            setError(err.message || 'Could not load watchlist.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (watchlistId) {
            fetchWatchlist()
        }
    }, [watchlistId])

    const handleRemoveFilm = async (filmId) => {
        if (!confirm('Remove this film from the watchlist?')) return

        try {
            const response = await fetch(`http://localhost:3000/watchlists/${watchlistId}/films/remove`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ filmId })
            })

            if (response.ok) {
                const updatedWatchlist = await response.json()
                setWatchlist(updatedWatchlist)
                alert('Film removed from watchlist!')
            } else {
                const errorData = await response.text()
                alert(errorData || 'Failed to remove film.')
            }
        } catch (err) {
            console.error('Remove error:', err)
            alert('Network error. Please try again.')
        }
    }

    const isOwner = user && watchlist && watchlist.user._id === user._id

    if (loading) {
        return <div className="loading">Loading watchlist...</div>
    }

    if (error || !watchlist) {
        return <div className="error">{error || 'Watchlist not found.'}</div>
    }

    return (
        <div className="watchlist-detail-container">
            <div className="watchlist-header">
                <h1>{watchlist.name}</h1>
                <p>Created by: {watchlist.user?.name}</p>
                <p className="watchlist-visibility">
                    {watchlist.isPublic ? '🌐 Public' : '🔒 Private'}
                </p>
                {isOwner && (
                    <button 
                        onClick={() => navigate(`/watchlists/edit/${watchlistId}`)}
                        className="edit-watchlist-button"
                    >
                        Edit Watchlist
                    </button>
                )}
            </div>

            <h2>Films ({watchlist.films?.length || 0})</h2>
            
            <div className="films-grid">
                {watchlist.films && watchlist.films.length > 0 ? (
                    watchlist.films.map(film => (
                        <div key={film._id} className="film-card">
                            <h3 onClick={() => navigate(`/films/${film._id}`)}>
                                {film.title}
                            </h3>
                            <p><strong>Genre:</strong> {film.genre}</p>
                            <p><strong>Release:</strong> {film.release_date ? film.release_date.substring(0, 4) : 'N/A'}</p>
                            <p><strong>Rating:</strong> {film.rating ? `${film.rating}/10` : 'N/A'}</p>
                            <div className="film-actions">
                                <button 
                                    onClick={() => navigate(`/films/${film._id}`)}
                                    className="view-film-button"
                                >
                                    View Details
                                </button>
                                {isOwner && (
                                    <button 
                                        onClick={() => handleRemoveFilm(film._id)}
                                        className="remove-film-button"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No films in this watchlist yet.</p>
                )}
            </div>
        </div>
    )
}