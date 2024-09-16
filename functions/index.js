const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.sendNotificationToAllUsers = functions.https.onCall(async () => {
  const db = admin.database();
  const usersRef = db.ref('RegisteredUsers');

  const users = await usersRef.once('value');
  const tokens = [];

  users.forEach((user) => {
    tokens.push(user.val().token);
  });

  const message = {
    data: {
      title: 'Notification from React App',
      body: 'This is a notification sent from the React app!',
    },
    tokens,
  };

  try {
    await admin.messaging().sendMulticast(message);
    console.log('Notifications sent successfully!');
  } catch (error) {
    console.error('Error sending notifications:', error);
  }
});