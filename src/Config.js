import { initializeApp } from 'firebase/app';
import {getFirestore,collection, addDoc, getDocs, deleteDoc,doc,writeBatch} from "firebase/firestore"
import {getStorage} from 'firebase/storage';
import { getAuth } from 'firebase/auth'; // Import Firebase Authentication
import {getMessaging, getToken, onMessage} from 'firebase/messaging'

const firebaseConfig = {
  apiKey: "AIzaSyBvqUHysbjYNn3nAg8pNhD8eA0LmbSOlX0",
  authDomain: "bus-driver-navigation.firebaseapp.com",
  databaseURL: "https://bus-driver-navigation-default-rtdb.firebaseio.com",
  projectId: "bus-driver-navigation",
  storageBucket: "bus-driver-navigation.appspot.com",
  messagingSenderId: "649443007271",
  appId: "1:649443007271:web:edfa5fc2853891f63fe702",
  measurementId: "G-HGBFY01SR1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app); // Initialize Firebase Authentication
const messaging = getMessaging(app);


export const generateToken = async () => {
  try {
    const token = await messaging.getToken({
      vapidKey: "BLZQb9jKDmmIuw8FWtCx9iCfeL8UU8dteoLAK7AqISIEQ_3N8OgyAqFIYO56lgX3V3YxzzmDXrbN6SefWZZ-leg"
    });
    console.log("Token is:", token);
    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    return null;
  }
};


export const sendNotification = async (title, body) => {
  try {
    // Add a new document with a generated ID to the "notifications" collection
    await addDoc(collection(db, 'notifications'), {
      title: title,
      body: body,
    });
    console.log('Notification sent from Admin panel');
  } catch (error) {
    console.error('Error sending notification from Admin panel:', error);
  }
};
const getNotifications = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'notifications'));
    if (!querySnapshot.empty) {
      const notifications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return notifications;
    } else {
      console.log('No notifications found.');
      return [];
    }
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
};


// const getNotifications = async () => {
//   try {
//     const querySnapshot = await getDocs(collection(db, 'notifications'));
//     if (!querySnapshot.empty) {
//       const notifications = querySnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       }));
//       return notifications;
//     } else {
//       console.log('No notifications found.');
//       return [];
//     }
//   } catch (error) {
//     console.error('Error getting notifications:', error);
//     return [];
//   }
// };


// Inside your Config module
const deleteNotification = async (id) => {
  try {
    // Delete the notification with the specified ID
    await deleteDoc(doc(db, 'notifications', id));
    console.log('Notification deleted successfully');
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error; // Rethrow the error to handle it in the component
  }
};

const batch = writeBatch(db);

export {storage, db,app ,auth, messaging,getNotifications, deleteNotification,doc,deleteDoc,getDocs,collection};
// export const onMessageListener = () => {

//   return new Promise((resolve) => {
//     onMessage(messaging, (payload) => {
//       console.log("onMessage Payload", payload);

//       resolve(payload);
//     })
//   })
// }
