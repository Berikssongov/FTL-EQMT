// src/services/partsRecordsService.ts
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Type for part record
export interface PartRecord {
  equipmentId: string;
  dateInstalled: string; // ISO string
  partName: string;
  notes?: string;
  cost?: number;
}

// Reference to the "partsRecords" collection
const partsRecordsCollection = collection(db, 'partsRecords');

// Add a new part record
export const addPartRecord = async (record: PartRecord) => {
  await addDoc(partsRecordsCollection, record);
};

// Fetch part records for specific equipment
export const fetchPartRecordsByEquipmentId = async (equipmentId: string): Promise<PartRecord[]> => {
  const q = query(partsRecordsCollection, where('equipmentId', '==', equipmentId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    ...(doc.data() as PartRecord),
  }));
};
