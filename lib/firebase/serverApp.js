import "server-only";
import { headers } from "next/headers";
import { initializeServerApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import firebaseConfig from "@/lib/firebase/config";
import Promise from "promise";
import { connectStorageEmulator, getStorage } from "firebase/storage";

/**
 * Get the Firebase server app and other service instances for the authenticated user
 * @returns {Promise<Object>} Promise that resolves with firebase server app and other service instances
 */
export async function getAuthenticatedServerApp() {
  const idToken = headers().get("Authorization")?.split("Bearer ")[1]; // Get token

  // Initialize Firebase app with token
  const app = initializeServerApp(
    firebaseConfig,
    idToken && idToken !== "missing" 
      ? { authIdToken: idToken } 
      : {}
  );

  const auth = getAuth(app);
  const db = getFirestore(app);
  const functions = getFunctions(app);
  const storage = getStorage(app);

  if (process.env.NODE_ENV === "development") {
    /* When connecting to the emulators, each function call must be in a seperate
    try catch block because an error will be thrown if an app instance already exists.  */
    try {
      /* Must connect to the auth emulator immediately after calling initializeAuth.
      Otherwise, Firebase will try to connect to the production auth service. */
      connectAuthEmulator(auth, 'http://127.0.0.1:9099');
    } catch (error) {
      // console.log("Failed to connect to auth emulator: ", error)
    }

    try {
      connectFirestoreEmulator(db, '127.0.0.1', 8080);
    } catch (error) {
      // console.log("Failed to connect to firestore emulator: ", error)
    }

    try {
      connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    } catch (error) {
      // console.log("Failed to connect to functions emulator: ", error)
    }

    try {
      connectStorageEmulator(storage, '127.0.0.1', 9199);
    } catch (error) {
      // console.log("Failed to connect to storage emulator: ", error)
    }
  }

  // Wait for auth state to be ready
  await auth.authStateReady();

  // Return app and other service instances
  return { 
    app, 
    auth, 
    db, 
    functions, 
    storage, 
    currentUser: auth.currentUser,
    serviceWorkerRunning: idToken !== undefined,
    idToken,
  };
}