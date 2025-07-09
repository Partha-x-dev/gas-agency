// Import Firebase modules correctly
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyD9OfSs3dzBdeLRrHoxM5Y8EyD_nsOeyH4",
    authDomain: "gasbooking-8609e.firebaseapp.com",
    projectId: "gasbooking-8609e",
    storageBucket: "gasbooking-8609e.firebasestorage.app",
    messagingSenderId: "214967225746",
    appId: "1:214967225746:web:f4cd3c4bddf6d405ad854b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

// Function to show messages
function showMessage(message) {
    let messageDiv = document.getElementById("bookingMessage");
    if (messageDiv) {
        messageDiv.innerText = message;
        messageDiv.style.display = "block";
        setTimeout(() => {
            messageDiv.style.display = "none";
        }, 4000);
    }
}

// Function to update cylinder count in UI
async function updateCylinderCount() {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "Users", user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
        let remainingCylinders = userDoc.data().cylinders || 12;
        document.getElementById("cylinderCount").innerText = `Cylinders Left: ${remainingCylinders}/12`;
    }
}

// Function to book a cylinder
async function bookCylinder() {
    const user = auth.currentUser;
    if (!user) {
        alert("Please log in first!");
        return;
    }

    try {
        // Fetch user data
        const userRef = doc(db, "Users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            let remainingCylinders = userDoc.data().cylinders || 12;

            if (remainingCylinders > 0) {
                // Deduct one cylinder
                await updateDoc(userRef, { cylinders: remainingCylinders - 1 });

                // Save booking info
                await addDoc(collection(db, "Bookings"), {
                    userId: user.uid,
                    bookedAt: new Date().toISOString(),
                    status: "Booked"
                });

                showMessage("Cylinder booked successfully!");
                updateCylinderCount(); // Refresh cylinder count
                loadBookingHistory(); // Refresh booking history
            } else {
                showMessage("No cylinders left!");
            }
        }
    } catch (error) {
        console.error("Error booking cylinder:", error);
    }
}

// Function to load booking history
async function loadBookingHistory() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const bookingsRef = query(collection(db, "Bookings"), where("userId", "==", user.uid));
        const snapshot = await getDocs(bookingsRef);

        const historyList = document.getElementById("bookingHistory");
        historyList.innerHTML = ""; // Clear old data

        snapshot.forEach((doc) => {
            let data = doc.data();
            let listItem = document.createElement("li");
            listItem.innerText = `Booked on: ${new Date(data.bookedAt).toLocaleString()} - Status: ${data.status}`;
            historyList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error fetching bookings:", error);
    }
}

// Logout function
function logout() {
    signOut(auth)
        .then(() => {
            window.location.href = "index.html";
        })
        .catch((error) => {
            console.error("Logout error:", error);
        });
}

// Wait for Firebase authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User detected:", user.uid);
        updateCylinderCount();
        loadBookingHistory();
    } else {
        console.log("No user found. Redirecting to login.");
        window.location.href = "index.html";
    }
});

// Event listener for booking button
document.getElementById("bookCylinder").addEventListener("click", bookCylinder);
