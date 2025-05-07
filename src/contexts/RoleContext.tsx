// src/contexts/RoleContext.tsx

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

type Role = "guest" | "user" | "manager" | "admin";

interface RoleContextType {
  role: Role;
  loading: boolean;
}

const RoleContext = createContext<RoleContextType>({
  role: "guest",
  loading: true,
});

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>("guest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            setRole((data.role as Role) || "user");
          } else {
            setRole("user"); // default for signed-in user with no role
          }
        } catch (error) {
          console.error("Error loading user role:", error);
          setRole("user");
        }
      } else {
        setRole("guest"); // not signed in
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <RoleContext.Provider value={{ role, loading }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
