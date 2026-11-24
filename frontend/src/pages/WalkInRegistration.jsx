import React, { useState } from 'react';
import { UserPlus, Search, CheckCircle2, AlertCircle, Phone, Calendar, User, ArrowRight, ShieldCheck } from 'lucide-react';
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

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Patient Intake Module</span>
        </div>
      </div>

      {createdPatient && (
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-3xl text-emerald-800 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Walk-in Profile Registered Successfully!</span>
          </div>
          <p className="font-medium text-slate-700 pl-7">
            Patient: <strong className="text-slate-900">{createdPatient.legalName}</strong> | Clinic ID:{' '}
            <span className="font-mono font-bold text-teal-700 bg-white px-2 py-0.5 rounded-lg border border-teal-200">
              {createdPatient.patientNumber || createdPatient.patientId}
            </span>
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Step 1: Search Existing Records */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                1. Search Existing Patient Directory
              </h2>
              <p className="text-xs text-slate-500">
                Prevent duplicate IDs by searching legal name, patient ID, or phone number.
              </p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search name, CCIS-PT-..., or phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
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
                  <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-xl">
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
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                2. Onboard New Walk-in Patient
              </h2>
              <p className="text-xs text-slate-500">
                Collect essential contact and demographic details for immediate clinic triage.
              </p>
            </div>
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

            <div className="grid grid-cols-2 gap-3">
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
                placeholder="e.g. 055-123-4567"
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
                placeholder="Hall / Hostel / Faculty address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{submitting ? 'Registering Patient...' : 'Create & Check-in Walk-in Profile'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
