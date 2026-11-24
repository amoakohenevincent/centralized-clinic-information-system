import React from 'react';

export default function PriorityBanner({ onBookClick }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-16 sm:my-20">
      <div className="rounded-2xl bg-teal-700 p-6 sm:p-10 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Side: Copy */}
        <div className="text-left space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-teal-200">
            Dedicated Healthcare
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Your Health Is Our Priority
          </h3>
          <p className="text-sm text-teal-100 max-w-xl">
            Let us take care of you and your family with trusted healthcare services.
          </p>
        </div>

        {/* Right Side: CTA Button */}
        <div className="w-full md:w-auto shrink-0">
          <button
            onClick={onBookClick}
            className="w-full md:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-sm shadow-sm transition-all"
          >
            Book Your Appointment Now
          </button>
        </div>
      </div>
    </div>
  );
}
