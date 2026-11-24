import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ServicesSection({ onServiceSelect }) {
  const navigate = useNavigate();

  const services = [
    {
      title: 'Pharmacy',
      desc: 'Genuine medicines at best prices.',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
      action: () => navigate('/prescriptions/catalogue'),
    },
    {
      title: 'Cardiology',
      desc: 'Advanced care for your heart.',
      image: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&w=600&q=80',
      action: () => onServiceSelect?.('Cardiology'),
    },
    {
      title: 'Neurology',
      desc: 'Expert treatment for brain & nervous system.',
      image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80',
      action: () => onServiceSelect?.('Neurology'),
    },
    {
      title: 'Pathology Lab',
      desc: 'Accurate reports, trusted results.',
      image: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=600&q=80',
      action: () => onServiceSelect?.('Pathology'),
    },
    {
      title: 'Pediatrics',
      desc: 'Special care for your little ones.',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
      action: () => onServiceSelect?.('Pediatrics'),
    },
  ];

  return (
    <section id="services" className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Our <span className="text-teal-600">Healthcare</span> Services
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-500">
            Comprehensive healthcare solutions for you and your family.
          </p>
        </div>

        {/* 5 Services Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {services.map((item, idx) => (
            <div
              key={idx}
              onClick={item.action}
              className="group bg-white rounded-2xl border border-slate-200 hover:border-teal-600 overflow-hidden shadow-sm hover:shadow transition-all flex flex-col cursor-pointer"
            >
              {/* Card Thumbnail Image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-teal-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-4 flex justify-end">
                  <span className="text-xs font-bold text-teal-700 group-hover:underline">
                    View Service
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
