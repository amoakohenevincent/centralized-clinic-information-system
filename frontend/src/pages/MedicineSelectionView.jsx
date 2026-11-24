import React, { useState, useEffect } from 'react';
import { Button } from '../components/common/Button';
import { prescriptionService } from '../services/prescriptionService';

export const MedicineSelectionView = ({ onNavigate, onSelectForPrescription }) => {
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    prescriptionService.getMedicineCatalogue().then((data) => {
      setMedicines(data);
      setLoading(false);
    });
  }, []);

  const categories = ['All', ...new Set(medicines.map((m) => m.category))];

  const filtered = medicines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || m.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200/80 mb-2">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span>Pharmacy Inventory Catalogue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Shared Pharmacy Medicine Catalogue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time medicine inventory synchronized from Pharmacy & Inventory Management.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => onNavigate('dashboard')}>
            Dashboard
          </Button>
          <Button variant="primary" size="sm" onClick={() => onNavigate('create')}>
            + Create Prescription
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by medicine name, active ingredient, or product code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20"
          />
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium text-slate-700 focus:ring-2 focus:ring-teal-500"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              Category: {c}
            </option>
          ))}
        </select>
      </div>

      {/* Catalogue Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading catalogue...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((med) => {
            const isOutOfStock = med.currentStock <= 0;
            const isLowStock = med.currentStock > 0 && med.currentStock <= med.reorderLevel;

            return (
              <div
                key={med._id}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card hover:border-teal-200 hover:shadow-floating transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase">
                        {med.code}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">{med.name}</h4>
                      <p className="text-xs text-slate-500">{med.genericName}</p>
                    </div>

                    {isOutOfStock ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800">
                        Stock-Out
                      </span>
                    ) : isLowStock ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                        Low Stock
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        Available
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Strength</span>
                      <span className="font-semibold text-slate-800">{med.strength}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Dosage Form</span>
                      <span className="font-semibold text-slate-800">{med.form}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Category</span>
                      <span className="text-slate-700">{med.category}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Pharmacy Stock</span>
                      <span
                        className={`font-bold ${
                          isOutOfStock
                            ? 'text-rose-600'
                            : isLowStock
                            ? 'text-amber-600'
                            : 'text-emerald-700'
                        }`}
                      >
                        {med.currentStock} {med.unitOfMeasure}s
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  {med.isControlled && (
                    <span className="text-[10px] font-semibold text-rose-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Controlled Rx
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant={isOutOfStock ? 'secondary' : 'outline'}
                    disabled={isOutOfStock}
                    onClick={() => {
                      if (onSelectForPrescription) {
                        onSelectForPrescription(med);
                      }
                      onNavigate('create');
                    }}
                    className="ml-auto"
                  >
                    {isOutOfStock ? 'Out of Stock' : 'Prescribe Medicine'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
