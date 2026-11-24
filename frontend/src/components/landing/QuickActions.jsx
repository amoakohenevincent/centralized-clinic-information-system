import React from 'react';
import { UserCheck, Calendar, Pill, FlaskConical, HeartPulse, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QuickActions({ onBookClick, onFindDoctorClick }) {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Find a Doctor',
      desc: 'Connect with our specialist doctors.',
      icon: UserCheck,
      color: 'bg-sky-50 text-sky-600 border-sky-100',
      action: onFindDoctorClick,
    },
    {
      title: 'Book Appointment',
      desc: 'Schedule an appointment easily.',
      icon: Calendar,
      color: 'bg-teal-50 text-teal-600 border-teal-100',
      action: onBookClick,
    },
    {
      title: 'Pharmacy',
      desc: 'Wide range of medicines at your fingertips.',
      icon: Pill,
      color: 'bg-cyan-50 text-cyan-600 border-cyan-100',
      action: () => navigate('/prescriptions/catalogue'),
    },
    {
      title: 'Lab Tests',
      desc: 'Accurate & reliable diagnostic tests.',
      icon: FlaskConical,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      action: onBookClick,
    },
    {
      title: 'Health Packages',
      desc: 'Preventive health checkup packages.',
      icon: HeartPulse,
      color: 'bg-rose-50 text-rose-600 border-rose-100',
      action: onBookClick,
    },
  ];

  return (
    <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-14 mb-16">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">
        <h2 className="text-center text-lg sm:text-xl font-extrabold text-slate-900 mb-6">
          How Can We Help You?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {actions.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                onClick={item.action}
                className="group p-4 rounded-2xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-3.5 transition-transform group-hover:scale-110 ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1 group-hover:text-teal-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    {item.desc}
                  </p>
                </div>
                <div className="flex items-center text-xs font-semibold text-teal-600 group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
