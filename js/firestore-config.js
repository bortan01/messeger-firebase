  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  var config = {
    apiKey: "AIzaSyChjRX4svOM5e6Uj-_KnCLDakaXxsbvv5k",
    authDomain: "notificacionpush-d6641.firebaseapp.com",
    databaseURL: "https://notificacionpush-d6641.firebaseio.com",
    projectId: "notificacionpush-d6641",
    storageBucket: "notificacionpush-d6641.appspot.com",
    messagingSenderId: "1036501737046",
    appId: "1:1036501737046:web:d87683709f65438caa65f7",
    measurementId: "G-7HDZR639SE"
  };
// Initialize Firebase
firebase.initializeApp(config);

// Initialize Cloud Firestore through Firebase
var db = firebase.firestore();

// Disable deprecated features
db.settings({
	timestampsInSnapshots: true
});



