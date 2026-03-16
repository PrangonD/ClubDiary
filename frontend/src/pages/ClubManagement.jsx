import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

const ClubManagement = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Other",
    status: "Active",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (user?.role !== "System Admin") {
      setError("Unauthorized. Access restricted to System Administrators.");
      setLoading(false);
      return;
    }

    try {
      await api.post("/clubs", formData);
      setSuccess("Organization established successfully. Initializing directory...");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.error || "Protocol error: Identification failure during creation."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-start justify-center py-12 px-6 lg:px-8 animate-fadeIn">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Side: The Form */}
        <div className="lg:col-span-7 space-y-8 bg-white p-10 rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 flex flex-col h-fit">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                Club <span className="text-indigo-600">Identity.</span>
              </h1>
              <p className="mt-2 text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                Administrator Console / Initialize New Record
              </p>
            </div>
            <button 
              onClick={() => navigate("/")}
              className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 hover:text-gray-600 transition-all active:scale-95"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-2xl flex items-center animate-shake">
                <p className="text-red-700 font-bold text-sm tracking-wide uppercase italic">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-indigo-50 border-l-4 border-indigo-600 p-5 rounded-2xl flex items-center animate-fadeIn">
                <p className="text-indigo-700 font-bold text-sm tracking-wide uppercase italic">{success}</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 transition-colors group-focus-within:text-indigo-600">
                    Official Designation
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="block w-full px-6 py-4 bg-gray-50 border-0 rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-indigo-600 transition-all placeholder-gray-300"
                    placeholder="Enter organization title..."
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="group">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 transition-colors group-focus-within:text-indigo-600">
                    Silo Category
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      className="block w-full px-6 py-4 bg-gray-50 border-0 rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-indigo-600 transition-all appearance-none cursor-pointer"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="Academic">Academic / Research</option>
                      <option value="Sports">Competitive Sports</option>
                      <option value="Cultural">Cultural Heritage</option>
                      <option value="Technology">Tech & Innovation</option>
                      <option value="Other">Miscellaneous</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-6 text-gray-400">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="group">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ">
                    Alpha status
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["Active", "Pending", "Inactive"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData({ ...formData, status: s })}
                        className={`py-4 rounded-2xl text-[10px] font-black transition-all border-2 ${
                          formData.status === s
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100"
                            : "bg-white text-gray-400 border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="group h-full">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 transition-colors group-focus-within:text-indigo-600">
                Mission Statement & Manifesto
              </label>
              <textarea
                name="description"
                required
                rows="6"
                className="block w-full px-6 py-4 bg-gray-50 border-0 rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-indigo-600 transition-all placeholder-gray-300 resize-none h-[180px]"
                placeholder="Describe the purpose, frequency of meetings, and core values..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex-1 py-5 px-8 border-2 border-gray-100 rounded-3xl text-sm font-black text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all active:scale-[0.98] uppercase tracking-widest"
              >
                Abort
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] py-5 px-8 rounded-3xl shadow-2xl shadow-indigo-200 text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 transition-all transform active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Establish Protocol"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Live Preview */}
        <div className="lg:col-span-5 h-fit sticky top-12">
          <div className="mb-8">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Live Visual Distribution</h3>
            <p className="text-gray-400 text-[10px] font-bold mt-1">Real-time render of the discovery card profile.</p>
          </div>
          
          <div className="group relative bg-white rounded-[40px] p-2 shadow-2xl shadow-gray-200/50 border border-gray-100 flex flex-col transition-all duration-700 ease-out">
            <div className="h-56 w-full bg-gray-50 rounded-[34px] overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20"></div>
              <div className="absolute top-6 right-6">
                <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-gray-200/20 bg-white ${
                  formData.status === "Active" ? "text-green-600" : "text-yellow-600"
                }`}>
                  {formData.status}
                </span>
              </div>
            </div>
            
            <div className="p-10 flex-grow flex flex-col">
              <div className="flex items-center mb-8">
                <span className="px-4 py-2 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-xl uppercase tracking-widest">
                  {formData.category}
                </span>
              </div>
              
              <h2 className={`text-3xl font-black text-gray-900 mb-4 transition-all ${!formData.name && "text-gray-200 italic font-medium"}`}>
                {formData.name || "Awaiting Title..."}
              </h2>
              
              <p className={`text-gray-400 text-sm leading-relaxed mb-10 font-bold ${!formData.description && "text-gray-200 font-medium"}`}>
                {formData.description || "The manifesto for this organization will be localized here once the uplink is established."}
              </p>
              
              <div className="mt-auto pt-10 border-t border-gray-50 flex items-center justify-between">
                <div className="flex -space-x-4 overflow-hidden">
                  {[1, 2].map((i) => (
                    <div key={i} className="inline-block h-12 w-12 rounded-full ring-4 ring-white bg-gray-100 border border-gray-200 flex items-center justify-center">
                      <span className="text-[10px] font-black text-gray-300">?</span>
                    </div>
                  ))}
                  <div className="inline-block h-12 w-12 rounded-full ring-4 ring-white bg-indigo-600 text-white flex items-center justify-center font-black text-[10px]">
                    +0
                  </div>
                </div>
                
                <div className="px-6 py-3 bg-gray-900 text-white text-[10px] font-black rounded-2xl uppercase tracking-widest opacity-50">
                  Profile Locked
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 p-8 bg-indigo-600 rounded-[32px] text-white shadow-2xl shadow-indigo-200 animate-fadeIn">
            <h4 className="text-xs font-black uppercase tracking-widest mb-4">Uplink Notice</h4>
            <p className="text-[10px] font-bold text-indigo-100 leading-relaxed opacity-80">
              Upon establishment, the organization will be immediately broadcasted to the Explorer Directory. Role-Based Access Control will automatically govern membership permissions based on the defined visibility status.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClubManagement;
