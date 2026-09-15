import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Heart,
  Image as ImageIcon,
  MessageSquare,
  RefreshCw,
  ScanLine,
  Send,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  Trash2,
  User,
} from 'lucide-react'
import { API_BASE_URL } from '../config/api'
import { BRAND_NAME, BRAND_TAGLINE } from '../config/brand'
import UserHeader from '../components/user/UserHeader'
import './Landing.css'
import './MarketingPages.css'

const asText = (value, fallback = '') => {
  const text = String(value ?? '').trim()
  return text || fallback
}

const formatDate = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  return date.toLocaleString()
}

const BAD_WORD_PATTERNS = [
  /\b(fuck|shit|bitch|asshole|motherfucker|cunt)\b/gi,
  /\b(puta|putangina|putang\s*ina|gago|tanga|ulol|pakyu|bobo)\b/gi,
]

const maskBadLanguage = (text) => {
  let masked = String(text || '')
  BAD_WORD_PATTERNS.forEach((pattern) => {
    masked = masked.replace(pattern, (match) => '*'.repeat(match.length))
  })
  return masked
}

const UserAvatar = ({ url, name, size = 32 }) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?'
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: 'rgba(244, 63, 94, 0.2)',
        backgroundImage: url ? `url(${url})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--accent-rose, #f43f5e)',
        fontWeight: 'bold',
        fontSize: size * 0.45,
        flexShrink: 0,
        border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.15))',
      }}
    >
      {!url && initial}
    </div>
  )
}

function CommunityForum() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [scans, setScans] = useState([])
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [postText, setPostText] = useState('')
  const [selectedScanId, setSelectedScanId] = useState('')
  const [commentDrafts, setCommentDrafts] = useState({})
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [feedError, setFeedError] = useState('')
  const [formError, setFormError] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem('user')
    if (!raw) {
      navigate('/login')
      return
    }
    try {
      setUser(JSON.parse(raw))
    } catch {
      localStorage.removeItem('user')
      navigate('/login')
    }
  }, [navigate])

  const userMeta = useMemo(() => {
    return {
      userId: asText(user?._id || user?.id || user?.userId || user?.uid) || undefined,
      authorName: asText(user?.name || user?.fullName || user?.username, 'Backyard Farmer'),
      authorEmail: asText(user?.email).toLowerCase() || undefined,
    }
  }, [user])

  const selectedScan = useMemo(
    () => scans.find((scan) => String(scan?._id || scan?.id || scan?.localScanId) === String(selectedScanId)) || null,
    [scans, selectedScanId]
  )

  const loadNotifications = useCallback(async () => {
    if (!userMeta.authorEmail && !userMeta.userId) return
    const query = new URLSearchParams()
    if (userMeta.authorEmail) query.set('email', userMeta.authorEmail)
    else if (userMeta.userId) query.set('userId', userMeta.userId)
    query.set('limit', '40')

    try {
      const res = await fetch(`${API_BASE_URL}/api/community/notifications?${query.toString()}`)
      const data = await res.json()
      if (res.ok) {
        setNotifications(Array.isArray(data?.items) ? data.items : [])
        setUnreadCount(Number(data?.unreadCount || 0))
      }
    } catch {
      setNotifications([])
      setUnreadCount(0)
    }
  }, [userMeta.authorEmail, userMeta.userId])

  const loadData = useCallback(async () => {
    setLoading(true)
    const postsReq = fetch(`${API_BASE_URL}/api/community?limit=70`, { cache: 'no-store' }).then(async (res) => {
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to load community posts')
      return Array.isArray(data) ? data : []
    })

    // Scans from local storage + API
    let localScans = []
    try {
      const rawLocal = localStorage.getItem('web_scan_history_v1')
      if (rawLocal) localScans = JSON.parse(rawLocal)
    } catch {
      // Local fallback
    }

    const scansReq = fetch(`${API_BASE_URL}/api/scan`)
      .then(async (res) => {
        const data = await res.json()
        const allScans = Array.isArray(data) ? data : []
        return [...localScans, ...allScans].sort(
          (a, b) => new Date(b?.timestamp || 0).getTime() - new Date(a?.timestamp || 0).getTime()
        )
      })
      .catch(() => localScans)

    const [postsResult, scansResult] = await Promise.allSettled([postsReq, scansReq, loadNotifications()])

    if (postsResult.status === 'fulfilled') {
      setPosts(postsResult.value)
      setFeedError('')
    } else {
      setPosts([])
      setFeedError(postsResult.reason?.message || 'Failed to load community posts')
    }

    if (scansResult.status === 'fulfilled') {
      setScans(scansResult.value)
      if (!selectedScanId && scansResult.value.length) {
        const first = scansResult.value[0]
        setSelectedScanId(String(first?._id || first?.id || first?.localScanId))
      }
    } else {
      setScans([])
    }

    setLoading(false)
  }, [loadNotifications, selectedScanId])

  useEffect(() => {
    if (!user) return
    void loadData()
  }, [loadData, user])

  const buildScanSnapshot = (scan) => {
    if (!scan) return undefined
    return {
      localScanId: asText(scan?.localScanId || scan?._id || scan?.id),
      condition: asText(scan?.condition || scan?.details || 'Swine Dermis Inspection'),
      severity: asText(scan?.severity || scan?.grade || 'Tier A').toUpperCase(),
      penId: asText(scan?.penId || 'Backyard Pen'),
      swineId: asText(scan?.swineId || 'Swine'),
      confidence: asText(scan?.confidence || '96.8%'),
      scanTimestamp: scan?.timestamp || scan?.createdAt || new Date().toISOString(),
      imageUrl: asText(scan?.imageUrl),
      notes: asText(scan?.recommendation || scan?.details || 'Shared diagnostic scan'),
    }
  }

  const handleCreatePost = async (event) => {
    event.preventDefault()
    if (posting) return

    const scanSnapshot = buildScanSnapshot(selectedScan)
    const cleanText = asText(postText)

    if (!cleanText && !scanSnapshot) {
      setFormError('Please add a message or attach a swine diagnostic scan.')
      return
    }

    const maskedText = maskBadLanguage(cleanText)

    setPosting(true)
    setFormError('')
    try {
      const payload = {
        ...userMeta,
        text: maskedText,
        source: 'web_app',
        scanSnapshot,
      }

      const res = await fetch(`${API_BASE_URL}/api/community`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to create post')

      setPosts((prev) => [data, ...prev])
      setPostText('')
      toast.success('Posted to Swine Community!')
      void loadNotifications()
    } catch (error) {
      setFormError(error?.message || 'Could not create post')
    } finally {
      setPosting(false)
    }
  }

  const handleReaction = async (post, type) => {
    const postId = String(post?._id || post?.id || '').trim()
    if (!postId) return

    try {
      const res = await fetch(`${API_BASE_URL}/api/community/${encodeURIComponent(postId)}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          user: userMeta.userId,
          name: userMeta.authorName,
          email: userMeta.authorEmail,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Reaction failed')

      setPosts((prev) =>
        prev.map((item) => {
          const id = String(item?._id || item?.id || '')
          return id === postId ? data : item
        })
      )
    } catch {
      toast.error('Could not update reaction')
    }
  }

  const handleAddComment = async (postId, e) => {
    e.preventDefault()
    const draft = asText(commentDrafts[postId])
    if (!draft) return

    try {
      const res = await fetch(`${API_BASE_URL}/api/community/${encodeURIComponent(postId)}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userMeta,
          text: maskBadLanguage(draft),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Comment failed')

      setPosts((prev) =>
        prev.map((item) => {
          const id = String(item?._id || item?.id || '')
          return id === postId ? data : item
        })
      )
      setCommentDrafts((prev) => ({ ...prev, [postId]: '' }))
    } catch {
      toast.error('Could not add reply')
    }
  }

  return (
    <div className="pro-landing mk-page">
      <UserHeader />

      <main className="mk-main">
        {/* ================================================================
            1. HERO COMMAND HEADER
            ================================================================ */}
        <section className="mk-hero" style={{ paddingBottom: '20px' }}>
          <div className="container-pro">
            <div className="mk-kicker">
              <span className="mk-kicker-dot" />
              <span>FARMER PEER FORUM // BACKYARD SWINE BIOSECURITY</span>
            </div>

            <h1 className="mk-title">
              Backyard Swine
              <span className="accent"> Health Community</span>
            </h1>

            <p className="mk-subtitle">
              Share symptom photographs, discuss pen quarantine protocols, and exchange field treatment advice with fellow backyard pig farmers.
            </p>
          </div>
        </section>

        {/* ================================================================
            2. MAIN FORUM FEED & CREATE POST
            ================================================================ */}
        <section className="mk-section" style={{ paddingTop: '0px' }}>
          <div className="container-pro" style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 440px) 1fr', gap: '24px', alignItems: 'start' }}>
            {/* ── LEFT COLUMN: Create Post Card ── */}
            <div
              style={{
                position: 'relative',
                borderRadius: '24px',
                background: 'var(--surface-card, rgba(13, 19, 32, 0.85))',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                padding: '24px',
                boxShadow: 'var(--shadow-card, 0 16px 40px rgba(0, 0, 0, 0.28))',
              }}
            >
              <div className="lp-card-reticle top-left" />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontFamily: 'Sora', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main, #ffffff)' }}>
                  Share With Farmers
                </h3>
                <button
                  type="button"
                  onClick={() => setNotifOpen((prev) => !prev)}
                  style={{
                    border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderRadius: '999px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--text-main, #ffffff)',
                  }}
                >
                  Alerts {unreadCount > 0 ? `(${unreadCount})` : ''}
                </button>
              </div>

              <form onSubmit={handleCreatePost}>
                <textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="Ask a question, share a skin lesion case, or describe pen symptoms..."
                  style={{
                    width: '100%',
                    minHeight: '110px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                    background: 'var(--input-bg, rgba(20, 29, 48, 0.7))',
                    color: 'var(--text-main, #ffffff)',
                    padding: '12px',
                    fontFamily: 'inherit',
                    fontSize: '0.88rem',
                    resize: 'vertical',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />

                {/* Attach Scan Selector */}
                <div style={{ marginTop: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main, #ffffff)', marginBottom: '6px' }}>
                    Attach Diagnostic Scan (Optional)
                  </label>
                  <select
                    value={selectedScanId}
                    onChange={(e) => setSelectedScanId(e.target.value)}
                    style={{
                      width: '100%',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                      background: 'var(--input-bg, rgba(20, 29, 48, 0.7))',
                      color: 'var(--text-main, #ffffff)',
                      padding: '10px',
                      fontFamily: 'inherit',
                      fontSize: '0.85rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="">No scan attached</option>
                    {scans.map((scan) => {
                      const id = String(scan?._id || scan?.id || scan?.localScanId)
                      return (
                        <option key={id} value={id}>
                          {scan?.condition || 'Swine Scan'} | {scan?.penId || 'Pen'} | {formatDate(scan?.timestamp)}
                        </option>
                      )
                    })}
                  </select>
                </div>

                {/* Selected Scan Preview Pill */}
                {selectedScan && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'rgba(244, 63, 94, 0.08)',
                      border: '1px solid rgba(244, 63, 94, 0.25)',
                      fontSize: '0.82rem',
                    }}
                  >
                    <strong style={{ color: 'var(--accent-rose, #f43f5e)' }}>{selectedScan.condition || 'Swine Scan'}</strong>
                    <div style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.76rem', marginTop: '2px' }}>
                      {selectedScan.penId || 'Pen B-12'} • Tier {selectedScan.severity || selectedScan.grade || 'A'}
                    </div>
                  </div>
                )}

                {formError && (
                  <div style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: '8px', fontWeight: 600 }}>
                    {formError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={posting}
                  className="lp-btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '16px', padding: '12px' }}
                >
                  {posting ? (
                    <>
                      <RefreshCw size={15} className="pigify-spin" />
                      <span>Posting…</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Publish to Community</span>
                    </>
                  )}
                </button>
              </form>

              {/* Notifications Dropdown */}
              {notifOpen && (
                <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main, #ffffff)', marginBottom: '8px' }}>
                    Recent Farmer Notifications
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)' }}>No notifications yet.</div>
                  ) : (
                    <div style={{ display: 'grid', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                      {notifications.map((item) => (
                        <div
                          key={String(item?._id || item?.id)}
                          style={{
                            padding: '8px 10px',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.025)',
                            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
                            fontSize: '0.78rem',
                          }}
                        >
                          <div style={{ color: 'var(--text-main, #ffffff)', fontWeight: 600 }}>{item?.message}</div>
                          <div style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.72rem' }}>{formatDate(item?.createdAt)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── RIGHT COLUMN: Forum Feed ── */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontFamily: 'Sora', fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main, #ffffff)' }}>
                    Community Case Feed
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)' }}>
                    Discussions and swine cases from backyard raisers
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void loadData()}
                  style={{
                    border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted, #94a3b8)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <RefreshCw size={13} />
                  <span>Refresh</span>
                </button>
              </div>

              {loading ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted, #94a3b8)' }}>
                  Loading community discussions…
                </div>
              ) : posts.length === 0 ? (
                <div
                  style={{
                    padding: '40px 20px',
                    borderRadius: '20px',
                    background: 'var(--surface-card, rgba(13, 19, 32, 0.85))',
                    border: '1px dashed var(--border-subtle, rgba(255, 255, 255, 0.15))',
                    textAlign: 'center',
                    color: 'var(--text-muted, #94a3b8)',
                  }}
                >
                  <MessageSquare size={32} color="var(--accent-rose, #f43f5e)" style={{ margin: '0 auto 10px auto' }} />
                  <h4 style={{ color: 'var(--text-main, #ffffff)', margin: '0 0 6px 0' }}>No Community Posts Yet</h4>
                  <p style={{ fontSize: '0.85rem', maxWidth: '320px', margin: '0 auto' }}>
                    Be the first backyard farmer to share a swine health question or scan record!
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {posts.map((post) => {
                    const id = String(post?._id || post?.id)
                    const scan = post?.scanSnapshot || null
                    const comments = Array.isArray(post?.comments) ? post.comments : []
                    const reactions = Array.isArray(post?.reactions) ? post.reactions : []
                    const heartCount = reactions.filter((r) => r.type === 'heart').length
                    const likeCount = reactions.filter((r) => r.type === 'like').length

                    return (
                      <article
                        key={id}
                        style={{
                          position: 'relative',
                          borderRadius: '18px',
                          background: 'var(--surface-card, rgba(13, 19, 32, 0.85))',
                          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                          padding: '18px',
                          boxShadow: 'var(--shadow-card, 0 8px 24px rgba(0, 0, 0, 0.2))',
                        }}
                      >
                        {/* Author Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                          <UserAvatar url={post?.user?.avatar} name={post?.authorName} size={36} />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-main, #ffffff)', fontSize: '0.92rem' }}>
                              {post?.authorName || 'Backyard Farmer'}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted, #94a3b8)' }}>
                              {formatDate(post?.createdAt)}
                            </div>
                          </div>
                        </div>

                        {/* Post Text */}
                        {post?.text && (
                          <p style={{ fontSize: '0.88rem', color: 'var(--text-main, #ffffff)', lineHeight: 1.55, margin: '0 0 12px 0' }}>
                            {post.text}
                          </p>
                        )}

                        {/* Attached Swine Scan Card */}
                        {scan && (
                          <div
                            style={{
                              borderRadius: '12px',
                              padding: '12px',
                              background: 'rgba(255, 255, 255, 0.025)',
                              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                              marginBottom: '12px',
                            }}
                          >
                            {scan.imageUrl && (
                              <img
                                src={scan.imageUrl}
                                alt="Attached Swine Scan"
                                style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }}
                              />
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div>
                                <strong style={{ fontSize: '0.88rem', color: 'var(--text-main, #ffffff)' }}>
                                  {scan.condition || 'Swine Scan Inspection'}
                                </strong>
                                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted, #94a3b8)', marginTop: '2px' }}>
                                  {scan.penId || 'Backyard Pen'} • Confidence: {scan.confidence || '96.8%'}
                                </div>
                              </div>
                              <span
                                style={{
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  fontFamily: 'JetBrains Mono',
                                  fontSize: '0.74rem',
                                  fontWeight: 800,
                                  color: 'var(--accent-rose, #f43f5e)',
                                  background: 'rgba(244, 63, 94, 0.15)',
                                }}
                              >
                                {String(scan.severity || 'TIER A').toUpperCase()}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Reactions Strip */}
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))' }}>
                          <button
                            type="button"
                            onClick={() => void handleReaction(post, 'like')}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-muted, #94a3b8)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '0.82rem',
                            }}
                          >
                            <ThumbsUp size={15} />
                            <span>{likeCount} Helpful</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => void handleReaction(post, 'heart')}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-muted, #94a3b8)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '0.82rem',
                            }}
                          >
                            <Heart size={15} />
                            <span>{heartCount} Support</span>
                          </button>
                        </div>

                        {/* Comments List */}
                        {comments.length > 0 && (
                          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.05))', display: 'grid', gap: '8px' }}>
                            {comments.map((cmt, idx) => (
                              <div key={idx} style={{ padding: '8px 10px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', fontSize: '0.8rem' }}>
                                <strong style={{ color: 'var(--text-main, #ffffff)' }}>{cmt.authorName || 'Farmer'}</strong>
                                <span style={{ color: 'var(--text-muted, #94a3b8)', marginLeft: '6px' }}>{cmt.text}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply Form */}
                        <form onSubmit={(e) => handleAddComment(id, e)} style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                          <input
                            type="text"
                            placeholder="Add advice or reply to this case..."
                            value={commentDrafts[id] || ''}
                            onChange={(e) => setCommentDrafts({ ...commentDrafts, [id]: e.target.value })}
                            style={{
                              flex: 1,
                              borderRadius: '8px',
                              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                              background: 'rgba(255, 255, 255, 0.03)',
                              color: 'var(--text-main, #ffffff)',
                              padding: '8px 12px',
                              fontSize: '0.82rem',
                              outline: 'none',
                            }}
                          />
                          <button
                            type="submit"
                            style={{
                              borderRadius: '8px',
                              border: 'none',
                              background: 'var(--accent-rose, #f43f5e)',
                              color: '#ffffff',
                              padding: '8px 12px',
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                            }}
                          >
                            Reply
                          </button>
                        </form>
                      </article>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="container-pro lp-footer-bottom" style={{ borderTop: 'none', paddingTop: '16px' }}>
          <span>(c) {new Date().getFullYear()} {BRAND_NAME}. {BRAND_TAGLINE}.</span>
          <div className="lp-footer-legal">
            <Link to="/about">About Study</Link>
            <Link to="/how-it-works">Guidelines</Link>
            <Link to="/features">Features</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default CommunityForum
