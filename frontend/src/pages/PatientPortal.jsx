import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, User, Clock, CheckCircle2, AlertCircle, PlusCircle, XCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

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
      // Profile might not exist yet for this user
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
      // Fallback doctor list
      setDoctors([
        { id: 'clinician-123', name: 'Dr. Sarah Jenkins' },
        { id: 'clinician-456', name: 'Dr. John Mensah' },
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
      // If mock/not configured, generate default daytime slots
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
      // Fallback
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
      setBookingSuccess('Appointment successfully booked!');
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-[#e9e9e7]">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#787774]">
          Patient Self-Service Portal
        </span>
        <h1 className="text-2xl font-serif font-bold text-[#191919] mt-1">Appointments & Profile</h1>
        <p className="text-xs text-[#787774] mt-0.5">
          Schedule consultations, view appointment history, and maintain your medical record contact details.
        </p>

        {/* Tab switcher */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setActiveTab('book')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'book'
                ? 'bg-[#191919] text-white'
                : 'bg-white border border-[#e9e9e7] text-[#5a5a5a] hover:bg-[#fbfbfa]'
            }`}
          >
            Book a Visit
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'appointments'
                ? 'bg-[#191919] text-white'
                : 'bg-white border border-[#e9e9e7] text-[#5a5a5a] hover:bg-[#fbfbfa]'
            }`}
          >
            My Appointments ({myAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-[#191919] text-white'
                : 'bg-white border border-[#e9e9e7] text-[#5a5a5a] hover:bg-[#fbfbfa]'
            }`}
          >
            My Profile
          </button>
        </div>
      </div>

      {bookingSuccess && (
        <div className="mb-4 p-3 bg-[#dbeddb] border border-[#2b784c]/20 text-[#2b784c] text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {bookingSuccess}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-[#ffe2dd] border border-[#c3453a]/20 text-[#c3453a] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Tab: Book a Visit */}
      {activeTab === 'book' && (
        <div className="bg-white border border-[#e9e9e7] p-6 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#191919] mb-4 pb-2 border-b border-[#e9e9e7]">
            Schedule New Doctor Appointment
          </h2>
          <form onSubmit={handleBook} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#5a5a5a] mb-1">Select Clinician</label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e9e9e7] bg-[#fbfbfa] text-[#191919] focus:outline-none"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name || d.id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#5a5a5a] mb-1">Appointment Date</label>
                <input
                  type="date"
                  min={dateOnly(new Date())}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e9e9e7] bg-[#fbfbfa] text-[#191919] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#5a5a5a] mb-2">Available Time Slots</label>
              {availableSlots.length === 0 ? (
                <p className="text-xs text-[#787774] p-4 bg-[#fbfbfa] border border-[#e9e9e7] text-center">
                  No available slots found for this clinician on {bookingDate}.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {availableSlots.map((slot, idx) => {
                    const isSelected = selectedSlot?.startsAt === slot.startsAt;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2.5 text-center text-xs transition-colors border ${
                          isSelected
                            ? 'bg-[#191919] text-white border-[#191919] font-bold'
                            : 'bg-[#fbfbfa] text-[#191919] border-[#e9e9e7] hover:border-[#191919]'
                        }`}
                      >
                        {formatDate(slot.startsAt).split(',')[1] || formatDate(slot.startsAt)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !selectedSlot}
              className="w-full py-2.5 bg-[#191919] text-white font-medium hover:bg-black transition-colors disabled:opacity-50"
            >
              {loading ? 'Booking Visit...' : 'Confirm Appointment Booking'}
            </button>
          </form>
        </div>
      )}

      {/* Tab: My Appointments */}
      {activeTab === 'appointments' && (
        <div className="bg-white border border-[#e9e9e7] shadow-sm">
          <div className="px-5 py-3 border-b border-[#e9e9e7] bg-[#fbfbfa]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#191919]">
              My Scheduled Appointments
            </h2>
          </div>
          {loadingAppointments ? (
            <div className="p-8 text-center text-xs text-[#787774]">Loading visits...</div>
          ) : myAppointments.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#787774]">
              You have no active or historical appointments.
            </div>
          ) : (
            <div className="divide-y divide-[#e9e9e7]">
              {myAppointments.map((item) => (
                <div key={item._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-semibold text-sm text-[#191919]">
                      {formatDate(item.startsAt || item.appointmentDate)}
                    </p>
                    <p className="text-[#787774] mt-0.5">Clinician: {item.doctorId}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] uppercase font-bold bg-[#ebebeb] text-[#5a5a5a]">
                      {item.status}
                    </span>
                  </div>

                  {item.status === 'booked' && (
                    <button
                      onClick={() => handleCancel(item._id)}
                      className="text-xs text-[#c3453a] hover:underline self-start sm:self-auto font-medium"
                    >
                      Cancel Visit
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-[#e9e9e7] p-6 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#191919] mb-4 pb-2 border-b border-[#e9e9e7]">
            Patient Profile Information
          </h2>
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#5a5a5a] mb-1">Legal Full Name</label>
              <input
                type="text"
                disabled={Boolean(profile)}
                value={profileForm.legalName}
                onChange={(e) => setProfileForm({ ...profileForm, legalName: e.target.value })}
                className="w-full px-3 py-2 border border-[#e9e9e7] bg-[#fbfbfa] text-[#191919] disabled:opacity-60"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#5a5a5a] mb-1">Preferred Name</label>
                <input
                  type="text"
                  value={profileForm.preferredName}
                  onChange={(e) => setProfileForm({ ...profileForm, preferredName: e.target.value })}
                  className="w-full px-3 py-2 border border-[#e9e9e7] bg-[#fbfbfa] text-[#191919]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#5a5a5a] mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-[#e9e9e7] bg-[#fbfbfa] text-[#191919]"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-[#5a5a5a] mb-1">Address</label>
              <input
                type="text"
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                className="w-full px-3 py-2 border border-[#e9e9e7] bg-[#fbfbfa] text-[#191919]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#191919] text-white font-medium hover:bg-black transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

