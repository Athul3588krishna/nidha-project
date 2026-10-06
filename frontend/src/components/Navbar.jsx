import { Link } from "react-router-dom";
import { HeartPulse, Menu, User, ShieldAlert, Calendar, Building } from "lucide-react";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 glass-card bg-white/80 border-b border-white/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <HeartPulse className="h-8 w-8 text-primary-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              MaternityHub
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-slate-600 hover:text-primary-500 font-medium transition-colors">Home</Link>
            <Link to="/centers" className="text-slate-600 hover:text-primary-500 font-medium transition-colors">Centers</Link>

            <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
              {user ? (
                <div className="flex items-center gap-4">
                  {user.role === 'admin' ? (
                    <Link
                      to="/admin"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 text-primary-700 font-bold text-xs border border-primary-200 hover:bg-primary-100 transition-all shadow-sm"
                    >
                      <ShieldAlert className="w-4 h-4 text-primary-500" />
                      Control Center
                    </Link>
                  ) : user.role === 'provider' ? (
                    <Link
                      to="/provider"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 text-primary-700 font-bold text-xs border border-primary-200 hover:bg-primary-100 transition-all shadow-sm"
                    >
                      <Building className="w-4 h-4 text-primary-500" />
                      Center Portal
                    </Link>
                  ) : (
                    <Link
                      to="/my-appointments"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 text-primary-700 font-bold text-xs border border-primary-200 hover:bg-primary-100 transition-all shadow-sm"
                    >
                      <Calendar className="w-4 h-4 text-primary-500" />
                      My Appointments
                    </Link>
                  )}
                  <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                    <User className="w-5 h-5 text-primary-500" />
                    <span>{user.name}</span>
                  </div>
                  <button onClick={logout} className="btn-secondary text-sm">Logout</button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login" className="text-slate-600 font-medium hover:text-primary-500">Sign in</Link>
                  <Link to="/register" className="btn-primary">Register</Link>
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600 hover:text-primary-500 transition-colors p-2">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 py-4 px-4 shadow-lg absolute w-full left-0 top-full">
            <div className="flex flex-col space-y-4">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-600 font-medium">Home</Link>
              <Link to="/centers" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-600 font-medium">Centers</Link>
              <hr className="border-slate-100" />
              {user ? (
                <>
                  {user.role === 'admin' ? (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-50 text-primary-700 font-bold text-sm border border-primary-200"
                    >
                      <ShieldAlert className="w-4 h-4 text-primary-500" />
                      Admin Control Center
                    </Link>
                  ) : user.role === 'provider' ? (
                    <Link
                      to="/provider"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-50 text-primary-700 font-bold text-sm border border-primary-200"
                    >
                      <Building className="w-4 h-4 text-primary-500" />
                      Maternity Center Portal
                    </Link>
                  ) : (
                    <Link
                      to="/my-appointments"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-50 text-primary-700 font-bold text-sm border border-primary-200"
                    >
                      <Calendar className="w-4 h-4 text-primary-500" />
                      My Appointments
                    </Link>
                  )}
                  <div className="text-slate-700 font-medium flex items-center gap-2">
                    <User className="w-5 h-5 text-primary-500" /> {user.name}
                  </div>
                  <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="btn-secondary w-full text-center">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-600 font-medium">Sign in</Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="btn-primary w-full text-center">Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
