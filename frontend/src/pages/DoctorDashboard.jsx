import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle2,
  CalendarDays,
  Search,
  ArrowRight,
  User,
  Stethoscope,
  FileText,
  Activity,
  Sparkles,
} from 'lucide-react';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* MediWell Hero Header */}
      <div className="relative bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-card overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-12 w-64 h-64 rounded-full bg-cyan-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 text-xs font-semibold backdrop-blur-md border border-teal-400/30 mb-4">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>MediWell Clinical Suite • Doctor Consultations & Records</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Doctor Consultation & <span className="text-teal-300">Clinical Records</span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl">
            Welcome back, <span className="font-semibold text-white">{currentUser.title || 'Dr.'} {currentUser.firstName} {currentUser.lastName}</span>.
            Review patients currently waiting in the clinic, initiate clinical consultations, and track diagnosis history.
          </p>

          {/* Search Bar & Quick CTAs */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <form onSubmit={handleQuickSearch} className="relative flex-1 min-w-[280px] max-w-md">
              <input
                type="text"
                placeholder="Search patient by name, student ID, or staff ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white/95 text-slate-900 placeholder-slate-400 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </form>

            <Link
              to="/doctor/appointments"
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-sm transition-all flex items-center gap-2 hover:shadow-md"
            >
              <span>View Waiting Queue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Metric KPI Cards (MediWell Rounded Cards) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
              Today's Clinic Summary
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Today's Appointments */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card hover:border-teal-200 transition-all flex flex-col justify-between group">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Appointments Today
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                    {stats?.todayAppointments ?? 0}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-white transition-colors">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <span className="text-xs text-slate-500 mt-3 block font-medium">Total booked for today</span>
            </div>

            {/* Card 2: Awaiting Consultation */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card hover:border-amber-200 transition-all flex flex-col justify-between group">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Waiting to See Doctor
                    </span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-amber-600">
                    {stats?.awaitingConsultation ?? 0}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <span className="text-xs text-amber-700 font-semibold mt-3 block">Patients in waiting room</span>
            </div>

            {/* Card 3: Completed Today */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card hover:border-emerald-200 transition-all flex flex-col justify-between group">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Patients Attended To
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600">
                    {stats?.completedToday ?? 0}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <span className="text-xs text-emerald-700 font-semibold mt-3 block">Consultations completed</span>
            </div>

            {/* Card 4: Upcoming Visits */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card hover:border-blue-200 transition-all flex flex-col justify-between group">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Upcoming Visits
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-blue-600">
                    {stats?.upcomingAppointments ?? 0}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <CalendarDays className="w-5 h-5" />
                </div>
              </div>
              <span className="text-xs text-slate-500 mt-3 block font-medium">Scheduled in next 7 days</span>
            </div>
          </div>
        )}
      </div>

      {/* Live Consultation Queue Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-teal-500 animate-pulse" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Patients Waiting to See the Doctor
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Active clinic queue • Listed in arrival order for immediate care
              </p>
            </div>
          </div>

          <Link
            to="/doctor/appointments"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100/70 px-3 py-1.5 rounded-xl transition-all"
          >
            <span>See Full Appointment Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Database Rows */}
        {loading ? (
          <SkeletonTable rows={3} />
        ) : queue.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 mx-auto flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">The waiting room is currently clear.</p>
            <p className="text-xs text-slate-500 mt-1">All checked-in patients have been attended to by the medical team.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-600 font-bold">
                <tr>
                  <th className="py-3 px-5 w-16">#</th>
                  <th className="py-3 px-5">Patient Name</th>
                  <th className="py-3 px-5">Category</th>
                  <th className="py-3 px-5">Arrival Time</th>
                  <th className="py-3 px-5">Reason for Visit</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queue.map((appt) => {
                  const patient = appt.patientId;
                  const initials = `${patient?.firstName?.[0] || 'P'}${patient?.lastName?.[0] || ''}`;
                  return (
                    <tr key={appt._id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="py-4 px-5 font-bold text-teal-700">
                        #{appt.queueNumber || 1}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">
                              {patient?.firstName} {patient?.lastName}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono">{patient?.patientId}</span>
                              <span>•</span>
                              <span>{patient?.universityId}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <Badge variant="neutral" className="capitalize">
                          {patient?.patientType || 'student'}
                        </Badge>
                      </td>
                      <td className="py-4 px-5 font-semibold text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{appt.appointmentTime}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-slate-700 max-w-xs truncate font-medium">
                        {appt.reasonForVisit || 'General Medical Consultation'}
                      </td>
                      <td className="py-4 px-5">
                        <Badge variant="checked_in">
                          Waiting for Doctor
                        </Badge>
                      </td>
                      <td className="py-4 px-5 text-right space-x-2">
                        <Link
                          to={`/doctor/patients/${patient?._id}/history`}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700 bg-slate-100 hover:bg-teal-50 rounded-xl transition-all"
                        >
                          Medical History
                        </Link>
                        {isDoctor && (
                          <Link
                            to={`/doctor/consultations/new/${appt._id}?patientId=${patient?._id}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs hover:shadow transition-all"
                          >
                            <span>Attend to Patient</span>
                            <ArrowRight className="w-3.5 h-3.5" />
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

      {/* Quick Action Navigation Cards (MediWell Rounded Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
        <Link
          to="/doctor/patients"
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card hover:border-teal-200 hover:shadow-floating transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 group-hover:scale-105 group-hover:bg-teal-500 group-hover:text-white transition-all">
              <User className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-slate-900 group-hover:text-teal-600 transition-colors">
              Find a Patient Record
            </h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Quickly look up registered students, faculty, and university staff by name, student number, or staff ID.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-teal-600">
            <span>Search directory</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/doctor/appointments"
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card hover:border-teal-200 hover:shadow-floating transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 group-hover:bg-blue-500 group-hover:text-white transition-all">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
              Waiting List & Schedule
            </h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Review full daily appointment lists, monitor check-in arrival times, and filter consultation queues.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-blue-600">
            <span>Open schedule</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/doctor/consultations/history"
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card hover:border-teal-200 hover:shadow-floating transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-105 group-hover:bg-purple-500 group-hover:text-white transition-all">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-slate-900 group-hover:text-purple-600 transition-colors">
              Past Consultation Records
            </h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Review historical clinician notes, diagnosed conditions, previous prescriptions, and ongoing treatment plans.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-purple-600">
            <span>Browse history</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default DoctorDashboard;

