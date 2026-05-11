import { useState, useEffect, createContext, useContext } from "react";
import {
  loginWithWallet as apiLoginWithWallet,
  checkOfficerStatus,
  getUserById,
  checkRegistration
} from "../services/api";
import {
  connectWallet as blockchainConnectWallet,
  getCurrentAccount,
  getSigner,
} from "../services/blockchain";
import { toast } from "react-hot-toast";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // Django auth token

  const [walletAddress, setWalletAddress] = useState(null); // Active MetaMask address

  // Prevents UI flicker while checking local storage
  const [loading, setLoading] = useState(true);

  // Derived states for easy component consumption
  const isOfficer = user?.role === "Officer";
  const isAuthenticated = !!token && !!user;


  // Force account selection popup
  const switchWallet = async () => {
    try {
      if (!window.ethereum) return;

      // Proactively clear the old address from storage so we don't "fall back" to it
      localStorage.removeItem("walletAddress");

      // Force MetaMask to show the account selection popup
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      // Small delay to allow MetaMask to update its internal state
      await new Promise(resolve => setTimeout(resolve, 300));

      // Fetch the active account (MetaMask should now report the newly active one)
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const address = accounts[0];

      if (address) {
        // Clear old session
        setUser(null);
        setToken(null);
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        localStorage.removeItem("loginTimestamp");
        
        // Update to the newly selected wallet
        setWalletAddress(address);
        localStorage.setItem("walletAddress", address);
        
        toast.success("Identity switched. Please sign in with your new wallet.", { duration: 5000 });
      }

      return address;
    } catch (error) {
      // User cancelled the wallet switch — do nothing
      if (error.code !== 4001 && error.code !== "ACTION_REJECTED") {
        console.error("Switching failed:", error);
      }
    }
  };

  // Generic wallet connector with optional prompt forcing
  const executeWalletConnection = async (silentFirst = true) => {
    const forcePrompt = localStorage.getItem("forceWalletPrompt") === "true";
    let address;

    if (forcePrompt && window.ethereum) {
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });
      localStorage.removeItem("forceWalletPrompt");
      address = await blockchainConnectWallet();
    } else {
      if (silentFirst) {
        address = await getCurrentAccount();
      }
      if (!address) {
        address = await blockchainConnectWallet();
      }
    }


    if (address) {
      setWalletAddress(address);
      localStorage.setItem("walletAddress", address);
    }
    return address;
  };

  const connectWallet = async () => {
    try {
      const address = await executeWalletConnection(false);
      toast.success("Wallet connected!");
      return address;
    } catch (error) {
      console.error("Wallet connection failed:", error);
      toast.error(error.message || "Failed to connect wallet.");
      throw error;
    }
  };

  const handleWalletLogin = async (navigate) => {
    let address;
    try {
      // Connect and sign verification message
      address = await executeWalletConnection(true);
      if (!address) return;

      const signer = await getSigner();
      const message = [
        "BhuChain: Confirm Login",
        "",
        "I am confirming my identity to securely access my land records.",
        "This is a free verification; no transaction fees will be charged.",
        "",
        `Wallet: ${address}`,
        `Time: ${new Date().toLocaleString()}`,
      ].join("\n");

      const signature = await signer.signMessage(message);

      // Backend signature verification
      const data = await apiLoginWithWallet(address, signature, message);

      const now = new Date().getTime();
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("loginTimestamp", now.toString());
      setToken(data.token);

      // PASS TOKEN EXPLICITLY to avoid axios race condition
      const currentUser = await getUserById(data.user_id, data.token);
      localStorage.setItem("user", JSON.stringify(currentUser));
      setUser(currentUser);

      // Route based on role
      if (currentUser.role === "Officer") {
        toast.success(`Welcome, Officer ${currentUser.full_name}`);
        navigate("/officer");
      } else {
        toast.success(`Welcome, ${currentUser.full_name}`);
        navigate("/dashboard");
      }
    } catch (error) {
      if (error.response?.status === 404) {
        try {
          const authStatus = await checkOfficerStatus(address);
          if (authStatus.is_authorized) {
            toast.success(`Official Credentials Detected. Redirecting to Government Onboarding...`, { duration: 5000 });
            navigate("/officer/onboarding");
          } else {
            toast.error(`Wallet not found in officer whitelist. Redirecting to Citizen Registration...`, { duration: 5000 });
            navigate("/register");
          }
        } catch (statusError) {
          console.error("Authorization check failed:", statusError);
          navigate("/register");
        }
      } else if (error.response?.status === 401) {
        // If we already have a token, it means login succeeded but profile fetch failed
        if (token || localStorage.getItem('authToken')) {
           toast.error("Session initialization failed. Please refresh and try again.");
        } else {
           toast.error("Signature verification failed. Please check your wallet and try again.");
        }
      } else if (error.code === 4001 || error.code === "ACTION_REJECTED") {
        // User cancelled — do nothing, no alert needed
      } else {
        console.error("Login error:", error);
      }
    }
  };

  // Initial check before proceeding to registration form
  const handleStartRegistration = async (navigate) => {
    try {
      const address = await executeWalletConnection(true);
      if (address) {
        // 1. Check if already registered
        try {
          const regData = await checkRegistration(address);
          if (regData.is_registered) {
            // If already registered, just log them in
            return handleWalletLogin(navigate);
          }
        } catch (err) {
          console.error("Registration check failed:", err);
        }

        // 2. Check if whitelisted as officer
        try {
          const authStatus = await checkOfficerStatus(address);
          if (authStatus.is_authorized) {
            toast.success(`Official Credentials Detected. Redirecting to Government Onboarding...`, { duration: 5000 });
            navigate("/officer/onboarding");
            return;
          }
        } catch (authErr) {
          console.error("Officer auth check failed:", authErr);
        }

        // 3. Otherwise, standard registration
        navigate("/register");
      }
    } catch (error) {
      if (error.code !== 4001 && error.code !== "ACTION_REJECTED") {
        console.error("Wallet connection for registration failed:", error);
      }
    }
  };

  const logout = () => {
    // Reset state and storage on exit
    setUser(null);
    setToken(null);
    setWalletAddress(null);

    // Clear localStorage (removes persisted data)
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("loginTimestamp");

    // Flag to force MetaMask account selection prompt on next connection
    localStorage.setItem("forceWalletPrompt", "true");
    toast.success("Logged out successfully.");
  };

  // MetaMask account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        const newAccount = accounts[0] || null;

        // Force logout on wallet mismatch to prevent data leakage
        const currentWallet = localStorage.getItem("walletAddress");
        
        if (token && newAccount && currentWallet && newAccount.toLowerCase() !== currentWallet.toLowerCase()) {
          // Clear session data but keep the new wallet address in state
          setUser(null);
          setToken(null);
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          localStorage.removeItem("loginTimestamp");
          
          setWalletAddress(newAccount);
          localStorage.setItem("walletAddress", newAccount);
          
          toast.error("Wallet change detected. For your security, you have been logged out.", { duration: 6000 });
        } else {
          // Normal wallet state update
          setWalletAddress(newAccount);
          if (newAccount) {
            localStorage.setItem("walletAddress", newAccount);
          } else {
            localStorage.removeItem("walletAddress");
          }
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged,
        );
      };
    }
  }, [token, logout]); // Re-run if token changes to track active session

  // Session restoration
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = localStorage.getItem("authToken");
        const savedUser = localStorage.getItem("user");
        const savedTimestamp = localStorage.getItem("loginTimestamp");
        const savedWallet = localStorage.getItem("walletAddress");

        // Verify active token and session age
        if (savedToken && savedUser && savedTimestamp) {
          const now = new Date().getTime();
          const sessionAge = now - parseInt(savedTimestamp);
          const TWO_HOURS = 2 * 60 * 60 * 1000;

          // 2. Check for 2-hour timeout
          if (sessionAge < TWO_HOURS) {
            try {
              // Set initial state from storage for speed
              setToken(savedToken);
              setUser(JSON.parse(savedUser));
              if (savedWallet) setWalletAddress(savedWallet);

              // Silent token verification against backend
              const parsedUser = JSON.parse(savedUser);
              const currentUser = await getUserById(parsedUser.id);
              if (currentUser) {
                setUser(currentUser);
              } else {
                // User exists in storage but NOT in backend DB (Deleted)
                logout();
              }
            } catch (err) {
              console.error("Session verification failed on backend:", err);
              // If the token is invalid (401), the api interceptor might already handle it,
              // but we logout here for total consistency.
              logout();
            }
          } else {
            logout();
          }
        } else if (savedWallet) {
          // Just restore the wallet if no session
          setWalletAddress(savedWallet);
        }
      } catch (error) {
        console.error("Session restoration failed:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []); // Empty dependency array = run once on mount

  const value = {
    user,
    token,
    walletAddress,
    isOfficer,
    isAuthenticated,
    loading,
    setToken,
    setUser,
    logout,
    connectWallet,
    switchWallet,
    handleWalletLogin,
    handleStartRegistration,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
