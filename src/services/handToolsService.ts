// src/services/handToolsService.ts
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

// Type for Hand Tool
export interface HandTool {
  id?: string;
  name: string;
  location: string;
  condition: string;
  quantity: number;
}

// Reference to "handTools" collection
const handToolsCollection = collection(db, "handTools");

// Add a hand tool
export const addHandTool = async (tool: HandTool) => {
  await addDoc(handToolsCollection, tool);
};

// Update quantity only
export const updateHandToolQuantity = async (id: string, quantity: number) => {
  const toolDoc = doc(db, "handTools", id);
  await updateDoc(toolDoc, { quantity });
};

// ✅ Full Update Hand Tool (NEW, FIXED)
export const updateHandTool = async (id: string, tool: HandTool) => {
  const toolDoc = doc(db, "handTools", id);
  const { id: _, ...toolData } = tool; // 👈 Strip out id
  await updateDoc(toolDoc, toolData);
};

// Fetch all hand tools
export const fetchHandTools = async (): Promise<HandTool[]> => {
  const snapshot = await getDocs(handToolsCollection);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as HandTool),
  }));
};
