// src/services/userService.ts
import { getDocs, collection } from "firebase/firestore";
import { db } from "../firebase";
import { UserProfile, User } from "../types";

export const getAllUsers = async (): Promise<User[]> => {
    const snapshot = await getDocs(collection(db, "users"));
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
      };
    });
  };
