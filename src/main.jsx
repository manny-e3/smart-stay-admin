import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Captured by ErrorBoundary:', error, errorInfo)
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '32px', fontFamily: 'system-ui, sans-serif', background: '#F7F7F5', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '32px', maxWidth: '640px', width: '100%', boxShadow: '0 8px 24px -4px rgba(11,31,58,0.1)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#DC2626', marginBottom: '8px' }}>
              Rendering Error Detected
            </h2>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
              An error occurred while mounting the component tree:
            </p>
            <pre style={{ whiteSpace: 'pre-wrap', background: '#FEE2E2', color: '#B91C1C', padding: '16px', borderRadius: '8px', fontSize: '12px', overflowX: 'auto' }}>
              {this.state.error?.toString()}
              {'\n\n'}
              {this.state.errorInfo?.componentStack}
            </pre>
            <button
              onClick={() => {
                window.location.reload()
              }}
              style={{ marginTop: '20px', padding: '10px 20px', background: '#0B1F3A', color: '#ffffff', borderRadius: '8px', fontSize: '13px', fontWeight: '600', border: 'none', cursor: 'pointer' }}
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
