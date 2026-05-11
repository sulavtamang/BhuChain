import { Routes, Route } from "react-router-dom";
import ProtectedRoute  from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";

import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";

import CitizenDashboard from "./pages/CitizenDashboard";
import ApplicationsPage from "./pages/ApplicationsPage";
import OfficerDashboard from "./pages/OfficerDashboard";
import SearchRegistry from "./pages/SearchRegistry";
import OverviewPage from "./pages/OverviewPage";
import SettingsPage from "./pages/SettingsPage";
import OfficerOnboardingPage from "./pages/OfficerOnboardingPage";
import NotFoundPage from "./pages/NotFoundPage";

import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import { isMetaMaskInstalled } from "./services/blockchain";
import { AlertCircle, ExternalLink } from "lucide-react";

function App () {
  const hasMetaMask = isMetaMaskInstalled();

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      
      {!hasMetaMask && (
        <div className="bg-amber-50 border-b border-amber-100 p-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-amber-800">
              <AlertCircle size={18} className="shrink-0" />
              <p className="text-sm font-medium">
                <span className="font-bold">MetaMask Extension Missing:</span> To interact with the BhuChain ledger, please install the MetaMask wallet.
              </p>
            </div>
            <a 
              href="https://metamask.io/download/" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0"
            >
              Get MetaMask <ExternalLink size={12} />
            </a>
          </div>
        </div>
      )}

      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/officer/onboarding" element={<OfficerOnboardingPage />} />

        {/* PROTECTED ROUTES (Must be logged in) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="properties" element={<CitizenDashboard />} />
            <Route path="applications" element={<ApplicationsPage />} />
            {/* The individual search is also available inside but redirects to the public module */}
            <Route path="search" element={<SearchRegistry />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
        
        {/* Public Utility Routes */}
        <Route path="/search" element={<SearchRegistry />} />
        
        {/* OFFICER ONLY ROUTES */}
        <Route element={<ProtectedRoute requireOfficer={true} />}>
          <Route path="/officer" element={<OfficerDashboard />} />
        </Route>

        {/* 404 CATCH ALL */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

export default App;

