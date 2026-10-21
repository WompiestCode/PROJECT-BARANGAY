import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { auth, firebaseReady } from "./firebase-config.js";

const accountLink = document.querySelector("[data-account-link]");

if (firebaseReady) {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            accountLink.href = "login.html";
            accountLink.textContent = "Sign in";
            return;
        }

        accountLink.href = "#signout";
        accountLink.textContent = "Sign out";
        accountLink.addEventListener("click", async (event) => {
            if (accountLink.href.endsWith("#signout")) {
                event.preventDefault();
                try {
                    await signOut(auth);
                    window.location.assign("index.html");
                } catch (error) {
                    window.alert(`Could not sign out: ${error.message}`);
                }
            }
        }, { once: true });
    });
}
