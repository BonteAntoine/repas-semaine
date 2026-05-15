import { initializeApp } from 'firebase/app'
import {
  getFirestore, collection, doc,
  onSnapshot, addDoc, deleteDoc, setDoc, updateDoc
} from 'firebase/firestore'
import { useState, useEffect } from 'react'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

export function useCollection(colPath) {
  const [data, setData] = useState([])
  useEffect(() => {
    return onSnapshot(collection(db, colPath), snap =>
      setData(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
  }, [colPath])
  return data
}

export function useDocument(docPath) {
  const [data, setData] = useState(null)
  useEffect(() => {
    if (!docPath) return
    return onSnapshot(doc(db, docPath), snap =>
      setData(snap.exists() ? { id: snap.id, ...snap.data() } : {})
    )
  }, [docPath])
  return data
}

export const addDish = (dish) => addDoc(collection(db, 'dishes'), dish)
export const deleteDish = (id) => deleteDoc(doc(db, 'dishes', id))
export const updateDish = (id, data) => updateDoc(doc(db, 'dishes', id), data)
export const setPlanningSlot = (weekKey, slot, dishId) =>
  setDoc(doc(db, 'planning', weekKey), { [slot]: dishId }, { merge: true })
