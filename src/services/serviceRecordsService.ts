// src/services/serviceRecordsService.ts
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Type for service record
export interface ServiceRecord {
  equipmentId: string;
  date: string; // ISO String
  serviceType: string;
  notes?: string;
}

// Reference to the "serviceRecords" collection in Firestore
const serviceRecordsCollection = collection(db, 'serviceRecords');

// Add a new service record
export const addServiceRecord = async (record: ServiceRecord) => {
  await addDoc(serviceRecordsCollection, record);
};

// Fetch service records for a specific equipment
export const fetchServiceRecordsByEquipmentId = async (equipmentId: string): Promise<ServiceRecord[]> => {
  const q = query(serviceRecordsCollection, where('equipmentId', '==', equipmentId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    ...(doc.data() as ServiceRecord),
  }));
};
