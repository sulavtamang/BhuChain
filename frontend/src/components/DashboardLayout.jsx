import { useEffect, useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  History, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Search
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { getPendingCounts } from "../services/api";
import HelpGuideModal from "./HelpGuideModal";

/**
 * DashboardLayout - The main shell for all authenticated views.
 * 
 * Features:
 * - Collapsible Sidebar with navigation links
 * - Main content area for sub-routes (Outlet)
 * - Responsive design for smaller screens
 */
export default function DashboardLayout() {
  const { user } = useAuth();
  // on mobile, start collapsed by default
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const location = useLocation();

  const [counts, setCounts] = useState({ applications: 0, kyc: 0 });

  useEffect(() => {
    let intervalId;
    const fetchCounts = async () => {
      if (user?.role === 'Officer') {
        try {
          const data = await getPendingCounts();
          setCounts({ applications: data.pending_applications, kyc: data.pending_kyc });
        } catch (e) {
          console.error("Failed to fetch pending counts", e);
        }
      }
    };

    fetchCounts();
    if (user?.role === 'Officer') {
       intervalId = setInterval(fetchCounts, 60000); // poll every 60s
    }

    return () => {
       if (intervalId) clearInterval(intervalId);
    };
  }, [user]);

  const navItems = [
    { label: "Overview", icon: LayoutDashboard, path: "/dashboard" },
    { label: "My Lalpurjas", icon: MapIcon, path: "/dashboard/properties" },
    { label: "Applications", icon: History, path: "/dashboard/applications", badge: counts.applications },
    { label: "Search Registry", icon: Search, path: "/dashboard/search" },
    { label: "Settings", icon: Settings, path: "/dashboard/settings" },
    // If we had a specific KYC tab, we'd add its badge here. 
    // Since Officer sees KYC in applications or overview, we could combine counts or just show applications for now.
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Mobile Overlay */}
      {!collapsed && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity" 
          onClick={() => setCollapsed(true)} 
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative top-0 bottom-0 left-0 h-full bg-white border-r border-gray-200 flex flex-col z-40 transition-all duration-300 ease-in-out ${
          collapsed 
            ? "-translate-x-full md:translate-x-0 md:w-[80px]" 
            : "translate-x-0 w-[260px]"
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex absolute -right-3 top-28 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:text-blue-600 z-50 transition-colors"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Workspace/Brand Area - Pushed down a bit to account for global Navbar */}
        <div className="h-20" /> 

        {/* Navigation Sidebar */}
        <nav className="flex-1 px-4 space-y-2 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/dashboard/');
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? "bg-blue-50 text-blue-600" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                  isActive ? "bg-white shadow-sm" : "group-hover:bg-white"
                }`}>
                  <Icon size={18} />
                </div>
                {!collapsed && (
                  <span className="font-semibold text-[0.95rem] truncate">{item.label}</span>
                )}
                {item.badge > 0 && user?.role === 'Officer' && (
                  <span className={`ml-auto shrink-0 bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full ${collapsed ? 'absolute top-1 right-1' : ''}`}>
                    {item.badge}
                  </span>
                )}
                {isActive && !collapsed && !item.badge && (
                  <motion.div 
                    layoutId="active-pill"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar Cta */}
        {!collapsed && (
          <div className="p-4 m-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
            <h4 className="text-white text-sm font-bold mb-1">Need Help?</h4>
            <p className="text-blue-100 text-[10px] mb-3">Check our guide on property transfer.</p>
            <button 
              onClick={() => setIsHelpOpen(true)}
              className="w-full bg-white/20 hover:bg-white/30 text-white text-xs py-2 rounded-lg font-bold transition-colors"
            >
              Read Guide
            </button>
          </div>
        )}

      </aside>

      {/* Mobile Toggle Button (when sidebar is hidden) */}
      <button 
        onClick={() => setCollapsed(false)}
        className={`md:hidden fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-2xl z-20 transition-transform duration-300 ${
           collapsed ? "scale-100" : "scale-0"
        }`}
      >
        <LayoutDashboard size={24} />
      </button>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto pt-20">
         <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-10">
            <Outlet />
         </div>
      </main>

      {/* Help Modal */}
      <HelpGuideModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
