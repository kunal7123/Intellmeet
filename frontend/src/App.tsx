import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Meeting from './pages/Meeting'
import PostMeeting from './pages/PostMeeting'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/meeting/:roomId" element={
          <ProtectedRoute>
            <Meeting />
          </ProtectedRoute>
        } />
        <Route path="/post-meeting" element={
          <ProtectedRoute>
            <PostMeeting />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App