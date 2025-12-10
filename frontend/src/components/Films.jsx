import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from "./AuthContext"
import AddToWatchlistModal from "./AddToWatchlistModal"
import "./Films.css"

export default function Films() {
    const { filmId } = useParams()
    const navigate = useNavigate()
    const { user, token } = useAuth()
    const [filmDetails, setFilmDetails] = useState(null)
    const [reviews, setReviews] = useState([])
    const [userReview, setUserReview] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showWatchlistModal, setShowWatchlistModal] = useState(false)

    const fetchFilmData = async () => {
        setLoading(true)
        setError(null)
        try {
            const filmResponse = await fetch(`${import.meta.env.VITE_API_URL}/films/${filmId}`)
            if (!filmResponse.ok) throw new Error("Film not found.")
            const filmData = await filmResponse.json()
            setFilmDetails(filmData)

            const reviewResponse = await fetch(`${import.meta.env.VITE_API_URL}/reviews?filmId=${filmId}`)
            if (!reviewResponse.ok) throw new Error("Failed to fetch reviews.")
            const reviewsData = await reviewResponse.json()
            setReviews(reviewsData.data || [])

            if (user && reviewsData.data) {
                const existingReview = reviewsData.data.find(
                    review => review.user._id === user._id
                )
                setUserReview(existingReview)
            }
        } catch (err) {
            console.error("Fetch error:", err)
            setError(err.message || "Could not load film or reviews.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (filmId) {
            fetchFilmData()
        }
    }, [filmId, user])

    const handleReviewButtonClick = () => {
        if (userReview) {
            navigate(`/reviews/edit/${userReview._id}`)
        } else {
            navigate(`/reviews/new/${filmId}`)
        }
    }

    if (loading) {
        return <div className="loading">Loading film and review details...</div>
    }

    if (error || !filmDetails) {
        return <div className="error">{error}</div>
    }

    return (
        <div className="film-detail-container" style={
            {
                background: "linear-gradient(135deg,  #667eea 0%, #764ba2 100%)"
            }
        }>
            <h1>{filmDetails.title}</h1>
            <p style={{color: "black"}}><strong style={{color: "black"}}>Genre:</strong> {filmDetails.genre}</p>
            <p style={{color: "black"}}><strong style={{color: "black"}}>Release Date:</strong> {filmDetails.release_date}</p>
            <p style={{color: "black"}}><strong style={{color: "black"}}>Rating:</strong> {filmDetails.rating}/10</p>
            
            <div className="film-actions">
                <button 
                    onClick={handleReviewButtonClick}
                    className="review-button"
                >
                    {userReview ? "Edit Your Review" : "Write a Review"}
                </button>
                
                <button 
                    onClick={() => setShowWatchlistModal(true)}
                    className="add-to-watchlist-button"
                >
                    + Add to Watchlist
                </button>
            </div>

            <h2>Reviews ({reviews.length})</h2>
            <div className="reviews-list">
                {reviews.length > 0 ? (
                    reviews.map(review => (
                        <div key={review._id} className="review-card">
                            <p><strong>User:</strong> {review.user.name}</p> 
                            <p><strong>Rating:</strong> {review.rating}/10</p>
                            <p>{review.review}</p>
                            {review.user._id === user?._id && <p>(This is your review)</p>}
                        </div>
                    ))
                ) : (
                    <p>No reviews yet. Be the first to post!</p>
                )}
            </div>

            {showWatchlistModal && (
                <AddToWatchlistModal 
                    filmId={filmId}
                    onClose={() => setShowWatchlistModal(false)}
                />
            )}
        </div>
    )
}