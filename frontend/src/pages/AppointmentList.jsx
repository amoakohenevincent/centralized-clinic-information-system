import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Filter, ArrowRight, User, CheckCircle2 } from 'lucide-react';
import { clinicalService } from '../services/clinicalService';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';
import { SkeletonTable } from '../components/common/LoadingSkeleton';

const AppointmentList = () => {
  const { isDoctor } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await clinicalService.getAppointmentQueue(statusFilter, dateFilter);
      setAppointments(data);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, dateFilter]);

  const filterTabs = [
    { label: 'All Records', value: 'all' },
    { label: 'Waiting for Doctor', value: 'checked-in' },
    { label: 'Booked / Scheduled', value: 'scheduled' },
    { label: 'In Consultation', value: 'in-consultation' },
    { label: 'Completed Visits', value: 'completed' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-card">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200/80 mb-2">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span>Clinic Waiting List & Queue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Daily Appointment & Triage Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time tracking of patient appointments, waiting room queue status, and completed doctor consultations.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2.5 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 text-xs">
          <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
          <span className="font-bold text-slate-700">Filter Date:</span>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-transparent font-semibold text-slate-900 focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-xs">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              statusFilter === tab.value
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Database Table Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
        {loading ? (
          <SkeletonTable rows={5} />
        ) : appointments.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 mx-auto flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">No patients found in this filter</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try selecting a different date or select "All Records" to view all patient appointments for today.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-600 font-bold">
                <tr>
                  <th className="py-3.5 px-5 w-16">#</th>
                  <th className="py-3.5 px-5">Appointment ID</th>
                  <th className="py-3.5 px-5">Patient Name</th>
                  <th className="py-3.5 px-5">Time</th>
                  <th className="py-3.5 px-5">Visit Type</th>
                  <th className="py-3.5 px-5">Reason for Visit</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((appt) => {
                  const patient = appt.patientId;
                  const isCheckedIn = appt.status === 'checked-in';
                  const isCompleted = appt.status === 'completed';
                  const initials = `${patient?.firstName?.[0] || 'P'}${patient?.lastName?.[0] || ''}`;

                  return (
                    <tr key={appt._id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="py-4 px-5 font-bold text-teal-700">
                        #{appt.queueNumber || 1}
                      </td>
                      <td className="py-4 px-5 font-mono font-medium text-slate-700">
                        {appt.appointmentNumber}
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
                      <td className="py-4 px-5 font-semibold text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{appt.appointmentTime}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <Badge variant={appt.appointmentType === 'urgent' ? 'urgent' : 'neutral'}>
                          {appt.appointmentType}
                        </Badge>
                      </td>
                      <td className="py-4 px-5 text-slate-700 max-w-xs truncate font-medium">
                        {appt.reasonForVisit || 'General Medical Consultation'}
                      </td>
                      <td className="py-4 px-5">
                        <Badge variant={isCheckedIn ? 'checked_in' : isCompleted ? 'completed' : 'scheduled'}>
                          {isCheckedIn ? 'Waiting in Clinic' : isCompleted ? 'Completed' : appt.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-5 text-right space-x-2">
                        <Link
                          to={`/doctor/patients/${patient?._id}/history`}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700 bg-slate-100 hover:bg-teal-50 rounded-xl transition-all"
                        >
                          Medical History
                        </Link>

                        {isDoctor && !isCompleted && (
                          <Link
                            to={`/doctor/consultations/new/${appt._id}?patientId=${patient?._id}`}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-all"
                          >
                            <span>Attend</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        {isCompleted && appt.consultation && (
                          <Link
                            to={`/doctor/consultations/${appt.consultation._id}`}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100/80 rounded-xl border border-teal-200 transition-all"
                          >
                            View Notes
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
    </div>
  );
};

export default AppointmentList;

