const { onCall } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const serviceAccount = require("./serviceAccountKey.json");

initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

exports.signUp = onCall({ cors: [
  "http://localhost:3000",
  "https://surround-sound.vercel.app",
] }, async (request) => {
  const { userId } = request.data;

  if (!userId) {
    return { firebaseAuthToken: null };
  }

  return getAuth().createCustomToken(userId).then((authToken) => {
    return { firebaseAuthToken: authToken };
  });
});
