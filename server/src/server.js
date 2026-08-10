const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const favoriteRoutes = require('./routes/favorite.routes');
app.use('/api/favorites', favoriteRoutes);

const searchRoutes = require('./routes/search.routes');
app.use('/api/search', searchRoutes);

const fakeAuth = require('./middleware/fakeAuth');
const searchController = require('./controllers/search.controller');
app.get('/api/dashboard/buyer', fakeAuth, searchController.getBuyerDashboard);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });