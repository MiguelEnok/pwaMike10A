// crud.js
import { db } from "./firebaseConfig.js";
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, onSnapshot, getDoc } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

const form = document.getElementById('contact-form');
const contactsTableBody = document.getElementById('contacts-table-body');
const contactIdField = document.getElementById('contact-id'); // Este ya no es tan necesario con 'idToEdit'
const btnSave = document.getElementById('btn-save');
const btnCancel = document.getElementById('btn-cancel');
const message = document.getElementById('message');

let editStatus = false;
let idToEdit = '';

// Referencia a la colección 'contactos'
const contactsCollection = collection(db, "contactos");

// ** LÓGICA DE NOTIFICACIÓN NATIVA (NUEVA) **
// Función para mostrar notificación nativa
const showNativeNotification = (title, options) => {
    // 1. Verificar si el navegador soporta Notificaciones
    if (!("Notification" in window)) {
        console.warn("Este navegador no soporta notificaciones de escritorio.");
        return;
    }

    // 2. Pedir permiso si aún no se ha concedido
    if (Notification.permission === "default") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification(title, options);
            }
        });
    } else if (Notification.permission === "granted") {
        // 3. Disparar la notificación si el permiso está concedido
        new Notification(title, options);
    }
    // Si el permiso es "denied", no hacemos nada.
};
// ** FIN LÓGICA DE NOTIFICACIÓN NATIVA **


// Función para mostrar mensajes
const showMessage = (msg, type = "success") => {
    message.textContent = msg;
    message.style.backgroundColor = type === "success" ? "#4CAF50" : "#F44336";
    message.style.color = "white";
    message.style.padding = "10px";
    message.style.marginTop = "10px";
    message.style.marginBottom = "10px"; // Añadido para mejor espaciado
    message.style.display = "block"; // Asegurarse de que el bloque de mensaje sea visible
    setTimeout(() => {
        message.textContent = '';
        message.style.padding = "0";
        message.style.marginTop = "0";
        message.style.marginBottom = "0";
        message.style.backgroundColor = "transparent";
        message.style.display = "none"; // Ocultar después del mensaje
    }, 3000);
};

// ** C R E A R / A C T U A L I Z A R **
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nombre = form['nombre'].value.trim(); // .trim() para quitar espacios en blanco
    const email = form['email'].value.trim();
    const telefono = form['telefono'].value.trim();
    const comentario = form['comentario'].value.trim();

    if (!nombre || !email) { // Validación básica de campos requeridos
        showMessage('Nombre y Correo Electrónico son obligatorios.', 'error');
        return;
    }

    if (!editStatus) {
        // CREAR nuevo contacto
        try {
            await addDoc(contactsCollection, {
                nombre,
                email,
                telefono: telefono || '', // Guardar vacío si no hay valor
                comentario: comentario || '' // Guardar vacío si no hay valor
            });
            showMessage('Contacto guardado exitosamente.');
        } catch (error) {
            console.error("Error al añadir documento: ", error);
            showMessage('Error al guardar contacto.', 'error');
        }
    } else {
        // ACTUALIZAR contacto existente
        try {
            const contactRef = doc(db, "contactos", idToEdit);
            await updateDoc(contactRef, {
                nombre,
                email,
                telefono: telefono || '',
                comentario: comentario || ''
            });
            showMessage('Contacto actualizado exitosamente.');
            editStatus = false;
            idToEdit = '';
            btnSave.textContent = 'Guardar Contacto';
            btnCancel.style.display = 'none';
        } catch (error) {
            console.error("Error al actualizar documento: ", error);
            showMessage('Error al actualizar contacto.', 'error');
        }
    }

    form.reset(); // Limpiar el formulario
});

// ** L E E R (En tiempo real con onSnapshot) **
let initialLoad = true; // Variable para controlar la carga inicial

const getContacts = () => {
    // Escucha los cambios en tiempo real
    onSnapshot(contactsCollection, (snapshot) => {
        
        // --- LÓGICA PARA DISPARAR LA NOTIFICACIÓN EN TIEMPO REAL ---
        if (!initialLoad && !snapshot.empty) {
            // Busca si hay algún documento que fue 'added' (añadido)
            const newDocChange = snapshot.docChanges().find(change => change.type === 'added');

            if (newDocChange) {
                const newContact = newDocChange.doc.data();
                // Dispara la notificación nativa del navegador a todos los usuarios
                showNativeNotification(`¡Nuevo Contacto de DOOM!`, {
                    body: `${newContact.nombre} se ha unido a la comunidad.`,
                    icon: '/img/96.png' // Usamos un icono de tu manifest
                });
            }
        }
        initialLoad = false; // Desactiva el flag después de la primera carga

        // --- LÓGICA DE RENDERIZADO DE TABLA (Original) ---
        contactsTableBody.innerHTML = ''; // Limpiar la tabla

        if (snapshot.empty) {
            contactsTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No hay contactos agregados.</td></tr>`;
            return;
        }

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const id = doc.id;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.nombre}</td>
                <td>${data.email}</td>
                <td>${data.telefono || '-'}</td>
                <td>${data.comentario || '-'}</td>
                <td>
                    <button class="btn-edit" data-id="${id}">Editar</button>
                    <button class="btn-delete" data-id="${id}">Eliminar</button>
                </td>
            `;
            contactsTableBody.appendChild(row);
        });

        // Adjuntar listeners de eventos a los nuevos botones DESPUÉS de renderizar
        attachButtonListeners();
    }, (error) => {
        console.error("Error al obtener contactos: ", error);
        contactsTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">Error al cargar los contactos.</td></tr>`;
    });
};

// ** E L I M I N A R **
const deleteContact = async (id) => {
    if (confirm('¿Estás seguro de que quieres eliminar este contacto?')) {
        try {
            await deleteDoc(doc(db, "contactos", id));
            showMessage('Contacto eliminado.');
        } catch (error) {
            console.error("Error al eliminar documento: ", error);
            showMessage('Error al eliminar contacto.', 'error');
        }
    }
};

// ** E D I T A R (Llenar formulario) **
const fillFormForEdit = async (id) => {
    try {
        const docRef = doc(db, "contactos", id);
        const docSnapshot = await getDoc(docRef); // Usar getDoc para obtener un solo documento
        
        if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            form['nombre'].value = data.nombre;
            form['email'].value = data.email;
            form['telefono'].value = data.telefono;
            form['comentario'].value = data.comentario;
            
            editStatus = true;
            idToEdit = id;
            btnSave.textContent = 'Actualizar Contacto';
            btnCancel.style.display = 'inline-block'; // Mostrar botón cancelar
            window.scrollTo(0, document.getElementById('contacts').offsetTop); // Scroll al formulario
        } else {
            console.warn("Documento no encontrado para editar:", id);
            showMessage("El contacto a editar no existe.", "error");
        }
    } catch (error) {
        console.error("Error al obtener documento para editar: ", error);
        showMessage("Error al cargar los datos para editar.", "error");
    }
};

// Función para adjuntar listeners de botones (DEBE LLAMARSE DESPUÉS DE CADA RENDERIZADO DE TABLA)
const attachButtonListeners = () => {
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', (e) => {
            deleteContact(e.target.dataset.id);
        });
    });

    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', (e) => {
            fillFormForEdit(e.target.dataset.id);
        });
    });
};

// Botón de cancelar edición
btnCancel.addEventListener('click', () => {
    form.reset();
    editStatus = false;
    idToEdit = '';
    btnSave.textContent = 'Guardar Contacto';
    btnCancel.style.display = 'none';
    showMessage('Edición cancelada.'); // Mensaje de cancelación
});

// Inicia la carga de contactos al iniciar
document.addEventListener('DOMContentLoaded', getContacts);