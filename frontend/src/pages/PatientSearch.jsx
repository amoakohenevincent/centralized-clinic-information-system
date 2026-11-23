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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs uppercase font-bold tracking-wider text-[#191919] block mb-2">
          University Patient Directory
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#191919] tracking-tight">
          Search for a Patient
        </h1>
        <p className="text-xs sm:text-sm text-[#191919] mt-1">
          Find registered students and university staff by name, student number, or staff ID.
        </p>
      </div>

      {/* Notion Search Bar */}
      <div className="bg-white p-5 rounded-none border border-[#e9e9e7] shadow-notion-card space-y-3">
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Type patient name, student ID, or staff ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-2.5 rounded-none border border-[#e5e5e3] text-xs sm:text-sm bg-[#fbfbfa] text-[#191919] focus:bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-[#191919] hover:bg-[#333333] text-white font-semibold text-xs sm:text-sm rounded-none shadow-notion-button transition-colors whitespace-nowrap"
          >
            {loading ? 'Searching...' : 'Search Patient'}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 text-xs text-[#191919] pt-1">
          <span className="text-[11px] font-bold text-[#191919]">Filter:</span>
          <button
            type="button"
            onClick={() => {
              setQuery('STU');
              handleSearch('STU');
            }}
            className="px-2 py-0.5 rounded-none bg-[#f1f1ef] hover:bg-[#e5e5e3] text-[#191919] font-medium text-[11px] border border-[#e5e5e3]"
          >
            Students (STU)
          </button>
          <button
            type="button"
            onClick={() => {
              setQuery('EMP');
              handleSearch('EMP');
            }}
            className="px-2 py-0.5 rounded-none bg-[#f1f1ef] hover:bg-[#e5e5e3] text-[#191919] font-medium text-[11px] border border-[#e5e5e3]"
          >
            Staff (EMP)
          </button>
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                handleSearch('');
              }}
              className="text-[11px] font-semibold text-[#191919] underline ml-2"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Database Results Table */}
      <div className="bg-white rounded-none border border-[#e9e9e7] shadow-notion-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#e9e9e7] flex items-center justify-between bg-[#faf9f6]">
          <span className="font-serif font-bold text-sm text-[#191919]">
            Patients Found ({patients.length})
          </span>
          <span className="text-[11px] font-medium text-[#191919]">
            Authorized Clinic Staff Only
          </span>
        </div>

        {loading ? (
          <SkeletonTable rows={4} />
        ) : patients.length === 0 ? (
          <div className="p-12 text-center text-[#191919]">
            <h4 className="font-serif font-bold text-base text-[#191919]">No patient found with that name or ID</h4>
            <p className="text-xs text-[#5a5a5a] mt-1">
              Check the spelling or ID number and try again.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf9f6] border-b border-[#e9e9e7] text-[#191919] font-bold">
                <tr>
                  <th className="py-2.5 px-4 font-mono text-[#191919]">Patient No.</th>
                  <th className="py-2.5 px-4 font-mono text-[#191919]">Student / Staff ID</th>
                  <th className="py-2.5 px-4 text-[#191919]">Full Name</th>
                  <th className="py-2.5 px-4 text-[#191919]">Faculty / Dept</th>
                  <th className="py-2.5 px-4 text-[#191919]">Blood Group</th>
                  <th className="py-2.5 px-4 text-[#191919]">Visits</th>
                  <th className="py-2.5 px-4 text-[#191919]">Previous Illness</th>
                  <th className="py-2.5 px-4 text-right text-[#191919]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f1ef]">
                {patients.map((p) => {
                  return (
                    <tr key={p._id} className="hover:bg-[#fbfbfa] transition-colors group">
                      <td className="py-3 px-4 font-mono font-bold text-[#191919]">
                        {p.patientId}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#191919]">
                        {p.universityId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#191919]">{p.fullName}</div>
                        <div className="text-[11px] text-[#5a5a5a] capitalize">
                          {p.gender} • {p.patientType}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#191919]">
                        {p.department || 'University General'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-none bg-[#f1f1ef] text-[#191919] border border-[#e5e5e3]">
                          {p.bloodGroup || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#191919]">
                        {p.totalConsultations ?? 0}
                      </td>
                      <td className="py-3 px-4">
                        {p.lastPrimaryDiagnosis ? (
                          <Badge variant="default">{p.lastPrimaryDiagnosis}</Badge>
                        ) : (
                          <span className="text-[#5a5a5a] italic text-[11px]">First visit (No past records)</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/doctor/patients/${p._id}/history`}
                          className="inline-flex items-center px-3 py-1 text-xs font-semibold text-[#191919] bg-[#f1f1ef] hover:bg-[#e5e5e3] border border-[#e5e5e3] rounded-none transition-colors"
                        >
                          View Medical History
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
