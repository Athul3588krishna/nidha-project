import { useContext, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Building, Baby, Users, HeartPulse, ArrowRight, ShieldAlert, MapPin, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [featuredCenters, setFeaturedCenters] = useState([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get("/centers");
        const approved = (res.data || []).filter(c => c.status === "Approved");
        // Sort by rating descending, take top 3
        const top3 = approved.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3);
        setFeaturedCenters(top3);
      } catch (err) {
        console.error("Error fetching featured centers:", err);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchInput.trim();
    if (q) {
      navigate(`/centers?search=${encodeURIComponent(q)}`);
    } else {
      navigate("/centers");
    }
  };

  return (
    <div className="min-h-screen pt-16 flex flex-col">
      {/* Hero Section */}
      <section className="relative flex-grow flex items-center justify-center px-4 py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-primary-50 to-white">
        <div className="absolute inset-0 z-0">
           <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
           <div className="absolute top-40 right-10 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {user?.role === "admin" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 max-w-xl mx-auto bg-white/90 backdrop-blur-md border-2 border-primary-200 rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Admin Control Center</div>
                  <div className="text-xs text-slate-500">You are signed in with admin privileges</div>
                </div>
              </div>
              <Link
                to="/admin"
                className="btn-primary py-2.5 px-5 text-sm font-semibold whitespace-nowrap flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center"
              >
                Go to Control Center <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}

          {user?.role === "provider" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 max-w-xl mx-auto bg-white/90 backdrop-blur-md border-2 border-primary-200 rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Maternity Center Portal</div>
                  <div className="text-xs text-slate-500">Manage your center, services & patient bookings</div>
                </div>
              </div>
              <Link
                to="/provider"
                className="btn-primary py-2.5 px-5 text-sm font-semibold whitespace-nowrap flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center"
              >
                Go to Center Portal <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}

          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6 }}
             className="inline-block px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm mb-6"
          >
            Premium Maternity Care Network
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8"
          >
            Find &amp; Book Certified <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">Maternity Centers</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto"
          >
            Discover top-rated maternity centers and postnatal care experts. Built for a seamless and trustworthy experience.
          </motion.p>
          
          {/* Search Box */}
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card p-4 rounded-3xl max-w-2xl mx-auto flex flex-col sm:flex-row gap-4 shadow-lg ring-2 ring-pink-400 ring-offset-2 ring-offset-primary-50"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input 
                type="text" 
                placeholder="Search by city, center name..." 
                className="input-field pl-12 h-14 bg-white/70 border-none"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary h-14 px-8 text-lg w-full sm:w-auto">
              Search
            </button>
          </motion.form>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white/60 border-b border-primary-100 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-primary-100">
             <div>
               <div className="text-4xl font-extrabold text-slate-900 mb-2">120+</div>
               <div className="text-slate-500 font-medium">Maternity Centers</div>
             </div>
             <div>
               <div className="text-4xl font-extrabold text-slate-900 mb-2">15,000+</div>
               <div className="text-slate-500 font-medium">Delivered Babies</div>
             </div>
             <div>
               <div className="text-4xl font-extrabold text-slate-900 mb-2">450+</div>
               <div className="text-slate-500 font-medium">Specialist Doctors</div>
             </div>
             <div>
               <div className="text-4xl font-extrabold text-slate-900 mb-2">99.4%</div>
               <div className="text-slate-500 font-medium">Care Satisfaction</div>
             </div>
           </div>
        </div>
      </section>
      
      {/* Featured Centers Section */}
      <section className="py-20 bg-primary-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Featured Centers</h2>
              <p className="text-slate-600 max-w-2xl">Highly rated birthing facilities equipped with modern infrastructure.</p>
            </div>
            <Link to="/centers" className="text-primary-600 font-medium hover:text-primary-700 flex items-center mt-4 md:mt-0">
              View all centers <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {featuredCenters.length > 0 ? (
              featuredCenters.map((center) => (
                <motion.div
                  key={center._id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl p-6 shadow-md border border-primary-100 flex flex-col justify-between h-full"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="font-bold text-amber-500 text-lg flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        {center.rating?.toFixed(1) || "4.8"}
                      </div>
                      <div className="flex items-center text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md gap-1">
                        <MapPin className="w-3 h-3" />{center.location}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{center.centerName}</h3>
                    <p className="text-slate-500 text-sm mb-6 line-clamp-2">{center.description}</p>
                  </div>
                  <Link to={`/centers/${center._id}`} className="text-primary-600 font-medium hover:text-primary-700 text-sm mt-auto">
                    View full details →
                  </Link>
                </motion.div>
              ))
            ) : (
              // Fallback skeleton cards while loading
              [1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-md border border-primary-100 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
                  <div className="h-6 bg-slate-200 rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-full mb-1"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-6"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Comprehensive Care */}
      <section className="py-20 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Comprehensive Care</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">From early trimester ultrasounds to postnatal care, book individual specialist services instantly through our verified network.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-primary-50 rounded-2xl border border-primary-100 shadow-sm hover:shadow-md transition-shadow">
               <HeartPulse className="w-8 h-8 text-primary-500 mb-4" />
               <h3 className="text-lg font-bold text-slate-900 mb-2">Prenatal Consults</h3>
               <p className="text-slate-600 text-sm">Routine monitoring and genetic screening.</p>
            </div>
            <div className="p-6 bg-primary-50 rounded-2xl border border-primary-100 shadow-sm hover:shadow-md transition-shadow">
               <Building className="w-8 h-8 text-primary-500 mb-4" />
               <h3 className="text-lg font-bold text-slate-900 mb-2">Birthing Suites</h3>
               <p className="text-slate-600 text-sm">Private water birth suites and OB specialists.</p>
            </div>
            <div className="p-6 bg-primary-50 rounded-2xl border border-primary-100 shadow-sm hover:shadow-md transition-shadow">
               <Users className="w-8 h-8 text-primary-500 mb-4" />
               <h3 className="text-lg font-bold text-slate-900 mb-2">Postnatal Care</h3>
               <p className="text-slate-600 text-sm">Lactation nursing and postpartum wellness.</p>
            </div>
            <div className="p-6 bg-primary-50 rounded-2xl border border-primary-100 shadow-sm hover:shadow-md transition-shadow">
               <Baby className="w-8 h-8 text-primary-500 mb-4" />
               <h3 className="text-lg font-bold text-slate-900 mb-2">NICU Services</h3>
               <p className="text-slate-600 text-sm">Level III neonatal intensive care facilities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 relative overflow-hidden">
         <div className="absolute inset-0 bg-primary-700 opacity-50 mix-blend-multiply"></div>
         <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Register Your Center</h2>
            <p className="text-primary-100 text-lg mb-10 max-w-2xl mx-auto">Join the MaternityHub network to showcase your facility and manage patient appointments seamlessly.</p>
            <Link to="/register?role=provider" className="inline-block bg-white text-primary-600 font-bold px-8 py-4 rounded-xl hover:bg-slate-50 transition-colors shadow-lg">
              Create Provider Account
            </Link>
         </div>
      </section>
    </div>
  );
};

export default Home;
