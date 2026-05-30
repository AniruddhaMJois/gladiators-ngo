require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const chatRoutes = require('./routes/chat');
const programRoutes = require('./routes/programs');
const applicationRoutes = require('./routes/applications');
const logRoutes = require('./routes/logs');
const financeRoutes = require('./routes/finance');
const userRoutes = require('./routes/users');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/users', userRoutes);

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gladiators';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
