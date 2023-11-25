// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAIz9yzh_U8CcnQaqK4ewRDTXZITiuwjqE",
  authDomain: "becomecustomer-290bf.firebaseapp.com",
  projectId: "becomecustomer-290bf",
  storageBucket: "becomecustomer-290bf.appspot.com",
  messagingSenderId: "873986224318",
  appId: "1:873986224318:web:32c519dea5a48d49342eef",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
