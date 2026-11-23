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
    { label: 'All', value: 'all' },
    { label: 'Waiting to See Doctor', value: 'checked-in' },
    { label: 'Booked Appointments', value: 'scheduled' },
    { label: 'With Doctor Now', value: 'in-consultation' },
    { label: 'Finished Consultations', value: 'completed' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#191919] block mb-2">
            Clinic Waiting List
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#191919] tracking-tight">
            Daily Appointment & Waiting List
          </h1>
          <p className="text-xs sm:text-sm text-[#191919] mt-1">
            Check patient appointments, who is waiting in the clinic, and who has been attended to.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-none border border-[#e9e9e7] text-xs shadow-notion-card">
          <span className="text-xs font-bold text-[#191919]">Date:</span>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-transparent font-semibold text-[#191919] focus:outline-none"
          />
        </div>
      </div>

      {/* Notion-style View Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-[#e9e9e7] pb-2 text-xs">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1.5 rounded-none font-semibold transition-colors ${
              statusFilter === tab.value
                ? 'bg-[#191919] text-white'
                : 'text-[#191919] hover:bg-[#f1f1ef]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Database Table */}
      <div className="bg-white rounded-none border border-[#e9e9e7] shadow-notion-card overflow-hidden">
        {loading ? (
          <SkeletonTable rows={5} />
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center text-[#191919]">
            <h4 className="font-serif font-bold text-base text-[#191919]">No patients found in this category</h4>
            <p className="text-xs text-[#5a5a5a] mt-1">Select another date or click "All" above to see all patients.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf9f6] border-b border-[#e9e9e7] text-[#191919] font-bold">
                <tr>
                  <th className="py-2.5 px-4 font-mono w-16 text-[#191919]">#</th>
                  <th className="py-2.5 px-4 text-[#191919]">Appointment No.</th>
                  <th className="py-2.5 px-4 text-[#191919]">Patient Name</th>
                  <th className="py-2.5 px-4 text-[#191919]">Time</th>
                  <th className="py-2.5 px-4 text-[#191919]">Visit Type</th>
                  <th className="py-2.5 px-4 text-[#191919]">Reason for Visit</th>
                  <th className="py-2.5 px-4 text-[#191919]">Status</th>
                  <th className="py-2.5 px-4 text-right text-[#191919]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f1ef]">
                {appointments.map((appt) => {
                  const patient = appt.patientId;
                  const isCheckedIn = appt.status === 'checked-in';
                  const isCompleted = appt.status === 'completed';

                  return (
                    <tr key={appt._id} className="hover:bg-[#fbfbfa] transition-colors group">
                      <td className="py-3 px-4 font-mono font-bold text-[#191919]">
                        #{appt.queueNumber || 1}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-[#191919]">
                        {appt.appointmentNumber}
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
                      <td className="py-3 px-4 font-medium text-[#191919]">
                        {appt.appointmentTime}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={appt.appointmentType === 'urgent' ? 'urgent' : 'default'}>
                          {appt.appointmentType}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-[#191919] max-w-xs truncate">
                        {appt.reasonForVisit || 'General Consultation'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={isCheckedIn ? 'default' : 'default'}>
                          {isCheckedIn ? 'Waiting' : isCompleted ? 'Completed' : appt.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Link
                          to={`/doctor/patients/${patient?._id}/history`}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-[#191919] hover:underline rounded-none transition-colors"
                        >
                          Medical History
                        </Link>

                        {isDoctor && !isCompleted && (
                          <Link
                            to={`/doctor/consultations/new/${appt._id}?patientId=${patient?._id}`}
                            className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-[#191919] hover:bg-[#333333] rounded-none shadow-notion-button transition-colors"
                          >
                            Attend to Patient
                          </Link>
                        )}

                        {isCompleted && appt.consultation && (
                          <Link
                            to={`/doctor/consultations/${appt.consultation._id}`}
                            className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-[#191919] bg-[#f1f1ef] hover:bg-[#e5e5e3] border border-[#e5e5e3] rounded-none transition-colors"
                          >
                            View Consultation Notes
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
