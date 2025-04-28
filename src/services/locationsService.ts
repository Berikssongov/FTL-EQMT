// src/services/locationsService.ts
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Location } from '../types'; // ✅ Type

// Reference to the "locations" collection
const locationsCollection = collection(db, 'locations');

// Add a new location
export const addLocation = async (location: { name: string }) => {
  await addDoc(locationsCollection, location);
};

// Fetch all locations
export const fetchLocations = async (): Promise<Location[]> => {
  const snapshot = await getDocs(locationsCollection);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Location),
  }));
};
