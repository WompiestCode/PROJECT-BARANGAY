import { onAuthStateChanged, getIdTokenResult } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { collection, onSnapshot, orderBy, query } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { auth, db, firebaseReady } from "./firebase-config.js";

const status = document.querySelector("#admin-request-status");
const requestList = document.querySelector("#admin-request-list");

function appendDetail(list, label, value) {
    const term = document.createElement("dt");
    term.textContent = label;
    const description = document.createElement("dd");
    description.textContent = value;
    list.append(term, description);
}

function showRequests(snapshot) {
    requestList.replaceChildren();
    snapshot.forEach((requestDocument) => {
        const request = requestDocument.data();
        const item = document.createElement("li");
        item.className = "request-card";

        const title = document.createElement("h2");
        title.textContent = `${request.firstName} ${request.middleName ? `${request.middleName} ` : ""}${request.lastName}`;
        const documentType = document.createElement("p");
        documentType.textContent = request.documentType;
        const details = document.createElement("dl");
        appendDetail(details, "Birthdate", request.birthdate);
        appendDetail(details, "Address", request.address);

        if (request.createdAt) {
            const submitted = document.createElement("p");
            const timestamp = document.createElement("time");
            timestamp.dateTime = request.createdAt.toDate().toISOString();
            timestamp.textContent = `Submitted ${request.createdAt.toDate().toLocaleString()}`;
            submitted.append(timestamp);
            item.append(title, documentType, details, submitted);
        } else {
            item.append(title, documentType, details);
        }

        requestList.append(item);
    });

    status.textContent = snapshot.empty ? "There are no document requests yet." : `${snapshot.size} document request${snapshot.size === 1 ? "" : "s"}.`;
}

if (!firebaseReady) {
    status.textContent = "Administrator access is unavailable until Firebase is configured. See the project README for setup steps.";
} else {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.replace("login.html?redirect=admin-requests.html");
            return;
        }

        try {
            const token = await getIdTokenResult(user, true);
            if (token.claims.admin !== true) {
                status.textContent = "Your account is not authorized to view these requests.";
                return;
            }

            status.textContent = "Loading document requests...";
            const requestsQuery = query(collection(db, "documentRequests"), orderBy("createdAt", "desc"));
            onSnapshot(requestsQuery, showRequests, (error) => {
                status.textContent = `Could not load document requests: ${error.message}`;
            });
        } catch (error) {
            status.textContent = `Could not verify administrator access: ${error.message}`;
        }
    }, (error) => {
        status.textContent = `Could not verify your sign-in: ${error.message}`;
    });
}
