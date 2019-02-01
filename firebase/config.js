// const admin = require('firebase-admin');
// const serviceAccount = require('path/to/serviceAccountKey.json');

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: 'https://nodejs-book-api.firebaseio.com'
// });


const firebase = require('firebase');
// Set the configuration for your app
// TODO: Replace with your project's config object
const config = {
    apiKey: "AIzaSyDAhJ2Fwh_760GiqAZ3L-hyuJrdnJClc9M",
    authDomain: "nodejs-book-api.firebaseapp.com",
    databaseURL: "https://nodejs-book-api.firebaseio.com",
    projectId: "nodejs-book-api",
    storageBucket: "nodejs-book-api.appspot.com",
    messagingSenderId: "517724765138"
};
firebase.initializeApp(config);

// Get a reference to the storage service, which is used to create references in your storage bucket
const storage = firebase.storage();