import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";

import {
  getAuth
} from "../firebase/firebase";

export const login = async (
  email,
  password
) => {

  const auth = getAuth();

  return await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
};

export const register = async (
  email,
  password
) => {

  const auth = getAuth();

  return await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
};

export const logout = async () => {

  const auth = getAuth();

  return await signOut(auth);
};