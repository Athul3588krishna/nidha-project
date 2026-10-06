import { useState, useEffect, useContext } from "react";
import { 
  Building, Calendar, Clock, DollarSign, Plus, Trash2, 
  MapPin, Phone, Mail, CheckCircle2, AlertCircle, ShieldAlert, 
  Edit3, Star, Loader2, ArrowRight, User, Stethoscope 
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { StatusBadge } from "../components/StatusBadge";
import { api } from "../services/api";

const ProviderDashboard = () => {
  const { user } = useContext(AuthContext);

  const [center, setCenter] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings"); // "bookings" | "services" | "profile"

  // Service Creation Modal / Form State
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [serviceFormData, setServiceFormData] = useState({
    serviceName: "",
    price: "",
    duration: "60 mins",
    description: ""
  });
  const [submittingService, setSubmittingService] = useState(false);

  // Profile Edit State
  const [profileFormData, setProfileFormData] = useState({
    centerName: "",
    phone: "",
    location: "",
    address: "",
    description: ""
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");

  // Booking Filtering
  const [bookingFilter, setBookingFilter] = useState("All");
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingActionLoading, setBookingActionLoading] = useState(null);

  useEffect(() => {
    fetchProviderData();
  }, []);

  const fetchProviderData = async () => {
    setLoading(true);
    try {
      const [centerRes, bookingsRes] = await Promise.all([
        api.get("/centers/provider/me"),
        api.get("/bookings/provider")
      ]);

      const centerData = centerRes.data;
      setCenter(centerData);
      setServices(centerData.services || []);
      setProfileFormData({
        centerName: centerData.centerName || "",
        phone: centerData.phone || "",
        location: centerData.location || "",
        address: centerData.address || "",
        description: centerData.description || ""
      });

      const normalizedBookings = (bookingsRes.data || []).map(b => ({
        ...b,
        status: b.bookingStatus || b.status,
        bookingStatus: b.bookingStatus || b.status
      }));
      setBookings(normalizedBookings);
    } catch (error) {
      console.error("Error fetching provider data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingStatusUpdate = async (bookingId, newStatus) => {
    setBookingActionLoading(bookingId);
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, bookingStatus: newStatus, status: newStatus } : b));
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update appointment status");
    } finally {
      setBookingActionLoading(null);
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!center?._id) return;

    setSubmittingService(true);
    try {
      const res = await api.post(`/centers/${center._id}/services`, serviceFormData);
      const newService = res.data.service || { ...serviceFormData, _id: Date.now() };
      setServices(prev => [...prev, newService]);
      setShowAddServiceModal(false);
      setServiceFormData({
        serviceName: "",
        price: "",
        duration: "60 mins",
        description: ""
      });
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add service");
    } finally {
      setSubmittingService(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Are you sure you want to remove this service?")) return;
    try {
      await api.delete(`/centers/${center._id}/services/${serviceId}`);
      setServices(prev => prev.filter(s => s._id !== serviceId));
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete service");
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileSuccessMsg("");
    try {
      const res = await api.put(`/centers/${center._id}`, profileFormData);
      setCenter(prev => ({ ...prev, ...res.data }));
      setProfileSuccessMsg("Center profile updated successfully!");
      setTimeout(() => setProfileSuccessMsg(""), 4000);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update center profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
          <span>Loading Maternity Center Portal...</span>
        </div>
      </div>
    );
  }

  if (!center) {
    return (
      <div className="min-h-screen pt-32 pb-12 px-4 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">No Maternity Center Found</h2>
        <p className="text-slate-600 text-sm mb-6">
          There is no registered maternity center linked to your provider account ({user?.email}).
        </p>
      </div>
    );
  }

  const pendingBookings = bookings.filter(b => (b.bookingStatus || b.status) === "Pending");
  const acceptedBookings = bookings.filter(b => (b.bookingStatus || b.status) === "Accepted");

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        
        {/* Verification Status Banner if Pending */}
        {center.status === "Pending" && (
          <div className="mb-8 p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start gap-3 text-amber-900">
            <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm">Application Under Admin Review</div>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                Your maternity center registration is currently <strong>Pending approval</strong> by platform administrators. You can manage your services and review your facility profile now; your center will appear on the public directory once verified.
              </p>
            </div>
          </div>
        )}

        {/* Center Header Profile Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-11 h-11 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{center.centerName}</h1>
                    <StatusBadge status={center.status} />
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Lead: <strong className="text-slate-700">{center.ownerName}</strong> • {center.location}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-600">
              <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                <div className="text-slate-400 font-medium">Official Email</div>
                <div className="font-bold text-slate-800">{center.email}</div>
              </div>
              <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                <div className="text-slate-400 font-medium">Helpline Phone</div>
                <div className="font-bold text-slate-800">+91 {center.phone}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Bookings</div>
            <div className="text-2xl font-extrabold text-slate-900">{bookings.length}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-sm">
            <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">Pending Requests</div>
            <div className="text-2xl font-extrabold text-amber-700">{pendingBookings.length}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Active Services</div>
            <div className="text-2xl font-extrabold text-slate-900">{services.length}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Patient Rating</div>
            <div className="text-2xl font-extrabold text-amber-500 flex items-center gap-1">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span>{center.rating?.toFixed(1) || "4.9"}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mb-8 overflow-x-auto">
          <button 
            onClick={() => setActiveTab("bookings")}
            className={`pb-4 px-6 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'bookings' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Center Bookings ({bookings.length})
          </button>
          <button 
            onClick={() => setActiveTab("services")}
            className={`pb-4 px-6 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'services' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Clinical Services ({services.length})
          </button>
          <button 
            onClick={() => setActiveTab("profile")}
            className={`pb-4 px-6 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'profile' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Center Profile & Details
          </button>
        </div>

        {/* TAB 1: BOOKINGS LIST */}
        {activeTab === "bookings" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Incoming Patient Appointments</h2>
                <p className="text-slate-500 text-xs mt-0.5">Review, accept, and update appointments booked at {center.centerName}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Search patient name, phone, or service..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 w-full sm:w-64"
                />

                <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs">
                  {["All", "Pending", "Accepted", "Rejected", "Completed"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setBookingFilter(st)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${bookingFilter === st ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-4 px-6">Patient</th>
                    <th className="py-4 px-6">Selected Service</th>
                    <th className="py-4 px-6">Appointment Date</th>
                    <th className="py-4 px-6">Price</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {bookings.filter(b => {
                    const statusVal = b.bookingStatus || b.status;
                    const matchesFilter = bookingFilter === "All" || statusVal === bookingFilter;
                    const s = bookingSearch.toLowerCase();
                    const matchesSearch = !bookingSearch ||
                      (b.user?.name || "").toLowerCase().includes(s) ||
                      (b.service?.serviceName || "").toLowerCase().includes(s) ||
                      (b.patientPhone || "").includes(s);
                    return matchesFilter && matchesSearch;
                  }).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-slate-400">
                        <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <div className="font-medium">No appointments matching this criteria</div>
                        <div className="text-xs mt-1">Bookings made by patients will appear here</div>
                      </td>
                    </tr>
                  ) : (
                    bookings.filter(b => {
                      const statusVal = b.bookingStatus || b.status;
                      const matchesFilter = bookingFilter === "All" || statusVal === bookingFilter;
                      const s = bookingSearch.toLowerCase();
                      const matchesSearch = !bookingSearch ||
                        (b.user?.name || "").toLowerCase().includes(s) ||
                        (b.service?.serviceName || "").toLowerCase().includes(s) ||
                        (b.patientPhone || "").includes(s);
                      return matchesFilter && matchesSearch;
                    }).map((b) => (
                      <tr key={b._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900">{b.user?.name || "Patient"}</div>
                          <div className="text-xs text-slate-500">{b.user?.email}</div>
                          {(b.patientPhone || b.user?.phone) && (
                            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded mt-1">
                              <Phone className="w-3 h-3 text-primary-500" /> +91 {b.patientPhone || b.user?.phone}
                            </div>
                          )}
                          {b.notes && (
                            <div className="text-xs text-slate-500 italic mt-1 bg-amber-50/70 p-1.5 rounded border border-amber-100 max-w-xs">
                              "{b.notes}"
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900">{b.service?.serviceName}</div>
                          <div className="text-xs text-slate-400">{b.service?.duration || "Consultation"}</div>
                        </td>
                        <td className="py-4 px-6 text-slate-600 text-xs">
                          {b.bookingDate ? (
                            <div>
                              <div className="font-semibold text-slate-800">{new Date(b.bookingDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
                              <div className="text-slate-400">{new Date(b.bookingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                          ) : "—"}
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-900">
                          ₹{Number(b.service?.price || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={b.bookingStatus || b.status} />
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {(b.bookingStatus || b.status) === 'Pending' && (
                              <>
                                <button
                                  onClick={() => handleBookingStatusUpdate(b._id, 'Accepted')}
                                  disabled={bookingActionLoading === b._id}
                                  className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 transition-colors"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleBookingStatusUpdate(b._id, 'Rejected')}
                                  disabled={bookingActionLoading === b._id}
                                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition-colors"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {(b.bookingStatus || b.status) === 'Accepted' && (
                              <button
                                onClick={() => handleBookingStatusUpdate(b._id, 'Completed')}
                                disabled={bookingActionLoading === b._id}
                                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 transition-colors"
                              >
                                Complete
                              </button>
                            )}

                            {/* Dropdown status changer */}
                            <select
                              value={b.bookingStatus || b.status}
                              onChange={(e) => handleBookingStatusUpdate(b._id, e.target.value)}
                              disabled={bookingActionLoading === b._id}
                              className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 font-medium focus:outline-none"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Accepted">Accepted</option>
                              <option value="Rejected">Rejected</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: SERVICES & PRICING */}
        {activeTab === "services" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Maternity Care Services &amp; Packages</h2>
                <p className="text-xs text-slate-500">List available consultations, delivery packages, and postnatal therapies with pricing</p>
              </div>
              <button 
                onClick={() => setShowAddServiceModal(true)}
                className="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add New Service
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s) => (
                <div key={s._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-primary-300 transition-colors">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-900 text-base">{s.serviceName}</h3>
                      <div className="text-primary-600 font-extrabold text-lg">
                        ₹{Number(s.price).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mb-3">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {s.duration || "Consultation"}
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed mb-6">
                      {s.description || "Specialist maternity consultation and medical care package."}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => handleDeleteService(s._id)}
                      className="text-xs text-rose-500 hover:text-rose-700 font-medium inline-flex items-center gap-1 p-1 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove Service
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CENTER PROFILE */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm max-w-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Maternity Center Details</h2>
            <p className="text-xs text-slate-500 mb-6">Keep your contact information, location, and facilities description up to date.</p>

            {profileSuccessMsg && (
              <div className="p-3.5 mb-5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Center Name</label>
                <input
                  type="text"
                  required
                  value={profileFormData.centerName}
                  onChange={(e) => setProfileFormData(p => ({ ...p, centerName: e.target.value }))}
                  className="input-field bg-slate-50 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">City / Location</label>
                  <input
                    type="text"
                    required
                    value={profileFormData.location}
                    onChange={(e) => setProfileFormData(p => ({ ...p, location: e.target.value }))}
                    className="input-field bg-slate-50 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Helpline Phone</label>
                  <input
                    type="text"
                    required
                    value={profileFormData.phone}
                    onChange={(e) => setProfileFormData(p => ({ ...p, phone: e.target.value }))}
                    className="input-field bg-slate-50 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={profileFormData.address}
                  onChange={(e) => setProfileFormData(p => ({ ...p, address: e.target.value }))}
                  className="input-field bg-slate-50 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Description & Maternity Facilities</label>
                <textarea
                  rows={4}
                  value={profileFormData.description}
                  onChange={(e) => setProfileFormData(p => ({ ...p, description: e.target.value }))}
                  className="input-field bg-slate-50 text-sm resize-none"
                />
              </div>

              <button type="submit" disabled={updatingProfile} className="btn-primary py-3 px-6 text-sm font-bold flex items-center gap-2">
                {updatingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </form>
          </div>
        )}

        {/* Add Service Modal */}
        {showAddServiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-1">Add Clinical Service / Package</h3>
              <p className="text-xs text-slate-500 mb-5">Create a new specialized package for patients to schedule.</p>

              <form onSubmit={handleAddService} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Service Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fetal Echocardiography Scan"
                    value={serviceFormData.serviceName}
                    onChange={(e) => setServiceFormData(p => ({ ...p, serviceName: e.target.value }))}
                    className="input-field text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Fee (₹) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 3500"
                      value={serviceFormData.price}
                      onChange={(e) => setServiceFormData(p => ({ ...p, price: e.target.value }))}
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Duration *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 60 mins"
                      value={serviceFormData.duration}
                      onChange={(e) => setServiceFormData(p => ({ ...p, duration: e.target.value }))}
                      className="input-field text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Details about what is covered in this service..."
                    value={serviceFormData.description}
                    onChange={(e) => setServiceFormData(p => ({ ...p, description: e.target.value }))}
                    className="input-field text-sm resize-none"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowAddServiceModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submittingService}
                    className="btn-primary py-2 px-5 text-xs font-bold"
                  >
                    {submittingService ? "Adding..." : "Add Service"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProviderDashboard;
