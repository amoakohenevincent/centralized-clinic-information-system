import React from 'react';
import { X, Star, Calendar, MapPin, Award } from 'lucide-react';

export default function FindDoctorModal({ isOpen, onClose, onBookWithDoctor }) {
  if (!isOpen) return null;

  const doctors = [
    {
      id: 'clinician-123',
      name: 'Dr. Sarah Jenkins',
      title: 'Senior Physician & Medical Director',
      specialty: 'Internal Medicine',
      experience: '14+ years experience',
      rating: 4.9,
      reviews: 128,
      education: 'Harvard Medical School · MD',
      availability: 'Available Today',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'clinician-456',
      name: 'Dr. John Mensah',
      title: 'Consultant Cardiologist',
      specialty: 'Cardiology & Heart Health',
      experience: '11+ years experience',
      rating: 4.8,
      reviews: 94,
      education: 'Johns Hopkins University · FACC',
      availability: 'Available Tomorrow',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'clinician-789',
      name: 'Dr. Kwame Boateng',
      title: 'Chief Pediatrician',
      specialty: 'Pediatrics & Neonatal Care',
      experience: '9+ years experience',
      rating: 4.9,
      reviews: 156,
      education: 'Oxford University Medical Sciences',
      availability: 'Available Today',
      image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-lg">Our Clinic Specialists</h3>
            <p className="text-xs text-teal-100">Board-certified physicians ready to provide premier care</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Doctor Cards */}
        <div className="p-6 divide-y divide-slate-100 max-h-[75vh] overflow-y-auto space-y-4">
          {doctors.map((doc) => (
            <div key={doc.id} className="pt-4 first:pt-0 flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <img
                src={doc.image}
                alt={doc.name}
                className="w-20 h-20 rounded-2xl object-cover object-top border border-slate-100 shadow-sm shrink-0"
              />
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="font-extrabold text-slate-900 text-base">{doc.name}</h4>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold justify-center sm:justify-start">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{doc.rating}</span>
                    <span className="text-slate-400 font-normal">({doc.reviews})</span>
                  </div>
                </div>

                <p className="text-xs font-semibold text-teal-600 mt-0.5">{doc.specialty}</p>
                <p className="text-xs text-slate-500 mt-1">{doc.education} · {doc.experience}</p>

                <div className="mt-3 flex items-center gap-3 justify-center sm:justify-start">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {doc.availability}
                  </span>
                  <button
                    onClick={() => {
                      onClose();
                      onBookWithDoctor(doc);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    Book Consultation
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

