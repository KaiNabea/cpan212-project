import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import "./Profile.css"

export default function Profile() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user: currentUser, token } = useAuth()
    const [profileUser, setProfileUser] = useState(null)
    const [reviews, setReviews] = useState([])
    const [watchlists, setWatchlists] = useState([])
    const [activeTab, setActiveTab] = useState('info') // 'info', 'reviews', 'watchlists'
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const isOwnProfile = currentUser && id === currentUser._id

    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true)
            setError(null)
            try {
                // Fetch user info
                const userResponse = await fetch(`http://localhost:3000/users/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                if (!userResponse.ok) throw new Error('User not found.')
                const userData = await userResponse.json()
                setProfileUser(userData)

                // Fetch user's reviews
                const reviewsResponse = await fetch(`http://localhost:3000/reviews?userId=${id}`)
                if (reviewsResponse.ok) {
                    const reviewsData = await reviewsResponse.json()
                    setReviews(reviewsData.data || [])
                }

                // Fetch user's watchlists
                const watchlistsResponse = await fetch(`http://localhost:3000/watchlists?userId=${id}`)
                if (watchlistsResponse.ok) {
                    const watchlistsData = await watchlistsResponse.json()
                    setWatchlists(watchlistsData.data || [])
                }
            } catch (err) {
                console.error('Fetch error:', err)
                setError(err.message || 'Could not load profile.')
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchProfileData()
        }
    }, [id, token])

    const handleDeleteReview = async (reviewId) => {
        if (!confirm('Are you sure you want to delete this review?')) return

        try {
            const response = await fetch(`http://localhost:3000/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                setReviews(reviews.filter(r => r._id !== reviewId))
                alert('Review deleted successfully!')
            } else {
                alert('Failed to delete review.')
            }
        } catch (err) {
            console.error('Delete error:', err)
            alert('Network error. Please try again.')
        }
    }

    const handleDeleteWatchlist = async (watchlistId) => {
        if (!confirm('Are you sure you want to delete this watchlist?')) return

        try {
            const response = await fetch(`http://localhost:3000/watchlists/${watchlistId}`, {
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
        return <div className="loading">Loading profile...</div>
    }

    if (error || !profileUser) {
        return <div className="error">{error || 'Profile not found.'}</div>
    }

    return (
        <div className="profile-container" style = {
            {
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            }
        }>
            <div className="profile-header">
                <div className="profile-avatar">
                    {profileUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="profile-header-info">
                    <h1>{profileUser.name}</h1>
                    <p className="profile-email">{profileUser.email}</p>
                    {profileUser.phone && <p className="profile-phone">📞 {profileUser.phone}</p>}
                    {profileUser.address && <p className="profile-address">📍 {profileUser.address}</p>}
                    <p className="profile-role">Role: {profileUser.roles}</p>
                    <p className="profile-joined">
                        Joined: {new Date(profileUser.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>

            <div className="profile-stats">
                <div className="stat-card">
                    <h3>{reviews.length}</h3>
                    <p>Reviews</p>
                </div>
                <div className="stat-card">
                    <h3>{watchlists.length}</h3>
                    <p>Watchlists</p>
                </div>
                <div className="stat-card">
                    <h3>
                        {watchlists.reduce((total, w) => total + (w.films?.length || 0), 0)}
                    </h3>
                    <p>Films Tracked</p>
                </div>
            </div>

            <div className="profile-tabs">
                <button 
                    className={activeTab === 'info' ? 'tab-active' : ''}
                    onClick={() => setActiveTab('info')}
                >
                    Personal Info
                </button>
                <button 
                    className={activeTab === 'reviews' ? 'tab-active' : ''}
                    onClick={() => setActiveTab('reviews')}
                >
                    Reviews ({reviews.length})
                </button>
                <button 
                    className={activeTab === 'watchlists' ? 'tab-active' : ''}
                    onClick={() => setActiveTab('watchlists')}
                >
                    Watchlists ({watchlists.length})
                </button>
            </div>

            <div className="profile-content">
                {activeTab === 'info' && (
                    <div className="info-section">
                        <h2>Personal Information</h2>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Name:</label>
                                <p>{profileUser.name}</p>
                            </div>
                            <div className="info-item">
                                <label>Email:</label>
                                <p>{profileUser.email}</p>
                            </div>
                            <div className="info-item">
                                <label>Phone:</label>
                                <p>{profileUser.phone || 'Not provided'}</p>
                            </div>
                            <div className="info-item">
                                <label>Address:</label>
                                <p>{profileUser.address || 'Not provided'}</p>
                            </div>
                            <div className="info-item">
                                <label>Role:</label>
                                <p>{profileUser.roles}</p>
                            </div>
                            <div className="info-item">
                                <label>Member Since:</label>
                                <p>{new Date(profileUser.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="reviews-section">
                        <h2>{isOwnProfile ? 'Your Reviews' : `${profileUser.name}'s Reviews`}</h2>
                        {reviews.length > 0 ? (
                            <div className="reviews-list">
                                {reviews.map(review => (
                                    <div key={review._id} className="review-card-profile">
                                        <div className="review-header">
                                            <h3 
                                                onClick={() => navigate(`/films/${review.film._id}`)}
                                                className="film-title-link"
                                            >
                                                {review.film?.title || 'Unknown Film'}
                                            </h3>
                                            <span className="review-rating">
                                                ⭐ {review.rating}/10
                                            </span>
                                        </div>
                                        <p className="review-text">{review.review}</p>
                                        <p className="review-date">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </p>
                                        {isOwnProfile && (
                                            <div className="review-actions">
                                                <button 
                                                    onClick={() => navigate(`/reviews/edit/${review._id}`)}
                                                    className="edit-review-btn"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteReview(review._id)}
                                                    className="delete-review-btn"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="empty-state">
                                {isOwnProfile ? "You haven't written any reviews yet." : "No reviews yet."}
                            </p>
                        )}
                    </div>
                )}

                {activeTab === 'watchlists' && (
                    <div className="watchlists-section">
                        <h2>{isOwnProfile ? 'Your Watchlists' : `${profileUser.name}'s Watchlists`}</h2>
                        {watchlists.length > 0 ? (
                            <div className="watchlists-grid-profile">
                                {watchlists.map(watchlist => (
                                    <div key={watchlist._id} className="watchlist-card-profile">
                                        <div className="watchlist-header">
                                            <h3 
                                                onClick={() => navigate(`/watchlists/${watchlist._id}`)}
                                                className="watchlist-title-link"
                                            >
                                                {watchlist.name}
                                            </h3>
                                            <span className="watchlist-visibility-badge">
                                                {watchlist.isPublic ? '🌐' : '🔒'}
                                            </span>
                                        </div>
                                        <p className="watchlist-count">
                                            {watchlist.films?.length || 0} film{watchlist.films?.length !== 1 ? 's' : ''}
                                        </p>
                                        <div className="watchlist-films-preview">
                                            {watchlist.films && watchlist.films.slice(0, 3).map(film => (
                                                <span key={film._id} className="film-preview-tag">
                                                    {film.title}
                                                </span>
                                            ))}
                                            {watchlist.films && watchlist.films.length > 3 && (
                                                <span className="film-preview-more">
                                                    +{watchlist.films.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                        {isOwnProfile && (
                                            <div className="watchlist-actions">
                                                <button 
                                                    onClick={() => navigate(`/watchlists/${watchlist._id}`)}
                                                    className="view-watchlist-btn"
                                                >
                                                    View
                                                </button>
                                                <button 
                                                    onClick={() => navigate(`/watchlists/edit/${watchlist._id}`)}
                                                    className="edit-watchlist-btn"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteWatchlist(watchlist._id)}
                                                    className="delete-watchlist-btn"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="empty-state">
                                {isOwnProfile ? "You haven't created any watchlists yet." : "No watchlists yet."}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}