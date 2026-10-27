import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

let serviceAccount = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (err) {
    console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT from env:', err.message);
  }
}

if (!serviceAccount) {
  const possiblePaths = [
    path.join(process.cwd(), 'firebase-key.json'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(/*turbopackIgnore: true*/ p)) {
      try {
        serviceAccount = JSON.parse(fs.readFileSync(/*turbopackIgnore: true*/ p, 'utf8'));
        break;
      } catch (err) {
        console.warn(`Failed to read key from ${p}:`, err.message);
      }
    }
  }
}

const firebaseAdminApp = getApps().length === 0
  ? initializeApp(serviceAccount ? { credential: cert(serviceAccount) } : {})
  : getApps()[0];

export const db = getFirestore(firebaseAdminApp);
