const express = require('express');
const { db } = require('../firebase');
const router = express.Router();

// Helper to populate volunteer
const populateVolunteer = async (docData) => {
  if (!docData.volunteerId) return docData;
  try {
    const volDoc = await db.collection('users').doc(docData.volunteerId).get();
    if (volDoc.exists) {
      const { name, profilePhoto, location, interests, age, badges } = volDoc.data();
      return { ...docData, volunteerId: { _id: volDoc.id, name, profilePhoto, location, interests, age, badges } };
    }
  } catch (err) {
    console.error('Error populating volunteer:', err);
  }
  return docData;
};

// Helper to populate program
const populateProgram = async (docData) => {
  if (!docData.programId) return docData;
  try {
    const progDoc = await db.collection('programs').doc(docData.programId).get();
    if (progDoc.exists) {
      const { title, status, hours } = progDoc.data();
      return { ...docData, programId: { _id: progDoc.id, title, status, hours } };
    }
  } catch (err) {
    console.error('Error populating program:', err);
  }
  return docData;
};

// Helper to populate NGO
const populateNgo = async (docData) => {
  if (!docData.ngoId) return docData;
  try {
    const ngoDoc = await db.collection('users').doc(docData.ngoId).get();
    if (ngoDoc.exists) {
      const { name, domain, profilePhoto } = ngoDoc.data();
      return { ...docData, ngoId: { _id: ngoDoc.id, name, domain, profilePhoto } };
    }
  } catch (err) {
    console.error('Error populating NGO:', err);
  }
  return docData;
};

// @route   POST /api/applications
// @desc    Volunteer applies to a program
router.post('/', async (req, res) => {
  try {
    const { programId, ngoId, volunteerId, roleApplied } = req.body;
    
    if (!programId || !ngoId || !volunteerId || !roleApplied) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if already applied
    const existingSnap = await db.collection('applications')
      .where('programId', '==', programId)
      .where('volunteerId', '==', volunteerId)
      .get();
      
    if (!existingSnap.empty) {
      return res.status(400).json({ message: 'You have already applied for this program' });
    }

    const newApp = {
      programId,
      ngoId,
      volunteerId,
      roleApplied,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('applications').add(newApp);
    res.status(201).json({ ...newApp, _id: docRef.id });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/applications/ngo/:ngoId
// @desc    NGO fetches applications for their programs
router.get('/ngo/:ngoId', async (req, res) => {
  try {
    const { ngoId } = req.params;
    
    const snapshot = await db.collection('applications').where('ngoId', '==', ngoId).get();
    const applications = [];
    
    for (const doc of snapshot.docs) {
      let app = doc.data();
      app._id = doc.id;
      app = await populateVolunteer(app);
      app = await populateProgram(app);
      applications.push(app);
    }
    
    applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/applications/:id/status
// @desc    NGO updates application status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Approved' or 'Rejected'
    
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const appRef = db.collection('applications').doc(id);
    const doc = await appRef.get();
    if (!doc.exists) return res.status(404).json({ message: 'Application not found' });
    
    await appRef.update({ status });
    const updatedDoc = await appRef.get();
    
    res.status(200).json({ ...updatedDoc.data(), _id: updatedDoc.id });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/applications/volunteer/public/:gcId
// @desc    Fetch public volunteer profile (hide sensitive info)
router.get('/volunteer/public/:gcId', async (req, res) => {
  try {
    const { gcId } = req.params;
    const doc = await db.collection('users').doc(gcId).get();
      
    if (!doc.exists) return res.status(404).json({ message: 'Volunteer not found' });
    
    const data = doc.data();
    const volunteer = {
      _id: doc.id,
      name: data.name,
      profilePhoto: data.profilePhoto,
      location: data.location,
      interests: data.interests,
      age: data.age
    };
    
    res.status(200).json(volunteer);
  } catch (error) {
    console.error('Error fetching volunteer public profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/applications/volunteer/:volunteerId
// @desc    Get all applications for a volunteer
router.get('/volunteer/:volunteerId', async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const snapshot = await db.collection('applications').where('volunteerId', '==', volunteerId).get();
    
    const applications = [];
    for (const doc of snapshot.docs) {
      let app = doc.data();
      app._id = doc.id;
      app = await populateProgram(app);
      app = await populateNgo(app);
      applications.push(app);
    }
    
    applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching volunteer applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
