import React from 'react';

export default function HealthTipsSection({ onArticleClick }) {
  const articles = [
    {
      category: 'Health Tips',
      title: 'Importance of Regular Health Checkups',
      date: 'May 02, 2024',
      image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80',
    },
    {
      category: 'Nutrition',
      title: 'Boost Your Immunity Naturally',
      date: 'May 01, 2024',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    },
    {
      category: 'Pharma News',
      title: 'Advances in Modern Medicine',
      date: 'Apr 30, 2024',
      image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <section id="news" className="py-16 sm:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
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
            className="self-start sm:self-auto px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm transition-all"
          >
            View All Articles
          </button>
        </div>

        {/* 3 Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onArticleClick?.(item.title)}
              className="group bg-white rounded-2xl border border-slate-200 hover:border-teal-600 shadow-sm hover:shadow transition-all overflow-hidden flex flex-col cursor-pointer"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                    {item.category}
                  </span>

                  <h3 className="mt-3 font-bold text-base sm:text-lg text-slate-900 group-hover:text-teal-700 transition-colors leading-snug">
                    {item.title}
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500 font-medium">
                  {item.date}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
