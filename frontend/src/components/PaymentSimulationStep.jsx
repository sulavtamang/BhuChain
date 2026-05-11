import { useState } from "react";
import { Banknote, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";

export default function PaymentSimulationStep({ onConfirm, onBack }) {
  const [salePrice, setSalePrice] = useState("");

  const handleConfirm = (e) => {
    e.preventDefault();
    if (!salePrice || isNaN(salePrice) || Number(salePrice) <= 0) {
      toast.error("Please enter a valid sale price.");
      return;
    }
    onConfirm(Number(salePrice));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
        <ShieldCheck className="text-blue-500 shrink-0" size={20} />
        <p className="text-[11px] text-blue-800 font-bold uppercase leading-tight tracking-tight">
          Simulated Payment Agreement. This step records the agreed sale price in the immutable transfer log for auditing purposes. No real funds are transferred.
        </p>
      </div>

      <form onSubmit={handleConfirm} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
            Agreed Sale Price (NPR)
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Banknote size={20} />
            </div>
            <input
              required
              type="number"
              min="0"
              placeholder="e.g. 5000000"
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pl-12 pr-5 py-4 text-lg font-black text-gray-900 focus:border-blue-500 focus:bg-white outline-none transition-all"
              value={salePrice}
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === 'e') e.preventDefault();
              }}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || Number(val) >= 0) {
                  setSalePrice(val);
                }
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            type="button"
            onClick={onBack}
            className="w-full bg-gray-100 text-gray-700 py-4 rounded-2xl font-black text-sm shadow-sm hover:bg-gray-200 transition-all flex items-center justify-center"
          >
            Back
          </button>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-2"
          >
            Agree & Continue <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
