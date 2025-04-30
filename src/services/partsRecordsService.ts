// src/services/partsRecordsService.ts
import { collection, addDoc, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export interface PartRecord {
  id?: string;
  equipmentId: string;
  partName: string;
  partNumber?: string;
  vendor?: string;
  price?: number;
  notes?: string;
  dateInstalled?: string;
}

const partsRecordsCollection = collection(db, "partsRecords");

export const addPartRecord = async (record: PartRecord) => {
  await addDoc(partsRecordsCollection, record);
};

export const getPartRecordById = async (id: string): Promise<PartRecord | null> => {
  const ref = doc(db, "partsRecords", id);
  const snapshot = await getDoc(ref);
  return snapshot.exists() ? { id, ...(snapshot.data() as PartRecord) } : null;
};

// Add this function to update parts:
export const updatePartRecord = async (id: string, data: PartRecord) => {
  const ref = doc(db, "partsRecords", id);
  await updateDoc(ref, { ...data });
};


export const fetchPartRecordsByEquipmentId = async (
  equipmentId: string
): Promise<PartRecord[]> => {
  const q = query(partsRecordsCollection, where("equipmentId", "==", equipmentId));
  const snapshot = await getDocs(q);

  

  return snapshot.docs.map(doc => {
    const data = doc.data() as Omit<PartRecord, "id">;
    return {
      id: doc.id,
      ...data,
    };
  });
  
};
