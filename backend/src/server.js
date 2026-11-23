 const express = require('express');
const app = express();
app.use(express.json());

let medicines = [
  { id: 1, name: "Paracetamol", price: 5, stock: 100 },
  { id: 2, name: "Amoxicillin", price: 15, stock: 50 },
  { id: 3, name: "Vitamin C", price: 10, stock: 8 }
];

app.get('/', (req, res) => {
  res.send('CCIS Pharmacy is working!');
});

// 1. View all medicines - INVENTORY
app.get('/medicines', (req, res) => {
  res.json(medicines);
});

// 2. Add new medicine - INVENTORY
app.post('/medicines', (req, res) => {
  const newMedicine = {
    id: medicines.length + 1,
    name: req.body.name,
    price: req.body.price,
    stock: req.body.stock
  };
  medicines.push(newMedicine);
  res.json(newMedicine);
});

// 3. Check low stock - INVENTORY
app.get('/medicines/low-stock', (req, res) => {
  const low = medicines.filter(m => m.stock < 10);
  res.json(low);
});

// 4. Delete medicine - INVENTORY
app.delete('/medicines/:id', (req, res) => {
  medicines = medicines.filter(m => m.id != req.params.id);
  res.json({ message: "Medicine deleted" });
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});

