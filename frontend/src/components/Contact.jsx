import React, { useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import './Contact.css'

export default function Contact() {
    const { user, token } = useAuth()
    const [activeTab, setActiveTab] = useState('new') // 'new' or 'history'
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [messageHistory, setMessageHistory] = useState([])
    const [loadingHistory, setLoadingHistory] = useState(false)

    const fetchMessageHistory = async () => {
        setLoadingHistory(true)
        try {
            const response = await fetch('http://localhost:3000/contacts', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setMessageHistory(data.data || [])
            }
        } catch (err) {
            console.error('Error fetching message history:', err)
        } finally {
            setLoadingHistory(false)
        }
    }

    useEffect(() => {
        if (activeTab === 'history') {
            fetchMessageHistory()
        }
    }, [activeTab])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)
        setSuccess(false)

        if (subject.length < 5 || subject.length > 200) {
            setError('Subject must be between 5 and 200 characters.')
            setSubmitting(false)
            return
        }

        if (message.length < 10 || message.length > 2000) {
            setError('Message must be between 10 and 2000 characters.')
            setSubmitting(false)
            return
        }

        try {
            const response = await fetch('http://localhost:3000/contacts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ subject, message })
            })

            if (response.ok) {
                setSuccess(true)
                setSubject('')
                setMessage('')
                alert('Your message has been sent successfully! An admin will review it soon.')
            } else {
                const errorData = await response.text()
                setError(errorData || 'Failed to send message.')
            }
        } catch (err) {
            console.error('Submit error:', err)
            setError('Network error. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteMessage = async (messageId) => {
        if (!confirm('Are you sure you want to delete this message?')) return

        try {
            const response = await fetch(`http://localhost:3000/contacts/${messageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                setMessageHistory(messageHistory.filter(m => m._id !== messageId))
                alert('Message deleted successfully!')
            } else {
                alert('Failed to delete message.')
            }
        } catch (err) {
            console.error('Delete error:', err)
            alert('Network error. Please try again.')
        }
    }

    const getStatusBadge = (status) => {
        const badges = {
            'pending': { text: 'Pending', color: '#FF9800' },
            'in-progress': { text: 'In Progress', color: '#2196F3' },
            'resolved': { text: 'Resolved', color: '#4CAF50' }
        }
        const badge = badges[status] || badges['pending']
        return (
            <span style={{
                background: badge.color,
                color: 'white',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600'
            }}>
                {badge.text}
            </span>
        )
    }

    return (
        <div className="contact-container">
            <h1>Contact Support</h1>
            <p className="contact-subtitle">
                Have an issue or suggestion? Let us know and we'll get back to you.
            </p>

            <div className="contact-tabs">
                <button 
                    className={activeTab === 'new' ? 'tab-active' : ''}
                    onClick={() => setActiveTab('new')}
                >
                    New Message
                </button>
                <button 
                    className={activeTab === 'history' ? 'tab-active' : ''}
                    onClick={() => setActiveTab('history')}
                >
                    Message History ({messageHistory.length})
                </button>
            </div>

            {activeTab === 'new' && (
                <div className="contact-form-wrapper">
                    {error && <div className="error-message">{error}</div>}
                    {success && (
                        <div className="success-message">
                            Message sent successfully! We'll review it and get back to you soon.
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="contact-form">
                        <div className="form-group">
                            <label>Subject *</label>
                            <input
                                type="text"
                                placeholder="Brief description of your issue..."
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                maxLength="200"
                                required
                            />
                            <span className="char-count">{subject.length}/200</span>
                        </div>

                        <div className="form-group">
                            <label>Message *</label>
                            <textarea
                                placeholder="Please provide details about your issue or suggestion..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                maxLength="2000"
                                rows="8"
                                required
                            />
                            <span className="char-count">{message.length}/2000</span>
                        </div>

                        <button type="submit" disabled={submitting} className="submit-button">
                            {submitting ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="message-history">
                    {loadingHistory ? (
                        <p className="loading-text">Loading your messages...</p>
                    ) : messageHistory.length > 0 ? (
                        <div className="messages-list">
                            {messageHistory.map(msg => (
                                <div key={msg._id} className="message-card">
                                    <div className="message-header">
                                        <h3>{msg.subject}</h3>
                                        {getStatusBadge(msg.status)}
                                    </div>
                                    <p className="message-text">{msg.message}</p>
                                    <div className="message-meta">
                                        <span className="message-date">
                                            Sent: {new Date(msg.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                        {msg.adminNotes && (
                                            <div className="admin-notes">
                                                <strong>Admin Response:</strong>
                                                <p>{msg.adminNotes}</p>
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteMessage(msg._id)}
                                        className="delete-message-btn"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="empty-state">
                            You haven't sent any messages yet. Use the "New Message" tab to contact support.
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}