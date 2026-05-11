import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, CheckCircle, Send, ShieldAlert, Key } from "lucide-react";

export default function HelpGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-100 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 lg:p-8"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-full"
        >
          {/* Header */}
          <div className="bg-linear-to-r from-blue-600 to-indigo-700 p-6 sm:p-8 text-white relative shrink-0">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-black mb-2">BhuChain Property Guide</h2>
            <p className="text-blue-100 text-sm font-medium">Learn how to register, manage, and transfer your digital Lalpurja.</p>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1">
            
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">1. Apply for Registration</h3>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    Start by clicking "New Application". Fill in the property details (Area, Location) and upload clear photos of the physical land and your paper Lalpurja document. 
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="bg-amber-100 text-amber-600 w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">2. Officer Verification</h3>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    A government officer will review your documents. If correct, they will approve it and "Mint" your land property onto the blockchain, giving it a unique, permanent <strong>Parcel ID</strong>.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="bg-emerald-100 text-emerald-600 w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <Send size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">3. Digital Transfer</h3>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    From "My Lalpurjas", click "Transfer" on any approved parcel. You will need the receiving citizen's <strong>MetaMask Wallet Address</strong> to perform a secure ownership transfer over the Ethereum network.
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Warnings / Security */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-3">
              <h4 className="font-bold text-gray-800 flex items-center gap-2">
                <ShieldAlert size={18} className="text-gray-500" /> Security Tips
              </h4>
              <ul className="text-xs text-gray-600 space-y-2 list-disc list-inside">
                <li><strong className="text-gray-800">Never share your Private Keys or Seed Phrase</strong> with anyone, including Government Officers.</li>
                <li>Ensure you are transferring to the exact wallet address of the recipient. Blockchain transfers are irreversible.</li>
                <li>Make sure MetaMask is connected to the right network (BhuChain Local / Sepolia) before approving transactions.</li>
              </ul>
            </div>

          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 flex justify-end shrink-0">
            <button 
              onClick={onClose}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl font-bold transition-all"
            >
              Got it
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
