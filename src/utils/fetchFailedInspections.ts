import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export type FailedInspection = {
  id: string;
  componentName: string;
  assetName: string;
  date: Date;
  notes?: string;
};

export const fetchFailedInspections = async (): Promise<FailedInspection[]> => {
  const snapshot = await getDocs(
    query(collection(db, "componentInspections"), where("status", "==", "fail"))
  );

  const inspections: FailedInspection[] = [];

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();

    const componentId = data.componentId;
    const assetId = data.assetId;

    let componentName = "Unknown Component";
    let assetName = "Unknown Asset";

    try {
      const compSnap = await getDoc(doc(db, "components", componentId));
      if (compSnap.exists()) componentName = compSnap.data().name;
    } catch {}

    try {
      const assetSnap = await getDoc(doc(db, "assets", assetId));
      if (assetSnap.exists()) assetName = assetSnap.data().name;
    } catch {}

    inspections.push({
      id: docSnap.id,
      componentName,
      assetName,
      date: data.date?.toDate?.() || new Date(), // 🔥 FIXED this line
      notes: data.notes || "",
    });
  }

  return inspections;
};
