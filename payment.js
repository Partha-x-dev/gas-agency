// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9OfSs3dzBdeLRrHoxM5Y8EyD_nsOeyH4",
  authDomain: "gasbooking-8609e.firebaseapp.com",
  projectId: "gasbooking-8609e",
  storageBucket: "gasbooking-8609e.appspot.com",
  messagingSenderId: "214967225746",
  appId: "1:214967225746:web:f4cd3c4bddf6d405ad854b",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get the booking ID from the URL
const urlParams = new URLSearchParams(window.location.search);
const bookingId = urlParams.get('bookingId');

// Confirm payment and update Firestore
async function confirmPayment(method) {
  const msg = `✅ Payment Successful via ${method}`;
  document.getElementById('successMsg').textContent = msg;

  try {
    const bookingRef = doc(db, 'Bookings', bookingId);
    await updateDoc(bookingRef, {
      paymentStatus: 'Paid'
    });

    setTimeout(() => {
      alert('Payment successful! Redirecting to homepage...');
      window.location.href = 'homepage.html';  // Change the URL if needed
    }, 1000);
  } catch (error) {
    console.error('Error updating payment status:', error);
    alert('❌ Payment status update failed. Please try again.');
  }
}

function showQRCode() {
  hideAll();
  document.getElementById('qrCodeBox').style.display = 'block';
}

function openFakeGateway() {
  hideAll();
  document.getElementById('fakeGatewayBox').style.display = 'block';
}

function cashOnDelivery() {
  hideAll();
  document.getElementById('successMsg').textContent = '💵 Cash on Delivery Selected. Please pay ₹890 on delivery.';
}

function hideAll() {
  document.getElementById('qrCodeBox').style.display = 'none';
  document.getElementById('fakeGatewayBox').style.display = 'none';
  document.getElementById('successMsg').textContent = '';
}

// ✅ Expose functions globally for HTML onclick handlers
window.confirmPayment = confirmPayment;
window.showQRCode = showQRCode;
window.openFakeGateway = openFakeGateway;
window.cashOnDelivery = cashOnDelivery;
