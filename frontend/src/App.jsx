/**
 * App.jsx - Main Application Component (Testing Auth Context)
 * 
 * This is a temporary test component to verify the AuthContext is working.
 * Once verified, this will be replaced with proper routing and page components.
 * 
 * Features tested:
 * - Login with Django backend
 * - Automatic wallet connection
 * - Session restoration on page refresh
 * - User profile display
 * - Role-based UI (Officer vs Citizen)
 * - Logout functionality
 */

import { useState } from 'react';
import { useAuth } from './context/AuthContext';

function App() {
  // Get auth state and functions from context
  const { 
    user, 
    walletAddress, 
    isOfficer, 
    isAuthenticated,
    loading,
    login, 
    connectWallet, 
    logout 
  } = useAuth();

  // Local state for login form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  /**
   * Handle login form submission
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(username, password);
      // Login successful - context will update automatically
    } catch (err) {
      const errorMessage = err.response?.data?.non_field_errors?.[0] 
        || err.response?.data?.detail 
        || err.message 
        || 'Login failed';
      setError(errorMessage);
    }
  };

  /**
   * Handle manual wallet connection
   */
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (err) {
      alert('Wallet connection failed: ' + err.message);
    }
  };

  // Show loading spinner while checking for existing session
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '600px', 
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        color: '#10b981',
        marginBottom: '30px'
      }}>
        🏛️ BhuChain Auth Test
      </h1>
      
      {isAuthenticated ? (
        // ============================================
        // LOGGED IN VIEW
        // ============================================
        <div style={{ 
          backgroundColor: '#f9fafb', 
          padding: '30px', 
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ marginTop: 0 }}>
            Welcome, {user.full_name}! 👋
          </h2>
          
          {/* User Information */}
          <div style={{ marginBottom: '20px' }}>
            <p><strong>Role:</strong> {isOfficer ? '👮 Officer' : '👤 Citizen'}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Citizenship No:</strong> {user.citizenship_no}</p>
            <p><strong>Verified:</strong> {user.is_verified ? '✅ Yes' : '❌ No'}</p>
          </div>

          {/* Wallet Information */}
          <div style={{ 
            backgroundColor: '#fff', 
            padding: '15px', 
            borderRadius: '6px',
            marginBottom: '20px'
          }}>
            <h3 style={{ marginTop: 0 }}>Wallet Connection</h3>
            {walletAddress ? (
              <p style={{ 
                fontFamily: 'monospace', 
                fontSize: '14px',
                wordBreak: 'break-all'
              }}>
                🔗 {walletAddress}
              </p>
            ) : (
              <div>
                <p style={{ color: '#ef4444' }}>⚠️ Wallet not connected</p>
                <button 
                  onClick={handleConnectWallet}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Connect MetaMask
                </button>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button 
            onClick={logout}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              width: '100%'
            }}
          >
            Logout
          </button>
        </div>
      ) : (
        // ============================================
        // LOGIN FORM
        // ============================================
        <div style={{ 
          backgroundColor: '#f9fafb', 
          padding: '30px', 
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ marginTop: 0, textAlign: 'center' }}>Login</h2>
          
          <form onSubmit={handleLogin}>
            {/* Username Input */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px',
                fontWeight: '500'
              }}>
                Username
              </label>
              <input 
                type="text"
                placeholder="Enter your username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px',
                fontWeight: '500'
              }}>
                Password
              </label>
              <input 
                type="password"
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div style={{ 
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                padding: '10px',
                borderRadius: '6px',
                marginBottom: '15px',
                fontSize: '14px'
              }}>
                ❌ {error}
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit"
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                width: '100%',
                fontWeight: '500'
              }}
            >
              Login & Connect Wallet
            </button>
          </form>

          {/* Info Message */}
          <p style={{ 
            marginTop: '20px',
            fontSize: '13px',
            color: '#6b7280',
            textAlign: 'center'
          }}>
            💡 After login, MetaMask will automatically connect
          </p>
        </div>
      )}

      {/* Debug Info (remove in production) */}
      <div style={{ 
        marginTop: '30px',
        padding: '15px',
        backgroundColor: '#fef3c7',
        borderRadius: '6px',
        fontSize: '12px'
      }}>
        <strong>Debug Info:</strong>
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li>Authenticated: {isAuthenticated ? '✅' : '❌'}</li>
          <li>User loaded: {user ? '✅' : '❌'}</li>
          <li>Wallet connected: {walletAddress ? '✅' : '❌'}</li>
          <li>Loading: {loading ? '⏳' : '✅'}</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
