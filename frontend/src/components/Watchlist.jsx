import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import "./Watchlist.css"

export default function Watchlists() {
    const navigate = useNavigate()
    const { user, token } = useAuth()
    const [watchlists, setWatchlists] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [newWatchlistName, setNewWatchlistName] = useState('')
    const [isPublic, setIsPublic] = useState(true)
    const [creating, setCreating] = useState(false)

    const fetchWatchlists = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/watchlists?userId=${user._id}`)
            if (!response.ok) throw new Error('Failed to fetch watchlists.')
            const data = await response.json()
            setWatchlists(data.data || [])
        } catch (err) {
            console.error('Fetch error:', err)
            setError(err.message || 'Could not load watchlists.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user) {
            fetchWatchlists()
        }
    }, [user])

    const handleCreateWatchlist = async (e) => {
        e.preventDefault()
        if (!newWatchlistName.trim()) {
            alert('Please enter a watchlist name.')
            return
        }

        setCreating(true)
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/watchlists`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newWatchlistName,
                    isPublic: isPublic
                })
            })

            if (response.ok) {
                const data = await response.json()
                setWatchlists([data, ...watchlists])
                setNewWatchlistName('')
                setIsPublic(true)
                setShowCreateForm(false)
                alert('Watchlist created successfully!')
            } else {
                const errorData = await response.text()
                alert(errorData || 'Failed to create watchlist.')
            }
        } catch (err) {
            console.error('Create error:', err)
            alert('Network error. Please try again.')
        } finally {
            setCreating(false)
        }
    }

    const handleDeleteWatchlist = async (watchlistId) => {
        if (!confirm('Are you sure you want to delete this watchlist?')) return

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/watchlists/${watchlistId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                setWatchlists(watchlists.filter(w => w._id !== watchlistId))
                alert('Watchlist deleted successfully!')
            } else {
                alert('Failed to delete watchlist.')
            }
        } catch (err) {
            console.error('Delete error:', err)
            alert('Network error. Please try again.')
        }
    }

    if (loading) {
        return <div className="loading">Loading watchlists...</div>
    }

    if (error) {
        return <div className="error">{error}</div>
    }

    return (
        <div className="watchlists-container" style={
            {
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            }
        }>
            <h1>My Watchlists</h1>
            <button 
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="create-watchlist-button"
            >
                {showCreateForm ? 'Cancel' : '+ Create New Watchlist'}
            </button>

            {showCreateForm && (
                <form onSubmit={handleCreateWatchlist} className="create-watchlist-form">
                    <input
                        type="text"
                        placeholder="Watchlist name..."
                        value={newWatchlistName}
                        onChange={(e) => setNewWatchlistName(e.target.value)}
                        maxLength="100"
                        required
                    />
                    <label>
                        <input
                            type="checkbox"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                        />
                        Make public (visible to others)
                    </label>
                    <button type="submit" disabled={creating}>
                        {creating ? 'Creating...' : 'Create'}
                    </button>
                </form>
            )}

            <div className="watchlists-grid">
                {watchlists.length > 0 ? (
                    watchlists.map(watchlist => (
                        <div key={watchlist._id} className="watchlist-card">
                            <h3 onClick={() => navigate(`/watchlists/${watchlist._id}`)}>
                                {watchlist.name}
                            </h3>
                            <p>
                                {watchlist.films?.length || 0} film{watchlist.films?.length !== 1 ? 's' : ''}
                            </p>
                            <p className="watchlist-visibility">
                                {watchlist.isPublic ? '🌐 Public' : '🔒 Private'}
                            </p>
                            <div className="watchlist-actions">
                                <button 
                                    onClick={() => navigate(`/watchlists/${watchlist._id}`)}
                                    className="view-button"
                                >
                                    View
                                </button>
                                <button 
                                    onClick={() => navigate(`/watchlists/edit/${watchlist._id}`)}
                                    className="edit-button"
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={() => handleDeleteWatchlist(watchlist._id)}
                                    className="delete-button"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No watchlists yet. Create your first one!</p>
                )}
            </div>
        </div>
    )
}