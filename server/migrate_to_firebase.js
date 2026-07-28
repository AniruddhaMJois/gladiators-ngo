require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./firebase-key.json');

// 1. Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();

// 2. MongoDB Connection URI
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gladiators';

async function migrateData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully!');

    const collections = [
      'users', 
      'programs', 
      'applications', 
      'messages', 
      'donations', 
      'expenselogs', 
      'financereports', 
      'logs'
    ];

    for (const collectionName of collections) {
      console.log(`\nMigrating collection: ${collectionName}...`);
      
      const firestoreCollectionName = collectionName === 'expenselogs' ? 'expense_logs' 
                                      : collectionName === 'financereports' ? 'finance_reports' 
                                      : collectionName;

      // Access the raw MongoDB collection
      const collection = mongoose.connection.collection(collectionName);
      const documents = await collection.find({}).toArray();
      
      console.log(`Found ${documents.length} documents in ${collectionName}.`);

      let count = 0;
      for (const rawDoc of documents) {
        // Deep convert BSON/ObjectIds to plain strings/JS types
        const doc = JSON.parse(JSON.stringify(rawDoc));

        // Prepare document for Firestore
        const docId = doc._id.toString();
        
        // Remove MongoDB specific _id and __v
        delete doc._id;
        delete doc.__v;

        // Write to Firestore
        await db.collection(firestoreCollectionName).doc(docId).set(doc);
        count++;
      }
      
      console.log(`Successfully migrated ${count} documents to Firestore collection: ${firestoreCollectionName}.`);
    }

    console.log('\n✅ ALL DATA MIGRATED SUCCESSFULLY TO FIREBASE FIRESTORE!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateData();
