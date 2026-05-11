import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  registerWithWallet, 
  checkRegistration, 
  requestOtp, 
  verifyOtp,
  checkOfficerStatus 
} from "../services/api";
import { 
  Shield, User, Mail, CreditCard, ArrowRight, ArrowLeft, 
  Loader2, Phone, Calendar, MapPin, Upload, CheckCircle2,
  Lock, Camera
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { handleApiError } from "../utils/errorUtils";

export default function RegisterPage() {
  const { walletAddress, setToken, setUser, handleWalletLogin } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Info, 2: OTP, 3: Documents
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    dob: "",
    citizenship_no: "",
    citizenship_issue_district: "",
    role: "Citizen",
  });

  const [files, setFiles] = useState({
    profile_picture: null,
    citizenship_front: null,
    citizenship_back: null
  });

  const [previews, setPreviews] = useState({
    profile_picture: null,
    citizenship_front: null,
    citizenship_back: null
  });

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    if (!walletAddress) {
      navigate("/");
      return;
    }

    const checkRegistrationStatus = async () => {
        try {
            const data = await checkRegistration(walletAddress);
            // Allow re-registration if they were rejected
            if (data.is_registered && data.kyc_status === 'Rejected') {
                setIsAlreadyRegistered(false);
            } else {
                setIsAlreadyRegistered(data.is_registered);
                if (data.is_registered) return; // Don't check officer status if already registered
            }

            // Also check if they are whitelisted as an officer
            const authStatus = await checkOfficerStatus(walletAddress);
            if (authStatus.is_authorized) {
              toast.success(`Official Credentials Detected. Redirecting to Government Onboarding...`, { duration: 5000 });
              navigate("/officer/onboarding");
            }
        } catch (err) {
            console.error("Silent verification failed:", err);
            setIsAlreadyRegistered(false);
        }
    };

    checkRegistrationStatus();
  }, [walletAddress, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      const file = selectedFiles[0];
      setFiles(prev => ({ ...prev, [name]: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [name]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRequestOtp = async () => {
    if (!formData.email) {
      setError("Please enter your email address first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await requestOtp(formData.email, walletAddress);
      setOtpSent(true);
      toast.success("OTP sent to your email!");
      setStep(2);
    } catch (err) {
      setError(handleApiError(err, "Failed to send OTP."));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await verifyOtp(formData.email, otp);
      setEmailVerified(true);
      toast.success("Email verified!");
      setStep(3);
    } catch (err) {
      setError(handleApiError(err, "Invalid or expired OTP."));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Final Validation
    if (!files.profile_picture || !files.citizenship_front || !files.citizenship_back) {
      setError("Please upload all required identity documents.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = new FormData();
      // Append all text fields
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      data.append('wallet_address', walletAddress);
      
      // Append files
      data.append('profile_picture', files.profile_picture);
      data.append('citizenship_front', files.citizenship_front);
      data.append('citizenship_back', files.citizenship_back);

      const response = await registerWithWallet(data);
      
      localStorage.setItem("authToken", response.token);
      setToken(response.token);
      
      const newUser = {
          id: response.user_id,
          role: response.role,
          full_name: formData.full_name,
          wallet_address: walletAddress,
          kyc_status: 'Pending'
      };
      
      const now = new Date().getTime();
      localStorage.setItem("user", JSON.stringify(newUser));
      localStorage.setItem("loginTimestamp", now.toString());
      setUser(newUser);

      // Navigate to dashboard
      toast.success("Registration submitted! Welcome to BhuChain.");
      navigate("/dashboard");

    } catch (err) {
      setError(handleApiError(err, "Registration failed. Please check your details."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 pt-32 pb-12">
      {/* Background Orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full -z-10" />

      <div className="w-full max-w-xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-blue-600 p-4 rounded-3xl shadow-xl mb-6 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <Shield className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Government KYC Registry
          </h1>
          <p className="text-gray-500 mt-2 text-center font-medium">
            Register your identity on the BhuChain network.
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-white overflow-hidden">
          {/* Progress Header */}
          <div className="bg-gray-50/50 px-10 py-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Registration Status</span>
              <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5 uppercase tracking-wider">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                Wallet Linked: {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
              </div>
            </div>
            
            {!isAlreadyRegistered && (
              <div className="flex gap-2">
                {[1, 2, 3].map((s) => (
                  <div 
                    key={s} 
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                      step >= s ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="p-10">
            {isAlreadyRegistered ? (
               <div className="text-center py-6">
                  <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-blue-100">
                    <Shield className="h-12 w-12 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 mb-4">Identity Verified</h2>
                  <p className="text-gray-500 mb-10 font-medium leading-relaxed max-w-sm mx-auto">
                    This wallet is already linked to a BhuChain profile. You can proceed to your dashboard.
                  </p>
                  <button
                    onClick={() => handleWalletLogin(navigate)}
                    className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gray-900 px-8 py-5 text-white font-black text-lg shadow-2xl hover:bg-gray-800 transition-all active:scale-[0.98]"
                  >
                    Go to Dashboard
                    <ArrowRight className="h-6 w-6" />
                  </button>
               </div>
            ) : (
              <>
                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-red-50 border-2 border-red-100 p-4 rounded-2xl mb-8 overflow-hidden"
                    >
                      <p className="text-xs text-red-600 font-bold flex items-center gap-2">
                        <Lock size={14} /> {error}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {/* STEP 1: PERSONAL INFO */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                          <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-bold"
                            placeholder="Full Name"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Date of Birth</label>
                        <div className="relative group">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                          <input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-bold"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-bold"
                          placeholder="name@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                        <input
                          type="text"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-bold"
                          placeholder="+977 98XXXXXXXX"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Citizenship No.</label>
                        <div className="relative group">
                          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                          <input
                            type="text"
                            name="citizenship_no"
                            value={formData.citizenship_no}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-bold"
                            placeholder="XX-XX-XX-XXXXX"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Issue District</label>
                        <div className="relative group">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                          <input
                            type="text"
                            name="citizenship_issue_district"
                            value={formData.citizenship_issue_district}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-bold"
                            placeholder="District"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 rounded-2xl bg-blue-600 px-8 py-5 text-white font-black text-lg shadow-xl hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-70 mt-4"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : "Next: Verify Email"}
                      <ArrowRight size={20} />
                    </button>
                  </motion.div>
                )}

                {/* STEP 2: OTP VERIFICATION */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="text-center space-y-8"
                  >
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto border border-blue-100">
                      <Mail className="h-10 w-10 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 mb-2">Check your email</h2>
                      <p className="text-sm text-gray-500 font-medium">
                        We've sent a 6-digit code to <span className="text-blue-600 font-bold">{formData.email}</span>
                      </p>
                    </div>

                    <div className="max-w-xs mx-auto">
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full text-center tracking-[1em] text-3xl font-black py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all"
                        placeholder="000000"
                      />
                    </div>

                    <div className="space-y-4 pt-4">
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={loading || otp.length !== 6}
                        className="w-full flex items-center justify-center gap-3 rounded-2xl bg-blue-600 px-8 py-5 text-white font-black text-lg shadow-xl hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="animate-spin" /> : "Verify & Continue"}
                      </button>
                      
                      <div className="flex items-center justify-between px-2">
                        <button 
                          onClick={() => setStep(1)}
                          className="text-xs font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest flex items-center gap-2"
                        >
                          <ArrowLeft size={14} /> Back
                        </button>
                        <button 
                          onClick={handleRequestOtp}
                          className="text-xs font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest"
                        >
                          Resend Code
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: DOCUMENT UPLOAD */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="space-y-8"
                  >
                    <div className="space-y-6">
                      {/* Profile Photo */}
                      <div className="flex flex-col items-center gap-4">
                         <div className="relative group">
                            <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-400">
                               {previews.profile_picture ? (
                                  <img src={previews.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                               ) : (
                                  <Camera className="h-8 w-8 text-gray-300" />
                               )}
                               <input 
                                  type="file" 
                                  name="profile_picture"
                                  accept="image/*"
                                  onChange={handleFileChange}
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                               />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-blue-600 p-1.5 rounded-full border-4 border-white shadow-lg">
                               <Upload size={12} className="text-white" />
                            </div>
                         </div>
                         <div className="text-center">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Profile Photo</p>
                            <p className="text-[9px] text-gray-500 font-medium">Clear face photo for verification</p>
                         </div>
                      </div>

                      {/* Citizenship Cards */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Citizenship (Front)</label>
                          <div className="relative aspect-3/2 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden group hover:border-blue-400 transition-all">
                             {previews.citizenship_front ? (
                                <img src={previews.citizenship_front} alt="Front" className="w-full h-full object-cover" />
                             ) : (
                                <>
                                  <Upload className="h-6 w-6 text-gray-300 mb-2" />
                                  <span className="text-[9px] font-bold text-gray-400 uppercase">Upload Front</span>
                                </>
                             )}
                             <input 
                                type="file" 
                                name="citizenship_front"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                             />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Citizenship (Back)</label>
                          <div className="relative aspect-3/2 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden group hover:border-blue-400 transition-all">
                             {previews.citizenship_back ? (
                                <img src={previews.citizenship_back} alt="Back" className="w-full h-full object-cover" />
                             ) : (
                                <>
                                  <Upload className="h-6 w-6 text-gray-300 mb-2" />
                                  <span className="text-[9px] font-bold text-gray-400 uppercase">Upload Back</span>
                                </>
                             )}
                             <input 
                                type="file" 
                                name="citizenship_back"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                             />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
                       <Shield className="text-amber-500 shrink-0" size={20} />
                       <p className="text-[10px] text-amber-800 font-bold leading-relaxed">
                          Your documents are stored securely and will only be used for identity verification by authorized government officers.
                       </p>
                    </div>

                    <div className="pt-4 flex flex-col gap-4">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading || !files.profile_picture || !files.citizenship_front || !files.citizenship_back}
                        className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gray-900 px-8 py-5 text-white font-black text-lg shadow-xl hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="animate-spin" /> : "Submit KYC Application"}
                        <CheckCircle2 size={20} />
                      </button>
                      <button 
                        onClick={() => setStep(1)}
                        className="text-xs font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest mx-auto"
                      >
                        Start Over
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
        
        <p className="text-center mt-8 text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
           BhuChain Security Protocol v2.0
        </p>
      </div>
    </div>
  );
}
