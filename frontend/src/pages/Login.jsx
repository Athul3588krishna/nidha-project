import { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      if (result.user?.role === "admin") {
        navigate("/admin");
      } else if (result.user?.role === "provider") {
        navigate("/provider");
      } else {
        const returnPath = location.state?.from || "/my-appointments";
        navigate(returnPath, { replace: true });
      }
    } else {
      setError(result.message || "Invalid credentials");
    }
  };

  const handleQuickLogin = (fillEmail, fillPassword) => {
    setEmail(fillEmail);
    setPassword(fillPassword);
  };

  return (
     <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-primary-50 flex items-center justify-center">
       <div className="max-w-md w-full bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-primary-100">
         <h2 className="text-3xl font-bold text-slate-900 text-center mb-2">Sign in to your account</h2>
         <p className="text-center text-slate-500 mb-6">
           Or <Link to="/register" state={{ from: location.state?.from }} className="text-primary-600 hover:text-primary-700 font-medium">create a new account</Link>
         </p>

         {/* Demo Account Fill Helpers */}
         <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 mb-6">
           <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 text-center">Quick Demo Logins</div>
           <div className="grid grid-cols-3 gap-1.5 text-xs">
             <button
               type="button"
               onClick={() => handleQuickLogin("patient@gmail.com", "patient123")}
               className="p-1.5 bg-white hover:bg-primary-50 border border-slate-200 rounded-lg text-slate-700 hover:text-primary-700 font-medium transition-colors text-center"
             >
               Patient
             </button>
             <button
               type="button"
               onClick={() => handleQuickLogin("provider@blossom.com", "provider123")}
               className="p-1.5 bg-white hover:bg-primary-50 border border-slate-200 rounded-lg text-slate-700 hover:text-primary-700 font-medium transition-colors text-center"
             >
               Center
             </button>
             <button
               type="button"
               onClick={() => handleQuickLogin("admin@maternityhub.com", "admin123")}
               className="p-1.5 bg-white hover:bg-primary-50 border border-slate-200 rounded-lg text-slate-700 hover:text-primary-700 font-medium transition-colors text-center"
             >
               Admin
             </button>
           </div>
         </div>

         {error && (
           <div className="p-3 mb-5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
             {error}
           </div>
         )}
         
         <form onSubmit={handleSubmit} className="space-y-5">
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
             <input 
               type="email" 
               required 
               value={email} 
               onChange={e => setEmail(e.target.value)} 
               placeholder="Enter your email address"
               className="input-field bg-slate-50" 
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
             <input 
               type="password" 
               required 
               value={password} 
               onChange={e => setPassword(e.target.value)} 
               placeholder="Enter your password"
               className="input-field bg-slate-50" 
             />
           </div>
           <button type="submit" disabled={loading} className="btn-primary w-full h-12 text-lg mt-2">
             {loading ? "Signing in..." : "Sign in"}
           </button>
         </form>
       </div>
     </div>
  );
};

export default Login;
