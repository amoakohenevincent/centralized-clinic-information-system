import React, { useState } from 'react';
import api from '../services/api';

const dateOnly = (date) => {
  const local = new Date(date);
  return new Date(local.getTime() - local.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

export default function WalkInRegistration() {
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Form state
  const [form, setForm] = useState({
    legalName: '',
    preferredName: '',
    dateOfBirth: '',
    phone: '',
    address: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [createdPatient, setCreatedPatient] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchTerm.trim()) return;
    setSearching(true);
    setError('');
    try {
      const res = await api.get(`/patients?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchResults(res.data || res || []);
    } catch (err) {
      setError(err.message || 'Search failed.');
    } finally {
      setSearching(false);
    }
  };

  const handleCreateWalkIn = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setCreatedPatient(null);
    try {
      const res = await api.post('/patients', form);
      const data = res.data || res;
      setCreatedPatient(data);
      setForm({ legalName: '', preferredName: '', dateOfBirth: '', phone: '', address: '' });
    } catch (err) {
      setError(err.message || 'Failed to register walk-in patient.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200/80 mb-2">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span>Reception Desk Check-In</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Walk-in Patient Registration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Check existing student and staff records before onboarding new unregistered walk-in patients.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200">
          <span>Patient Intake Module</span>
        </div>
      </div>

      {createdPatient && (
        <div className="p-5 bg-teal-50 border border-teal-200 rounded-3xl text-teal-900 text-xs space-y-1">
          <div className="font-bold text-sm">
            Walk-in Profile Registered Successfully
          </div>
          <p className="font-medium text-slate-700">
            Patient: <strong className="text-slate-900">{createdPatient.legalName}</strong> | Clinic ID:{' '}
            <span className="font-mono font-bold text-teal-800 bg-white px-2 py-0.5 rounded-lg border border-teal-200">
              {createdPatient.patientNumber || createdPatient.patientId}
            </span>
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white text-xs font-bold">
          Notice: {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Step 1: Search Existing Records */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-card space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">
              1. Search Existing Patient Directory
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Prevent duplicate IDs by searching legal name, patient ID, or phone number.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search name, CCIS-PT-..., or phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold bg-teal-600 text-white hover:bg-teal-700 rounded-2xl shadow-xs transition-all disabled:opacity-50 whitespace-nowrap"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </form>

          {searchResults.length > 0 ? (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl max-h-72 overflow-y-auto">
              {searchResults.map((p) => (
                <div key={p._id} className="p-3.5 text-xs hover:bg-slate-50/70 transition-colors flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{p.preferredName || p.legalName}</p>
                    <p className="text-slate-500 font-mono mt-0.5">{p.patientNumber || p.patientId} · {p.phone || 'No phone'}</p>
                  </div>
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-xl border border-teal-200">
                    Existing Record
                  </span>
                </div>
              ))}
            </div>
          ) : searchTerm && !searching ? (
            <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
              No existing patient record matched "{searchTerm}". Safe to register as a new walk-in arrival below.
            </p>
          ) : null}
        </div>

        {/* Step 2: Register Walk-In */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-card space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">
              2. Onboard New Walk-in Patient
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Collect essential contact and demographic details for immediate clinic triage.
            </p>
          </div>

          <form onSubmit={handleCreateWalkIn} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                maxLength={120}
                placeholder="e.g. Samuel Kofi Mensah"
                value={form.legalName}
                onChange={(e) => setForm({ ...form, legalName: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Preferred Name</label>
                <input
                  type="text"
                  maxLength={80}
                  placeholder="e.g. Kofi"
                  value={form.preferredName}
                  onChange={(e) => setForm({ ...form, preferredName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  max={dateOnly(new Date())}
                  value={form.dateOfBirth}
                  onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Phone Number *</label>
              <input
                type="tel"
                required
                maxLength={30}
                placeholder="e.g. 024 123 4567 or 055 987 6543"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Residential Address</label>
              <input
                type="text"
                maxLength={300}
                placeholder="e.g. Commonwealth Hall Room B12, Legon or Pentagon Hostel, Accra"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition-all disabled:opacity-50"
            >
              {submitting ? 'Registering Patient...' : 'Create & Check-in Walk-in Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
