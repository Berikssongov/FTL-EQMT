// src/services/powerToolsService.ts
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

// Type for Power Tool
export interface PowerTool {
  id?: string;
  name: string;
  location: string;
  serialNumber?: string;
  condition: string;
}

// Reference to "powerTools" collection
const powerToolsCollection = collection(db, "powerTools");

// Add a power tool
export const addPowerTool = async (tool: PowerTool) => {
  await addDoc(powerToolsCollection, tool);
};

// ✅ Full Update Power Tool (NEW, FIXED)
export const updatePowerTool = async (id: string, tool: PowerTool) => {
  const toolDoc = doc(db, "powerTools", id);
  const { id: _, ...toolData } = tool; // 👈 Strip out id
  await updateDoc(toolDoc, toolData);
};

// Fetch all power tools
export const fetchPowerTools = async (): Promise<PowerTool[]> => {
  const snapshot = await getDocs(powerToolsCollection);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as PowerTool),
  }));
};
