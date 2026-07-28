const express = require('express');
const { db } = require('../firebase');
const router = express.Router();

// @route   GET /api/chat/contacts/:userId
// @desc    Get all NGOs and anyone the user has chatted with
router.get('/contacts/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Find all messages involving this user
    // Firestore workaround for OR query
    const sentSnap = await db.collection('messages').where('senderId', '==', userId).get();
    const receivedSnap = await db.collection('messages').where('receiverId', '==', userId).get();
    
    const contactIds = new Set();
    sentSnap.forEach(doc => {
      const data = doc.data();
      if (data.receiverId) contactIds.add(data.receiverId);
    });
    
    receivedSnap.forEach(doc => {
      const data = doc.data();
      if (data.senderId) contactIds.add(data.senderId);
    });

    // Also include all NGOs so they are discoverable
    const allNgos = await db.collection('users').where('role', '==', 'ngo').get();
    allNgos.forEach(ngo => contactIds.add(ngo.id));

    // Ensure we don't return the user themselves
    contactIds.delete(userId);

    const contacts = [];
    const contactIdsArray = Array.from(contactIds);
    
    // Firestore 'in' queries are limited to 10, so we fetch individually or chunk
    for (const id of contactIdsArray) {
      const doc = await db.collection('users').doc(id).get();
      if (doc.exists) {
        const data = doc.data();
        contacts.push({
          _id: doc.id,
          gcId: doc.id,
          name: data.name,
          profilePhoto: data.profilePhoto,
          domain: data.domain,
          headquarters: data.headquarters,
          email: data.email,
          role: data.role
        });
      }
    }
    
    contacts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Server error fetching contacts.' });
  }
});

// @route   GET /api/chat/messages
// @desc    Get chat history between two users
// @query   senderId, receiverId
router.get('/messages', async (req, res) => {
  try {
    const { senderId, receiverId } = req.query;

    if (!senderId || !receiverId) {
      return res.status(400).json({ message: 'Both senderId and receiverId are required.' });
    }

    const snap1 = await db.collection('messages')
      .where('senderId', '==', senderId)
      .where('receiverId', '==', receiverId)
      .get();
      
    const snap2 = await db.collection('messages')
      .where('senderId', '==', receiverId)
      .where('receiverId', '==', senderId)
      .get();

    const messages = [];
    snap1.forEach(doc => messages.push({ ...doc.data(), _id: doc.id }));
    snap2.forEach(doc => messages.push({ ...doc.data(), _id: doc.id }));
    
    // Sort by createdAt ascending (Oldest first)
    messages.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error fetching messages.' });
  }
});

// @route   GET /api/chat/inbox/:userId
// @desc    Get all messages for a specific user
router.get('/inbox/:userId', async (req, res) => {
  try {
    const snapshot = await db.collection('messages').where('receiverId', '==', req.params.userId).get();
    
    const messages = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      let senderInfo = null;
      if (data.senderId) {
        const senderDoc = await db.collection('users').doc(data.senderId).get();
        if (senderDoc.exists) {
          senderInfo = { _id: senderDoc.id, name: senderDoc.data().name, profilePhoto: senderDoc.data().profilePhoto };
        }
      }
      messages.push({ ...data, _id: doc.id, senderId: senderInfo || data.senderId });
    }
    
    messages.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching inbox messages:', error);
    res.status(500).json({ message: 'Server error fetching inbox messages.' });
  }
});

// @route   PUT /api/chat/inbox/read/:userId
// @desc    Mark all messages for a user as read
router.put('/inbox/read/:userId', async (req, res) => {
  try {
    const snapshot = await db.collection('messages')
      .where('receiverId', '==', req.params.userId)
      .where('read', '==', false)
      .get();
      
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });
    
    await batch.commit();
    res.status(200).json({ message: 'Inbox messages marked as read.' });
  } catch (error) {
    console.error('Error marking inbox read:', error);
    res.status(500).json({ message: 'Server error marking inbox read.' });
  }
});

// @route   POST /api/chat/messages
// @desc    Send a new message
router.post('/messages', async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ message: 'senderId, receiverId, and content are required.' });
    }

    const newMessage = {
      senderId,
      receiverId,
      content,
      read: false,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('messages').add(newMessage);

    res.status(201).json({ ...newMessage, _id: docRef.id });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ message: 'Server error saving message.' });
  }
});

// @route   GET /api/chat/unread-counts
// @desc    Get count of unread messages per sender
// @query   receiverId
router.get('/unread-counts', async (req, res) => {
  try {
    const { receiverId } = req.query;
    if (!receiverId) return res.status(400).json({ message: 'receiverId is required.' });

    const snapshot = await db.collection('messages')
      .where('receiverId', '==', receiverId)
      .where('read', '==', false)
      .get();
      
    const countsMap = {};
    snapshot.forEach(doc => {
      const senderId = doc.data().senderId;
      if (senderId) {
        countsMap[senderId] = (countsMap[senderId] || 0) + 1;
      }
    });

    res.status(200).json(countsMap);
  } catch (error) {
    console.error('Error fetching unread counts:', error);
    res.status(500).json({ message: 'Server error fetching unread counts.' });
  }
});

// @route   PUT /api/chat/mark-read
// @desc    Mark all messages from a specific sender as read
router.put('/mark-read', async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    if (!senderId || !receiverId) {
      return res.status(400).json({ message: 'senderId and receiverId are required.' });
    }

    const snapshot = await db.collection('messages')
      .where('senderId', '==', senderId)
      .where('receiverId', '==', receiverId)
      .where('read', '==', false)
      .get();

    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });
    
    await batch.commit();
    res.status(200).json({ message: 'Messages marked as read.' });
  } catch (error) {
    console.error('Error marking messages read:', error);
    res.status(500).json({ message: 'Server error marking messages read.' });
  }
});

module.exports = router;
