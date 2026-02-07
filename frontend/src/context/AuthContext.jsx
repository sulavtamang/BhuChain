/**
 * AuthContext - Global Authentication State Management
 * 
 * Provides centralized authentication state and functions across the entire application.
 * Manages user sessions, wallet connections, and role-based access control.
 * 
 * Features:
 * - Django backend authentication with token management
 * - MetaMask wallet integration
 * - Session persistence via localStorage
 * - Automatic session restoration on page reload
 * - Role-based access control (Citizen vs Officer)
 * 
 * @module context/AuthContext
 */

import { useState, useEffect, createContext, useContext } from "react";
import { login as apiLogin, getUsers } from '../services/api';
import { connectWallet as blockchainConnectWallet, getCurrentAccount } from "../services/blockchain";

// ============================================================================
// CONTEXT CREATION
// ============================================================================

/**
 * Authentication context object.
 * Default value is null to indicate no authentication data is available
 * until the AuthProvider sets the actual values.
 */
const AuthContext = createContext(null);

// ============================================================================
// CUSTOM HOOK
// ============================================================================

/**
 * Custom hook to access authentication context.
 * 
 * This hook provides a safe way to access auth state and functions.
 * It includes error checking to ensure it's used within the AuthProvider.
 * 
 * @returns {Object} Authentication context containing:
 *   - user: Current user profile object
 *   - token: Django auth token
 *   - walletAddress: Connected MetaMask address
 *   - isOfficer: Boolean indicating if user is an officer
 *   - isAuthenticated: Boolean indicating if user is logged in
 *   - loading: Boolean indicating if session is being restored
 *   - login: Function to authenticate user
 *   - logout: Function to clear authentication
 *   - connectWallet: Function to connect MetaMask
 * 
 * @throws {Error} If used outside of AuthProvider
 * 
 * @example
 * function Dashboard() {
 *   const { user, isOfficer, logout } = useAuth();
 *   return <div>Welcome {user.full_name}</div>;
 * }
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

/**
 * Authentication Provider Component
 * 
 * Wraps the application to provide authentication state to all child components.
 * Handles session management, token storage, and wallet integration.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to wrap
 * 
 * @example
 * // In main.jsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export const AuthProvider = ({ children }) => {
    // ========================================================================
    // STATE MANAGEMENT
    // ========================================================================
    
    /**
     * Current authenticated user profile from Django.
     * null when no user is logged in.
     */
    const [user, setUser] = useState(null);
    
    /**
     * Django authentication token.
     * null when user is not authenticated.
     */
    const [token, setToken] = useState(null);
    
    /**
     * Connected MetaMask wallet address.
     * null when wallet is not connected.
     */
    const [walletAddress, setWalletAddress] = useState(null);
    
    /**
     * Loading state for session restoration.
     * Prevents flash of login screen while checking localStorage.
     */
    const [loading, setLoading] = useState(true);

    // ========================================================================
    // DERIVED STATE
    // ========================================================================
    
    /**
     * Check if current user is an officer.
     * Uses optional chaining to safely access user.role even when user is null.
     */
    const isOfficer = user?.role === 'Officer';
    
    /**
     * Check if user is fully authenticated.
     * Requires both token and user data to be present.
     * Double negation (!!) converts truthy/falsy values to strict boolean.
     */
    const isAuthenticated = !!token && !!user;

    // ========================================================================
    // AUTHENTICATION FUNCTIONS
    // ========================================================================
    
    /**
     * Authenticate user with Django backend and connect wallet.
     * 
     * Flow:
     * 1. Call Django /api/login/ to get auth token
     * 2. Store token in localStorage and state
     * 3. Fetch user profile from /api/users/
     * 4. Store user data in localStorage and state
     * 5. Automatically connect MetaMask wallet
     * 
     * @param {string} username - Django username
     * @param {string} password - User password
     * @returns {Promise<{success: boolean}>} Success indicator
     * @throws {Error} If login fails or wallet connection fails
     * 
     * @example
     * try {
     *   await login('citizen1', 'password123');
     *   // User is now logged in and wallet is connected
     * } catch (error) {
     *   console.error('Login failed:', error);
     * }
     */
    const login = async (username, password) => {
        try {
            // Step 1: Get authentication token from Django
            const data = await apiLogin(username, password);
            const authToken = data.token;

            // Step 2: Store token in both localStorage (persistence) and state (reactivity)
            localStorage.setItem('authToken', authToken);
            setToken(authToken);

            // Step 3: Fetch user profile (Django filters by logged-in user)
            const userData = await getUsers();
            const currentUser = userData.results[0]; // Backend returns only current user's profile

            // Step 4: Store user data in both localStorage and state
            localStorage.setItem('user', JSON.stringify(currentUser));
            setUser(currentUser);

            // Step 5: Automatically connect MetaMask wallet
            await connectWallet();

            return { success: true };
        } catch (error) {
            console.error('Login failed:', error);
            throw error; // Re-throw to allow calling code to handle error
        }
    }

    /**
     * Connect MetaMask wallet and store address.
     * 
     * @returns {Promise<string>} Connected wallet address
     * @throws {Error} If MetaMask is not installed or user rejects connection
     * 
     * @example
     * const address = await connectWallet();
     * console.log('Connected:', address);
     */
    const connectWallet = async () => {
        try {
            const address = await blockchainConnectWallet();
            setWalletAddress(address);
            localStorage.setItem('walletAddress', address);
            return address;
        } catch (error) {
            console.error('Wallet connection failed:', error);
            throw error;
        }
    };

    /**
     * Clear all authentication data and log out user.
     * 
     * Clears both React state and localStorage to ensure complete logout.
     * User will need to login again to access protected routes.
     * 
     * @example
     * <button onClick={logout}>Logout</button>
     */
    const logout = () => {
        // Clear React state (triggers immediate UI update)
        setUser(null);
        setToken(null);
        setWalletAddress(null);

        // Clear localStorage (removes persisted data)
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('walletAddress');
    }

    // ========================================================================
    // SESSION RESTORATION
    // ========================================================================
    
    /**
     * Restore user session from localStorage on component mount.
     * 
     * This effect runs once when the AuthProvider first renders.
     * It checks localStorage for saved authentication data and restores
     * the session if valid data is found.
     * 
     * Flow:
     * 1. Check localStorage for saved token and user data
     * 2. If found, restore to React state
     * 3. Attempt to reconnect wallet (may fail if MetaMask is locked)
     * 4. Set loading to false to show UI
     * 
     * This allows users to stay logged in even after page refresh.
     */
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const savedToken = localStorage.getItem('authToken');
                const savedUser = localStorage.getItem('user');
                const savedWallet = localStorage.getItem('walletAddress');

                if (savedToken && savedUser) {
                    // Restore authentication state
                    setToken(savedToken);
                    setUser(JSON.parse(savedUser));

                    // Attempt to reconnect wallet (optional, may fail if MetaMask is locked)
                    if (savedWallet) {
                        try {
                            const currentAccount = await getCurrentAccount();
                            if (currentAccount) {
                                setWalletAddress(currentAccount);
                            }
                        } catch (err) {
                            console.log('Wallet not available, user can reconnect manually');
                        }
                    }
                }
            } catch (error) {
                console.error('Session restoration failed:', error);
            } finally {
                // Always set loading to false, even if restoration fails
                setLoading(false);
            }
        };

        restoreSession();
    }, []); // Empty dependency array = run once on mount

    // ========================================================================
    // CONTEXT VALUE
    // ========================================================================
    
    /**
     * Context value object containing all auth state and functions.
     * This object is provided to all child components via the Provider.
     */
    const value = {
        user,
        token,
        walletAddress,
        isOfficer,
        isAuthenticated,
        loading,
        login,
        logout,
        connectWallet,
    };

    // ========================================================================
    // PROVIDER RENDER
    // ========================================================================
    
    /**
     * Render the Provider component with the context value.
     * All child components can now access auth state via useAuth().
     */
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
