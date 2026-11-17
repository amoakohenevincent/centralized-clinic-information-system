import React from 'react';

export const SkeletonCard = () => (
  <div className="bg-white p-6 rounded-none border border-slate-200 shadow-sm animate-pulse">
    <div className="h-4 bg-slate-200 rounded-none w-1/3 mb-4"></div>
    <div className="h-8 bg-slate-200 rounded-none w-1/2 mb-2"></div>
    <div className="h-3 bg-slate-200 rounded-none w-2/3"></div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="bg-white rounded-none border border-slate-200 p-4 shadow-sm animate-pulse space-y-4">
    <div className="h-6 bg-slate-200 rounded-none w-1/4"></div>
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-4 bg-slate-200 rounded-none w-1/6"></div>
          <div className="h-4 bg-slate-200 rounded-none w-1/3"></div>
          <div className="h-4 bg-slate-200 rounded-none w-1/4"></div>
          <div className="h-4 bg-slate-200 rounded-none w-1/6"></div>
        </div>
      ))}
    </div>
  </div>
);

export default {
  SkeletonCard,
  SkeletonTable,
};

