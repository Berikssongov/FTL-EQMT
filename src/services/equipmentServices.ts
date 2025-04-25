// src/services/equipmentServices.ts
import { doc, getDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Equipment } from '../types';

const equipmentCollection = collection(db, 'equipment');

export const addEquipment = async (equipment: Equipment) => {
  await addDoc(equipmentCollection, equipment);
};

export const fetchEquipment = async (): Promise<Equipment[]> => {
  const snapshot = await getDocs(equipmentCollection);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Equipment),
  }));
};

// ✅ New function to fetch equipment by ID
export const getEquipmentById = async (id: string): Promise<Equipment | null> => {
  try {
    const docRef = doc(db, 'equipment', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...(docSnap.data() as Equipment) };
    } else {
      console.warn(`No equipment found with ID: ${id}`);
      return null;
    }
  } catch (error) {
    console.error('Error fetching equipment by ID:', error);
    return null;
  }
};
