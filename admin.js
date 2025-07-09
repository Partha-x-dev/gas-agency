import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { 
    getFirestore, collection, getDocs, deleteDoc, doc, updateDoc, getDoc 
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyD9OfSs3dzBdeLRrHoxM5Y8EyD_nsOeyH4",
    authDomain: "gasbooking-8609e.firebaseapp.com",
    projectId: "gasbooking-8609e",
    storageBucket: "gasbooking-8609e.appspot.com",
    messagingSenderId: "214967225746",
    appId: "1:214967225746:web:f4cd3c4bddf6d405ad854b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Restrict access to admins only and load users if admin
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userRef = doc(db, "Users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            if (userData.role === "admin") {
                fetchUsers();
            } else {
                alert("Access denied! Admins only.");
                window.location.href = "homepage.html";
            }
        } else {
            alert("User data not found.");
            window.location.href = "index.html";
        }
    } else {
        alert("You must be logged in.");
        window.location.href = "index.html";
    }
});

// Fetch and display users
async function fetchUsers() {
    const userTableBody = document.getElementById("userTableBody");
    userTableBody.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "Users"));

    querySnapshot.forEach((docSnap) => {
        const userData = docSnap.data();
        const userId = docSnap.id;

        if (userData.role && userData.role.toLowerCase() === "admin") return;

        const row = `
            <tr id="row-${userId}">
                <td>${userData.firstName}</td>
                <td>${userData.lastName}</td>
                <td>${userData.email}</td>
                <td>${userData.role}</td>
                <td class="text-center">
                    <div class="d-flex justify-content-center gap-2">
                        <button class="btn btn-danger btn-sm" onclick="window.deleteUser('${userId}')">Delete</button>
                        <button class="btn btn-primary btn-sm" onclick="window.openEditForm('${userId}', '${userData.firstName.replace(/'/g, "\\'")}', '${userData.lastName.replace(/'/g, "\\'")}', '${userData.email.replace(/'/g, "\\'")}')">Edit</button>
                    </div>
                </td>
            </tr>
        `;

        userTableBody.innerHTML += row;
    });
}

// Edit User: Open Modal with current details
window.openEditForm = function (userId, firstName, lastName, email) {
    document.getElementById("editUserId").value = userId;
    document.getElementById("editFirstName").value = firstName;
    document.getElementById("editLastName").value = lastName;
    document.getElementById("editEmail").value = email;

    // Bootstrap modal show
    const modalElement = document.getElementById("editModal");
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
};

// Handle Edit Form Submission
document.getElementById("editUserForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const userId = document.getElementById("editUserId").value;
    const updatedData = {
        firstName: document.getElementById("editFirstName").value,
        lastName: document.getElementById("editLastName").value,
        email: document.getElementById("editEmail").value,
    };

    try {
        await updateDoc(doc(db, "Users", userId), updatedData);
        alert("User updated successfully!");

        // Close modal after update
        const modal = bootstrap.Modal.getInstance(document.getElementById("editModal"));
        modal.hide();

        fetchUsers();
    } catch (error) {
        console.error("Error updating user:", error);
        alert("Failed to update user.");
    }
});

// Delete user
async function deleteUser(userId) {
    const confirmDelete = confirm("Are you sure you want to delete this user?");
    if (confirmDelete) {
        try {
            await deleteDoc(doc(db, "Users", userId));
            document.getElementById(`row-${userId}`).remove();
            alert("User deleted successfully!");
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user.");
        }
    }
}
window.deleteUser = deleteUser;

// Logout Admin
document.getElementById("logout").addEventListener("click", () => {
    signOut(auth).then(() => {
        alert("Logged out successfully!");
        window.location.href = "index.html";
    }).catch((error) => {
        console.error("Logout error:", error);
    });
});
