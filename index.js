
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const routes = require('./routes/api');
const productRoutes = require('./routes/productRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const customerRoutes = require('./routes/customerRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productionRoutes = require('./routes/productionRoutes');
const reportRoutes = require('./routes/reportRoutes');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
    );

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

// MongoDB connection
mongoose.connect(process.env.MONGO_DB_URI)
    .then(() => console.log('Database connected successfully'))
    .catch(err => console.log('Database error:', err));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        message: 'SmartBiz ERP Backend is running!'
    });
});

// API routes
app.use('/api/products', productRoutes);
app.use('/api', routes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/reports', reportRoutes);

// Serve React frontend
const frontendPath = path.join(__dirname, 'client', 'dist');

app.use(express.static(frontendPath));

// React Router fallback
app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/')) {
        return res.sendFile(
            path.join(frontendPath, 'index.html'),
            (err) => {
                if (err) next(err);
            }
        );
    }

    next();
});

// 404 handler for unknown API routes
app.use('/api', (req, res) => {
    res.status(404).json({
        message: 'API endpoint not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        message: 'Internal Server Error'
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
