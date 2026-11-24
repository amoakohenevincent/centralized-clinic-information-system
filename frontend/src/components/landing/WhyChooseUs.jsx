import React from 'react';
import { CheckCircle2, ArrowRight, Phone, ShieldCheck } from 'lucide-react';

export default function WhyChooseUs({ onLearnMoreClick, onEmergencyCall }) {
  const points = [
    'WHO-GMP Certified',
    'High Quality & Safe Medicines',
    'Affordable & Accessible Healthcare',
    'Experienced & Caring Professionals',
    'Advanced Technology & Facilities',
  ];

  return (
    <section id="about" className="py-20 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Column 1: Clinic Building with Mission Overlay */}
          <div className="lg:col-span-4 relative rounded-3xl overflow-hidden shadow-lg border border-slate-100 min-h-[380px] bg-slate-100">
            <img
              src="https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80"
              alt="MediWell Clinic and Hospital Facility"
              className="w-full h-full object-cover"
            />
            
            {/* Our Mission Badge Overlay */}
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-teal-600/95 backdrop-blur-md text-white shadow-xl">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-extrabold text-xs uppercase tracking-wider">
                  Our Mission
                </span>
              </div>
              <p className="text-xs text-teal-50 font-medium leading-relaxed">
                To deliver quality healthcare with compassion and innovation.
              </p>
            </div>
          </div>

          {/* Column 2: Why Choose Us Content */}
          <div className="lg:col-span-5 flex flex-col justify-between py-2 px-2 sm:px-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Why Choose <span className="text-[#0ea5a0]">MediWell</span> Pharma?
              </h2>
              
              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                We combine innovation, expertise, and care to deliver the best healthcare experience.
              </p>

              {/* Checklist */}
              <div className="mt-6 space-y-3.5">
                {points.map((point, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 fill-teal-600 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-slate-800">
                      {point}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Learn More Button */}
            <div className="pt-8">
              <button
                onClick={onLearnMoreClick}
                className="px-6 py-3 rounded-lg border border-slate-300 hover:border-teal-500 bg-white hover:bg-teal-50 text-slate-800 font-semibold text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Learn More About Us</span>
                <ArrowRight className="w-4 h-4 text-teal-600" />
              </button>
            </div>
          </div>

          {/* Column 3: Emergency Card */}
          <div className="lg:col-span-3 rounded-3xl bg-gradient-to-br from-[#0066cc] to-[#004f9e] text-white p-6 sm:p-7 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div>
              <h3 className="text-2xl font-extrabold tracking-tight mb-2">
                Need Emergency Help?
              </h3>
              <p className="text-xs text-blue-100 leading-relaxed">
                We are available 24/7 for emergencies. Your health is our priority.
              </p>

              {/* Phone Pill Button */}
              <a
                href="tel:+12345678900"
                onClick={onEmergencyCall}
                className="mt-6 inline-flex items-center justify-center gap-2.5 w-full py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-sm shadow-md transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4 text-[#0066cc]" />
                <span>+1 234 567 8900</span>
              </a>
            </div>

            {/* Ambulance Photo */}
            <div className="mt-6 rounded-2xl overflow-hidden border border-white/20 shadow-lg aspect-[16/10] bg-slate-900/20">
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
