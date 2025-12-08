import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import "./Reviews.css"

export default function Reviews() {
    const { filmId, reviewId } = useParams()
    const navigate = useNavigate()
    const { token } = useAuth()
    const isEditing = !!reviewId
    const [reviewData, setReviewData] = useState({
        rating: 5.0,
        review: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [initialLoadError, setInitialLoadError] = useState(null)
    useEffect(() => {
        if (!isEditing) return
        const fetchReview = async () => {
            setLoading(true)
            try {
                if (!token) throw new Error("Authorization required for editing.")
                const response = await fetch(`http://localhost:3000/reviews/${reviewId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                })
                if (!response.ok) throw new Error('Failed to load review for editing.')
                
                const data = await response.json()
                setReviewData({
                    rating: data.rating,
                    review: data.review
                })
            } catch (err) {
                setInitialLoadError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchReview()
    }, [isEditing, reviewId, token])
    const handleChange = (e) => {
        setReviewData({
            ...reviewData,
            [e.target.name]: e.target.value
        })
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const method = isEditing ? 'PUT' : 'POST'
        const url = isEditing 
            ? `http://localhost:3000/reviews/${reviewId}`
            : `http://localhost:3000/reviews`
        const body = isEditing 
            ? reviewData
            : { ...reviewData, film: filmId }
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            })
            const data = await response.json()
            if (response.ok) {
                alert(isEditing ? "Review updated successfully!" : "Review posted successfully!")
                const targetFilmId = isEditing ? data.film : filmId
                navigate(`/film/${targetFilmId}`) 
            } else {
                setError(data.errorMessage || `Failed to ${isEditing ? 'update' : 'post'} review.`)
            }
        } catch (err) {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }
    if (initialLoadError) return <div className="error">{initialLoadError}</div>
    if (loading && isEditing) return <div>Loading existing review...</div>
    return (
        <div className="review-form-container">
            <h1>{isEditing ? "Edit Your Review" : "Write a Review"}</h1>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
                <label>Rating (0.1 - 10.0):</label>
                <input
                    type="number"
                    name="rating"
                    step="0.1"
                    min="0.1"
                    max="10.0"
                    value={reviewData.rating}
                    onChange={handleChange}
                    required
                />
                <br />
                <label>Review:</label>
                <textarea
                    name="review"
                    placeholder="Tell us what you thought..."
                    maxLength="500"
                    rows="5"
                    value={reviewData.review}
                    onChange={handleChange}
                    required
                />
                <br />
                <button type="submit" disabled={loading}>
                    {loading ? (isEditing ? "Updating..." : "Posting...") : (isEditing ? "Update Review" : "Post Review")}
                </button>
            </form>
        </div>
    )
}