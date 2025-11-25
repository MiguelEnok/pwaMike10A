// firebaseConfig.js
// Configuración de Firebase para inicializar la aplicación y los servicios.

// Importa las funciones necesarias desde los SDKs de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

// Tu configuración de Firebase
// Nota: Estas credenciales se consideran públicas y se deben proteger con las Reglas de Seguridad de Firebase.
const firebaseConfig = {
    apiKey: "AIzaSyC_kvBUSYaypnUCAx6YqZLaR8-HPsam1zc",
    authDomain: "ejemplofirebase-36d92.firebaseapp.com",
    databaseURL: "https://ejemplofirebase-36d92-default-rtdb.firebaseio.com",
    projectId: "ejemplofirebase-36d92",
    storageBucket: "ejemplofirebase-36d92.firebasestorage.app",
    messagingSenderId: "553465124394",
    appId: "1:553465124394:web:25dbb08a8b538c0c2d9553",
    measurementId: "G-4KVV7939XW"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Firestore
const db = getFirestore(app);

// Exporta la base de datos para usarla en `crud.js`
export { db };