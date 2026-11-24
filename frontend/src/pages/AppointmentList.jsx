import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 inline-block mb-1">
            Clinic Waiting List & Queue
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Daily Appointment & Triage Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time tracking of patient appointments, waiting room queue status, and completed doctor consultations.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-300 text-xs">
          <span className="font-bold text-slate-700">Date:</span>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-transparent font-semibold text-slate-900 focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === tab.value
                ? 'bg-teal-600 text-white font-bold shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Database Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <SkeletonTable rows={5} />
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center">
            <h4 className="text-sm font-bold text-slate-900">No patients found in this filter</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try selecting a different date or select "All Records" to view all patient appointments for today.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-14">#</th>
                  <th className="py-3 px-4">Appointment ID</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Visit Type</th>
                  <th className="py-3 px-4">Reason for Visit</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {appointments.map((appt) => {
                  const patient = appt.patientId;
                  const isCheckedIn = appt.status === 'checked-in';
                  const isCompleted = appt.status === 'completed';
                  const initials = `${patient?.firstName?.[0] || 'P'}${patient?.lastName?.[0] || ''}`;

                  return (
                    <tr key={appt._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-teal-800">
                        #{appt.queueNumber || 1}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {appt.appointmentNumber}
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
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {appt.appointmentTime}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={appt.appointmentType === 'urgent' ? 'urgent' : 'neutral'}>
                          {appt.appointmentType}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate font-medium">
                        {appt.reasonForVisit || 'General Medical Consultation'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={isCheckedIn ? 'checked_in' : isCompleted ? 'completed' : 'scheduled'}>
                          {isCheckedIn ? 'Waiting in Clinic' : isCompleted ? 'Completed' : appt.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <Link
                          to={`/doctor/patients/${patient?._id}/history`}
                          className="inline-block px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-all"
                        >
                          Medical History
                        </Link>

                        {isDoctor && !isCompleted && (
                          <Link
                            to={`/doctor/consultations/new/${appt._id}?patientId=${patient?._id}`}
                            className="inline-block px-3.5 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-all"
                          >
                            Attend
                          </Link>
                        )}

                        {isCompleted && appt.consultation && (
                          <Link
                            to={`/doctor/consultations/${appt.consultation._id}`}
                            className="inline-block px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-all"
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
