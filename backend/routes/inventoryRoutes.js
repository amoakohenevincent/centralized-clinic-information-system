const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');

// In-memory fallback if DB has no seed yet
let fallbackMedicines = [
  { id: 1, name: 'Paracetamol', price: 5, stock: 100 },
  { id: 2, name: 'Amoxicillin', price: 15, stock: 50 },
  { id: 3, name: 'Vitamin C', price: 10, stock: 8 },
];

// 1. View all medicines - INVENTORY
router.get('/', async (req, res) => {
  try {
    const meds = await Medicine.find({ isActive: true });
    if (meds && meds.length > 0) {
      return res.json(meds);
    }
  } catch (err) {
    // If Mongo fails or not populated, return fallback
  }
  return res.json(fallbackMedicines);
});

// 2. Check low stock - INVENTORY
router.get('/low-stock', async (req, res) => {
  try {
    const meds = await Medicine.find({
      isActive: true,
      $expr: { $lte: ['$currentStock', '$reorderLevel'] },
    });
    if (meds && meds.length > 0) {
      return res.json(meds);
    }
  } catch (err) {}
  const low = fallbackMedicines.filter((m) => m.stock < 10);
  return res.json(low);
});

// 3. Add new medicine - INVENTORY
router.post('/', async (req, res) => {
  try {
    const { name, price, stock, strength, form, category, code } = req.body;
    if (name) {
      const generatedCode = code || `MED-${name.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
      const med = await Medicine.create({
        code: generatedCode,
        name,
        strength: strength || '500mg',
        form: form || 'Tablet',
        category: category || 'General',
        currentStock: Number(stock) || 0,
        reorderLevel: 20,
        isActive: true,
      });
      return res.status(201).json(med);
    }
  } catch (err) {
    // fallback
  }

  const newMedicine = {
    id: fallbackMedicines.length + 1,
    name: req.body.name,
    price: req.body.price,
    stock: req.body.stock,
  };
  fallbackMedicines.push(newMedicine);
  res.status(201).json(newMedicine);
});

// 4. Delete medicine - INVENTORY
router.delete('/:id', async (req, res) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id);
  } catch (err) {}
  fallbackMedicines = fallbackMedicines.filter((m) => String(m.id) !== String(req.params.id));
  res.json({ message: 'Medicine deleted' });
});

module.exports = router;
