import React from 'react';
import { ArrowRight, Calendar } from 'lucide-react';

export default function HealthTipsSection({ onArticleClick }) {
  const articles = [
    {
      category: 'Health Tips',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      title: 'Importance of Regular Health Checkups',
      date: 'May 02, 2024',
      image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80',
    },
    {
      category: 'Nutrition',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      title: 'Boost Your Immunity Naturally',
      date: 'May 01, 2024',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    },
    {
      category: 'Pharma News',
      badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      title: 'Advances in Modern Medicine',
      date: 'Apr 30, 2024',
      image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <section id="news" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Health Tips & News
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-500">
              Stay updated with the latest health tips and news.
            </p>
          </div>

          <button
            onClick={() => onArticleClick?.('all')}
            className="self-start sm:self-auto px-5 py-2.5 rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-slate-700 hover:text-teal-700 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>View All Articles</span>
            <ArrowRight className="w-4 h-4 text-teal-600" />
          </button>
        </div>

        {/* 3 Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onArticleClick?.(item.title)}
              className="group bg-white rounded-2xl border border-slate-100 hover:border-teal-200 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${item.badgeColor}`}>
                    {item.category}
                  </span>

                  <h3 className="mt-3 font-bold text-base sm:text-lg text-slate-900 group-hover:text-teal-600 transition-colors leading-snug">
                    {item.title}
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{item.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

