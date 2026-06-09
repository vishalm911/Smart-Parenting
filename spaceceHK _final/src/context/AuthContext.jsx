// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); });
    return unsub;
  }, []);

  const register = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    // Save to Firestore so admin can look up usernames
    await setDoc(doc(db, "users", cred.user.uid), {
      uid: cred.user.uid,
      username: displayName,
      email: email,
      created_at: new Date(),
    });
    return cred.user;
  };

  const login  = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:48, height:48, border:"5px solid #F0E8DA", borderTopColor:"#2EC4B6",
        borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
