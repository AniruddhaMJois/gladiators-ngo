const express = require('express');
const router = express.Router();
const { db } = require('../firebase');

// Search NGOs (Charity Search Engine)
router.get('/ngos/search', async (req, res) => {
  try {
    const { location, domain } = req.query;
    
    // Fetch all NGOs from Firestore
    const snapshot = await db.collection('users').where('role', '==', 'ngo').get();
    
    let ngos = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // Select only public/non-sensitive fields
      const publicData = {
        _id: doc.id,
        gcId: doc.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        profilePhoto: data.profilePhoto,
        ngoDarpanId: data.ngoDarpanId,
        headquarters: data.headquarters,
        website: data.website,
        domain: data.domain,
        about: data.about,
        mediaGallery: data.mediaGallery,
        pocName: data.pocName,
        pocDesignation: data.pocDesignation,
        createdAt: data.createdAt
      };
      ngos.push(publicData);
    });

    // In-memory filter for location and domain (simulating RegExp)
    if (location) {
      const locRegex = new RegExp(location, 'i');
      ngos = ngos.filter(ngo => ngo.headquarters && locRegex.test(ngo.headquarters));
    }
    
    if (domain) {
      const domRegex = new RegExp(domain, 'i');
      ngos = ngos.filter(ngo => ngo.domain && domRegex.test(ngo.domain));
    }

    // Sort by createdAt descending
    ngos.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    });

    res.json(ngos);
  } catch (error) {
    console.error('Error searching NGOs:', error);
    res.status(500).json({ error: 'Server error while searching NGOs' });
  }
});

// Get True Impact Stats for NGO
router.get('/ngos/:ngoId/stats', async (req, res) => {
  try {
    const { ngoId } = req.params;
    
    // Count Volunteers (Approved Applications)
    const appsSnapshot = await db.collection('applications')
      .where('ngoId', '==', ngoId)
      .where('status', '==', 'Approved')
      .get();
    const volunteers = appsSnapshot.size;
    
    // Active Campaigns
    const activeSnapshot = await db.collection('programs')
      .where('ngoId', '==', ngoId)
      .where('status', '==', 'Active')
      .get();
    const activeCampaigns = activeSnapshot.size;
    
    // Completed Campaigns
    const completedSnapshot = await db.collection('programs')
      .where('ngoId', '==', ngoId)
      .where('status', '==', 'Completed')
      .get();
      
    // Cancelled Campaigns
    const cancelledSnapshot = await db.collection('programs')
      .where('ngoId', '==', ngoId)
      .where('status', '==', 'Cancelled')
      .get();
      
    const endedCampaigns = completedSnapshot.size + cancelledSnapshot.size;
    const campaigns = activeCampaigns + endedCampaigns;
    
    // Calculate Hours from completed programs
    let hours = 0;
    completedSnapshot.forEach(doc => {
      const prog = doc.data();
      hours += (prog.hours || 0);
    });
    
    res.json({ volunteers, campaigns, activeCampaigns, endedCampaigns, hours });
  } catch (error) {
    console.error('Error fetching NGO stats:', error);
    res.status(500).json({ error: 'Server error while fetching NGO stats' });
  }
});

module.exports = router;
