import React, { useState, useEffect } from "react";
import { X, User, Mail, CreditCard, Phone, Calendar, MapPin, Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { submitKYCUpdate } from "../services/api";

export default function KYCUpdateModal({ isOpen, onClose, user, onUpdateSubmitted }) {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    citizenship_no: "",
    phone_number: "",
    dob: "",
    citizenship_issue_district: "",
  });

  const [files, setFiles] = useState({
    profile_picture: null,
    citizenship_front: null,
    citizenship_back: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        citizenship_no: user.citizenship_no || "",
        phone_number: user.phone_number || "",
        dob: user.dob || "",
        citizenship_issue_district: user.citizenship_issue_district || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      Object.keys(files).forEach(key => {
        if (files[key]) data.append(key, files[key]);
      });

      await submitKYCUpdate(data);
      setSuccess(true);
      if (onUpdateSubmitted) onUpdateSubmitted();
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit update request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Request Profile Update</h2>
            <p className="text-sm font-bold text-gray-400">Propose changes to your verified legal identity.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {success ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-100">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Request Submitted!</h3>
              <p className="text-gray-500 font-medium">An officer will review your request shortly. You'll be notified once approved.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-700 text-sm font-bold">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <User size={12} /> Full Legal Name
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-800 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Mail size={12} /> Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-800 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                    placeholder="example@email.com"
                    required
                  />
                </div>

                {/* Citizenship */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <CreditCard size={12} /> Citizenship Number
                  </label>
                  <input
                    type="text"
                    name="citizenship_no"
                    value={formData.citizenship_no}
                    onChange={handleChange}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-800 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                    placeholder="ID Number"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Phone size={12} /> Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-800 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                    placeholder="+977"
                  />
                </div>

                {/* DOB */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar size={12} /> Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-800 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                  />
                </div>

                {/* District */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <MapPin size={12} /> Issue District
                  </label>
                  <input
                    type="text"
                    name="citizenship_issue_district"
                    value={formData.citizenship_issue_district}
                    onChange={handleChange}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-800 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                    placeholder="e.g. Kathmandu"
                  />
                </div>
              </div>

              {/* File Uploads */}
              <div className="space-y-4">
                <h4 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-2">Updated Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: "Profile Picture", name: "profile_picture" },
                    { label: "Citizenship Front", name: "citizenship_front" },
                    { label: "Citizenship Back", name: "citizenship_back" },
                  ].map((file) => (
                    <div key={file.name} className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{file.label}</label>
                      <label className="flex flex-col items-center justify-center w-full h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className={`h-6 w-6 mb-2 ${files[file.name] ? "text-emerald-500" : "text-gray-400 group-hover:text-blue-500"}`} />
                          <p className="text-[10px] font-bold text-gray-500 text-center px-2 truncate w-full">
                            {files[file.name] ? files[file.name].name : "Upload New"}
                          </p>
                        </div>
                        <input type="file" name={file.name} className="hidden" onChange={handleFileChange} accept="image/*" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-3xl font-black text-lg shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Submitting Request...
                  </>
                ) : (
                  "Submit Amendment Request"
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
