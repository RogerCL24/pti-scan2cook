import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ScanPage from './pages/ScanPage'
import ReviewPage from './pages/ReviewPage'
import { AuthProvider, useAuth } from './hooks/useAuth'

function PrivateRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/scan"
            element={
              <PrivateRoute>
                <ScanPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/review"
            element={
              <PrivateRoute>
                <ReviewPage />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/scan" />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}
