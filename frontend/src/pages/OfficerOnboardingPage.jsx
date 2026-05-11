import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { checkOfficerStatus, activateOfficerRole } from "../services/api";
import { getSigner } from "../services/blockchain";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../components/Logo";
import { 
  ShieldCheck, 
  PenTool, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Gavel,
  History,
  FileText
} from "lucide-react";

//OfficerOnboardingPage - The "Production-Grade" enrollment portal for government personnel.
//Restricted to pre-authorized wallet addresses only.
//Cryptographic signature of a formal "Officer's Oath".
//Visual feedback on government-registry status.
export default function OfficerOnboardingPage() {
  const { walletAddress, setUser, setToken } = useAuth();
  const navigate = useNavigate();
  
  const [authData, setAuthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: Introduction, 2: Oath & Signature

  useEffect(() => {
    if (!walletAddress) {
      navigate("/");
      return;
    }
    verifyAuthorization();
  }, [walletAddress]);

  const verifyAuthorization = async () => {
    try {
      setLoading(true);
      const data = await checkOfficerStatus(walletAddress);
      if (!data.is_authorized) {
        // If not authorized, they shouldn't be here
        navigate("/");
        return;
      }
      setAuthData(data);
    } catch (err) {
      console.error("Auth check failed:", err);
      setError("Unable to verify authorization status. Please contact the IT department.");
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    try {
      setActivating(true);
      setError("");

      const signer = await getSigner();
      const message = [
        "BHUCHAIN GOVERNMENT REGISTRY: OFFICIAL OATH OF CONDUCT",
        "",
        `I, ${authData.full_name}, solemnly swear to uphold the integrity of the land registry.`,
        "I acknowledge that my actions as a Land Revenue Officer are recorded on the blockchain",
        "and are legally binding under the National Land Act.",
        "",
        `Wallet: ${walletAddress}`,
        `Email: ${authData.email}`,
        `Date: ${new Date().toLocaleDateString()}`,
        `Challenge: ${Math.random().toString(36).substring(7)}`
      ].join("\n");

      const signature = await signer.signMessage(message);
      
      const response = await activateOfficerRole(walletAddress, signature, message);
      
      // Update local auth state
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("user", JSON.stringify({
        wallet_address: walletAddress,
        role: 'Officer',
        full_name: authData.full_name,
        email: authData.email
      }));
      
      setToken(response.token);
      setUser({
        wallet_address: walletAddress,
        role: 'Officer',
        full_name: authData.full_name,
        email: authData.email
      });

      setStep(3); // Success step
      
      // Delay redirect to show success state
      setTimeout(() => {
        navigate("/officer");
      }, 3000);

    } catch (err) {
      console.error("Activation failed:", err);
      setError(err.response?.data?.error || "Signature verification failed. Activation cancelled.");
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Validating Government Credentials...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-700 via-indigo-600 to-blue-500" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl -ml-48 -mb-48" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl shadow-blue-900/10 border border-blue-50 overflow-hidden relative z-10"
      >
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-10 md:p-16 space-y-10"
            >
              <div className="flex items-center gap-4 text-blue-600">
                <ShieldCheck size={48} className="drop-shadow-lg" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Verified Credentials</p>
                  <h1 className="text-2xl font-black text-gray-900">Administrative Access Detected</h1>
                </div>
              </div>

              <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-blue-100">
                    <History className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 leading-tight">Registry Authorization Found</h3>
                    <p className="text-xs text-gray-500 font-medium">BhuChain Protocol Management System</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-100/50">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Personnel</p>
                    <p className="text-sm font-bold text-gray-800">{authData?.full_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Administrative ID</p>
                    <p className="text-sm font-bold text-gray-800">{authData?.employee_id || "PENDING-ASSIGNMENT"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-black text-gray-900">BhuChain Administrative Onboarding</h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  Your wallet address has been whitelisted as a Protocol Officer. 
                  To activate your administrative privileges and access the Management Dashboard, 
                  you must finalize the enrollment by signing your cryptographic oath.
                </p>
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-blue-100 transition-all hover:scale-[1.02] group"
              >
                Proceed to Activation
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-10 md:p-16 space-y-8"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <PenTool size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Step 2: Protocol Activation</span>
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Administrative Oath</h1>
              </div>

              <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 relative max-h-64 overflow-y-auto scrollbar-hide">
                <div className="absolute top-4 right-4 text-blue-100">
                  <Gavel size={64} />
                </div>
                <div className="space-y-6 text-sm text-gray-600 font-medium leading-relaxed relative z-10">
                  <p>
                    I, <span className="text-gray-900 font-bold underline decoration-blue-200 decoration-4 underline-offset-4">{authData?.full_name}</span>, 
                    hereby accept my appointment as a Protocol Officer within the BhuChain Digital Ecosystem.
                  </p>
                  <p>
                    I understand that my cryptographic signature serves as my legally binding seal. 
                    I commit to performing my duties with impartiality, transparency, and strict adherence 
                    to the BhuChain Governance Framework.
                  </p>
                  <p>
                    I acknowledge that every action or registry modification I perform will be 
                    permanently recorded on the blockchain and subject to immutable audit by the 
                    Management Authority.
                  </p>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600"
                >
                  <AlertCircle size={20} />
                  <p className="text-sm font-bold">{error}</p>
                </motion.div>
              )}

              <div className="flex flex-col gap-4 pt-4">
                <button 
                  onClick={handleActivate}
                  disabled={activating}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-blue-100 transition-all group"
                >
                  {activating ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Authenticating Signature...
                    </>
                  ) : (
                    <>
                      Sign and Activate Credentials
                      <PenTool size={20} />
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setStep(1)}
                  disabled={activating}
                  className="text-gray-400 hover:text-gray-600 text-[10px] font-black uppercase tracking-widest py-2"
                >
                  Back to Details
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-16 text-center space-y-8"
            >
              <div className="relative inline-block">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12, stiffness: 100 }}
                  className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center border-2 border-emerald-100 mx-auto shadow-2xl shadow-emerald-500/10"
                >
                  <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                </motion.div>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-blue-600 rounded-full border-4 border-white flex items-center justify-center shadow-lg animate-bounce">
                  <ShieldCheck size={20} className="text-white" />
                </div>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Credentials Activated</h1>
                <p className="text-gray-500 font-medium">Welcome to the BhuChain Registry Command Center.</p>
              </div>

              <div className="pt-4">
                <div className="flex items-center justify-center gap-2 text-blue-600 font-bold text-sm">
                  <Loader2 size={16} className="animate-spin" />
                  Redirecting to Officer Dashboard...
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer Branding */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex items-center gap-3 opacity-60 z-10"
      >
         <img src="/logo.svg" alt="BhuChain" className="h-6" />
         <div className="h-4 w-px bg-gray-400" />
         <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">BhuChain Administrative Portal</p>
      </motion.div>
    </div>
  );
}
