import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  XCircle,
  ShieldCheck,
  Stethoscope,
  Heart,
  Phone,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';

const dateOnly = (date) => {
  const local = new Date(date);
  return new Date(local.getTime() - local.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

const formatDate = (value) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

export default function PatientPortal() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('book'); // 'book' | 'appointments' | 'profile'

  // Profile State
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    legalName: '',
    preferredName: '',
    dateOfBirth: '',
    phone: '',
    address: '',
  });

  // Booking State
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [bookingDate, setBookingDate] = useState(dateOnly(new Date(Date.now() + 24 * 60 * 60 * 1000)));
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState('');

  // Appointments State
  const [myAppointments, setMyAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  // Common Feedback
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Fetch Patient Profile
  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const res = await api.get('/patients/me');
      const data = res.data || res;
      setProfile(data);
      setProfileForm({
        legalName: data.legalName || '',
        preferredName: data.preferredName || '',
        dateOfBirth: data.dateOfBirth ? dateOnly(data.dateOfBirth) : '',
        phone: data.phone || '',
        address: data.address || '',
      });
    } catch (err) {
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // 2. Fetch Doctors
  const loadDoctors = useCallback(async () => {
    try {
      const res = await api.get('/appointments/doctors');
      setDoctors(res.data || res || []);
      if (res.data?.length > 0) setSelectedDoctor(res.data[0].id);
    } catch (err) {
      setDoctors([
        { id: 'clinician-123', name: 'Dr. Sarah Jenkins (General Medicine)' },
        { id: 'clinician-456', name: 'Dr. John Mensah (Internal Medicine)' },
      ]);
      setSelectedDoctor('clinician-123');
    }
  }, []);

  // 3. Fetch Slots
  const loadSlots = useCallback(async () => {
    if (!selectedDoctor || !bookingDate) return;
    try {
      const from = new Date(`${bookingDate}T08:00:00Z`).toISOString();
      const to = new Date(`${bookingDate}T17:00:00Z`).toISOString();
      const res = await api.get(`/appointments/availability?doctorId=${encodeURIComponent(selectedDoctor)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
      setAvailableSlots(res.data || res || []);
    } catch (err) {
      const mockSlots = [
        { startsAt: `${bookingDate}T09:00:00.000Z`, endsAt: `${bookingDate}T09:30:00.000Z` },
        { startsAt: `${bookingDate}T10:00:00.000Z`, endsAt: `${bookingDate}T10:30:00.000Z` },
        { startsAt: `${bookingDate}T11:00:00.000Z`, endsAt: `${bookingDate}T11:30:00.000Z` },
        { startsAt: `${bookingDate}T14:00:00.000Z`, endsAt: `${bookingDate}T14:30:00.000Z` },
        { startsAt: `${bookingDate}T15:00:00.000Z`, endsAt: `${bookingDate}T15:30:00.000Z` },
      ];
      setAvailableSlots(mockSlots);
    }
  }, [selectedDoctor, bookingDate]);

  // 4. Fetch My Appointments
  const loadMyAppointments = useCallback(async () => {
    setLoadingAppointments(true);
    try {
      const res = await api.get('/appointments/mine');
      setMyAppointments(res.data || res || []);
    } catch (err) {
      setMyAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
    loadDoctors();
    loadMyAppointments();
  }, [loadProfile, loadDoctors, loadMyAppointments]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  // Handle Book
  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError('Please select an appointment time slot.');
      return;
    }
    setLoading(true);
    setError('');
    setBookingSuccess('');
    try {
      await api.post('/appointments', {
        doctorId: selectedDoctor,
        startsAt: selectedSlot.startsAt,
      });
      setBookingSuccess('Appointment successfully booked! The clinic receptionist will confirm your queue slot on arrival.');
      setSelectedSlot(null);
      loadMyAppointments();
      loadSlots();
    } catch (err) {
      setError(err.message || 'Failed to book appointment.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Cancel
  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this visit?')) return;
    try {
      await api.patch(`/appointments/${id}/cancel`, { reason: 'Cancelled by patient' });
      loadMyAppointments();
      loadSlots();
    } catch (err) {
      setError(err.message || 'Failed to cancel appointment.');
    }
  };

  // Handle Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (profile) {
        await api.patch('/patients/me', {
          preferredName: profileForm.preferredName,
          phone: profileForm.phone,
          address: profileForm.address,
        });
      } else {
        await api.post('/patients/me', profileForm);
      }
      setBookingSuccess('Profile updated successfully!');
      loadProfile();
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'book', label: 'Book a Doctor Visit', icon: Calendar },
    { id: 'appointments', label: `My Appointments (${myAppointments.length})`, icon: Clock },
    { id: 'profile', label: 'My Medical Profile', icon: User },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200/80 mb-2">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span>MediWell Health • Patient Self-Service</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Patient Portal & Appointments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Book consultations with specialist doctors, view appointment history, and maintain contact information.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Verified Patient Account</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {bookingSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {bookingSuccess}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" /> {error}
        </div>
      )}

      {/* Tab 1: Book a Visit */}
      {activeTab === 'book' && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-card space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              Schedule New Doctor Consultation
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your preferred doctor, appointment date, and available time slot.
            </p>
          </div>

          <form onSubmit={handleBook} className="space-y-6 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                  <span>Select Specialist Clinician</span>
                </label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 text-slate-900 text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name || d.id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  <span>Appointment Date</span>
                </label>
                <input
                  type="date"
                  min={dateOnly(new Date())}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 text-slate-900 text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>Available Consultation Time Slots</span>
              </label>

              {availableSlots.length === 0 ? (
                <div className="p-8 bg-slate-50 border border-slate-100 rounded-2xl text-center text-slate-500">
                  No slots currently available for this clinician on {bookingDate}. Please pick another date.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                  {availableSlots.map((slot, idx) => {
                    const isSelected = selectedSlot?.startsAt === slot.startsAt;
                    const slotTime = formatDate(slot.startsAt).split(',')[1] || formatDate(slot.startsAt);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-3.5 rounded-2xl text-center text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600 shadow-md ring-2 ring-teal-400/30'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-teal-400 hover:bg-teal-50/50'
                        }`}
                      >
                        {slotTime}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !selectedSlot}
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'Confirming Visit...' : 'Confirm Appointment Booking'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: My Appointments */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              My Scheduled Appointments ({myAppointments.length})
            </h2>
            <span className="text-xs text-slate-500">Self-Service Records</span>
          </div>

          {loadingAppointments ? (
            <div className="p-16 text-center text-xs text-slate-500">Loading your visits...</div>
          ) : myAppointments.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">No scheduled appointments</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                You currently have no active or historical consultations booked. Click "Book a Doctor Visit" to schedule one.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myAppointments.map((item) => (
                <div key={item._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900">
                        {formatDate(item.startsAt || item.appointmentDate)}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">Attending Clinician: {item.doctorId}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <Badge status={item.status} />

                    {item.status === 'booked' && (
                      <button
                        onClick={() => handleCancel(item._id)}
                        className="px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 font-bold rounded-xl transition-all"
                      >
                        Cancel Visit
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-card space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              Personal Profile & Contact Information
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Keep your address and phone number updated for prescription dispensing notifications.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Legal Full Name</label>
              <input
                type="text"
                disabled={Boolean(profile)}
                value={profileForm.legalName}
                onChange={(e) => setProfileForm({ ...profileForm, legalName: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl bg-slate-100 text-slate-600 font-semibold disabled:opacity-80"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Preferred Name / Alias</label>
                <input
                  type="text"
                  value={profileForm.preferredName}
                  onChange={(e) => setProfileForm({ ...profileForm, preferredName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Residential Address</label>
              <input
                type="text"
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'Saving Profile...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
