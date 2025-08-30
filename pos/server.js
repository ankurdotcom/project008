const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 9090;

// Serve static files
app.use(express.static(__dirname));

// API endpoint for items (future expansion)
app.get('/api/items', (req, res) => {
    const items = [
        { id: '1', name: 'Apple', price: 2.50, category: 'Fruits', unit: 'kg', stock: 100 },
        { id: '2', name: 'Bread', price: 3.00, category: 'Bakery', unit: 'loaf', stock: 50 },
        { id: '3', name: 'Milk', price: 4.50, category: 'Dairy', unit: 'liter', stock: 30 },
        { id: '4', name: 'Banana', price: 1.20, category: 'Fruits', unit: 'kg', stock: 80 },
        { id: '5', name: 'Cheese', price: 5.00, category: 'Dairy', unit: 'kg', stock: 25 },
        { id: '6', name: 'Orange', price: 3.50, category: 'Fruits', unit: 'kg', stock: 60 },
        { id: '7', name: 'Yogurt', price: 2.00, category: 'Dairy', unit: 'cup', stock: 40 },
        { id: '8', name: 'Croissant', price: 1.50, category: 'Bakery', unit: 'piece', stock: 35 }
    ];
    res.json(items);
});

// Serve main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'web-simple.html'));
});

app.listen(PORT, () => {
    console.log(`🛒 Grocery POS Server running on http://localhost:${PORT}`);
    console.log(`📱 Access the POS system at: http://localhost:${PORT}`);
});
