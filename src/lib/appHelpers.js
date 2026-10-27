import { db } from '@/lib/firebase';

export const populateVolunteer = async (docData) => {
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

export const populateProgram = async (docData) => {
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

export const populateNgo = async (docData) => {
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
