import React, { useState } from 'react';
import { UserPlus, Search, CheckCircle2, AlertCircle, Phone, Calendar, User } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-6 pb-4 border-b border-[#e9e9e7]">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#787774]">
          Reception Desk
        </span>
        <h1 className="text-2xl font-serif font-bold text-[#191919] mt-1">Walk-in Patient Registration</h1>
        <p className="text-xs text-[#787774] mt-0.5">
          Verify existing patient records first before registering new walk-in arrivals.
        </p>
      </div>

      {createdPatient && (
        <div className="mb-6 p-4 bg-[#dbeddb] border border-[#2b784c]/30 text-[#2b784c] text-xs">
          <div className="flex items-center gap-2 font-bold mb-1">
            <CheckCircle2 className="w-4 h-4" /> Walk-in Profile Created Successfully!
          </div>
          <p>
            Patient: <span className="font-semibold">{createdPatient.legalName}</span> | Number:{' '}
            <span className="font-mono font-bold">{createdPatient.patientNumber || createdPatient.patientId}</span>
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-3 bg-[#ffe2dd] border border-[#c3453a]/20 text-[#c3453a] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Step 1: Search Existing Records */}
        <div className="bg-white border border-[#e9e9e7] p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#e9e9e7]">
            <Search className="w-4 h-4 text-[#787774]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#191919]">
              1. Search Existing Records
            </h2>
          </div>
          <p className="text-xs text-[#787774] mb-4">
            Avoid duplicate records by searching legal name, patient number, or phone number.
          </p>
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="e.g. Jordan Example, CCIS-PT-..., 555-0101"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 text-xs border border-[#e9e9e7] bg-[#fbfbfa] text-[#191919] focus:outline-none focus:border-[#191919]"
            />
            <button
              type="submit"
              disabled={searching}
              className="px-4 py-2 text-xs font-medium bg-[#191919] text-white hover:bg-black transition-colors disabled:opacity-50"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </form>

          {searchResults.length > 0 ? (
            <div className="divide-y divide-[#e9e9e7] border border-[#e9e9e7] max-h-64 overflow-y-auto">
              {searchResults.map((p) => (
                <div key={p._id} className="p-3 text-xs hover:bg-[#fbfbfa]">
                  <p className="font-semibold text-[#191919]">{p.preferredName || p.legalName}</p>
                  <p className="text-[#787774] font-mono mt-0.5">{p.patientNumber || p.patientId} · {p.phone}</p>
                </div>
              ))}
            </div>
          ) : searchTerm && !searching ? (
            <p className="text-xs text-[#787774] bg-[#fbfbfa] p-3 text-center border border-[#e9e9e7]">
              No existing patient record matched "{searchTerm}". Safe to register below.
            </p>
          ) : null}
        </div>

        {/* Step 2: Register Walk-In */}
        <div className="bg-white border border-[#e9e9e7] p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#e9e9e7]">
            <UserPlus className="w-4 h-4 text-[#787774]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#191919]">
              2. Register New Walk-in Profile
            </h2>
          </div>
          <form onSubmit={handleCreateWalkIn} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#5a5a5a] mb-1">Legal Full Name *</label>
              <input
                type="text"
                required
                maxLength={120}
                placeholder="First Last"
                value={form.legalName}
                onChange={(e) => setForm({ ...form, legalName: e.target.value })}
                className="w-full px-3 py-2 border border-[#e9e9e7] bg-[#fbfbfa] text-[#191919] focus:outline-none focus:border-[#191919]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#5a5a5a] mb-1">Preferred Name</label>
                <input
                  type="text"
                  maxLength={80}
                  placeholder="Nickname"
                  value={form.preferredName}
                  onChange={(e) => setForm({ ...form, preferredName: e.target.value })}
                  className="w-full px-3 py-2 border border-[#e9e9e7] bg-[#fbfbfa] text-[#191919] focus:outline-none focus:border-[#191919]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#5a5a5a] mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  max={dateOnly(new Date())}
                  value={form.dateOfBirth}
                  onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 border border-[#e9e9e7] bg-[#fbfbfa] text-[#191919] focus:outline-none focus:border-[#191919]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#5a5a5a] mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                maxLength={30}
                placeholder="555-0101"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-[#e9e9e7] bg-[#fbfbfa] text-[#191919] focus:outline-none focus:border-[#191919]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#5a5a5a] mb-1">Residential Address</label>
              <input
                type="text"
                maxLength={300}
                placeholder="Hall / Hostel / Residence address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 border border-[#e9e9e7] bg-[#fbfbfa] text-[#191919] focus:outline-none focus:border-[#191919]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-[#191919] text-white font-medium hover:bg-black transition-colors disabled:opacity-50"
            >
              {submitting ? 'Creating Profile...' : 'Create Walk-in Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

