const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Atlas Connected Successfully! 🍃 Server ready.'))
  .catch((err) => console.error('MongoDB Connection Error ❌:', err));

// Test Route
app.get('/', (req, res) => {
  res.send('WallpaperHub Backend Server is Running with MongoDB! 🚀');
});

// Server Port Setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});