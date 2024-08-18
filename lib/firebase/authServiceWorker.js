/**
 * Session management using service workers.
 * 
 * The code in this file is adapted from this example project:
 * https://github.com/firebase/friendlyeats-web/blob/master/nextjs-end/auth-service-worker.js
 * 
 * Full documentation for Firebase session management available at:
 * https://firebase.google.com/docs/auth/web/service-worker-sessions#web-modular-api
 */

import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth, getIdToken } from "firebase/auth";

/* Firebase configurations are hard coded here for simplicity, as there is no easy
way to pass the service worker (especially if the service worker restarts after reopening the tab). */
const firebaseConfig = {
  apiKey: "AIzaSyCbiunfnc85XBiN_S740SYhmZzIdrv97Co",
  authDomain: "surround-sound-7c813.firebaseapp.com",
  projectId: "surround-sound-7c813",
  storageBucket: "surround-sound-7c813.appspot.com",
  messagingSenderId: "728812750997",
  appId: "1:728812750997:web:caa155e9b3ef70b529739c",
  measurementId: "G-8CE2RH60XG"
};

/* Current running environment */
const environment = 
  // 'development'
  'production'  
;

// eslint-disable-next-line no-unused-vars
self.addEventListener('install', event => {
  // console.log("Started auth service worker for Firebase.");
  // self.skipWaiting();
});

// Intercept requests
self.addEventListener("fetch", (event) => {
  
  event.respondWith(
    (async () => {
      // console.log('Intercepted request: ', event.request.url);
      
      // Initialize Firebase app and auth
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app)
      
      if (environment === 'development') {
        try {
          connectAuthEmulator(auth, 'http://127.0.0.1:9099');
        } catch (error) {
          // // console.log('Failed to connect to emulator: ', error);
        }
      }
      
      // Wait for auth to load
      await auth.authStateReady();
      
      /* Set ID token, or 'missing' if not available. If the server component is not able to authenticate, 
      the special value 'missing' will tell us if it is due to the service worker not running properly, or that
      the user is simply not logged in. */
      const authIdToken = auth.currentUser 
        ? await getIdToken(auth.currentUser) 
        : 'missing';
      

      const { origin } = new URL(event.request.url);

      // Clone request to modify headers
      const headers = new Headers(event.request.headers);

      // Set auth header on same origin requests
      // if (self.location.origin) {
      //   // console.log(123, auth.currentUser)
      // }
      if (authIdToken && origin === self.location.origin) {
        headers.set('Authorization', `Bearer ${authIdToken}`)
      }

      const newRequest = new Request(event.request, { headers })

      // Return promise which resolves to response
      return fetch(newRequest);
    })(),
  )
});

// Take control of all clients on activation
self.addEventListener('activate', (event) => {
  // eslint-disable-next-line no-undef
  event.waitUntil(clients.claim());
});