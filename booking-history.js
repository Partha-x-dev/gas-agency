import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore, collection, query, where, onSnapshot
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD9OfSs3dzBdeLRrHoxM5Y8EyD_nsOeyH4",
  authDomain: "gasbooking-8609e.firebaseapp.com",
  projectId: "gasbooking-8609e",
  storageBucket: "gasbooking-8609e.appspot.com",
  messagingSenderId: "214967225746",
  appId: "1:214967225746:web:f4cd3c4bddf6d405ad854b"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get user ID
const userId = localStorage.getItem("loggedInUserId");

if (!userId) {
  alert("Please log in first.");
  window.location.href = "index.html";
}

// Load booking history
function loadBookingHistory() {
  const bookingQuery = query(collection(db, "Bookings"), where("userId", "==", userId));

  onSnapshot(bookingQuery, (querySnapshot) => {
    const table = document.getElementById("bookingHistoryTable");
    table.innerHTML = "";

    let bookings = [];

    querySnapshot.forEach((doc) => {
      bookings.push({ id: doc.id, ...doc.data() });
    });

    // Sort: Pending first, then by timestamp descending
    bookings.sort((a, b) => {
      if (a.status === "Pending" && b.status !== "Pending") return -1;
      if (a.status !== "Pending" && b.status === "Pending") return 1;
      const dateA = a.timestamp?.toDate() || new Date(0);
      const dateB = b.timestamp?.toDate() || new Date(0);
      return dateB - dateA;
    });

    bookings.forEach((booking) => {
      const row = document.createElement("tr");

      const idCell = document.createElement("td");
      idCell.textContent = booking.id;

      const statusCell = document.createElement("td");
      statusCell.textContent = booking.status;

      const dateCell = document.createElement("td");
      const date = booking.timestamp?.toDate();
      dateCell.textContent = date ? date.toLocaleString() : "Unknown";

      row.appendChild(idCell);
      row.appendChild(statusCell);
      row.appendChild(dateCell);

      table.appendChild(row);
    });
  });
}

loadBookingHistory();

// Back button
document.getElementById("backToHome").addEventListener("click", () => {
  window.location.href = "homepage.html";
});
