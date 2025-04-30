// src/services/serviceRecordsService.ts
import { collection, addDoc, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export interface ServiceRecord {
  items: never[];
  id?: string;
  equipmentId: string;
  date: string; // ISO String
  summary?: string;
  serviceType?: string;
  notes?: string;
  totalCost?: number;
}

const serviceRecordsCollection = collection(db, "serviceRecords");

export const addServiceRecord = async (record: ServiceRecord) => {
  await addDoc(serviceRecordsCollection, record);
};

export const updateServiceRecord = async (id: string, data: ServiceRecord) => {
  const ref = doc(db, "serviceRecords", id);
  await updateDoc(ref, { ...data });
};

export const getServiceRecordById = async (id: string): Promise<ServiceRecord | null> => {
  const ref = doc(db, "serviceRecords", id);
  const snapshot = await getDoc(ref);
  return snapshot.exists() ? { id, ...(snapshot.data() as ServiceRecord) } : null;
};


export const fetchServiceRecordsByEquipmentId = async (
  equipmentId: string
): Promise<ServiceRecord[]> => {
  const q = query(serviceRecordsCollection, where("equipmentId", "==", equipmentId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => {
    const data = doc.data() as Omit<ServiceRecord, "id">;
    return {
      id: doc.id,
      ...data,
    };
  });
  
};
