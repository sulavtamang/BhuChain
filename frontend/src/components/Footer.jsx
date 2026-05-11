import { useState } from "react";
import { Hexagon, Box, ExternalLink, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import ContactModal from "./ContactModal";

function Footer() {
  const currentYear = new Date().getFullYear();
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <>
      <footer className="bg-white pt-16 pb-12 border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
            
            {/* Brand Column */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="flex items-center gap-3 mb-6 group">
                <Logo className="h-8 w-8" />
                <span className="text-xl font-bold text-gray-600">BhuChain</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                A secure, blockchain-powered ecosystem for land records and transparent property management.
              </p>
            </div>

            {/* Navigation Column */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Platform</h4>
              <ul className="space-y-4">
                <li><a href="/#home" className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-bold">Home</a></li>
                <li><Link to="/search" className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-bold flex items-center gap-2 justify-center lg:justify-start">Public Registry <ExternalLink size={12} /></Link></li>
                <li><Link to="/register" className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-bold">Citizen Registration</Link></li>
              </ul>
            </div>

            {/* Support Column */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Support</h4>
              <ul className="space-y-4">
                <li><a href="/#features" className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-bold">Key Features</a></li>
                <li><a href="/#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-bold">How it Works</a></li>
                <li>
                  <button 
                    onClick={() => setIsContactOpen(true)}
                    className="p-0 text-gray-600 hover:text-blue-600 transition-colors text-sm font-bold flex items-center gap-2"
                  >
                    <Mail size={14} /> Contact Team
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-16 pt-8 border-t border-gray-50">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
              &copy; {currentYear} BhuChain. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <ContactModal 
        isOpen={isContactOpen} 
        onClose={() => setIsContactOpen(false)} 
      />
    </>
  );
}

export default Footer;

