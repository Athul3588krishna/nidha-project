import { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Building, User, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setAuthSession } = useContext(AuthContext);

  const queryParams = new URLSearchParams(location.search);
  const initialRole = queryParams.get("role") === "provider" ? "provider" : "user";
  const [activeTab, setActiveTab] = useState(initialRole);

  // User (Patient) Form State
  const [userForm, setUserForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: ""
  });

  // Provider (Maternity Center) Form State
  const [providerForm, setProviderForm] = useState({
    centerName: "",
    ownerName: "",
    email: "",
    phone: "",
    location: "",
    address: "",
    description: "",
    password: ""
  });

  const [phoneError, setPhoneError] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (queryParams.get("role") === "provider") {
      setActiveTab("provider");
    }
  }, [location.search]);

  // Handle User Input Changes
  const handleUserChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const clean = value.replace(/\D/g, '').slice(0, 10);
      setUserForm(prev => ({ ...prev, phone: clean }));
      setPhoneError(clean && clean.length !== 10 ? "Phone number must be exactly 10 digits" : "");
    } else {
      setUserForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle Provider Input Changes
  const handleProviderChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const clean = value.replace(/\D/g, '').slice(0, 10);
      setProviderForm(prev => ({ ...prev, phone: clean }));
      setPhoneError(clean && clean.length !== 10 ? "Phone number must be exactly 10 digits" : "");
    } else {
      setProviderForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle Patient Registration Submit
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    const cleanPhone = userForm.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setPhoneError("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        name: userForm.name.trim(),
        email: userForm.email.toLowerCase().trim(),
        password: userForm.password,
        phone: cleanPhone,
        role: "user"
      });

      if (setAuthSession && res.data?.token) {
        setAuthSession(res.data);
        navigate("/my-appointments");
      } else {
        alert("Account created successfully! Please sign in.");
        navigate("/login");
      }
    } catch (error) {
      setFormError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle Provider / Center Registration Submit
  const handleProviderSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    const cleanPhone = providerForm.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setPhoneError("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/register-center", {
        ...providerForm,
        phone: cleanPhone,
        email: providerForm.email.toLowerCase().trim()
      });

      if (setAuthSession && res.data?.token) {
        setAuthSession(res.data);
        navigate("/provider");
      } else {
        alert("Maternity center registered successfully! Please sign in.");
        navigate("/login");
      }
    } catch (error) {
      setFormError(error.response?.data?.message || "Maternity center registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-primary-50 flex items-center justify-center">
      <div className={`w-full ${activeTab === 'provider' ? 'max-w-2xl' : 'max-w-md'} bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-primary-100 transition-all duration-300`}>
        
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Create an account</h2>
          <p className="text-slate-500 text-sm">
            Already have an account? <Link to="/login" state={{ from: location.state?.from }} className="text-primary-600 hover:text-primary-700 font-semibold">Sign in</Link>
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => { setActiveTab("user"); setFormError(""); }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'user' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <User className="w-4 h-4" /> Patient / Parent
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("provider"); setFormError(""); }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'provider' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Building className="w-4 h-4" /> Maternity Center
          </button>
        </div>

        {formError && (
          <div className="p-3.5 mb-5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{formError}</span>
          </div>
        )}

        {/* PATIENT REGISTRATION FORM */}
        {activeTab === "user" ? (
          <form onSubmit={handleUserSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
              <input
                name="name"
                onChange={handleUserChange}
                type="text"
                required
                placeholder="e.g. Emily Watson"
                value={userForm.name}
                className="input-field bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Phone Number (10 Digits)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">+91</span>
                <input
                  name="phone"
                  onChange={handleUserChange}
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="9876543210"
                  value={userForm.phone}
                  className={`input-field pl-12 bg-slate-50 ${phoneError ? 'border-rose-400 focus:border-rose-500' : ''}`}
                />
              </div>
              {phoneError && (
                <p className="text-xs text-rose-500 mt-1">{phoneError}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
              <input
                name="email"
                onChange={handleUserChange}
                type="email"
                required
                placeholder="patient@gmail.com"
                value={userForm.email}
                className="input-field bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Password (Min 6 Characters)</label>
              <input
                name="password"
                onChange={handleUserChange}
                type="password"
                required
                placeholder="Create a password"
                value={userForm.password}
                className="input-field bg-slate-50"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full h-12 text-base font-bold mt-4 shadow-sm">
              {loading ? "Creating Account..." : "Create Patient Account"}
            </button>
          </form>
        ) : (
          /* MATERNITY CENTER / PROVIDER REGISTRATION FORM */
          <form onSubmit={handleProviderSubmit} className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-xs text-amber-800 flex items-start gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                New maternity centers are registered with a <strong>Pending</strong> status and undergo quick platform verification before appearing publicly.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Center / Hospital Name *</label>
                <input
                  name="centerName"
                  onChange={handleProviderChange}
                  type="text"
                  required
                  placeholder="e.g. Blossom Maternity Care"
                  value={providerForm.centerName}
                  className="input-field bg-slate-50 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Owner / Chief Doctor Name *</label>
                <input
                  name="ownerName"
                  onChange={handleProviderChange}
                  type="text"
                  required
                  placeholder="e.g. Dr. Sarah Jenkins"
                  value={providerForm.ownerName}
                  className="input-field bg-slate-50 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Official Provider Email *</label>
                <input
                  name="email"
                  onChange={handleProviderChange}
                  type="email"
                  required
                  placeholder="provider@blossom.com"
                  value={providerForm.email}
                  className="input-field bg-slate-50 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Official Contact Phone *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">+91</span>
                  <input
                    name="phone"
                    onChange={handleProviderChange}
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={providerForm.phone}
                    className={`input-field pl-12 bg-slate-50 text-sm ${phoneError ? 'border-rose-400 focus:border-rose-500' : ''}`}
                  />
                </div>
                {phoneError && (
                  <p className="text-xs text-rose-500 mt-1">{phoneError}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">City / Region *</label>
                <input
                  name="location"
                  onChange={handleProviderChange}
                  type="text"
                  required
                  placeholder="e.g. Kochi, Kerala or San Francisco, CA"
                  value={providerForm.location}
                  className="input-field bg-slate-50 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Password *</label>
                <input
                  name="password"
                  onChange={handleProviderChange}
                  type="password"
                  required
                  placeholder="Create provider password (min 6 chars)"
                  value={providerForm.password}
                  className="input-field bg-slate-50 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Street Address *</label>
              <input
                name="address"
                onChange={handleProviderChange}
                type="text"
                required
                placeholder="e.g. 450 Healthcare Ave, Suite 200"
                value={providerForm.address}
                className="input-field bg-slate-50 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Description & Maternity Facilities</label>
              <textarea
                name="description"
                rows={3}
                onChange={handleProviderChange}
                placeholder="Describe facilities, birthing suites, 24/7 OB/GYN specialists, water birth tubs, NICU level, etc."
                value={providerForm.description}
                className="input-field bg-slate-50 text-sm resize-none"
              ></textarea>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full h-12 text-base font-bold mt-4 shadow-sm flex items-center justify-center gap-2">
              <Building className="w-5 h-5" />
              {loading ? "Registering Center..." : "Register Maternity Center"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
