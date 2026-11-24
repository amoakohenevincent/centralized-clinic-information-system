import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, User, Filter, ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';
import { clinicalService } from '../services/clinicalService';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';
import { SkeletonTable } from '../components/common/LoadingSkeleton';

const PatientSearch = () => {
  const { isDoctor } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('query') || '';

  const [query, setQuery] = useState(initialQuery);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  const handleSearch = async (searchQuery = query, page = 1) => {
    setLoading(true);
    setSearched(true);
    try {
      const response = await clinicalService.searchPatients(searchQuery, page);
      setPatients(response.data);
      if (response.pagination) {
        setPagination(response.pagination);
      }
      setSearchParams({ query: searchQuery });
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch(initialQuery);
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    handleSearch(query, 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200/80 mb-2">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span>University Patient Records Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Search Patient Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access registered patient records, verify eligibility, and view longitudinal health histories.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Encrypted Clinical Database</span>
        </div>
      </div>

      {/* MediWell Search & Filter Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card space-y-4">
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by patient name, student ID, or staff ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 text-slate-900 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs hover:shadow transition-all whitespace-nowrap flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Searching...' : 'Search Patient'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 pt-1">
          <span className="font-bold text-slate-700 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-teal-600" /> Quick Filters:
          </span>
          <button
            type="button"
            onClick={() => {
              setQuery('STU');
              handleSearch('STU');
            }}
            className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 font-semibold border border-slate-200/80 transition-all"
          >
            Students (STU)
          </button>
          <button
            type="button"
            onClick={() => {
              setQuery('EMP');
              handleSearch('EMP');
            }}
            className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 font-semibold border border-slate-200/80 transition-all"
          >
            Faculty & Staff (EMP)
          </button>
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                handleSearch('');
              }}
              className="text-xs font-bold text-teal-600 hover:underline ml-2"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Database Results Table Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <span className="font-bold text-sm text-slate-900">
            Patients Found ({patients.length})
          </span>
          <span className="text-xs font-semibold text-slate-500">
            Authorized Medical Staff Access Only
          </span>
        </div>

        {loading ? (
          <SkeletonTable rows={4} />
        ) : patients.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">No patient found with that query</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Please check the spelling of the name or verify the student/staff ID number.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-600 font-bold">
                <tr>
                  <th className="py-3.5 px-5">Patient ID</th>
                  <th className="py-3.5 px-5">University ID</th>
                  <th className="py-3.5 px-5">Full Name</th>
                  <th className="py-3.5 px-5">Department</th>
                  <th className="py-3.5 px-5">Blood Group</th>
                  <th className="py-3.5 px-5">Total Visits</th>
                  <th className="py-3.5 px-5">Recent Diagnosis</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((p) => {
                  const initials = `${p.fullName?.split(' ')[0]?.[0] || 'P'}${p.fullName?.split(' ')[1]?.[0] || ''}`;
                  return (
                    <tr key={p._id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="py-4 px-5 font-mono font-bold text-teal-700">
                        {p.patientId}
                      </td>
                      <td className="py-4 px-5 font-mono font-semibold text-slate-700">
                        {p.universityId}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{p.fullName}</div>
                            <div className="text-[11px] text-slate-500 capitalize">
                              {p.gender} • {p.patientType}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-slate-700 font-medium">
                        {p.department || 'University General'}
                      </td>
                      <td className="py-4 px-5">
                        <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80">
                          {p.bloodGroup || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-bold text-slate-800">
                        {p.totalConsultations ?? 0}
                      </td>
                      <td className="py-4 px-5">
                        {p.lastPrimaryDiagnosis ? (
                          <Badge variant="teal">{p.lastPrimaryDiagnosis}</Badge>
                        ) : (
                          <span className="text-slate-400 italic text-xs">First Visit</span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <Link
                          to={`/doctor/patients/${p._id}/history`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100/80 rounded-xl border border-teal-200/80 transition-all"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Medical History</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientSearch;

