import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 inline-block mb-1">
            University Patient Records Directory
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Search Patient Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access registered patient records, verify eligibility, and view longitudinal health histories.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-300">
          Encrypted Database
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            placeholder="Search by patient name, student ID, or staff ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600 focus:outline-none transition-all"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all whitespace-nowrap"
          >
            {loading ? 'Searching...' : 'Search Patient'}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 pt-1">
          <span className="font-bold text-slate-700">Quick Filters:</span>
          <button
            type="button"
            onClick={() => {
              setQuery('STU');
              handleSearch('STU');
            }}
            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 font-semibold border border-slate-300 transition-all"
          >
            Students (STU)
          </button>
          <button
            type="button"
            onClick={() => {
              setQuery('EMP');
              handleSearch('EMP');
            }}
            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 font-semibold border border-slate-300 transition-all"
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
              className="text-xs font-bold text-teal-700 hover:underline ml-2"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Database Results Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <span className="font-bold text-xs sm:text-sm text-slate-900">
            Patients Found ({patients.length})
          </span>
          <span className="text-xs font-semibold text-slate-500">
            Authorized Medical Staff Access Only
          </span>
        </div>

        {loading ? (
          <SkeletonTable rows={4} />
        ) : patients.length === 0 ? (
          <div className="p-12 text-center">
            <h4 className="text-sm font-bold text-slate-900">No patient found with that query</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Please check the spelling of the name or verify the student/staff ID number.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Patient ID</th>
                  <th className="py-3 px-4">University ID</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Total Visits</th>
                  <th className="py-3 px-4">Recent Diagnosis</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {patients.map((p) => {
                  const initials = `${p.fullName?.split(' ')[0]?.[0] || 'P'}${p.fullName?.split(' ')[1]?.[0] || ''}`;
                  return (
                    <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-teal-800">
                        {p.patientId}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                        {p.universityId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-300">
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
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {p.department || 'University General'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                          {p.bloodGroup || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {p.totalConsultations ?? 0}
                      </td>
                      <td className="py-3.5 px-4">
                        {p.lastPrimaryDiagnosis ? (
                          <Badge variant="teal">{p.lastPrimaryDiagnosis}</Badge>
                        ) : (
                          <span className="text-slate-400 italic text-xs">First Visit</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/doctor/patients/${p._id}/history`}
                          className="inline-block px-3 py-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-all"
                        >
                          Medical History
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
