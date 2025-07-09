// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { 
    getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { 
    getFirestore, setDoc, getDoc, doc 
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Firebase Configuration
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
const auth = getAuth();
const db = getFirestore();

/* -------------------------------------------------
🚀 User Registration (Only for Normal Users)
------------------------------------------------- */
const signUp = document.getElementById('submitSignUp');
if (signUp) {
    signUp.addEventListener('click', async (event) => {
        event.preventDefault();

        const email = document.getElementById('rEmail').value;
        const password = document.getElementById('rPassword').value;
        const firstName = document.getElementById('fName').value;
        const lastName = document.getElementById('lName').value;
        const address = document.getElementById('rAddress').value;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Store user details in Firestore (Default role: 'user')
            const userData = {
                email: email,
                firstName: firstName,
                lastName: lastName,
                address: address,
                role: "user"  // Default role
            };

            await setDoc(doc(db, "Users", user.uid), userData);
            alert("Account Created Successfully");

            // Redirect to home page
            window.location.href = "homepage.html";
        } catch (error) {
            console.error("Sign-up Error:", error);
            alert("Error creating account. " + error.message);
        }
    });
}

/* -------------------------------------------------
🚀 User & Admin Login
------------------------------------------------- */
const signIn = document.getElementById('submitSignIn');
if (signIn) {
    signIn.addEventListener('click', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            console.log("User UID:", user.uid); // Debugging

            // Fetch user role from Firestore
            const userDocRef = doc(db, "Users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                console.log("User Data:", userData); // Debugging

                // Store logged-in user ID
                localStorage.setItem("loggedInUserId", user.uid);

                if (userData.role === "admin") {
                    window.location.href = "admin.html";  // Redirect Admin
                } else {
                    window.location.href = "homepage.html";  // Redirect Normal User
                }
            } else {
                alert("User role not found in Firestore. Please contact support.");
            }
        } catch (error) {
            console.error("Login Error:", error);
            alert("Invalid Email or Password.");
        }
    });
}

/* -------------------------------------------------
🚀 Auto-Fetch User Data & Show in Profile (If Logged In)
------------------------------------------------- */
onAuthStateChanged(auth, (user) => {
    if (user) {
        const loggedInUserId = localStorage.getItem('loggedInUserId');
        if (loggedInUserId) {
            console.log("Fetching user data for:", loggedInUserId);
            const docRef = doc(db, "Users", loggedInUserId);

            getDoc(docRef).then((docSnap) => {
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    document.getElementById('loggedUserFName').innerText = userData.firstName;
                    document.getElementById('loggedUserEmail').innerText = userData.email;
                    document.getElementById('loggedUserLName').innerText = userData.lastName;
                } else {
                    console.log("No document found matching ID");
                }
            }).catch((error) => {
                console.log("Error getting document:", error);
            });
        } else {
            console.log("User ID not found in Local Storage");
        }
    } else {
        console.log("No user logged in");
    }
});

/* -------------------------------------------------
🚀 Logout Functionality
------------------------------------------------- */
const logoutButton = document.getElementById('logout');
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('loggedInUserId');
        signOut(auth)
            .then(() => {
                window.location.href = "index.html"; // Redirect to login
            })
            .catch((error) => {
                console.error('Error Signing out:', error);
            });
    });
}
