import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function EditWatchlist() {
    const { watchlistId } = useParams()
    const navigate = useNavigate()
    const { token } = useAuth()
    const [watchlistName, setWatchlistName] = useState('')
    const [isPublic, setIsPublic] = useState(true)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    useEffect(() => {
        const fetchWatchlist = async () => {
            setLoading(true)
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/watchlists/${watchlistId}`, {
                    headers: token ? {
                        "Authorization": `Bearer ${token}`
                    } : {}
                })
                if (!response.ok) throw new Error('Watchlist not found.')
                const data = await response.json()
                setWatchlistName(data.name)
                setIsPublic(data.isPublic)
            } catch (err) {
                console.error('Fetch error:', err)
                setError(err.message || 'Could not load watchlist.')
            } finally {
                setLoading(false)
            }
        }

        if (watchlistId) {
            fetchWatchlist()
        }
    }, [watchlistId])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!watchlistName.trim()) {
            alert('Please enter a watchlist name.')
            return
        }

        setSaving(true)
        setError(null)

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/watchlists/${watchlistId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: watchlistName,
                    isPublic: isPublic
                })
            })

            if (response.ok) {
                alert('Watchlist updated successfully!')
                navigate(`/watchlists/${watchlistId}`)
            } else {
                const errorData = await response.text()
                setError(errorData || 'Failed to update watchlist.')
            }
        } catch (err) {
            console.error('Update error:', err)
            setError('Network error. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="loading">Loading watchlist...</div>
    }

    if (error && loading) {
        return <div className="error">{error}</div>
    }

    return (
        <div className="edit-watchlist-container">
            <h1>Edit Watchlist</h1>
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit} className="edit-watchlist-form">
                <label>Watchlist Name:</label>
                <input
                    type="text"
                    value={watchlistName}
                    onChange={(e) => setWatchlistName(e.target.value)}
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

                <div className="form-actions">
                    <button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                        type="button" 
                        onClick={() => navigate(`/watchlists/${watchlistId}`)}
                        className="cancel-button"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}