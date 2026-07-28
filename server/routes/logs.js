const express = require('express');
const { db } = require('../firebase');
const router = express.Router();

// Get all logs for an NGO
router.get('/ngo/:id', async (req, res) => {
  try {
    const snapshot = await db.collection('logs').where('ngoId', '==', req.params.id).get();
    const logs = [];
    snapshot.forEach(doc => logs.push({ ...doc.data(), _id: doc.id }));
    logs.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    res.json(logs);
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create a new log
router.post('/', async (req, res) => {
  try {
    const newLog = {
      ...req.body,
      date: req.body.date || new Date().toISOString()
    };
    const docRef = await db.collection('logs').add(newLog);
    res.status(201).json({ ...newLog, _id: docRef.id });
  } catch (err) {
    console.error('Error creating log:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update an existing log
router.put('/:id', async (req, res) => {
  try {
    const logRef = db.collection('logs').doc(req.params.id);
    await logRef.update(req.body);
    const updatedDoc = await logRef.get();
    res.json({ ...updatedDoc.data(), _id: updatedDoc.id });
  } catch (err) {
    console.error('Error updating log:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a log
router.delete('/:id', async (req, res) => {
  try {
    await db.collection('logs').doc(req.params.id).delete();
    res.json({ message: 'Log deleted successfully' });
  } catch (err) {
    console.error('Error deleting log:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
