import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import PageLoader from './components/PageLoader'
import ProtectedRoute from './components/admin/ProtectedRoute'
import UserProtectedRoute from './components/UserProtectedRoute'
import { API_BASE_URL } from './config/api'
import { ThemeProvider } from './context/ThemeContext'
import './theme.css'
import './components/marketing/MarketingNav.css'
import './App.css'

// Robust Lazy Loader with proper async retry loop and preload support
const lazyWithRetry = (componentImport, retries = 2) => {
  const load = async (attempt = 0) => {
    try {
      return await componentImport()
    } catch (error) {
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)))
        return load(attempt + 1)
      }
      throw error
    }
  }
  const LazyComponent = lazy(() => load(0))
  LazyComponent.preload = componentImport
  return LazyComponent
}

// Lazy-load Floating Chatbot so it never blocks initial page render
const PigifyChatbot = lazyWithRetry(() => import('./components/chatbot/PigifyChatbot'))

// Public & Marketing Pages (Lazy-loaded with retry)
const Landing = lazyWithRetry(() => import('./pages/Landing'))
const About = lazyWithRetry(() => import('./pages/About'))
const HowItWorks = lazyWithRetry(() => import('./pages/HowItWorks'))
const Features = lazyWithRetry(() => import('./pages/Features'))
const Auth = lazyWithRetry(() => import('./pages/AuthPro'))

// User Tab Pages (Lazy-loaded with retry)
const Home = lazyWithRetry(() => import('./pages/Home'))
const Overview = lazyWithRetry(() => import('./pages/Overview'))
const AiAnalysis = lazyWithRetry(() => import('./pages/AiAnalysis'))
const SortingGrading = lazyWithRetry(() => import('./pages/SortingGrading'))
const Environment = lazyWithRetry(() => import('./pages/Environment'))
const CommunityForum = lazyWithRetry(() => import('./pages/CommunityForum'))
const DiseaseMap = lazyWithRetry(() => import('./pages/DiseaseMap'))
const UserProfile = lazyWithRetry(() => import('./pages/UserProfile'))
const ChatbotPage = lazyWithRetry(() => import('./pages/ChatbotPage'))

// Admin Pages (Lazy-loaded with retry)
const AdminLayout = lazyWithRetry(() => import('./components/admin/AdminLayout'))
const Dashboard = lazyWithRetry(() => import('./pages/admin/Dashboard'))
const AdminFeatures = lazyWithRetry(() => import('./pages/admin/AdminFeatures'))
const FeatureShowcase = lazyWithRetry(() => import('./pages/admin/FeatureShowcase'))
const AdminAiAnalysis = lazyWithRetry(() => import('./pages/admin/AdminAiAnalysis'))
const AdminMarketplace = lazyWithRetry(() => import('./pages/admin/AdminMarketplace'))
const UserManagement = lazyWithRetry(() => import('./pages/admin/UserManagement'))
const Analytics = lazyWithRetry(() => import('./pages/admin/Analytics'))
const ScannedItems = lazyWithRetry(() => import('./pages/admin/ScannedItems'))
const ApiMonitoring = lazyWithRetry(() => import('./pages/admin/ApiMonitoring'))
const EnvironmentalData = lazyWithRetry(() => import('./pages/admin/environmentaldata'))

function App() {
  const forcedLogoutRef = useRef(false)
  const [mountChatbot, setMountChatbot] = useState(false)

  // Defer floating chatbot & prefetch high-frequency route chunks during browser idle time
  useEffect(() => {
    const scheduleIdle =
      typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback
        : (cb) => window.setTimeout(cb, 1200)

    const cancelIdle =
      typeof window.cancelIdleCallback === 'function'
        ? window.cancelIdleCallback
        : window.clearTimeout

    const idleId = scheduleIdle(() => {
      setMountChatbot(true)
      // Prefetch core user routes in the background when browser is idle so tab switching is instant
      const rawUser = localStorage.getItem('user')
      if (rawUser) {
        Home.preload?.()
        DiseaseMap.preload?.()
        AiAnalysis.preload?.()
        ChatbotPage.preload?.()
      }
    })

    return () => cancelIdle(idleId)
  }, [])

  useEffect(() => {
    const checkSession = async () => {
      if (document.visibilityState === 'hidden') return
      const rawUser = localStorage.getItem('user')
      if (!rawUser) {
        forcedLogoutRef.current = false
        return
      }

      let parsedUser
      try {
        parsedUser = JSON.parse(rawUser)
      } catch (_error) {
        localStorage.removeItem('user')
        return
      }

      if (!parsedUser?.token || parsedUser?.token?.startsWith('demo-')) return

      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/session`, {
          headers: {
            Authorization: `Bearer ${parsedUser.token}`,
          },
        })

        if (res.ok) {
          forcedLogoutRef.current = false
          return
        }

        if (res.status !== 401 && res.status !== 403) return

        if (forcedLogoutRef.current) return
        forcedLogoutRef.current = true

        const body = await res.json().catch(() => ({}))
        localStorage.removeItem('user')
        toast.error(body?.message || 'Your session ended due to account status update.')
        if (window.location.pathname !== '/login') {
          window.location.assign('/login')
        }
      } catch (_error) {
        // Ignore transient network errors; only force logout on explicit auth/status failures.
      }
    }

    const visibilityHandler = () => {
      if (document.visibilityState === 'visible') {
        checkSession()
      }
    }

    checkSession()
    const intervalId = window.setInterval(checkSession, 60000)
    window.addEventListener('focus', checkSession)
    document.addEventListener('visibilitychange', visibilityHandler)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', checkSession)
      document.removeEventListener('visibilitychange', visibilityHandler)
    }
  }, [])

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Toaster position="top-center" reverseOrder={false} />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/features" element={<Features />} />
            <Route path="/login" element={<Auth />} />
            {/* User Routes - Protected against unauthorized URL copy/paste bypass */}
            <Route element={<UserProtectedRoute />}>
              <Route path="/home" element={<Home />} />
              <Route path="/overview" element={<Overview />} />
              <Route path="/ai-analysis" element={<AiAnalysis />} />
              <Route path="/sorting-grading" element={<SortingGrading />} />
              <Route path="/environment" element={<Environment />} />
              <Route path="/disease-map" element={<DiseaseMap />} />
              <Route path="/community" element={<CommunityForum />} />
              <Route path="/chatbot" element={<ChatbotPage />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/settings" element={<Navigate to="/profile" replace />} />
              <Route path="/user-features" element={<Navigate to="/community" replace />} />
              <Route path="/marketplace" element={<Navigate to="/community" replace />} />
              <Route path="/user-admin" element={<Navigate to="/community" replace />} />
            </Route>

            {/* Admin Routes - Protected */}
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="scans" element={<ScannedItems />} />
                <Route path="api-health" element={<ApiMonitoring />} />
                <Route path="features" element={<AdminFeatures />} />
                <Route path="tabs" element={<FeatureShowcase />} />
                <Route path="ai-analysis" element={<AdminAiAnalysis />} />
                <Route path="marketplace" element={<AdminMarketplace />} />
                <Route path="environment" element={<EnvironmentalData />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        {mountChatbot && (
          <Suspense fallback={null}>
            <PigifyChatbot />
          </Suspense>
        )}
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
