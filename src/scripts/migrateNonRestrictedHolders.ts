import { collection, getDocs, deleteDoc, setDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

interface RawKey {
  id: string;
  keyName: string;
  isRestricted: boolean;
  currentHolder: {
    type: "lockbox" | "person";
    name: string;
  };
}

interface Holder {
  type: "lockbox" | "person";
  name: string;
  quantity: number;
}

export const migrateNonRestrictedKeys = async () => {
  const snap = await getDocs(collection(db, "keys"));

  const grouped: Record<string, { isRestricted: boolean; holders: Holder[] }> = {};

  snap.docs.forEach((docSnap) => {
    const key = docSnap.data() as RawKey;

    if (key.isRestricted) return;

    const keyName = key.keyName.trim();
    const holderKey = `${key.currentHolder.type}-${key.currentHolder.name.trim().toLowerCase()}`;

    if (!grouped[keyName]) {
      grouped[keyName] = {
        isRestricted: false,
        holders: [],
      };
    }

    const existing = grouped[keyName].holders.find(
      (h) =>
        h.type === key.currentHolder.type &&
        h.name.trim().toLowerCase() === key.currentHolder.name.trim().toLowerCase()
    );

    if (existing) {
      existing.quantity += 1;
    } else {
      grouped[keyName].holders.push({
        type: key.currentHolder.type,
        name: key.currentHolder.name.trim(),
        quantity: 1,
      });
    }
  });

  // Delete all old non-restricted keys
  const deletions = snap.docs
    .filter((d) => !(d.data() as RawKey).isRestricted)
    .map((d) => deleteDoc(doc(db, "keys", d.id)));

  await Promise.all(deletions);

  // Create one doc per grouped key
  for (const keyName in grouped) {
    await setDoc(doc(collection(db, "keys")), {
      keyName,
      isRestricted: false,
      holders: grouped[keyName].holders,
    });
  }

  console.log(`✅ Consolidated and migrated ${Object.keys(grouped).length} non-restricted keys`);
};
