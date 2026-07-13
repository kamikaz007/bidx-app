import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD9L74WN6V_4lOrIoaQPPtyi_SO-LLtayA",
  authDomain: "chatoo-4566f.firebaseapp.com",
  projectId: "chatoo-4566f",
  storageBucket: "chatoo-4566f.appspot.com",
  messagingSenderId: "724118831864",
  appId: "1:724118831864:web:2cca10fa8d290d4288f10d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
export default app;
