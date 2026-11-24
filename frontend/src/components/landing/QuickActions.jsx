import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function QuickActions({ onBookClick, onFindDoctorClick }) {
  const navigate = useNavigate();

  const actions = [
    {
      step: '01',
      title: 'Find a Doctor',
      desc: 'Connect with our specialist doctors.',
      action: onFindDoctorClick,
    },
    {
      step: '02',
      title: 'Book Appointment',
      desc: 'Schedule an appointment easily.',
      action: onBookClick,
    },
    {
      step: '03',
      title: 'Pharmacy',
      desc: 'Wide range of medicines at your fingertips.',
      action: () => navigate('/prescriptions/catalogue'),
    },
    {
      step: '04',
      title: 'Lab Tests',
      desc: 'Accurate & reliable diagnostic tests.',
      action: onBookClick,
    },
    {
      step: '05',
      title: 'Health Packages',
      desc: 'Preventive health checkup packages.',
      action: onBookClick,
    },
  ];

  return (
    <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10 sm:my-14">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h2 className="text-center text-lg sm:text-xl font-extrabold text-slate-900 mb-6">
          How Can We Help You?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {actions.map((item, index) => (
            <div
              key={index}
              onClick={item.action}
              className="group p-4 rounded-xl border border-slate-200 hover:border-teal-600 hover:bg-slate-50 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 font-bold text-xs flex items-center justify-center border border-teal-200 mb-3">
                  {item.step}
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-1 group-hover:text-teal-700 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  {item.desc}
                </p>
              </div>
              <div className="text-xs font-bold text-teal-700">
                Explore
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
