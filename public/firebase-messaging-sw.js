
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
    apiKey: "AIzaSyBvqUHysbjYNn3nAg8pNhD8eA0LmbSOlX0",
    authDomain: "bus-driver-navigation.firebaseapp.com",
    databaseURL: "https://bus-driver-navigation-default-rtdb.firebaseio.com",
    projectId: "bus-driver-navigation",
    storageBucket: "bus-driver-navigation.appspot.com",
    messagingSenderId: "649443007271",
    appId: "1:649443007271:web:edfa5fc2853891f63fe702",
    measurementId: "G-HGBFY01SR1"
  });

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log(
      '[firebase-messaging-sw.js] Received background message ',
      payload
    );
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: payload.notification.image
    };
  
    self.registration.showNotification(notificationTitle, notificationOptions);
  });