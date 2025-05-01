import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    Timestamp,
    deleteDoc,
    doc,
    setDoc,
  } from "firebase/firestore";
  import { db } from "../firebase";
  
  export const addKeyLog = async (log: any) => {
    return await addDoc(collection(db, "keyLogs"), {
      ...log,
      timestamp: Timestamp.now(),
    });
  };
  
  export const getKeyLogs = async () => {
    const snapshot = await getDocs(collection(db, "keyLogs"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };
  
  export const assignKey = async (keyName: string, person: string) => {
    return await setDoc(doc(db, "keyAssignments", keyName), {
      keyName,
      person,
    });
  };
  
  export const getAssignedKeys = async (person?: string) => {
    const colRef = collection(db, "keyAssignments");
    const q = person ? query(colRef, where("person", "==", person)) : colRef;
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };
  
  export const updateLockbox = async (keyName: string, location: string) => {
    return await setDoc(doc(db, "lockboxes", keyName), {
      keyName,
      lockboxLocation: location,
    });
  };
  
  export const getLockboxKeys = async () => {
    const snapshot = await getDocs(collection(db, "lockboxes"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };
  