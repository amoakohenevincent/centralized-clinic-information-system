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
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            placeholder="Search by generic, brand name, or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Live Catalogue Table */}
        <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-96 overflow-y-auto">
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
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Medicine & Generic</th>
                  <th className="px-4 py-3">Strength & Form</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Availability</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((med) => {
                  const isOutOfStock = med.currentStock <= 0;
                  const isLowStock = med.currentStock > 0 && med.currentStock <= med.reorderLevel;

                  return (
                    <tr key={med._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{med.name}</div>
                        <div className="text-slate-500 text-[11px]">
                          {med.genericName} • <span className="font-mono text-slate-600">{med.code}</span>
                        </div>
                        {med.isControlled && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 text-[10px] font-bold bg-slate-900 text-white rounded">
                            Controlled
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
                          <span className="text-slate-900 font-bold text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                            Out of Stock (0)
                          </span>
                        ) : isLowStock ? (
                          <span className="text-slate-800 font-bold text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                            Low Stock ({med.currentStock})
                          </span>
                        ) : (
                          <span className="text-teal-800 font-bold text-[11px] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
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
export default MedicineSelectorModal;
