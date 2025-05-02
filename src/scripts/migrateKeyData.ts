// src/scripts/migrateKeyData.ts
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

// Function to detect restricted keys based on format: A–F + 1–2 digits
const isRestrictedKey = (key: string): boolean => {
  return /^[A-Fa-f]\d{1,2}$/.test(key.trim());
};

export const migrateKeyData = async () => {
  const assignedSnap = await getDocs(collection(db, "assignedKeys"));
  const lockboxSnap = await getDocs(collection(db, "lockboxKeys"));

  const allKeyDocs: {
    keyName: string;
    isRestricted: boolean;
    currentHolder: {
      type: "lockbox" | "person";
      name: string;
    };
  }[] = [];

  // Keys currently signed out
  assignedSnap.docs.forEach((docSnap) => {
    const data = docSnap.data();
    const keyName = data.keyName.trim();

    allKeyDocs.push({
      keyName,
      isRestricted: isRestrictedKey(keyName),
      currentHolder: {
        type: "person",
        name: data.person || "Unknown",
      },
    });
  });

  // Keys currently in lockboxes
  lockboxSnap.docs.forEach((docSnap) => {
    const data = docSnap.data();
    const keyName = data.keyName.trim();

    allKeyDocs.push({
      keyName,
      isRestricted: isRestrictedKey(keyName),
      currentHolder: {
        type: "lockbox",
        name: data.lockboxLocation || "Unknown",
      },
    });
  });

  // Write to new 'keys' collection
  const keysCollection = collection(db, "keys");

  for (const keyData of allKeyDocs) {
    const newDocRef = doc(keysCollection);
    await setDoc(newDocRef, keyData);
  }

  console.log(`✅ Migration complete: ${allKeyDocs.length} keys migrated.`);
};

export {};
