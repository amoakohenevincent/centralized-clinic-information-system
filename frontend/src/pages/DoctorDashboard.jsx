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
    <div className="space-y-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Notion-style Hero Header */}
      <div className="relative pt-4 pb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-[#f1f1ef] text-[#191919] text-xs font-medium border border-[#e5e5e3] mb-4">
          <span>University Clinic • Doctor Consultations & Records</span>
        </div>

        {/* Editorial Serif Headline */}
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#191919] tracking-tight leading-[1.15]">
          Doctor Consultation & <em className="italic font-normal">Patient Records</em>.
        </h1>

        <p className="mt-4 text-base sm:text-lg text-[#787774] max-w-2xl font-normal leading-relaxed">
          Welcome, {currentUser.title || 'Dr.'} {currentUser.firstName} {currentUser.lastName}. See patients waiting in the clinic, write consultation notes, and check past medical records.
        </p>

        {/* Action Controls & Search */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <form onSubmit={handleQuickSearch} className="relative flex-1 min-w-[280px] max-w-md">
            <input
              type="text"
              placeholder="Search patient by name, student ID, or staff ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 text-xs sm:text-sm bg-white border border-[#e9e9e7] rounded-none text-[#191919] shadow-sm focus:border-[#191919] focus:outline-none"
            />
          </form>

          <Link
            to="/doctor/appointments"
            className="px-4 py-2 bg-[#191919] hover:bg-[#333333] text-white text-xs sm:text-sm font-medium rounded-none shadow-notion-button transition-colors flex items-center"
          >
            <span>View Waiting List →</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards (Notion Card Style) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase font-bold tracking-wider text-[#191919]">
            Today's Clinic Summary
          </span>
          <span className="text-xs font-semibold text-[#191919]">Live Status</span>
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
            <div className="bg-white p-5 rounded-none border border-[#e9e9e7] shadow-notion-card hover:border-[#191919] transition-all flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#191919] uppercase tracking-wider block mb-2">
                  Appointments Today
                </span>
                <div className="font-serif font-bold text-4xl text-[#191919]">
                  {stats?.todayAppointments ?? 0}
                </div>
              </div>
              <span className="text-xs text-[#5a5a5a] mt-2 block">Total booked for today</span>
            </div>

            {/* Card 2: Awaiting Consultation */}
            <div className="bg-white p-5 rounded-none border border-[#e9e9e7] shadow-notion-card hover:border-[#191919] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-xs font-bold text-[#191919] uppercase tracking-wider">
                    Waiting to See Doctor
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-[#f1f1ef] text-[#191919] border border-[#e5e5e3] rounded-none">
                    In Queue
                  </span>
                </div>
                <div className="font-serif font-bold text-4xl text-[#191919]">
                  {stats?.awaitingConsultation ?? 0}
                </div>
              </div>
              <span className="text-xs text-[#5a5a5a] mt-2 block">Patients currently waiting</span>
            </div>

            {/* Card 3: Completed Today */}
            <div className="bg-white p-5 rounded-none border border-[#e9e9e7] shadow-notion-card hover:border-[#191919] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-xs font-bold text-[#191919] uppercase tracking-wider">
                    Patients Attended To
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-[#f1f1ef] text-[#191919] border border-[#e5e5e3] rounded-none">
                    Completed
                  </span>
                </div>
                <div className="font-serif font-bold text-4xl text-[#191919]">
                  {stats?.completedToday ?? 0}
                </div>
              </div>
              <span className="text-xs text-[#5a5a5a] mt-2 block">Consultations done today</span>
            </div>

            {/* Card 4: Upcoming Appointments */}
            <div className="bg-white p-5 rounded-none border border-[#e9e9e7] shadow-notion-card hover:border-[#191919] transition-all flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#191919] uppercase tracking-wider block mb-2">
                  Upcoming Visits
                </span>
                <div className="font-serif font-bold text-4xl text-[#191919]">
                  {stats?.upcomingAppointments ?? 0}
                </div>
              </div>
              <span className="text-xs text-[#5a5a5a] mt-2 block">Next 7 days</span>
            </div>
          </div>
        )}
      </div>

      {/* Notion Database Table View: Patients Waiting to See the Doctor */}
      <div className="bg-white rounded-none border border-[#e9e9e7] shadow-notion-card overflow-hidden">
        {/* Database Header Bar */}
        <div className="px-5 py-4 border-b border-[#e9e9e7] flex flex-wrap items-center justify-between gap-3 bg-[#faf9f6]">
          <div>
            <h3 className="font-serif font-bold text-base text-[#191919]">
              Patients Waiting to See the Doctor
            </h3>
            <p className="text-[11px] text-[#191919] mt-0.5">
              Waiting room list • Arranged in order of arrival
            </p>
          </div>

          <Link
            to="/doctor/appointments"
            className="text-xs font-semibold text-[#191919] hover:underline px-2 py-1 rounded-none transition-colors"
          >
            See Full Appointment List
          </Link>
        </div>

        {/* Database Rows */}
        {loading ? (
          <SkeletonTable rows={3} />
        ) : queue.length === 0 ? (
          <div className="p-10 text-center text-[#191919]">
            <p className="text-sm font-serif font-bold text-[#191919]">The waiting room is clear.</p>
            <p className="text-xs text-[#191919] mt-0.5">All checked-in patients have been attended to by the doctor.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf9f6] border-b border-[#e9e9e7] text-[#191919] font-bold">
                <tr>
                  <th className="py-2.5 px-4 font-mono w-16 text-[#191919]">#</th>
                  <th className="py-2.5 px-4 text-[#191919]">Patient</th>
                  <th className="py-2.5 px-4 text-[#191919]">Type</th>
                  <th className="py-2.5 px-4 text-[#191919]">Time In</th>
                  <th className="py-2.5 px-4 text-[#191919]">Reason for Visit</th>
                  <th className="py-2.5 px-4 text-[#191919]">Status</th>
                  <th className="py-2.5 px-4 text-right text-[#191919]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f1ef]">
                {queue.map((appt) => {
                  const patient = appt.patientId;
                  return (
                    <tr key={appt._id} className="hover:bg-[#fbfbfa] transition-colors group">
                      <td className="py-3 px-4 font-mono font-bold text-[#191919]">
                        #{appt.queueNumber || 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#191919]">
                          {patient?.firstName} {patient?.lastName}
                        </div>
                        <div className="text-[11px] text-[#191919] font-mono flex items-center gap-1.5">
                          <span>{patient?.patientId}</span>
                          <span>•</span>
                          <span className="font-sans font-medium text-[#191919]">{patient?.universityId}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-0.5 text-xs font-semibold bg-[#f1f1ef] text-[#191919] border border-[#e5e5e3] rounded-none capitalize">
                          {patient?.patientType || 'student'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-[#191919]">
                        {appt.appointmentTime}
                      </td>
                      <td className="py-3 px-4 text-[#191919] max-w-xs truncate">
                        {appt.reasonForVisit || 'General Medical Consultation'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-0.5 text-xs font-semibold bg-[#f1f1ef] text-[#191919] border border-[#e5e5e3] rounded-none capitalize">
                          {appt.status === 'checked-in' ? 'Waiting' : appt.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Link
                          to={`/doctor/patients/${patient?._id}/history`}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-[#191919] hover:underline rounded-none transition-colors"
                        >
                          Medical History
                        </Link>
                        {isDoctor && (
                          <Link
                            to={`/doctor/consultations/new/${appt._id}?patientId=${patient?._id}`}
                            className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-[#191919] hover:bg-[#333333] rounded-none shadow-notion-button transition-colors"
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

      {/* Notion-style Quick Cards / Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <Link
          to="/doctor/patients"
          className="bg-white p-5 rounded-none border border-[#e9e9e7] shadow-notion-card hover:border-[#d0d0ce] transition-all group block"
        >
          <h4 className="font-serif font-bold text-base text-[#191919]">
            Find a Patient
          </h4>
          <p className="text-xs text-[#787774] mt-1.5 leading-relaxed">
            Search registered student and staff records by name or university ID number.
          </p>
        </Link>

        <Link
          to="/doctor/appointments"
          className="bg-white p-5 rounded-none border border-[#e9e9e7] shadow-notion-card hover:border-[#d0d0ce] transition-all group block"
        >
          <h4 className="font-serif font-bold text-base text-[#191919]">
            Waiting List & Appointments
          </h4>
          <p className="text-xs text-[#787774] mt-1.5 leading-relaxed">
            Check today's appointments and see patients currently waiting in the clinic.
          </p>
        </Link>

        <Link
          to="/doctor/consultations/history"
          className="bg-white p-5 rounded-none border border-[#e9e9e7] shadow-notion-card hover:border-[#d0d0ce] transition-all group block"
        >
          <h4 className="font-serif font-bold text-base text-[#191919]">
            Past Consultation Records
          </h4>
          <p className="text-xs text-[#787774] mt-1.5 leading-relaxed">
            Read past doctor notes, diagnosed illnesses, and treatment history.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default DoctorDashboard;
