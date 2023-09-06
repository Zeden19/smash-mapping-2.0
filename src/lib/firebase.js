// Import the functions you need from the SDKs you need
import {initializeApp} from "firebase/app";
import {doc, getFirestore} from "firebase/firestore"
import {getAuth} from "firebase/auth"
import {getStorage} from "firebase/storage"
import {onAuthStateChanged} from "firebase/auth";
import {derived, writable} from "svelte/store";
import {onSnapshot} from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyC3dl3Dp0bNkmvssI3PX96SCbg5rm6RCSE",
    authDomain: "smash-mapping.firebaseapp.com",
    databaseURL: "https://smash-mapping-default-rtdb.firebaseio.com",
    projectId: "smash-mapping",
    storageBucket: "smash-mapping.appspot.com",
    messagingSenderId: "370086284592",
    appId: "1:370086284592:web:9969cdd8dffb91afc08cf5",
    measurementId: "G-BZ1PDSWW86"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage();


/**
 * @returns a store with the current firebase user
 */
function userStore() {
    let unsubscribe = function () {
    };

    if (!auth || !globalThis.window) {
        console.warn('Auth is not initialized or not in browser');
        const {subscribe} = writable(null);
        return {
            subscribe,
        }
    }

    const {subscribe} = writable(auth?.currentUser ?? null, (set) => {
        unsubscribe = onAuthStateChanged(auth, (user) => {
            set(user);
        });

        return () => unsubscribe();
    });

    return {
        subscribe,
    };
}

export const user = userStore();

export function docStore(path) {
    const docRef = doc(db, path);
    let unsubscribe = function () {
    };

    const {subscribe} = writable(null, (set) => {
        unsubscribe = onSnapshot(docRef, (snapshot) => {
            set((snapshot.data()) ?? null);
        });

        return () => unsubscribe();
    });
    return {
        subscribe,
        ref: docRef,
        id: docRef.id,
    }
}

export const userData = derived(user, ($user, set) => {
    if ($user) {
        return docStore(`users/${$user.uid}`).subscribe(set);
    } else {
        set(null);
    }
});

