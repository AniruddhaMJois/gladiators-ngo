const express = require('express');
const router = express.Router();
const { db } = require('../firebase');

// Helper function to populate campaign details
const populateCampaign = async (docData) => {
  if (!docData.campaignId) return docData;
  try {
    const campaignDoc = await db.collection('programs').doc(docData.campaignId).get();
    if (campaignDoc.exists) {
      return { ...docData, campaignId: { _id: campaignDoc.id, title: campaignDoc.data().title } };
    }
  } catch (err) {
    console.error('Error populating campaign:', err);
  }
  return docData;
};

// 0. Finance Reports
router.post('/reports', async (req, res) => {
  try {
    const { ngoId, campaignId, title, rows, bills } = req.body;
    if (!ngoId || !title || !rows) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const totalAmount = rows.reduce((acc, row) => acc + Number(row.expense || 0), 0);
    
    const newReport = { 
      ngoId, 
      campaignId: campaignId || null, 
      title, 
      rows, 
      totalAmount, 
      bills,
      createdAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('finance_reports').add(newReport);
    res.status(201).json({ ...newReport, _id: docRef.id });
  } catch (error) {
    console.error('Error generating finance report:', error);
    res.status(500).json({ error: 'Error generating finance report' });
  }
});

router.get('/reports/:ngoId', async (req, res) => {
  try {
    const snapshot = await db.collection('finance_reports').where('ngoId', '==', req.params.ngoId).get();
    const reports = [];
    for (const doc of snapshot.docs) {
      let data = doc.data();
      data._id = doc.id;
      data = await populateCampaign(data);
      reports.push(data);
    }
    
    reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(reports);
  } catch (error) {
    console.error('Error fetching finance reports:', error);
    res.status(500).json({ error: 'Error fetching finance reports' });
  }
});

router.delete('/reports/:id', async (req, res) => {
  try {
    await db.collection('finance_reports').doc(req.params.id).delete();
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'Error deleting report' });
  }
});

router.put('/reports/:id', async (req, res) => {
  try {
    const { title, campaignId, rows, totalAmount, bills } = req.body;
    const reportRef = db.collection('finance_reports').doc(req.params.id);
    
    await reportRef.update({ title, campaignId, rows, totalAmount, bills });
    const updatedDoc = await reportRef.get();
    
    res.json({ ...updatedDoc.data(), _id: updatedDoc.id });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ error: 'Error updating report' });
  }
});

// 1. Campaigns
router.post('/campaigns', async (req, res) => {
  try {
    const { ngoId, title, description, targetAmount, endDate } = req.body;
    if (!ngoId) return res.status(400).json({ error: 'ngoId is required' });
    
    const newCampaign = { 
      ngoId, 
      title, 
      description, 
      targetAmount, 
      endDate,
      status: 'Active',
      raisedAmount: 0,
      hasFinanceReport: false,
      createdAt: new Date().toISOString()
    };
    const docRef = await db.collection('programs').add(newCampaign);
    res.status(201).json({ ...newCampaign, _id: docRef.id });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Error creating campaign' });
  }
});

router.get('/campaigns/:ngoId', async (req, res) => {
  try {
    const snapshot = await db.collection('programs').where('ngoId', '==', req.params.ngoId).get();
    const campaigns = [];
    snapshot.forEach(doc => campaigns.push({ ...doc.data(), _id: doc.id }));
    campaigns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Error fetching campaigns' });
  }
});

// Complete a campaign
router.put('/campaigns/:id/complete', async (req, res) => {
  try {
    const campaignRef = db.collection('programs').doc(req.params.id);
    await campaignRef.update({ status: 'Completed' });
    const updatedDoc = await campaignRef.get();
    res.json({ ...updatedDoc.data(), _id: updatedDoc.id });
  } catch (error) {
    console.error('Error completing campaign:', error);
    res.status(500).json({ error: 'Error completing campaign' });
  }
});

// Generate/submit a finance report for a campaign
router.post('/campaigns/:id/report', async (req, res) => {
  try {
    const { reportUrl } = req.body;
    const campaignRef = db.collection('programs').doc(req.params.id);
    await campaignRef.update({ 
      hasFinanceReport: true, 
      financeReportUrl: reportUrl || 'generated_report.pdf' 
    });
    const updatedDoc = await campaignRef.get();
    res.json({ ...updatedDoc.data(), _id: updatedDoc.id });
  } catch (error) {
    console.error('Error generating finance report:', error);
    res.status(500).json({ error: 'Error generating finance report' });
  }
});

// Get campaigns pending finance report
router.get('/campaigns/:ngoId/pending-reports', async (req, res) => {
  try {
    const snapshot = await db.collection('programs')
      .where('ngoId', '==', req.params.ngoId)
      .where('status', '==', 'Completed')
      .where('hasFinanceReport', '==', false)
      .get();
      
    const campaigns = [];
    snapshot.forEach(doc => campaigns.push({ ...doc.data(), _id: doc.id }));
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching pending reports:', error);
    res.status(500).json({ error: 'Error fetching pending reports' });
  }
});

// 2. Donations
router.post('/donations', async (req, res) => {
  try {
    const { ngoId, donorId, campaignId, amount, donorName } = req.body;
    if (!ngoId || !donorId || !amount) return res.status(400).json({ error: 'Missing required fields' });
    
    const newDonation = { 
      ngoId, 
      donorId, 
      campaignId, 
      amount, 
      donorName,
      createdAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('donations').add(newDonation);
    
    if (campaignId) {
      const campaignRef = db.collection('programs').doc(campaignId);
      const campaignDoc = await campaignRef.get();
      if (campaignDoc.exists) {
        await campaignRef.update({ raisedAmount: (campaignDoc.data().raisedAmount || 0) + Number(amount) });
      }
    }
    
    res.status(201).json({ ...newDonation, _id: docRef.id });
  } catch (error) {
    console.error('Error logging donation:', error);
    res.status(500).json({ error: 'Error logging donation' });
  }
});

router.get('/donations/:ngoId', async (req, res) => {
  try {
    const snapshot = await db.collection('donations').where('ngoId', '==', req.params.ngoId).get();
    const donations = [];
    snapshot.forEach(doc => donations.push({ ...doc.data(), _id: doc.id }));
    donations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(donations);
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ error: 'Error fetching donations' });
  }
});

// 3. Expenses
router.post('/expenses', async (req, res) => {
  try {
    const { ngoId, campaignId, title, amountSpent, category, description, proofUrl } = req.body;
    if (!ngoId || !title || !amountSpent || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newExpense = { 
      ngoId, 
      campaignId, 
      title, 
      amountSpent, 
      category, 
      description, 
      proofUrl,
      createdAt: new Date().toISOString()
    };
    const docRef = await db.collection('expense_logs').add(newExpense);
    res.status(201).json({ ...newExpense, _id: docRef.id });
  } catch (error) {
    console.error('Error logging expense:', error);
    res.status(500).json({ error: 'Error logging expense' });
  }
});

router.get('/expenses/:ngoId', async (req, res) => {
  try {
    const snapshot = await db.collection('expense_logs').where('ngoId', '==', req.params.ngoId).get();
    const expenses = [];
    for (const doc of snapshot.docs) {
      let data = doc.data();
      data._id = doc.id;
      data = await populateCampaign(data);
      expenses.push(data);
    }
    expenses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Error fetching expenses' });
  }
});

module.exports = router;
