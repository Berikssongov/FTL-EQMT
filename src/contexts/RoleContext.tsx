import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

type Role = "guest" | "user" | "manager" | "admin";

interface RoleContextType {
  role: Role;
  loading: boolean;
  firstName?: string;
  lastName?: string;
  fullName?: string;
}

const RoleContext = createContext<RoleContextType>({
  role: "guest",
  loading: true,
});

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>("guest");
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState<string | undefined>();
  const [lastName, setLastName] = useState<string | undefined>();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            setRole((data.role as Role) || "user");
            setFirstName(data.firstName);
            setLastName(data.lastName);
          } else {
            setRole("user");
          }
        } catch (error) {
          console.error("Error loading user info:", error);
          setRole("user");
        }
      } else {
        setRole("guest");
        setFirstName(undefined);
        setLastName(undefined);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fullName = firstName && lastName ? `${firstName} ${lastName}` : undefined;

  return (
    <RoleContext.Provider value={{ role, loading, firstName, lastName, fullName }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);

export const isRole = (roleToCheck: Role, currentRole: Role): boolean => currentRole === roleToCheck;

export const isAtLeastManager = (role: Role) =>
  role === "manager" || role === "admin";

export const isAtLeastUser = (role: Role) =>
  role === "user" || role === "manager" || role === "admin";

