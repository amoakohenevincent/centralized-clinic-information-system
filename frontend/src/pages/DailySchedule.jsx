import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, User, CheckCircle2, Play, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../services/api';

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

  const statusBadge = (status) => {
    const s = String(status || '').replace('-', '_');
    const colors = {
      booked: 'bg-[#d3e5ef] text-[#24638a]',
      scheduled: 'bg-[#d3e5ef] text-[#24638a]',
      checked_in: 'bg-[#fdecc8] text-[#d9730d]',
      in_consultation: 'bg-[#e8deee] text-[#6940a5]',
      completed: 'bg-[#dbeddb] text-[#2b784c]',
      cancelled: 'bg-[#ebebeb] text-[#5a5a5a]',
      no_show: 'bg-[#ffe2dd] text-[#c3453a]',
    };
    return (
      <span className={`px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${colors[s] || 'bg-[#ebebeb] text-[#5a5a5a]'}`}>
        {s.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-6 pb-4 border-b border-[#e9e9e7]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#787774]">
              Reception & Clinic Operations
            </span>
            <h1 className="text-2xl font-serif font-bold text-[#191919] mt-1">Daily Appointment Schedule</h1>
            <p className="text-xs text-[#787774] mt-0.5">Manage patient flow, check-ins, and consultation queues.</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-[#5a5a5a] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#787774]" /> Date:
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-2.5 py-1 text-xs border border-[#e9e9e7] bg-white text-[#191919] focus:outline-none focus:border-[#191919]"
              />
            </label>
            <button
              onClick={loadSchedule}
              className="px-3 py-1 text-xs font-medium bg-[#191919] text-white hover:bg-black transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="mb-4 p-3 bg-[#dbeddb] border border-[#2b784c]/20 text-[#2b784c] text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {actionSuccess}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-[#ffe2dd] border border-[#c3453a]/20 text-[#c3453a] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Schedule Table / Cards */}
      <div className="bg-white border border-[#e9e9e7] shadow-sm">
        <div className="px-5 py-3 border-b border-[#e9e9e7] bg-[#fbfbfa] flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#191919]">
            Appointments for {date} ({appointments.length})
          </h2>
          <span className="text-[11px] text-[#787774]">Live Desk Monitor</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-[#787774]">Loading schedule...</div>
        ) : appointments.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#787774]">
            No appointments scheduled for this date.
          </div>
        ) : (
          <div className="divide-y divide-[#e9e9e7]">
            {appointments.map((item) => (
              <div key={item._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#fbfbfa] transition-colors">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-sm text-[#191919]">
                      {item.patientId?.legalName || item.patientId?.preferredName || item.patientName || 'Patient'}
                    </p>
                    <span className="text-[11px] font-mono text-[#787774]">
                      {item.patientId?.patientNumber || item.appointmentNumber || ''}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#787774] mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {formatDate(item.startsAt || item.appointmentDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> Clinician: {item.doctorId?.name || item.doctorId || 'General Doctor'}
                    </span>
                    {item.patientId?.phone && <span>Phone: {item.patientId.phone}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {statusBadge(item.status)}
                  <div className="flex items-center gap-1">
                    {(item.status === 'booked' || item.status === 'scheduled') && (
                      <button
                        onClick={() => handleStatusChange(item._id, 'checked_in')}
                        className="px-2.5 py-1 text-xs font-medium bg-[#191919] text-white hover:bg-black transition-colors"
                      >
                        Check-in
                      </button>
                    )}
                    {(item.status === 'checked_in' || item.status === 'checked-in') && (
                      <button
                        onClick={() => handleStatusChange(item._id, 'in_consultation')}
                        className="px-2.5 py-1 text-xs font-medium bg-[#6940a5] text-white hover:bg-[#58338f] transition-colors flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" /> Start Visit
                      </button>
                    )}
                    {(item.status === 'in_consultation' || item.status === 'in-consultation') && (
                      <button
                        onClick={() => handleStatusChange(item._id, 'completed')}
                        className="px-2.5 py-1 text-xs font-medium bg-[#2b784c] text-white hover:bg-[#205c39] transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
