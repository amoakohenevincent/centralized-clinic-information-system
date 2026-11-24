import React from 'react';

export default function HeroSection({ onExploreClick, onFindDoctorClick }) {
  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
  ];

  return (
    <section id="home" className="relative pt-6 pb-16 sm:pb-20 overflow-hidden bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column Content */}
          <div className="lg:col-span-6 space-y-5 text-left">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                YOUR HEALTH, OUR PRIORITY
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Better Science. <br />
              Better <span className="text-teal-600">Health.</span>
            </h1>

            {/* Paragraph */}
            <p className="text-base sm:text-lg text-slate-600 max-w-lg leading-relaxed">
              We are committed to improving and extending lives through innovative medicines and trusted healthcare solutions.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onExploreClick}
                className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm transition-all"
              >
                Explore Services
              </button>

              <button
                onClick={onFindDoctorClick}
                className="px-6 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm transition-all"
              >
                Find a Doctor
              </button>
            </div>

            {/* Social Proof Avatars */}
            <div className="pt-3 flex items-center gap-3">
              <div className="flex -space-x-2 overflow-hidden">
                {avatars.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="Patient avatar"
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover"
                  />
                ))}
              </div>
              <div className="leading-tight">
                <span className="block text-sm sm:text-base font-extrabold text-slate-900">100K+</span>
                <span className="block text-xs font-semibold text-slate-500">Patients Trust Us</span>
              </div>
            </div>
          </div>

          {/* Right Column Image & Metric Cards */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Doctor photo */}
              <div className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white aspect-[4/3] sm:aspect-[16/11]">
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1200&q=80"
                  alt="Doctor in healthcare laboratory"
                  className="w-full h-full object-cover object-top"
                />
              </div>

              {/* Floating Badge 1: 24/7 Emergency Support (Top Right) */}
              <div className="absolute -top-3 -right-2 sm:top-4 sm:-right-4 bg-white p-3 rounded-xl shadow-md border border-slate-200 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 font-bold text-xs flex items-center justify-center border border-teal-200">
                  24/7
                </div>
                <div className="text-left text-xs leading-tight">
                  <span className="font-bold text-slate-900 block">Emergency</span>
                  <span className="text-slate-500">Medical Support</span>
                </div>
              </div>

              {/* Floating Badge 2: Certified Quality Medicines (Middle Right) */}
              <div className="absolute top-1/2 -translate-y-1/2 -right-2 sm:-right-6 bg-white p-3 rounded-xl shadow-md border border-slate-200 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                  WHO
                </div>
                <div className="text-left text-xs leading-tight">
                  <span className="font-bold text-slate-900 block">GMP Certified</span>
                  <span className="text-slate-500">Quality Assured</span>
                </div>
              </div>

              {/* Floating Badge 3: Trusted by 100K+ (Bottom Right) */}
              <div className="absolute -bottom-4 right-2 sm:bottom-4 sm:-right-3 bg-white p-3 rounded-xl shadow-md border border-slate-200 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                  100K
                </div>
                <div className="text-left text-xs leading-tight">
                  <span className="font-bold text-slate-900 block">Happy Patients</span>
                  <span className="text-slate-500 text-[10px]">National Coverage</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
