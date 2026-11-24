import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clinicalService } from '../services/clinicalService';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';
import { SkeletonCard, SkeletonTable } from '../components/common/LoadingSkeleton';

const DoctorDashboard = () => {
  const { currentUser, isDoctor } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [statsData, queueData] = await Promise.all([
          clinicalService.getDashboardStats(),
          clinicalService.getAppointmentQueue('checked-in'),
        ]);
        setStats(statsData);
        setQueue(queueData);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/doctor/patients?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Header */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-10 text-white shadow-sm border border-slate-800">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-teal-300 text-xs font-bold border border-slate-700">
            <span>MediWell Clinical Suite • Doctor Consultations & Records</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Doctor Consultation & <span className="text-teal-400">Clinical Records</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Welcome back, <span className="font-bold text-white">{currentUser.title || 'Dr.'} {currentUser.firstName} {currentUser.lastName}</span>.
            Review patients currently waiting in the clinic, initiate clinical consultations, and track diagnosis history.
          </p>

          {/* Search Bar & Quick CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <form onSubmit={handleQuickSearch} className="flex-1 min-w-[260px] max-w-md">
              <input
                type="text"
                placeholder="Search patient by name, student ID, or staff ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white text-slate-900 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 border border-slate-300"
              />
            </form>

            <Link
              to="/doctor/appointments"
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all"
            >
              View Waiting Queue
            </Link>
          </div>
        </div>
      </div>

      {/* Metric KPI Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-900">
            Today's Clinic Summary
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
            Live Sync
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Today's Appointments */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Appointments Today
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                  {stats?.todayAppointments ?? 0}
                </div>
              </div>
              <span className="text-xs text-slate-500 mt-3 block font-medium">Total booked for today</span>
            </div>

            {/* Card 2: Awaiting Consultation */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Waiting for Doctor
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-teal-700">
                  {stats?.awaitingConsultation ?? 0}
                </div>
              </div>
              <span className="text-xs text-slate-600 font-semibold mt-3 block">Patients in waiting room</span>
            </div>

            {/* Card 3: Completed Today */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Patients Attended To
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                  {stats?.completedToday ?? 0}
                </div>
              </div>
              <span className="text-xs text-slate-600 font-semibold mt-3 block">Consultations completed</span>
            </div>

            {/* Card 4: Upcoming Visits */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Upcoming Visits
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                  {stats?.upcomingAppointments ?? 0}
                </div>
              </div>
              <span className="text-xs text-slate-500 mt-3 block font-medium">Scheduled in next 7 days</span>
            </div>
          </div>
        )}
      </div>

      {/* Live Consultation Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Patients Waiting to See the Doctor
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Active clinic queue • Listed in arrival order for immediate care
            </p>
          </div>

          <Link
            to="/doctor/appointments"
            className="text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200 transition-all"
          >
            See Full Appointment Queue
          </Link>
        </div>

        {/* Database Rows */}
        {loading ? (
          <SkeletonTable rows={3} />
        ) : queue.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-bold text-slate-800">The waiting room is currently clear.</p>
            <p className="text-xs text-slate-500 mt-1">All checked-in patients have been attended to by the medical team.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-14">#</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Arrival Time</th>
                  <th className="py-3 px-4">Reason for Visit</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {queue.map((appt) => {
                  const patient = appt.patientId;
                  const initials = `${patient?.firstName?.[0] || 'P'}${patient?.lastName?.[0] || ''}`;
                  return (
                    <tr key={appt._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-teal-800">
                        #{appt.queueNumber || 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-300">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">
                              {patient?.firstName} {patient?.lastName}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {patient?.patientId} • {patient?.universityId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="neutral" className="capitalize">
                          {patient?.patientType || 'student'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {appt.appointmentTime}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate font-medium">
                        {appt.reasonForVisit || 'General Medical Consultation'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="checked_in">
                          Waiting for Doctor
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <Link
                          to={`/doctor/patients/${patient?._id}/history`}
                          className="inline-block px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-all"
                        >
                          Medical History
                        </Link>
                        {isDoctor && (
                          <Link
                            to={`/doctor/consultations/new/${appt._id}?patientId=${patient?._id}`}
                            className="inline-block px-3 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-all"
                          >
                            Attend to Patient
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
        <Link
          to="/doctor/patients"
          className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-600 transition-all flex flex-col justify-between"
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 inline-block mb-3">
              Patient Directory
            </span>
            <h4 className="font-bold text-base text-slate-900">
              Find a Patient Record
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Quickly look up registered students, faculty, and university staff by name, student number, or staff ID.
            </p>
          </div>
          <div className="mt-4 text-xs font-bold text-teal-700">
            Search directory
          </div>
        </Link>

        <Link
          to="/doctor/appointments"
          className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-600 transition-all flex flex-col justify-between"
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300 inline-block mb-3">
              Operations
            </span>
            <h4 className="font-bold text-base text-slate-900">
              Waiting List & Schedule
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Review full daily appointment lists, monitor check-in arrival times, and filter consultation queues.
            </p>
          </div>
          <div className="mt-4 text-xs font-bold text-teal-700">
            Open schedule
          </div>
        </Link>

        <Link
          to="/doctor/consultations/history"
          className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-600 transition-all flex flex-col justify-between"
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300 inline-block mb-3">
              Archives
            </span>
            <h4 className="font-bold text-base text-slate-900">
              Past Consultation Records
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Review historical clinician notes, diagnosed conditions, previous prescriptions, and ongoing treatment plans.
            </p>
          </div>
          <div className="mt-4 text-xs font-bold text-teal-700">
            Browse history
          </div>
        </Link>
      </div>
    </div>
  );
};

export default DoctorDashboard;
