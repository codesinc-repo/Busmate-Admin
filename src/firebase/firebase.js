// import firebase from 'firebase/app';
// import 'firebase/firestore'; // Import the Firestore module separately


// // Initialize Firebase
// const firebaseConfig = {
//   apiKey: "AIzaSyBvqUHysbjYNn3nAg8pNhD8eA0LmbSOlX0",
//   authDomain: "bus-driver-navigation.firebaseapp.com",
//   databaseURL: "https://bus-driver-navigation-default-rtdb.firebaseio.com",
//   projectId: "bus-driver-navigation",
//   storageBucket: "bus-driver-navigation.appspot.com",
//   messagingSenderId: "649443007271",
//   appId: "1:649443007271:web:edfa5fc2853891f63fe702",
//   measurementId: "G-HGBFY01SR1",
// }; // Your Firebase config
// firebase.initializeApp(firebaseConfig);
// const db = firebase.firestore();

// // Function to send notification from Admin panel
// export const sendNotification = async (title, body) => {
//     try {
//       await db.collection('notifications').add({
//         title: title,
//         body: body,
//       });
//       console.log('Notification sent from Admin panel');
//     } catch (error) {
//       console.error('Error sending notification from Admin panel:', error);
//     }
//   };
