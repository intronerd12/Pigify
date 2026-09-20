import { useEffect, useRef, lazy, Suspense } from 'react'
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

// Public & Marketing Pages (Lazy-loaded)
const Landing = lazy(() => import('./pages/Landing'))
const About = lazy(() => import('./pages/About'))
const HowItWorks = lazy(() => import('./pages/HowItWorks'))
const Features = lazy(() => import('./pages/Features'))
const Auth = lazy(() => import('./pages/AuthPro'))

// User Tab Pages (Lazy-loaded)
const Home = lazy(() => import('./pages/Home'))
const Overview = lazy(() => import('./pages/Overview'))
const AiAnalysis = lazy(() => import('./pages/AiAnalysis'))
const SortingGrading = lazy(() => import('./pages/SortingGrading'))
const Environment = lazy(() => import('./pages/Environment'))
const CommunityForum = lazy(() => import('./pages/CommunityForum'))

// Admin Pages (Lazy-loaded)
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminFeatures = lazy(() => import('./pages/admin/AdminFeatures'))
const FeatureShowcase = lazy(() => import('./pages/admin/FeatureShowcase'))
const AdminAiAnalysis = lazy(() => import('./pages/admin/AdminAiAnalysis'))
const AdminMarketplace = lazy(() => import('./pages/admin/AdminMarketplace'))
const UserManagement = lazy(() => import('./pages/admin/UserManagement'))
const Analytics = lazy(() => import('./pages/admin/Analytics'))
const ScannedItems = lazy(() => import('./pages/admin/ScannedItems'))
const ApiMonitoring = lazy(() => import('./pages/admin/ApiMonitoring'))
const EnvironmentalData = lazy(() => import('./pages/admin/environmentaldata'))

function App() {
  const forcedLogoutRef = useRef(false)

  useEffect(() => {
    const checkSession = async () => {
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

      if (!parsedUser?.token) return

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
    const intervalId = window.setInterval(checkSession, 30000)
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
              <Route path="/community" element={<CommunityForum />} />
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
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
