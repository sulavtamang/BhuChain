import { useState } from "react";
import { Menu, X, Shield } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#1E3A8A] text-white shadow-lg">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <Shield className="h-8 w-8" />
          <div>
            <div className="text-lg font-bold leading-tight tracking-tight">
              BhuChain
            </div>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden items-center gap-6 md:flex">
          {["Home", "Verify", "Register", "About"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm font-medium text-white/80 transition-colors hover:text-white"
            >
              {item}
            </a>
          ))}
          <button className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#1E3A8A] transition-colors hover:bg-white/90">
            Connect Wallet
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-t border-white/10 px-4 pb-4 md:hidden">
          {["Home", "Verify", "Register", "About"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="block py-2 text-sm text-white/80 hover:text-white"
            >
              {item}
            </a>
          ))}
          <button className="mt-2 w-full rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#1E3A8A]">
            Connect Wallet
          </button>
        </div>
      )}
    </header>
  );
}