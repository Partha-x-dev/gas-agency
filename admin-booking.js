import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, updateDoc, doc, getDoc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyD9OfSs3dzBdeLRrHoxM5Y8EyD_nsOeyH4",
  authDomain: "gasbooking-8609e.firebaseapp.com",
  projectId: "gasbooking-8609e",
  storageBucket: "gasbooking-8609e.appspot.com",
  messagingSenderId: "214967225746",
  appId: "1:214967225746:web:f4cd3c4bddf6d405ad854b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ✅ Restrict access to admins only
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef = doc(db, "Users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      if (userData.role === "admin") {
        fetchBookings();
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

// Fetch Bookings
async function fetchBookings() {
  const bookingTableBody = document.getElementById("bookingTableBody");
  bookingTableBody.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "Bookings"));
  let bookings = [];

  querySnapshot.forEach((docSnap) => {
    bookings.push({ id: docSnap.id, ...docSnap.data() });
  });

  // Sort: pending first
  bookings.sort((a, b) => {
    if (a.status === "Pending" && b.status !== "Pending") return -1;
    if (a.status !== "Pending" && b.status === "Pending") return 1;
    return 0;
  });

  bookings.forEach((booking) => {
    const isDisabled = booking.status !== "Pending" ? "disabled" : "";

    const row = `
      <tr id="booking-${booking.id}">
        <td>${booking.userEmail}</td>
        <td>${booking.status}</td>
        <td>
          <button class="btn btn-success btn-sm me-2" onclick="updateBooking('${booking.id}', 'Accepted', this)" ${isDisabled}>Accept</button>
          <button class="btn btn-warning btn-sm" onclick="updateBooking('${booking.id}', 'Rejected', this)" ${isDisabled}>Reject</button>
        </td>
      </tr>
    `;
    bookingTableBody.insertAdjacentHTML("beforeend", row);
  });
}

// Update booking status
async function updateBooking(bookingId, status, buttonElement) {
  try {
    await updateDoc(doc(db, "Bookings", bookingId), { status });

    const statusCell = document.querySelector(`#booking-${bookingId} td:nth-child(2)`);
    statusCell.innerText = status;

    const row = document.getElementById(`booking-${bookingId}`);
    const buttons = row.querySelectorAll("button");
    buttons.forEach((btn) => btn.disabled = true);

    alert(`Booking ${status} successfully!`);
  } catch (error) {
    console.error("Error updating booking:", error);
    alert("Failed to update booking.");
  }
}

window.updateBooking = updateBooking;
