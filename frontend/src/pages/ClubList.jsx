import React, { useState, useEffect } from "react";
import api from "../services/api";

const ClubList = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await api.get("/clubs");
        if (response.data?.success) {
          setClubs(response.data.data);
        } else {
          setError("The directory is currently unavailable. Please try again later.");
        }
      } catch (err) {
        console.error("Discovery error:", err);
        setError("Network connection issue. Unable to fetch club records.");
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center h-full">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-6 text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">
          Synchronizing Directory
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl animate-fadeIn">
      
      {/* Search & Title Hero Section */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 space-y-6 md:space-y-0">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-black text-gray-900 tracking-tight sm:text-6xl">
            Club <span className="text-indigo-600">Explorer.</span>
          </h1>
          <p className="mt-6 text-xl text-gray-500 font-medium leading-relaxed">
            Discover vibrant communities, pursue your interests, and build lifelong connections through our university network.
          </p>
        </div>
        <div className="flex items-center space-x-4 pb-2">
          <div className="px-4 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-widest">
            {clubs.length} Organizations Active
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-8 rounded-3xl shadow-sm text-center">
          <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-red-700 font-black text-lg">{error}</p>
        </div>
      ) : clubs.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-gray-100 shadow-inner">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-50 text-gray-300 rounded-full mb-6">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m4 0h1m-5 10h5m-5-2h5m2-4h2a2 2 0 012 2v10M7 10H5a2 2 0 00-2 2v10" />
            </svg>
          </div>
          <h3 className="text-2xl font-black text-gray-900">The Directory is Quiet.</h3>
          <p className="text-gray-400 mt-2 font-medium">New organizations are on the horizon. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {clubs.map((club) => (
            <div
              key={club._id}
              className="group relative bg-white rounded-[32px] p-1 shadow-sm border border-gray-100 flex flex-col hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 ease-out transform hover:-translate-y-2"
            >
              <div className="h-48 w-full bg-gray-50 rounded-[28px] overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 group-hover:opacity-0 transition-opacity duration-500"></div>
                <div className="absolute top-4 right-4">
                  <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                    club.status === "Active" ? "bg-white text-green-600" : "bg-white text-yellow-600"
                  }`}>
                    {club.status}
                  </span>
                </div>
              </div>
              
              <div className="p-8 flex-grow flex flex-col">
                <div className="flex items-center mb-6">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-lg uppercase tracking-wider">
                    {club.category}
                  </span>
                </div>
                
                <h2 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors duration-300">
                  {club.name}
                </h2>
                
                <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-3 font-medium">
                  {club.description}
                </p>
                
                <div className="mt-auto pt-8 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex -space-x-3 overflow-hidden">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="inline-block h-10 w-10 rounded-full ring-4 ring-white bg-gray-50 flex items-center justify-center border border-gray-100">
                        <span className="text-[10px] font-black text-gray-400">{String.fromCharCode(64 + i)}</span>
                      </div>
                    ))}
                    <div className="inline-block h-10 w-10 rounded-full ring-4 ring-white bg-indigo-600 flex items-center justify-center text-[10px] text-white font-black">
                      +{club.members?.length || 0}
                    </div>
                  </div>
                  
                  <button className="inline-flex items-center px-6 py-3 bg-gray-900 hover:bg-indigo-600 text-white text-[10px] font-black rounded-2xl transition-all shadow-xl hover:shadow-indigo-200 active:scale-95 uppercase tracking-widest">
                    Explore Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClubList;
