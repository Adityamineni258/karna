import app from './firebase-config.js';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

import { showChatUI } from './script.js';

const auth = getAuth(app);
let isLoggingOut = false; // ✅ this line is new

onAuthStateChanged(auth, (user) => {
  if (user) {
    const usernameEl = document.getElementById("username");
    if (usernameEl) {
      const name = user.displayName || user.email;
      usernameEl.innerText = `Hello, ${name}`;
    }
    showChatUI(user);
  } else {
    const currentPage = window.location.pathname;
    if (!currentPage.includes("login.html") && !isLoggingOut) {
      alert("Please log in first.");
      window.location.href = "login.html";
    }
  }
});

// ✅ EXPOSED FUNCTIONS

window.googleLogin = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then(result => {
      console.log("Google user:", result.user);
      window.location.href = "index.html";
    })
    .catch(error => {
      console.error("Google login failed:", error.message);
      alert("Google sign-in failed: " + error.message);
    });
};

window.githubLogin = () => {
  const provider = new GithubAuthProvider();
  signInWithPopup(auth, provider)
    .then(result => {
      console.log("GitHub user:", result.user);
      window.location.href = "index.html";
    })
    .catch(error => {
      console.error("GitHub login failed:", error.message);
      alert("GitHub sign-in failed: " + error.message);
    });
};

window.logout = () => {
  isLoggingOut = true; // ✅ tell listener not to trigger alert
  signOut(auth)
    .then(() => {
      console.log("User signed out");
      window.location.href = "login.html";
    })
    .catch((error) => {
      console.error("Sign-out error:", error.message);
      alert("Sign-out failed");
      isLoggingOut = false; // restore on error
    });
};

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => logout());
  }
});
