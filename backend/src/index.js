const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS properly configured to allow both localhost and your Azure VM Public IP
app.use(cors({
    origin: ['http://localhost:3000', 'http://20.204.15.77:3000'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const leaveRoutes = require('./routes/leave');
const complaintRoutes = require('./routes/complaints');
const announcementRoutes = require('./routes/announcements');
const notificationRoutes = require('./routes/notifications');
const reportRoutes = require('./routes/reports');
const auditRoutes = require('./routes/audit');
const taskRoutes = require('./routes/tasks');
const privilegeRoutes = require('./routes/privileges');
const departmentRoutes = require('./routes/departments');
const profileRoutes = require('./routes/profile');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/privileges', privilegeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/profile', profileRoutes);

// Health check
app.get('/', (req, res) => {
    res.json({
        message: 'Pradeshiya Sabha Staff Management API',
        status: 'Running',
        time: new Date().toISOString()
    });
});

const initNotificationCleanup = require('./services/cleanup');

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});