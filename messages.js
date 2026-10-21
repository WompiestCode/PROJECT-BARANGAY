import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { auth, db, firebaseReady } from "./firebase-config.js";

const conversationList = document.querySelector("#conversation-list");
const directoryList = document.querySelector("#directory-list");
const chatTitle = document.querySelector("#chat-title");
const chatHelp = document.querySelector("#chat-help");
const messageList = document.querySelector("#message-list");
const messageForm = document.querySelector("#message-form");
const messageInput = document.querySelector("#message-text");
const sendButton = document.querySelector("#send-message");
let currentUser = null;
let activeConversationId = null;
let stopConversationUpdates = null;
let stopMessageUpdates = null;

function showError(message) {
    chatHelp.textContent = message;
}

function makeConversationId(firstUid, secondUid) {
    const [first, second] = [firstUid, secondUid].sort();
    return `${first.length}_${first}${second.length}_${second}`;
}

function createUserButton(name, onClick, selected = false) {
    const button = document.createElement("button");
    button.className = "conversation-link";
    button.type = "button";
    button.textContent = name;
    button.setAttribute("aria-pressed", String(selected));
    button.addEventListener("click", onClick);
    return button;
}

function openConversation(conversationId, partnerName) {
    activeConversationId = conversationId;
    chatTitle.textContent = partnerName;
    chatHelp.textContent = "Loading messages...";
    messageForm.hidden = false;
    messageList.replaceChildren();
    if (stopMessageUpdates) {
        stopMessageUpdates();
    }

    const messagesQuery = query(
        collection(db, "conversations", conversationId, "messages"),
        orderBy("createdAt", "asc")
    );
    stopMessageUpdates = onSnapshot(messagesQuery, (snapshot) => {
        messageList.replaceChildren();
        snapshot.forEach((messageDocument) => {
            const message = messageDocument.data();
            const item = document.createElement("li");
            item.className = message.senderUid === currentUser.uid
                ? "message-bubble message-mine"
                : "message-bubble";
            const body = document.createElement("p");
            body.textContent = message.text;
            const timestamp = document.createElement("time");
            if (message.createdAt) {
                timestamp.dateTime = message.createdAt.toDate().toISOString();
                timestamp.textContent = message.createdAt.toDate().toLocaleString();
            } else {
                timestamp.textContent = "Sending...";
            }
            item.append(body, timestamp);
            messageList.append(item);
        });
        chatHelp.textContent = snapshot.empty ? `You can now message ${partnerName}.` : "";
        messageList.scrollTop = messageList.scrollHeight;
    }, (error) => {
        showError(`Could not load messages: ${error.message}`);
    });
}

async function startConversation(profileDocument) {
    const partnerUid = profileDocument.id;
    const partnerName = profileDocument.data().displayName;
    const conversationId = makeConversationId(currentUser.uid, partnerUid);
    const conversationRef = doc(db, "conversations", conversationId);

    try {
        const existing = await getDoc(conversationRef);
        if (!existing.exists()) {
            await setDoc(conversationRef, {
                participants: [currentUser.uid, partnerUid],
                createdBy: currentUser.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        }
        openConversation(conversationId, partnerName);
    } catch (error) {
        showError(`Could not start the conversation: ${error.message}`);
    }
}

async function loadDirectory() {
    try {
        const profiles = await getDocs(collection(db, "publicProfiles"));
        directoryList.replaceChildren();
        const otherProfiles = profiles.docs
            .filter((profile) => profile.id !== currentUser.uid)
            .sort((first, second) => first.data().displayName.localeCompare(second.data().displayName));

        if (otherProfiles.length === 0) {
            directoryList.textContent = "No other accounts are registered yet.";
            return;
        }

        otherProfiles.forEach((profile) => {
            directoryList.append(createUserButton(profile.data().displayName, () => startConversation(profile)));
        });
    } catch (error) {
        showError(`Could not load the user list: ${error.message}`);
    }
}

async function loadConversations() {
    const conversationsQuery = query(
        collection(db, "conversations"),
        where("participants", "array-contains", currentUser.uid)
    );
    stopConversationUpdates = onSnapshot(conversationsQuery, async (snapshot) => {
        conversationList.replaceChildren();
        const conversations = snapshot.docs.slice().sort((first, second) => {
            const firstTime = first.data().updatedAt?.toMillis() ?? 0;
            const secondTime = second.data().updatedAt?.toMillis() ?? 0;
            return secondTime - firstTime;
        });

        for (const conversation of conversations) {
            const partnerUid = conversation.data().participants.find((uid) => uid !== currentUser.uid);
            if (!partnerUid) {
                continue;
            }
            try {
                const profile = await getDoc(doc(db, "publicProfiles", partnerUid));
                const partnerName = profile.exists() ? profile.data().displayName : "Community member";
                conversationList.append(createUserButton(partnerName, () => {
                    openConversation(conversation.id, partnerName);
                }, conversation.id === activeConversationId));
            } catch (error) {
                showError(`Could not load a conversation participant: ${error.message}`);
            }
        }

        if (conversations.length === 0) {
            conversationList.textContent = "No conversations yet.";
        }
    }, (error) => {
        showError(`Could not load conversations: ${error.message}`);
    });
}

messageForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = messageInput.value.trim();
    if (!text || !activeConversationId) {
        return;
    }

    sendButton.disabled = true;
    try {
        const conversationRef = doc(db, "conversations", activeConversationId);
        await addDoc(collection(conversationRef, "messages"), {
            senderUid: currentUser.uid,
            text,
            createdAt: serverTimestamp()
        });
        await updateDoc(conversationRef, { updatedAt: serverTimestamp() });
        messageInput.value = "";
        chatHelp.textContent = "";
    } catch (error) {
        showError(`Could not send the message: ${error.message}`);
    } finally {
        sendButton.disabled = false;
    }
});

if (!firebaseReady) {
    showError("Connect a Firebase project to enable accounts and messages. See the project README for setup steps.");
    directoryList.textContent = "Firebase setup is required.";
} else {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.replace("login.html");
            return;
        }
        currentUser = user;
        chatHelp.textContent = `Signed in as ${user.displayName || user.email}.`;
        loadDirectory();
        loadConversations();
    }, (error) => {
        showError(`Could not verify your sign-in: ${error.message}`);
    });
}
