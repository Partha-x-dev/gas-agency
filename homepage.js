import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  updateEmail,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  Timestamp,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD9OfSs3dzBdeLRrHoxM5Y8EyD_nsOeyH4",
  authDomain: "gasbooking-8609e.firebaseapp.com",
  projectId: "gasbooking-8609e",
  storageBucket: "gasbooking-8609e.appspot.com",
  messagingSenderId: "214967225746",
  appId: "1:214967225746:web:f4cd3c4bddf6d405ad854b",
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Utility: Count non-rejected bookings
const getValidBookingsCount = (snap) => {
  let count = 0;
  snap.forEach((doc) => {
    if (doc.data().status !== "Rejected") count++;
  });
  return count;
};

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Please login first.");
    window.location.href = "index.html";
    return;
  }

  const userId = user.uid;
  const userRef = doc(db, "Users", userId);

  try {
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) throw new Error("User data not found.");

    const userData = userSnap.data();

    // Display user info in sidebar
    document.getElementById("sidebarFName").textContent = userData.firstName || "";
    document.getElementById("sidebarLName").textContent = userData.lastName || "";
    document.getElementById("sidebarAddress").textContent = userData.address || "N/A";
    document.getElementById("loggedUserEmail").textContent = user.email;

    // Fill modal form with user info
    document.getElementById("editFirstName").value = userData.firstName || "";
    document.getElementById("editLastName").value = userData.lastName || "";
    document.getElementById("editEmail").value = user.email || "";
    document.getElementById("editUserId").value = userId;

    // Cylinder count
    const bookingsSnap = await getDocs(
      query(collection(db, "Bookings"), where("userId", "==", userId))
    );
    const remaining = 12 - getValidBookingsCount(bookingsSnap);
    document.getElementById("cylinderCount").textContent = remaining >= 0 ? remaining : 0;
  } catch (err) {
    console.error("Error fetching user data:", err);
    alert("Failed to load user data.");
    return;
  }

  // Book Cylinder (status = "Pending", paymentStatus = "Pending")
  document.getElementById("bookCylinder").addEventListener("click", async () => {
    if (!confirm("Are you sure you want to book a new cylinder?")) return;

    try {
      const bookingsSnap = await getDocs(
        query(collection(db, "Bookings"), where("userId", "==", auth.currentUser.uid))
      );

      if (getValidBookingsCount(bookingsSnap) >= 12) {
        alert("You have reached the maximum limit of 12 bookings.");
        return;
      }

      const docRef = await addDoc(collection(db, "Bookings"), {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        status: "Pending",
        timestamp: Timestamp.now(),
        paymentStatus: "Pending", 
      });

      // Redirect to payment page with bookingId
      window.location.href = `payment.html?bookingId=${docRef.id}`;

    } catch (err) {
      console.error("Booking error:", err);
      alert("Booking failed.");
    }
  });

  // Real-time updates for booking status
  const bookingQuery = query(collection(db, "Bookings"), where("userId", "==", userId));
  onSnapshot(bookingQuery, (snapshot) => {
    const bookingTable = document.getElementById("bookingHistoryTable");
    bookingTable.innerHTML = "";

    const bookings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    if (!bookings.length) {
      bookingTable.innerHTML = "<tr><td colspan='4'>No bookings found.</td></tr>";
      document.getElementById("bookingStatus").textContent = "No Bookings Yet";
      return;
    }

    bookings.sort((a, b) => {
      if (a.status === "Pending" && b.status !== "Pending") return -1;
      if (a.status !== "Pending" && b.status === "Pending") return 1;
      return (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0);
    });

    bookings.forEach((b) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${b.id}</td>
        <td>${b.status}</td>
        <td>${b.timestamp?.toDate().toLocaleString() || "Unknown"}</td>
        <td>${b.paymentStatus || "Pending"}</td>
      `;
      bookingTable.appendChild(row);
    });

    const latest = bookings.find((b) => b.status === "Pending") || bookings[0];
    document.getElementById("bookingStatus").textContent = latest.status || "Unknown";
  });

  // Edit form submit
  document.getElementById("editUserForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const userId = document.getElementById("editUserId").value;
    const firstName = document.getElementById("editFirstName").value;
    const lastName = document.getElementById("editLastName").value;
    const email = document.getElementById("editEmail").value;

    try {
      await updateDoc(doc(db, "Users", userId), {
        firstName,
        lastName,
      });

      const currentUser = auth.currentUser;
      if (currentUser && currentUser.email !== email) {
        await updateEmail(currentUser, email);
      }

      alert("User updated successfully!");

      // Update sidebar text
      document.getElementById("sidebarFName").textContent = firstName;
      document.getElementById("sidebarLName").textContent = lastName;
      document.getElementById("loggedUserEmail").textContent = email;

      const modal = bootstrap.Modal.getInstance(document.getElementById("editModal"));
      modal.hide();
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Failed to update user.");
    }
  });

  // Logout
  document.getElementById("logout").addEventListener("click", async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("loggedInUserId");
      window.location.href = "index.html";
    } catch (err) {
      console.error("Logout error:", err);
    }
  });
});