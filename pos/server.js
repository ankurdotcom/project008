const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 9090;

// Security middleware
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

// Apply security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "http://localhost:9090"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// CORS configuration
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);

        // Allow localhost for development
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
        }

        // Reject other origins
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// In-memory storage for sales data (persisted to file)
let sales = [];
const SALES_FILE = path.join(__dirname, 'sales.json');

// Load sales data from file on startup
try {
    if (fs.existsSync(SALES_FILE)) {
        const data = fs.readFileSync(SALES_FILE, 'utf8');
        sales = JSON.parse(data);
        console.log(`📊 Loaded ${sales.length} sales records from storage`);
    }
} catch (error) {
    console.log('⚠️  Could not load sales data, starting fresh');
    sales = [];
}

// Save sales data to file
function saveSalesData() {
    try {
        fs.writeFileSync(SALES_FILE, JSON.stringify(sales, null, 2));
    } catch (error) {
        console.error('❌ Error saving sales data:', error);
    }
}

// Input validation and sanitization functions
const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 254 && email.length >= 5;
};

const sanitizeInput = (input) => {
    if (typeof input !== 'string') return '';
    return input.replace(/[<>]/g, '').trim();
};

const validateNumeric = (value, min = 0, max = 999999) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max && isFinite(num);
};

const validateSaleData = (data) => {
    if (!data || typeof data !== 'object') {
        return { valid: false, error: 'Invalid data format' };
    }

    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
        return { valid: false, error: 'Items array is required and cannot be empty' };
    }

    if (!validateNumeric(data.total, 0.01, 999999)) {
        return { valid: false, error: 'Invalid total amount' };
    }

    if (!validateNumeric(data.cashAmount, 0.01, 999999)) {
        return { valid: false, error: 'Invalid cash amount' };
    }

    // Validate each item
    for (const item of data.items) {
        if (!item.id || !item.name || !validateNumeric(item.price, 0.01, 99999) || !validateNumeric(item.quantity, 1, 999)) {
            return { valid: false, error: 'Invalid item data' };
        }
    }

    return { valid: true };
};

// Security logging
const logSecurityEvent = (event, details) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        event: event,
        details: details,
        ip: '', // Will be set by middleware
        userAgent: '' // Will be set by middleware
    };
    console.log('SECURITY_EVENT:', JSON.stringify(logEntry));
};

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - IP: ${req.ip}`);
    });
    next();
});

// API endpoint for items
app.get('/api/items', (req, res) => {
    res.json(items);
});

// Favicon handler
app.get('/favicon.ico', (req, res) => {
    res.status(204).end(); // No content response for favicon
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API endpoint for login
app.post('/api/login', (req, res) => {
    try {
        const { email } = req.body;

        // Security: Validate email format
        if (!validateEmail(email)) {
            logSecurityEvent('INVALID_LOGIN_EMAIL', {
                email: email,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Security: Sanitize input
        const sanitizedEmail = sanitizeInput(email);

        // Simple user database (in production, this would be a real database)
        const users = [
            { email: 'owner@grocery.com', role: 'owner', isInitial: true },
            { email: 'sales@grocery.com', role: 'sales', isInitial: false }
        ];

        const user = users.find(u => u.email.toLowerCase() === sanitizedEmail.toLowerCase());

        if (!user) {
            logSecurityEvent('LOGIN_FAILED_USER_NOT_FOUND', {
                email: sanitizedEmail,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            return res.status(401).json({
                success: false,
                message: 'User not found. Please contact the owner to register your account.'
            });
        }

        // Log successful login
        logSecurityEvent('LOGIN_SUCCESSFUL', {
            email: sanitizedEmail,
            role: user.role,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            role: user.role,
            email: sanitizedEmail,
            message: `Welcome ${user.role === 'owner' ? 'Owner' : 'Sales Person'}`
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        logSecurityEvent('LOGIN_ERROR', {
            error: error.message,
            ip: req.ip
        });
        res.status(500).json({
            success: false,
            message: 'Login failed due to server error'
        });
    }
});

// API endpoint to record a sale
app.post('/api/sales', (req, res) => {
    try {
        const saleData = req.body;

        // Security: Validate sale data
        const validation = validateSaleData(saleData);
        if (!validation.valid) {
            logSecurityEvent('INVALID_SALE_DATA', {
                error: validation.error,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            return res.status(400).json({
                success: false,
                error: validation.error
            });
        }

        // Security: Sanitize item names
        const sanitizedItems = saleData.items.map(item => ({
            id: item.id,
            name: sanitizeInput(item.name),
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity
        }));

        // Create sale record with additional security fields
        const sale = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            items: sanitizedItems,
            subtotal: saleData.subtotal || 0,
            total: saleData.total,
            cashAmount: saleData.cashAmount,
            change: saleData.change || 0,
            paymentMethod: saleData.paymentMethod || 'cash',
            processedBy: saleData.processedBy || 'unknown',
            userRole: saleData.userRole || 'unknown',
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        };

        // Security: Validate final calculations
        const calculatedTotal = sanitizedItems.reduce((sum, item) => sum + item.total, 0);
        if (Math.abs(calculatedTotal - sale.total) > 0.01) {
            logSecurityEvent('CALCULATION_MISMATCH', {
                expected: calculatedTotal,
                received: sale.total,
                ip: req.ip
            });
            return res.status(400).json({
                success: false,
                error: 'Calculation mismatch detected'
            });
        }

        // Add to sales array
        sales.push(sale);

        // Save to file
        saveSalesData();

        console.log(`💰 Sale recorded: $${sale.total.toFixed(2)} - ${sale.items.length} items - User: ${sale.processedBy}`);
        logSecurityEvent('SALE_RECORDED', {
            amount: sale.total,
            items: sale.items.length,
            processedBy: sale.processedBy,
            ip: req.ip
        });

        res.json({
            success: true,
            sale: {
                id: sale.id,
                total: sale.total,
                items: sale.items.length,
                timestamp: sale.timestamp
            },
            message: 'Sale recorded successfully'
        });

    } catch (error) {
        console.error('❌ Error recording sale:', error);
        logSecurityEvent('SALE_ERROR', {
            error: error.message,
            ip: req.ip
        });
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// API endpoint to get all sales
app.get('/api/sales', (req, res) => {
    try {
        res.json({
            sales: sales,
            totalSales: sales.length,
            totalRevenue: sales.reduce((sum, sale) => sum + sale.total, 0)
        });
    } catch (error) {
        console.error('❌ Error retrieving sales:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint to get sales statistics
app.get('/api/sales/stats', (req, res) => {
    try {
        const totalSales = sales.length;
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
        const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

        // Get today's sales
        const today = new Date().toISOString().split('T')[0];
        const todaySales = sales.filter(sale =>
            sale.timestamp.startsWith(today)
        );
        const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);

        // Get top selling items
        const itemSales = {};
        sales.forEach(sale => {
            sale.items.forEach(item => {
                if (!itemSales[item.name]) {
                    itemSales[item.name] = { quantity: 0, revenue: 0 };
                }
                itemSales[item.name].quantity += item.quantity;
                itemSales[item.name].revenue += item.price * item.quantity;
            });
        });

        const topItems = Object.entries(itemSales)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        res.json({
            totalSales,
            totalRevenue,
            averageSale,
            todaySales: todaySales.length,
            todayRevenue,
            topItems
        });

    } catch (error) {
        console.error('❌ Error retrieving sales stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint to clear all sales (for testing)
app.delete('/api/sales', (req, res) => {
    try {
        sales = [];
        saveSalesData();
        console.log('🗑️  All sales data cleared');
        res.json({ success: true, message: 'All sales data cleared' });
    } catch (error) {
        console.error('❌ Error clearing sales:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'web-simple.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    logSecurityEvent('UNHANDLED_ERROR', {
        error: err.message,
        stack: err.stack,
        ip: req.ip,
        url: req.url
    });

    // Don't leak error details to client
    res.status(500).json({
        success: false,
        message: 'An internal server error occurred'
    });
});

// 404 handler
app.use((req, res) => {
    logSecurityEvent('PAGE_NOT_FOUND', {
        url: req.url,
        method: req.method,
        ip: req.ip
    });
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

app.listen(PORT, () => {
    console.log(`🛒 Grocery POS Server running on http://localhost:${PORT}`);
    console.log(`📱 Access the POS system at: http://localhost:${PORT}`);
    console.log(`📊 Sales data will be stored in: ${SALES_FILE}`);
    console.log(`🔒 Security measures: Helmet, Rate limiting, CORS, Input validation enabled`);
});
