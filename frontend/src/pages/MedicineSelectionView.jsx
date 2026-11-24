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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 inline-block mb-1">
            Pharmacy Inventory Catalogue
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Shared Pharmacy Medicine Catalogue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time medicine inventory synchronized from Pharmacy & Inventory Management.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => onNavigate('dashboard')}>
            Dashboard
          </Button>
          <Button variant="primary" size="sm" onClick={() => onNavigate('create')}>
            Create Prescription
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by medicine name, active ingredient, or product code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white font-semibold text-slate-700 focus:ring-2 focus:ring-teal-600"
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
                className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-600 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                        {med.code}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">{med.name}</h4>
                      <p className="text-xs text-slate-500">{med.genericName}</p>
                    </div>

                    {isOutOfStock ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white">
                        Stock-Out
                      </span>
                    ) : isLowStock ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                        Low Stock
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                        Available
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Strength</span>
                      <span className="font-semibold text-slate-800">{med.strength}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Dosage Form</span>
                      <span className="font-semibold text-slate-800">{med.form}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Category</span>
                      <span className="text-slate-700">{med.category}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Pharmacy Stock</span>
                      <span
                        className={`font-bold ${
                          isOutOfStock
                            ? 'text-slate-900'
                            : isLowStock
                            ? 'text-slate-800'
                            : 'text-teal-800'
                        }`}
                      >
                        {med.currentStock} {med.unitOfMeasure}s
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                  {med.isControlled && (
                    <span className="text-[10px] font-bold text-slate-900">
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

export default MedicineSelectionView;
