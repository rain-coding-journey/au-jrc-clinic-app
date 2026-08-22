const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const studentRoutes = require('./src/routes/StudentRoutes');
const visitRoutes = require('./src/routes/visitRoutes');

const app = express();

// Middleware(?)
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// Routes 
app.use('/api/v1/auth', authRoutes);
app.use('api/v1/students', studentRoutes);
app.use('api/v1/visits', visitRoutes);

// Health Check
app.get('/health', (req, res) => res.json ({ status: 'UP', campus: 'AU Jose Rizal' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});