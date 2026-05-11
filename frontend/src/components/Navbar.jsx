import { useState, useEffect } from "react";
import { LogOut, User as UserIcon, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { getImageUrl } from "../utils/media";
import Logo from "./Logo";



export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const { handleWalletLogin, walletAddress, token, logout, user, switchWallet, connectWallet } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = !!token;
  // Only show the Dashboard shortcut when on the landing page
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    } else {
      // If element not found (e.g., we are on /search), navigate to home
      navigate(`/#${id}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-4 bg-(--bg-primary) transition-all duration-300 ease-in-out ${
        scrolled ? "border-b border-(--border-color) shadow-lg" : "border-b border-transparent"
      }`}
      >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 group">
          <Logo className="h-10 w-10" />
          <span className="text-2xl font-bold leading-none hidden sm:block text-gray-600">
            BhuChain
          </span>
        </a>

        {/* Desktop Nav Links - Only show for public users */}
        {!token && (
          <nav className="hidden md:flex flex-1 justify-center gap-8">
            {[
              { label: "Home", id: "home" },
              { label: "Features", id: "features" },
              { label: "Process", id: "how-it-works" },
              { label: "Contact", id: "contact" }
            ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => scrollToSection(e, item.id)}
                  className="text-(--text-primary) font-medium text-base px-2 py-2 transition-colors hover:text-(--primary)"
                >
                  {item.label}
                </a>
            ))}
          </nav>
        )}

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {token && user ? (
            <div className="flex items-center gap-3">
              {/* Clickable User Badge → goes to dashboard */}
              <button
                onClick={() => navigate(user.role === 'Officer' ? '/officer' : '/dashboard')}
                className="flex items-center gap-3 bg-white border-2 border-blue-100 rounded-2xl px-3 py-1.5 shadow-md hover:border-blue-300 hover:shadow-lg transition-all"
                title="Go to Dashboard"
              >
                <div className="relative">
                  {user.profile_picture ? (
                    <img 
                      src={getImageUrl(user.profile_picture)} 
                      alt="Profile" 
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                    />
                  ) : (
                    <div className="bg-blue-600 p-2 rounded-full shadow-sm">
                      <UserIcon className="h-4 w-4 text-white" />
                    </div>
                  )}
                  {user.is_verified && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                      <ShieldCheck size={8} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-gray-900 leading-tight">{user.full_name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter ${
                      user.role === 'Officer' ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-blue-50 text-blue-600 border border-blue-100"
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold font-mono tracking-tighter">{walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}</span>
                </div>
              </button>

              {/* Go to Dashboard button — only on the landing page */}
              {isHomePage && (
                <button
                  onClick={() => navigate(user.role === 'Officer' ? '/officer' : '/dashboard')}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-bold text-white transition-all shadow-md shadow-blue-100"
                >
                  Dashboard
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Logout */}
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                title="Logout"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
               {walletAddress ? (
                 <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full pl-2 pr-3 py-1 scale-95 origin-right">
                        <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                        <span className="text-[11px] font-black text-blue-700 tracking-tight font-mono">
                            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                        </span>
                        <button 
                            onClick={switchWallet}
                            className="ml-1 p-1 text-blue-400 hover:text-blue-600 transition-colors"
                            title="Switch Wallet"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                        </button>
                    </div>
                    <button 
                        onClick={() => handleWalletLogin(navigate)}
                        className="rounded-lg bg-(--primary) px-6 py-2.5 text-[0.95rem] font-bold text-white transition-all hover:-translate-y-[2px] hover:shadow-[0_10px_20px_rgba(30,64,239,0.3)] group flex items-center gap-2"
                    >
                        Sign In
                        <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                 </div>
               ) : (
                <button 
                    onClick={connectWallet}
                    className="rounded-lg bg-(--primary) px-5 py-2.5 text-[0.95rem] font-semibold text-white transition-all hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(30,64,239,0.3)]">
                    Connect Wallet
                </button>
               )}
            </div>
          )}

          {walletAddress && !token && (
            <button
              onClick={logout}
              className="p-2.5 text-gray-400 hover:text-red-500 transition-colors"
              title="Disconnect Wallet"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="flex md:hidden flex-col gap-[6px] border-none bg-transparent p-0 z-50 cursor-pointer"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`origin-center h-[3px] w-[25px] rounded-sm bg-[#1e40ef] transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'translate-y-[9px] rotate-45' : ''}`}></span>
          <span className={`h-[3px] w-[25px] rounded-sm bg-[#1e40ef] transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`origin-center h-[3px] w-[25px] rounded-sm bg-[#1e40ef] transition-all duration-300 ease-in-out ${mobileMenuOpen ? '-translate-y-[9px] -rotate-45' : ''}`}></span>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <nav className={`absolute left-0 right-0 top-full flex flex-col gap-3 bg-(--bg-primary) px-6 transition-all duration-300 ease-in-out md:hidden overflow-hidden ${mobileMenuOpen ? 'max-h-[500px] py-6 border-b border-gray-200 shadow-lg' : 'max-h-0 py-0 border-b border-transparent'}`}>
        {!token && [
            { label: "Home", id: "home" },
            { label: "Features", id: "features" },
            { label: "Process", id: "how-it-works" },
            { label: "Contact", id: "contact" }
        ].map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => scrollToSection(e, item.id)}
              className="w-full text-left py-3 text-base font-medium text-gray-800 hover:text-[#1e40ef]"
            >
              {item.label}
            </a>
        ))}
        <div className="flex flex-col gap-3 mt-4">
          {token && user ? (
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
               <div className="bg-blue-600 p-2 rounded-lg">
                  <UserIcon className="h-5 w-5 text-white" />
               </div>
               <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">{user.full_name}</span>
                  <span className="text-xs text-gray-400 font-mono">{walletAddress?.slice(0, 10)}...{walletAddress?.slice(-4)}</span>
               </div>
            </div>
          ) : (
            <>
              {walletAddress ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                       <span className="text-sm font-bold text-blue-700 font-mono">{walletAddress.slice(0, 12)}...</span>
                    </div>
                    <button 
                       onClick={switchWallet}
                       className="text-xs font-black text-blue-600 uppercase tracking-tighter"
                    >
                        Switch
                    </button>
                  </div>
                  <button 
                    onClick={() => { handleWalletLogin(navigate); setMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-(--primary) px-5 py-4 text-white font-bold shadow-lg"
                  >
                    Sign in to Account
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <button 
                    onClick={() => { connectWallet(); setMobileMenuOpen(false); }}
                    className="w-full rounded-xl bg-(--primary) px-5 py-4 text-lg font-bold text-white shadow-lg">
                    Connect Wallet
                </button>
              )}
            </>
          )}

          {token && (
             <button
               onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}
               className="w-full rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700"
             >
                Go to Dashboard
             </button>
          )}
          
          {walletAddress && (
            <button 
              onClick={() => { logout(); setMobileMenuOpen(false); }}
              className="flex items-center justify-center gap-2 w-full mt-2 rounded-lg border border-red-200 text-red-600 px-5 py-2.5 text-[0.95rem] font-medium hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}