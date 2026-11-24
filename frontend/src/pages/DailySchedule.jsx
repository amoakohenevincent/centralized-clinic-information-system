import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Badge } from '../components/common/Badge';

const dateOnly = (date) => {
  const local = new Date(date);
  return new Date(local.getTime() - local.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

const formatDate = (value) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

export default function DailySchedule() {
  const [date, setDate] = useState(dateOnly(new Date()));
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const loadSchedule = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const from = new Date(`${date}T00:00:00`);
      const to = new Date(from);
      to.setDate(to.getDate() + 1);

      const res = await api.get(`/appointments/schedule?from=${from.toISOString()}&to=${to.toISOString()}`);
      setAppointments(res.data || res || []);
    } catch (err) {
      setError(err.message || 'Failed to load schedule.');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      setActionSuccess(`Appointment status updated to ${status.replace('_', ' ')}.`);
      setTimeout(() => setActionSuccess(''), 3000);
      loadSchedule();
    } catch (err) {
      setError(err.message || 'Status update failed.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200/80 mb-2">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span>Reception & Patient Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Daily Appointment Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage front desk patient flow, process check-ins, and orchestrate consultation queues.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 text-xs">
            <span className="font-bold text-slate-700">Date:</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent font-semibold text-slate-900 focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={loadSchedule}
            className="px-4 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-2xl shadow-xs transition-all"
          >
            Refresh
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl text-teal-900 text-xs font-bold">
          {actionSuccess}
        </div>
      )}

      {error && (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white text-xs font-bold">
          Notice: {error}
        </div>
      )}

      {/* Schedule Table / Cards */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Appointments for {date} ({appointments.length} patients)
          </h2>
          <span className="text-xs font-semibold text-slate-500">Live Desk Monitor</span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs text-slate-500">Loading daily schedule...</div>
        ) : appointments.length === 0 ? (
          <div className="p-16 text-center">
            <h4 className="text-base font-bold text-slate-900">No appointments scheduled for this date</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Select another calendar date or register a new walk-in patient from the Walk-In Desk.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {appointments.map((item) => {
              const patientName = item.patientId?.legalName || item.patientId?.preferredName || item.patientName || 'Patient';
              const initials = `${patientName.split(' ')[0]?.[0] || 'P'}${patientName.split(' ')[1]?.[0] || ''}`;

              return (
                <div key={item._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center font-bold text-xs shrink-0">
                      {initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <p className="font-bold text-sm text-slate-900">
                          {patientName}
                        </p>
                        <span className="text-xs font-mono font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
                          {item.patientId?.patientNumber || item.appointmentNumber || 'WALK-IN'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1 font-medium">
                        <span className="text-slate-700">
                          Time: {formatDate(item.startsAt || item.appointmentDate)}
                        </span>
                        <span>
                          Clinician: {item.doctorId?.name || item.doctorId || 'General Medical Officer'}
                        </span>
                        {item.patientId?.phone && <span>Tel: {item.patientId.phone}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <Badge status={item.status} />

                    <div className="flex items-center gap-2">
                      {(item.status === 'booked' || item.status === 'scheduled') && (
                        <button
                          onClick={() => handleStatusChange(item._id, 'checked_in')}
                          className="px-3.5 py-1.5 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs transition-all"
                        >
                          Check-in Patient
                        </button>
                      )}
                      {(item.status === 'checked_in' || item.status === 'checked-in') && (
                        <button
                          onClick={() => handleStatusChange(item._id, 'in_consultation')}
                          className="px-3.5 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs transition-all"
                        >
                          Send to Doctor
                        </button>
                      )}
                      {(item.status === 'in_consultation' || item.status === 'in-consultation') && (
                        <button
                          onClick={() => handleStatusChange(item._id, 'completed')}
                          className="px-3.5 py-1.5 text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-xs transition-all"
                        >
                          Complete Visit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
