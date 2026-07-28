const express = require('express');
const { db } = require('../server');
const router = express.Router();

// Helper to populate NGO details for a program
const populateNgo = async (programData) => {
  if (!programData.ngoId) return programData;
  try {
    const ngoDoc = await db.collection('users').doc(programData.ngoId).get();
    if (ngoDoc.exists) {
      const { name, domain, location, profilePhoto, headquarters, about } = ngoDoc.data();
      return { ...programData, ngoId: { _id: ngoDoc.id, name, domain, location, profilePhoto, headquarters, about } };
    }
  } catch (err) {
    console.error('Error populating NGO for program:', err);
  }
  return programData;
};

// @route   POST /api/programs
// @desc    NGO broadcasts a new program/need
router.post('/', async (req, res) => {
  try {
    const { ngoId, title, description, rolesNeeded, location } = req.body;
    
    if (!ngoId || !title || !description || !rolesNeeded || !location) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newProgram = {
      ngoId,
      title,
      description,
      rolesNeeded,
      location,
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('programs').add(newProgram);
    res.status(201).json({ ...newProgram, _id: docRef.id });
  } catch (error) {
    console.error('Error creating program:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/programs
// @desc    Get all active programs (for volunteers)
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('programs').where('status', '==', 'Active').get();
    const programs = [];
    
    for (const doc of snapshot.docs) {
      let p = doc.data();
      p._id = doc.id;
      p = await populateNgo(p);
      
      const appsSnap = await db.collection('applications')
        .where('programId', '==', p._id)
        .where('status', '==', 'Approved')
        .get();
      p.volunteerCount = appsSnap.size;
      
      programs.push(p);
    }
    
    programs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json(programs);
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/programs/ngo/:ngoId
// @desc    Get all programs for a specific NGO
router.get('/ngo/:ngoId', async (req, res) => {
  try {
    const { ngoId } = req.params;
    const snapshot = await db.collection('programs').where('ngoId', '==', ngoId).get();
    const programs = [];
    
    for (const doc of snapshot.docs) {
      let p = doc.data();
      p._id = doc.id;
      
      const appsSnap = await db.collection('applications')
        .where('programId', '==', p._id)
        .where('status', '==', 'Approved')
        .get();
      p.volunteerCount = appsSnap.size;
      
      programs.push(p);
    }
    
    programs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json(programs);
  } catch (error) {
    console.error('Error fetching NGO programs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/programs/:id/end
// @desc    NGO ends a program and logs hours and attendance
router.put('/:id/end', async (req, res) => {
  try {
    const { id } = req.params;
    const { hours, attendanceData } = req.body;
    
    if (hours === undefined || isNaN(hours) || hours <= 0) {
      return res.status(400).json({ message: 'Valid hours are required to end a campaign' });
    }

    const progRef = db.collection('programs').doc(id);
    await progRef.update({ status: 'Completed', hours: Number(hours) });
    const updatedDoc = await progRef.get();
    
    if (!updatedDoc.exists) return res.status(404).json({ message: 'Program not found' });
    const program = updatedDoc.data();
    
    // Process attendance if provided
    if (attendanceData && Array.isArray(attendanceData)) {
      for (const att of attendanceData) {
        await db.collection('applications').doc(att.applicationId).update({
          attendance: att.status
        });
        
        // Notify absent volunteers
        if (att.status === 'Absent') {
          const newMsg = {
            senderId: program.ngoId,
            receiverId: att.volunteerId,
            content: `Attendance Update: You have been marked absent for the volunteer program "${program.title}". No hours have been credited for this session. If you believe this is an error, please contact the hosting NGO.`,
            createdAt: new Date().toISOString(),
            read: false
          };
          await db.collection('messages').add(newMsg);
        }
      }
    }
    
    res.status(200).json({ ...program, _id: updatedDoc.id });
  } catch (error) {
    console.error('Error ending program:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/programs/:id
// @desc    Delete a program
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('programs').doc(id).delete();
    res.status(200).json({ message: 'Program deleted successfully' });
  } catch (error) {
    console.error('Error deleting program:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
