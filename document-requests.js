import { addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { db, firebaseReady } from "./firebase-config.js";

const form = document.querySelector("#document-request");
const submitButton = document.querySelector("#request-submit");
const status = document.querySelector("#request-status");
const birthdateInput = form.elements.birthdate;
const today = new Date();
birthdateInput.max = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
].join("-");

if (!firebaseReady) {
    submitButton.disabled = true;
    status.textContent = "Request submission is unavailable until Firebase is configured. See the project README for setup steps.";
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!firebaseReady) {
        status.textContent = "Request submission is unavailable until Firebase is configured.";
        return;
    }

    const formData = new FormData(form);
    const request = {
        documentType: formData.get("documentType"),
        firstName: formData.get("firstName").trim(),
        lastName: formData.get("lastName").trim(),
        middleName: formData.get("middleName").trim(),
        birthdate: formData.get("birthdate"),
        address: formData.get("address").trim(),
        createdAt: serverTimestamp()
    };

    if (!request.firstName || !request.lastName || !request.birthdate || !request.address) {
        status.textContent = "Please complete all required fields.";
        return;
    }

    submitButton.disabled = true;
    status.textContent = "Submitting your request...";
    try {
        await addDoc(collection(db, "documentRequests"), request);
        form.reset();
        status.textContent = "Your Barangay Clearance request was submitted. The barangay office can now review it.";
    } catch (error) {
        status.textContent = `Could not submit your request: ${error.message}`;
    } finally {
        submitButton.disabled = false;
    }
});
