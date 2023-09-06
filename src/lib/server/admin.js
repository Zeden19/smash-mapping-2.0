import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import {CLIENT_EMAIL, PRIVATE_KEY, PROJECT_ID} from "$env/static/private";
import pkg from "firebase-admin";

try {
    pkg.initializeApp({
        credential: pkg.credential.cert({
            projectId: PROJECT_ID,
            privateKey: PRIVATE_KEY,
            clientEmail: CLIENT_EMAIL
        }),
    })
} catch (err) {
    if (!/already exists/u.test(err.message)) {
        console.error("Firebase Admin error", err.stack)
    }
}

export const adminDB = getFirestore();
export const adminAuth = getAuth();


