import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js';
import { firebaseConfig } from '../config/firebase-config.local.js';

const firebaseApp = initializeApp(firebaseConfig);

export const firestore = getFirestore(firebaseApp);

