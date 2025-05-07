import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut, getAuth } from "firebase/auth";
import { auth } from "../firebase"; // assumes firebase.ts exports `auth`

const AuthContext = createContext<{
  user: User | null;
  logout: () => void;
}>({
  user: null,
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
