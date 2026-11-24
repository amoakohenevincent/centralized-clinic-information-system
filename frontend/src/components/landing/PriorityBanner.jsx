import React from 'react';
import { CalendarCheck2, ArrowRight, Users } from 'lucide-react';

export default function PriorityBanner({ onBookClick }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
      <div className="rounded-3xl bg-gradient-to-r from-teal-600 via-teal-500 to-teal-600 p-8 sm:p-12 text-white shadow-xl shadow-teal-700/10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        {/* Left Side: Icon & Copy */}
        <div className="flex items-center gap-5 text-left">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20 shadow-sm">
            <CalendarCheck2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Your Health Is Our Priority
            </h3>
            <p className="mt-1 text-sm text-teal-100 max-w-xl">
              Let us take care of you and your family with trusted healthcare services.
            </p>
          </div>
        </div>

        {/* Right Side: CTA Button & Community Avatar */}
        <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-end">
          <button
            onClick={onBookClick}
            className="w-full md:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>Book Your Appointment Now</span>
            <ArrowRight className="w-4 h-4 text-teal-600 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="hidden sm:flex w-12 h-12 rounded-full bg-white/20 border border-white/30 items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
