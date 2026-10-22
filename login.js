import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { doc, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { auth, db, firebaseReady } from "./firebase-config.js";

const form = document.querySelector("#auth-form");
const title = document.querySelector("#auth-title");
const nameField = document.querySelector("#name-field");
const nameInput = document.querySelector("#display-name");
const passwordInput = document.querySelector("#password");
const submitButton = document.querySelector("#auth-submit");
const status = document.querySelector("#auth-status");
const modeButtons = document.querySelectorAll(".auth-tab");
const firebaseNotice = document.querySelector("#firebase-notice");
let mode = "signin";
const returnToAdminRequests = new URLSearchParams(window.location.search).get("redirect") === "admin-requests.html";
const postAuthPage = returnToAdminRequests ? "admin-requests.html" : "messages.html";

if (!firebaseReady) {
    firebaseNotice.hidden = false;
    form.hidden = true;
}

if (firebaseReady) {
    onAuthStateChanged(auth, (user) => {
        if (user && mode === "signin") {
            window.location.replace(postAuthPage);
        }
    });
}

modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        mode = button.dataset.mode;
        const signingUp = mode === "signup";
        title.textContent = signingUp ? "Create an account" : "Sign in";
        nameField.hidden = !signingUp;
        nameInput.required = signingUp;
        passwordInput.autocomplete = signingUp ? "new-password" : "current-password";
        submitButton.textContent = signingUp ? "Create account" : "Sign in";
        status.textContent = "";
        modeButtons.forEach((tab) => tab.setAttribute("aria-pressed", String(tab === button)));
    });
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!firebaseReady) {
        status.textContent = "Account sign-in is unavailable until Firebase is configured.";
        return;
    }

    submitButton.disabled = true;
    status.textContent = "";
    const email = form.elements.email.value.trim();
    const password = passwordInput.value;

    try {
        if (mode === "signup") {
            const displayName = nameInput.value.trim();
            const credential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(credential.user, { displayName });
            await setDoc(doc(db, "publicProfiles", credential.user.uid), {
                displayName,
                createdAt: serverTimestamp()
            });
            window.location.assign(postAuthPage);
        } else {
            await signInWithEmailAndPassword(auth, email, password);
            window.location.assign(postAuthPage);
        }
    } catch (error) {
        status.textContent = `Could not ${mode === "signup" ? "create the account" : "sign in"}: ${error.message}`;
    } finally {
        submitButton.disabled = false;
    }
});
