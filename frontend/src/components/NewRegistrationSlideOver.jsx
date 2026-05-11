import { useEffect, useState } from "react";
import { X, Upload, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createApplication, updateApplication } from "../services/api";
import { convertRopaniToSqm, convertBighaToSqm } from "../utils/conversions";
import { getDistricts, getMunicipalities } from "../data/nepalLocations";
import { toast } from "react-hot-toast";

export default function NewRegistrationSlideOver({
  isOpen,
  onClose,
  onSuccess,
  initialData = null, // New prop for editing
}) {
  const isEdit = !!initialData;
  const [unitSystem, setUnitSystem] = useState("sqm");

  const NEPAL_STATES = [
    "Koshi", "Madhesh", "Bagmati", "Gandaki", "Lumbini", "Karnali", "Sudurpashchim"
  ];

  // 'ropani', 'bigha'
  const [landDetails, setLandDetails] = useState({
    ropani: 0,
    aana: 0,
    paisa: 0,
    daam: 0,
    bigha: 0,
    kattha: 0,
    dhur: 0,
  });

  const [locationDetails, setLocationDetails] = useState({
    state: "",
    district: "",
    municipality: "",
    ward: "",
    address: "",
  });

  const [formData, setFormData] = useState({
    area: "",
    document: null,
    landImage: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, success, error
  const [message, setMessage] = useState("");

  // Populate form if in edit mode
  useEffect(() => {
    if (initialData && isOpen) {
      // Parse location string
      const locParts = initialData.location.split(",").map(s => s.trim());
      const state = locParts[0] || "";
      const district = locParts[1] || "";
      
      const munWard = (locParts[2] || "").split("-");
      const municipality = munWard[0] || "";
      const ward = munWard[1] || "";
      
      const address = locParts.slice(3).join(", ");

      setLocationDetails({ state, district, municipality, ward, address });
      
      setFormData({ 
        area: initialData.area, 
        document: null, 
        landImage: null 
      });
      setUnitSystem("sqm"); 
    } else if (!isOpen) {
      // Reset form when closed
      setFormData({ area: "", document: null, landImage: null });
      setLandDetails({ ropani: 0, aana: 0, paisa: 0, daam: 0, bigha: 0, kattha: 0, dhur: 0 });
      setLocationDetails({ state: "", district: "", municipality: "", ward: "", address: "" });
      setStatus("idle");
    }
  }, [initialData, isOpen]);

  const calculateTotalArea = () => {
    // Force absolute positive values for all calculations
    if (unitSystem === "sqm") return Math.abs(parseFloat(formData.area || 0));
    if (unitSystem === "ropani") {
      const { ropani, aana, paisa, daam } = landDetails;
      return convertRopaniToSqm(
        Math.abs(ropani || 0), 
        Math.abs(aana || 0), 
        Math.abs(paisa || 0), 
        Math.abs(daam || 0)
      ).toFixed(2);
    }
    if (unitSystem === "bigha") {
      const { bigha, kattha, dhur } = landDetails;
      return convertBighaToSqm(
        Math.abs(bigha || 0), 
        Math.abs(kattha || 0), 
        Math.abs(dhur || 0)
      ).toFixed(2);
    }

    return 0;
  };

  const handleLocationChange = (field, value) => {
    // Cascade reset: changing province clears district + municipality
    // Changing district clears municipality
    if (field === 'state') {
      setLocationDetails({ ...locationDetails, state: value, district: '', municipality: '' });
    } else if (field === 'district') {
      setLocationDetails({ ...locationDetails, district: value, municipality: '' });
    } else {
      setLocationDetails({ ...locationDetails, [field]: value });
    }
  };

  const handleFileChange = (e, field) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, [field]: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // In edit mode, files are optional (backend keeps old ones if not provided)
    if (!isEdit && !formData.document) {
      toast.error("Please upload a scanned copy of your land deed.");
      return;
    }

    // Validation: Ensure location is reasonably complete
    if (!locationDetails.state || !locationDetails.district || !locationDetails.municipality || !locationDetails.ward) {
        toast.error("Please complete the location details.");
        return;
    }

    try {
      setIsSubmitting(true);
      setStatus("idle");

      const fullLocation = `${locationDetails.state}, ${locationDetails.district}, ${locationDetails.municipality}-${locationDetails.ward}${locationDetails.address ? ', ' + locationDetails.address : ''}`;

      const submission = new FormData();
      submission.append("location", fullLocation);
      submission.append("area", calculateTotalArea());
      
      if (formData.document) {
        submission.append("document_path", formData.document);
      }
      
      if (formData.landImage) {
        submission.append("land_image", formData.landImage);
      }

      if (isEdit) {
        await updateApplication(initialData.id, submission);
      } else {
        await createApplication(submission);
      }

      setStatus("success");
      setMessage(
        isEdit 
          ? "Your application has been updated and re-submitted for review."
          : "Your application has been submitted successfully. A government officer will verify your deed shortly.",
      );

      setTimeout(() => {
        onSuccess?.();
        onClose();
        setStatus("idle");
      }, 3000);
    } catch (err) {
      console.error("Submission failed:", err);
      setStatus("error");
      setMessage(err.response?.data?.error || "Failed to process application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-60"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ 
              ease: [0.16, 1, 0.3, 1], // Quintic easing for premium feel
              duration: 0.5 
            }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-70 flex flex-col will-change-transform"
            style={{ backfaceVisibility: 'hidden', transform: 'translateZ(0)' }}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-gray-900">
                  {isEdit ? "Modify Application" : "New Registration"}
                </h2>
                <p className="text-sm text-gray-500 font-medium">
                  {isEdit ? "Update and re-submit your registration." : "Apply for a digital land certificate."}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {status === "success" ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="bg-green-100 p-4 rounded-full">
                    <CheckCircle2 size={40} className="text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Application Received!
                  </h3>
                  <p className="text-gray-500 max-w-xs">{message}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  {status === "error" && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                      <AlertCircle
                        className="text-red-500 shrink-0"
                        size={18}
                      />
                      <p className="text-sm text-red-700 font-medium">
                        {message}
                      </p>
                    </div>
                  )}

                   <div className="space-y-6">
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Location
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">State</p>
                          <select
                            required
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={locationDetails.state}
                            onChange={(e) => handleLocationChange('state', e.target.value)}
                          >
                            <option value="">Select State</option>
                            {NEPAL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">District</p>
                          <select
                            required
                            disabled={!locationDetails.state}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                            value={locationDetails.district}
                            onChange={(e) => handleLocationChange('district', e.target.value)}
                          >
                            <option value="">{locationDetails.state ? 'Select District' : 'Select Province first'}</option>
                            {getDistricts(locationDetails.state).map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Municipality / VDC</p>
                          <select
                            required
                            disabled={!locationDetails.district}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                            value={locationDetails.municipality}
                            onChange={(e) => handleLocationChange('municipality', e.target.value)}
                          >
                            <option value="">{locationDetails.district ? 'Select Municipality' : 'Select District first'}</option>
                            {getMunicipalities(locationDetails.state, locationDetails.district).map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Ward</p>
                          <input
                            required
                            type="number"
                            min="1"
                            step="1"
                            placeholder="Ward"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={locationDetails.ward}
                            onChange={(e) => handleLocationChange('ward', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Local Address / Tole (Optional)</p>
                        <input
                          type="text"
                          placeholder="e.g. Main Street, Road-4"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          value={locationDetails.address}
                          onChange={(e) => handleLocationChange('address', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          Area Measurement
                        </label>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                          {["sqm", "ropani", "bigha"].map((sys) => (
                            <button
                              key={sys}
                              type="button"
                              onClick={() => setUnitSystem(sys)}
                              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${unitSystem === sys ? "bg-white text-blue-600 shadow-sm" : "text-gray-400"}`}
                            >
                              {sys.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>

                      {unitSystem === "sqm" && (
                        <input
                          type="number"
                          min="0"
                          step="any"
                          onKeyDown={(e) => (e.key === '-' || e.key === 'e') && e.preventDefault()}
                          placeholder="Total Area in Sq. m."
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          value={formData.area}
                          onChange={(e) =>
                            setFormData({ ...formData, area: e.target.value })
                          }
                        />
                      )}

                      {unitSystem === "ropani" && (
                        <div className="grid grid-cols-4 gap-2">
                          {["ropani", "aana", "paisa", "daam"].map((unit) => (
                            <div key={unit} className="space-y-1">
                              <input
                                type="number"
                                min="0"
                                step="any"
                                onKeyDown={(e) => (e.key === '-' || e.key === 'e') && e.preventDefault()}
                                placeholder={unit[0].toUpperCase()}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 py-3 text-center text-sm"
                                value={landDetails[unit] === 0 ? "" : landDetails[unit]}
                                onChange={(e) =>
                                  setLandDetails({
                                    ...landDetails,
                                    [unit]: e.target.value,
                                  })
                                }
                              />
                              <p className="text-[8px] text-center text-gray-400 font-bold uppercase">
                                {unit}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {unitSystem === "bigha" && (
                        <div className="grid grid-cols-3 gap-2">
                          {["bigha", "kattha", "dhur"].map((unit) => (
                            <div key={unit} className="space-y-1">
                              <input
                                type="number"
                                min="0"
                                step="any"
                                placeholder={unit[0].toUpperCase()}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 py-3 text-center text-sm"
                                value={landDetails[unit] === 0 ? "" : landDetails[unit]}
                                onChange={(e) =>
                                  setLandDetails({
                                    ...landDetails,
                                    [unit]: e.target.value,
                                  })
                                }
                              />
                              <p className="text-[8px] text-center text-gray-400 font-bold uppercase">
                                {unit}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Display the calculated result for clarity */}
                      {unitSystem !== "sqm" && (
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex justify-between items-center">
                          <span className="text-[10px] font-bold text-blue-400 uppercase">
                            Calculated SI Area:
                          </span>
                          <span className="text-xs font-black text-blue-700">
                            {calculateTotalArea()} sq. m.
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Scan of Land Deed (Lalpurja)
                      </label>
                      <div
                        className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${formData.document ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                      >
                        {formData.document ? (
                          <div className="flex flex-col items-center">
                            <CheckCircle2
                              size={32}
                              className="text-blue-600 mb-2"
                            />
                            <p className="text-sm font-bold text-blue-900 truncate max-w-[200px]">
                              {formData.document.name}
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({ ...formData, document: null })
                              }
                              className="mt-2 text-[10px] font-bold text-gray-400 hover:text-red-500 uppercase underline"
                            >
                              Change File
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload size={32} className="text-gray-300 mb-2" />
                            <p className="text-xs font-bold text-gray-400 mb-1">
                              Click to Upload Deed Image
                            </p>
                            <p className="text-[10px] text-gray-300 tracking-tighter uppercase font-mono italic">
                              JPG, PNG (Max 5MB)
                            </p>
                          </>
                        )}
                        <input
                          type="file"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "document")}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Property Photo (Optional)
                      </label>
                      <div
                        className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${formData.landImage ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                      >
                        {formData.landImage ? (
                          <div className="flex flex-col items-center">
                            <CheckCircle2
                              size={32}
                              className="text-blue-600 mb-2"
                            />
                            <p className="text-sm font-bold text-blue-900 truncate max-w-[200px]">
                              {formData.landImage.name}
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({ ...formData, landImage: null })
                              }
                              className="mt-2 text-[10px] font-bold text-gray-400 hover:text-red-500 uppercase underline"
                            >
                              Change File
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload size={32} className="text-gray-300 mb-2" />
                            <p className="text-xs font-bold text-gray-400 mb-1">
                              Click to Upload Land Picture
                            </p>
                            <p className="text-[10px] text-gray-300 tracking-tighter uppercase font-mono italic">
                              JPG, PNG (Max 5MB)
                            </p>
                          </>
                        )}
                        <input
                          type="file"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "landImage")}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      disabled={isSubmitting}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-3"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit for Review"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
