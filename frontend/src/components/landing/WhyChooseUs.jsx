import React from 'react';

export default function WhyChooseUs({ onLearnMoreClick, onEmergencyCall }) {
  const points = [
    'WHO-GMP Certified',
    'High Quality & Safe Medicines',
    'Affordable & Accessible Healthcare',
    'Experienced & Caring Professionals',
    'Advanced Technology & Facilities',
  ];

  return (
    <section id="about" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Column 1: Clinic Building with Mission Overlay */}
          <div className="lg:col-span-4 relative rounded-2xl overflow-hidden shadow-sm border border-slate-200 min-h-[350px] bg-slate-100">
            <img
              src="https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80"
              alt="MediWell Clinic and Hospital Facility"
              className="w-full h-full object-cover"
            />
            
            {/* Our Mission Overlay */}
            <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl bg-teal-700 text-white shadow-md">
              <span className="font-extrabold text-xs uppercase tracking-wider block mb-1">
                Our Mission
              </span>
              <p className="text-xs text-teal-100 font-medium leading-relaxed">
                To deliver quality healthcare with compassion and innovation.
              </p>
            </div>
          </div>

          {/* Column 2: Why Choose Us Content */}
          <div className="lg:col-span-5 flex flex-col justify-between py-2 px-1 sm:px-3">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Why Choose <span className="text-teal-600">MediWell</span> Pharma?
              </h2>
              
              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                We combine innovation, expertise, and care to deliver the best healthcare experience.
              </p>

              {/* Checklist */}
              <div className="mt-6 space-y-3">
                {points.map((point, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
                    <span className="text-sm font-semibold text-slate-800">
                      {point}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Learn More Button */}
            <div className="pt-6 sm:pt-8">
              <button
                onClick={onLearnMoreClick}
                className="px-6 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm shadow-xs transition-all"
              >
                Learn More About Us
              </button>
            </div>
          </div>

          {/* Column 3: Emergency Card */}
          <div className="lg:col-span-3 rounded-2xl bg-slate-900 text-white p-6 sm:p-7 flex flex-col justify-between shadow-md relative overflow-hidden">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 block mb-1">
                24/7 Service
              </span>
              <h3 className="text-2xl font-extrabold tracking-tight mb-2">
                Need Emergency Help?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                We are available 24/7 for emergencies. Your health is our priority.
              </p>

              {/* Phone Pill Button */}
              <a
                href="tel:+233302123456"
                onClick={onEmergencyCall}
                className="mt-5 inline-flex items-center justify-center w-full py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-sm shadow-sm transition-all text-center"
              >
                +233 30 212 3456
              </a>
            </div>

            {/* Ambulance Photo */}
            <div className="mt-6 rounded-xl overflow-hidden border border-slate-700 aspect-[16/10] bg-slate-800">
              <img
                src="https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=800&q=80"
                alt="Emergency 24/7 Ambulance"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
