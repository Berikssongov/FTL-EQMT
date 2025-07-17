import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase"; // make sure db is exported from firebase.ts
import { doc, getDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  firstName: string | null;
  lastName: string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firstName: null,
  lastName: null,
  logout: () => {
    console.warn("Logout function not implemented.");
  },
    
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userSnapshot = await getDoc(userDocRef);

          if (userSnapshot.exists()) {
            const data = userSnapshot.data();
            setFirstName(data.firstName || null);
            setLastName(data.lastName || null);
          } else {
            console.warn("No Firestore user profile found for:", firebaseUser.uid);
            setFirstName(null);
            setLastName(null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setFirstName(null);
          setLastName(null);
        }
      } else {
        setFirstName(null);
        setLastName(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, firstName, lastName, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
