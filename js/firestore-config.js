// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var config = {
  apiKey: "AIzaSyD0LwZwZuOmigM6wLK4HUYEJsDz8Cz8jks",
  authDomain: "agenciamartinez-76dbe.firebaseapp.com",
  databaseURL: "https://agenciamartinez-76dbe.firebaseio.com",
  projectId: "agenciamartinez-76dbe",
  storageBucket: "agenciamartinez-76dbe.appspot.com",
  messagingSenderId: "702881328033",
  appId: "1:702881328033:web:50a2d8991a278cad7d39e0",
  measurementId: "G-JNBXFBYQ56"
};
// Initialize Firebase
firebase.initializeApp(config);

// Initialize Cloud Firestore through Firebase
var db = firebase.firestore();

// Disable deprecated features
db.settings({
  timestampsInSnapshots: true
});







