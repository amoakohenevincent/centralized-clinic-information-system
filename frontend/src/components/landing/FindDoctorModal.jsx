import React from 'react';

export default function FindDoctorModal({ isOpen, onClose, onBookWithDoctor }) {
  if (!isOpen) return null;

  const doctors = [
    {
      id: 'clinician-123',
      name: 'Dr. Kwabena Mensah',
      title: 'Senior Physician & Medical Director',
      specialty: 'Internal Medicine',
      experience: '14+ years experience',
      rating: '4.9 / 5.0',
      reviews: 128,
      education: 'University of Ghana Medical School (UGMS), Korle-Bu · MB ChB, FWACP',
      availability: 'Available Today',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'clinician-456',
      name: 'Dr. Akosua Serwaa Boateng',
      title: 'Consultant Cardiologist',
      specialty: 'Cardiology & Heart Health',
      experience: '11+ years experience',
      rating: '4.8 / 5.0',
      reviews: 94,
      education: 'KNUST School of Medical Sciences, Kumasi · MB ChB, FGCPS',
      availability: 'Available Tomorrow',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'clinician-789',
      name: 'Dr. Kwame Osei-Tutu',
      title: 'Chief Pediatrician',
      specialty: 'Pediatrics & Neonatal Care',
      experience: '9+ years experience',
      rating: '4.9 / 5.0',
      reviews: 156,
      education: 'University of Cape Coast (UCC) School of Medical Sciences · MB ChB',
      availability: 'Available Today',
      image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-teal-700 text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg">Our Clinic Specialists</h3>
            <p className="text-xs text-teal-100">Board-certified physicians ready to provide premier care</p>
          </div>
          <button
            onClick={onClose}
            className="px-2.5 py-1 rounded-lg border border-teal-500 bg-teal-800 text-xs font-semibold hover:bg-teal-900 transition-colors"
          >
            Close
          </button>
        </div>

        {/* Doctor Cards */}
        <div className="p-5 sm:p-6 divide-y divide-slate-200 overflow-y-auto space-y-4 flex-1">
          {doctors.map((doc) => (
            <div key={doc.id} className="pt-4 first:pt-0 flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <img
                src={doc.image}
                alt={doc.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover object-top border border-slate-200 shrink-0"
              />
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="font-extrabold text-slate-900 text-base">{doc.name}</h4>
                  <div className="text-xs font-bold text-slate-700">
                    Rating: {doc.rating} ({doc.reviews} reviews)
                  </div>
                </div>

                <p className="text-xs font-semibold text-teal-700 mt-0.5">{doc.specialty}</p>
                <p className="text-xs text-slate-500 mt-1">{doc.education} · {doc.experience}</p>

                <div className="mt-3 flex items-center gap-3 justify-center sm:justify-start">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                    {doc.availability}
                  </span>
                  <button
                    onClick={() => {
                      onClose();
                      onBookWithDoctor(doc);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all"
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
