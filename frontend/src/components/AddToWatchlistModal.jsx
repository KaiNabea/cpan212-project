import React, { useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

export default function AddToWatchlistModal({ filmId, onClose }) {
    const { user, token } = useAuth()
    const [watchlists, setWatchlists] = useState([])
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchWatchlists = async () => {
            setLoading(true)
            setError(null)
            try {
                const response = await fetch(`http://localhost:3000/watchlists?userId=${user._id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                
                if (!response.ok) {
                    const errorText = await response.text()
                    throw new Error(errorText || 'Failed to fetch watchlists.')
                }
                
                const data = await response.json()
                setWatchlists(data.data || [])
            } catch (err) {
                console.error('Fetch error:', err)
                setError(err.message || 'Could not load watchlists.')
            } finally {
                setLoading(false)
            }
        }

        if (user && token) {
            fetchWatchlists()
        }
    }, [user, token])

    const handleAddToWatchlist = async (watchlistId) => {
        setAdding(true)
        try {
            const response = await fetch(`http://localhost:3000/watchlists/${watchlistId}/films/add`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ filmId })
            })

            if (response.ok) {
                alert('Film added to watchlist!')
                onClose()
            } else {
                const errorData = await response.text()
                alert(errorData || 'Failed to add film to watchlist.')
            }
        } catch (err) {
            console.error('Add error:', err)
            alert('Network error. Please try again.')
        } finally {
            setAdding(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Add to Watchlist</h2>
                <button className="modal-close" onClick={onClose}>×</button>
                
                {loading ? (
                    <p>Loading your watchlists...</p>
                ) : error ? (
                    <div>
                        <p className="error">{error}</p>
                        <p style={{marginTop: '10px', fontSize: '14px', color: '#666'}}>
                            Make sure you're logged in and the backend server is running on http://localhost:3000
                        </p>
                    </div>
                ) : watchlists.length > 0 ? (
                    <div className="watchlist-selection">
                        {watchlists.map(watchlist => (
                            <div 
                                key={watchlist._id} 
                                className="watchlist-option"
                                onClick={() => !adding && handleAddToWatchlist(watchlist._id)}
                                style={{opacity: adding ? 0.6 : 1, cursor: adding ? 'wait' : 'pointer'}}
                            >
                                <h3>{watchlist.name}</h3>
                                <p>{watchlist.films?.length || 0} films</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>
                        <p>You don't have any watchlists yet.</p>
                        <button onClick={() => window.location.href = '/watchlists'}>
                            Create a Watchlist
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}