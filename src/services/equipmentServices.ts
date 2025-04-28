// src/services/equipmentServices.ts
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../firebase";
import { Equipment, DamageReport } from "../types";

const equipmentCollection = collection(db, "equipment");

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

export const getEquipmentById = async (
  id: string
): Promise<Equipment | null> => {
  try {
    const docRef = doc(db, "equipment", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...(docSnap.data() as Equipment) };
    } else {
      console.warn(`No equipment found with ID: ${id}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching equipment by ID:", error);
    return null;
  }
};

export const updateEquipmentById = async (
  id: string,
  updates: Partial<Equipment>
): Promise<void> => {
  const docRef = doc(db, "equipment", id);
  await updateDoc(docRef, updates);
};
export const updateEquipment = async (id: string, data: Partial<Equipment>) => {
  try {
    const docRef = doc(db, "equipment", id);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error("Error updating equipment:", error);
    throw error;
  }
};

export const addDamageReport = async (
  id: string,
  report: DamageReport
): Promise<void> => {
  const docRef = doc(db, "equipment", id);
  await updateDoc(docRef, {
    damageReports: arrayUnion({
      ...report,
      timestamp: new Date().toISOString(),
    }),
  });
};
