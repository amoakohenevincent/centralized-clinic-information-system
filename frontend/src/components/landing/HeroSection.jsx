import React from 'react';
import { ArrowRight, UserCheck, Headphones, ShieldCheck, Users } from 'lucide-react';

export default function HeroSection({ onExploreClick, onFindDoctorClick }) {
  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
  ];

  return (
    <section id="home" className="relative pt-6 pb-20 overflow-hidden bg-gradient-to-b from-[#f0fbf9] via-[#f7fcfb] to-white">
      {/* Background Decorative Circles */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 left-10 w-80 h-80 bg-cyan-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column Content */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#0ea5a0]">
                YOUR HEALTH, OUR PRIORITY
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Better Science. <br />
              Better <span className="text-[#0ea5a0]">Health.</span>
            </h1>

            {/* Paragraph */}
            <p className="text-base sm:text-lg text-slate-600 max-w-lg leading-relaxed">
              We are committed to improving and extending lives through innovative medicines and trusted healthcare solutions.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onExploreClick}
                className="px-7 py-3.5 rounded-lg bg-[#0ea5a0] hover:bg-[#0c8d88] text-white font-semibold text-sm shadow-md shadow-teal-500/20 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Explore Services</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onFindDoctorClick}
                className="px-7 py-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-[#0ea5a0]" />
                <span>Find a Doctor</span>
              </button>
            </div>

            {/* Social Proof Avatars */}
            <div className="pt-4 flex items-center gap-4">
              <div className="flex -space-x-2.5 overflow-hidden">
                {avatars.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="Patient avatar"
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover"
                  />
                ))}
              </div>
              <div className="leading-tight">
                <span className="block text-base font-extrabold text-slate-900">100K+</span>
                <span className="block text-xs font-medium text-slate-500">Patients Trust Us</span>
              </div>
            </div>
          </div>

          {/* Right Column Image & Floating Cards */}
          <div className="lg:col-span-6 relative">
            {/* Main Doctor Hero Image Container */}
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Soft decorative background glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-400/20 to-cyan-400/10 rounded-3xl transform -rotate-1 scale-102 filter blur-sm" />

              {/* Main Doctor photo */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white aspect-[4/3] sm:aspect-[16/11]">
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1200&q=80"
                  alt="Doctor in healthcare laboratory"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent" />
              </div>

              {/* Floating Badge 1: 24/7 Emergency Support (Top Right) */}
              <div className="absolute -top-4 -right-4 sm:top-4 sm:-right-6 bg-white/95 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-fade-in hover:scale-102 transition-transform">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                  <Headphones className="w-5 h-5" />
                </div>
                <div className="text-left text-xs leading-snug">
                  <span className="font-extrabold text-slate-900 block text-sm">24/7</span>
                  <span className="text-slate-500 font-medium">Emergency Support</span>
                </div>
              </div>

              {/* Floating Badge 2: Certified Quality Medicines (Middle Right) */}
              <div className="absolute top-1/2 -translate-y-1/2 -right-4 sm:-right-8 bg-white/95 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 hover:scale-102 transition-transform">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-left text-xs leading-snug">
                  <span className="font-extrabold text-slate-900 block">Certified</span>
                  <span className="text-slate-500 font-medium">Quality Medicines</span>
                </div>
              </div>

              {/* Floating Badge 3: Trusted by 100K+ (Bottom Right) */}
              <div className="absolute -bottom-6 right-2 sm:bottom-4 sm:-right-4 bg-white/95 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 hover:scale-102 transition-transform">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-left text-xs leading-snug">
                  <span className="text-slate-500 font-medium block">Trusted by</span>
                  <span className="font-extrabold text-slate-900 block text-sm">100K+</span>
                  <span className="text-slate-500 font-medium text-[10px]">Happy Patients</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
