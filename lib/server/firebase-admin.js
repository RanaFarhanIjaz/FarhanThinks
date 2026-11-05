import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp() {
  const existingApp = getApps().find((app) => app.name === "server");
  if (existingApp) return existingApp;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not configured.");
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
  } catch (error) {
    console.error("Firebase service account JSON is invalid:", error);
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON must be valid JSON.");
  }

  return initializeApp(
    {
      credential: cert(serviceAccount),
    },
    "server"
  );
}

export function getAdminFirestore() {
  return getFirestore(getAdminApp());
}
