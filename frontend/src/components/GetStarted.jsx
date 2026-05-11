import { Lock, Zap, Smartphone } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function GetStarted() {
  const { handleWalletLogin } = useAuth();
  const navigate = useNavigate();
  return (
    <section id="contact" className="py-20 sm:py-28 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#111827] px-6 py-16 sm:px-12 sm:py-20 lg:flex lg:items-center lg:justify-between lg:px-20">
          
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[#1e40ef]/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#1e40ef]/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xl lg:max-w-2xl text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl text-balance">
              Ready to Secure Your Property?
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-300 text-balance">
              Join thousands of Nepali citizens protecting their land ownership on the
              blockchain. Link your citizenship and stage your deeds off-chain today.
            </p>
          </div>

          <div className="relative z-10 mt-10 w-full max-w-md lg:mt-0 lg:max-w-md mx-auto lg:mx-0 lg:ml-8 flex flex-col">
            <button
              onClick={() => handleWalletLogin(navigate)}
              className="w-full rounded-xl bg-[#1e40ef] px-8 py-5 text-base font-semibold text-white shadow-lg hover:bg-blue-600 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#1e40ef] transition-all hover:-translate-y-1"
            >
              Connect MetaMask Wallet
            </button>

            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Lock className="h-5 w-5 text-[#10b981]" strokeWidth={2.5} />
                <span>Passwordless Login</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Zap className="h-5 w-5 text-[#eab308]" fill="currentColor" strokeWidth={0} />
                <span>Instant KYC Link</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default GetStarted
