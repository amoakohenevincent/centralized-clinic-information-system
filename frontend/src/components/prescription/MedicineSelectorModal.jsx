import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { prescriptionService } from '../../services/prescriptionService';

export const MedicineSelectorModal = ({ isOpen, onClose, onSelectMedicine }) => {
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      prescriptionService.getMedicineCatalogue().then((data) => {
        setMedicines(data);
        setLoading(false);
      });
    }
  }, [isOpen]);

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Shared Pharmacy Medicine Catalogue"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by generic, brand name, or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Live Catalogue Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              Loading catalogue from Pharmacy & Inventory module...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No matching medicines found in pharmacy inventory.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Medicine & Generic</th>
                  <th className="px-4 py-3">Strength & Form</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Availability</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((med) => {
                  const isOutOfStock = med.currentStock <= 0;
                  const isLowStock = med.currentStock > 0 && med.currentStock <= med.reorderLevel;

                  return (
                    <tr key={med._id} className="hover:bg-teal-50/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{med.name}</div>
                        <div className="text-slate-500 text-[11px]">
                          {med.genericName} • <span className="font-mono text-slate-400">{med.code}</span>
                        </div>
                        {med.isControlled && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 text-[10px] font-semibold bg-rose-100 text-rose-800 rounded">
                            Controlled Substance
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-800">{med.strength}</span>
                        <div className="text-slate-500 text-[11px]">{med.form}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{med.category}</td>
                      <td className="px-4 py-3">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 text-rose-700 font-medium">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            Out of Stock (0)
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            Low Stock ({med.currentStock})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            In Stock ({med.currentStock})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isOutOfStock}
                          onClick={() => {
                            onSelectMedicine(med);
                            onClose();
                          }}
                        >
                          {isOutOfStock ? 'Unavailable' : 'Select'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
          <span>
            Showing {filtered.length} of {medicines.length} pharmacy items
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
