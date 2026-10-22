# Barangay Milagrosa Community Desk

For Some reason eto pinapa recommend

The site is a static multi-page website and can be hosted on GitHub Pages. Firebase Authentication and Cloud Firestore provide accounts, private realtime conversations, and document requests; GitHub Pages does not provide a database or run server-side code.

## Firebase setup

1. Create a Firebase project and register a Web app.
2. In Firebase Authentication, enable **Email/Password** sign-in.
3. Create a Cloud Firestore database.
4. Publish the rules in [`firestore.rules`](./firestore.rules) in the Firebase console under **Firestore Database → Rules**.
5. Copy the web app's `apiKey`, `authDomain`, `projectId`, and `appId` into [`firebase-config.js`](./firebase-config.js), replacing the `YOUR_...` placeholders.
6. In Firebase Authentication settings, add the deployed GitHub Pages domain to **Authorized domains**.
7. Open `index.html` through a local static web server while developing (ES modules do not work from a `file://` URL), then deploy the repository with GitHub Pages.

The Firebase web configuration is public client configuration, not a service-account credential. Never put service-account keys or other private credentials in this repository. Authentication protects the Firestore data; the supplied rules limit profile access to signed-in users and conversation/message access to participants.

Users can create accounts and privately message another registered user. Display names, but not email addresses, are visible in the signed-in user directory.

## Document requests and administrator access

The contact page accepts Barangay Clearance requests without requiring an account. Request records are stored in the Firestore `documentRequests` collection. Visitors can submit a request but cannot read, edit, or delete requests. Administrators can view the live request list at `admin-requests.html`; access requires a Firebase Authentication account with the `admin: true` custom claim.

Grant the claim from a trusted environment using the Firebase Admin SDK, never from browser code. For example, after initializing the Admin SDK with secure credentials on a trusted machine or server, look up the administrator account by its Firebase Authentication email and preserve any existing claims:

```js
const user = await getAuth().getUserByEmail("admin@example.com");
await getAuth().setCustomUserClaims(user.uid, {
  ...user.customClaims,
  admin: true
});
```

Replace the example email with the administrator's verified Firebase sign-in email. The administrator should sign in again (or refresh their ID token) after the claim is set. Do not commit service-account credentials or run this code in the website. The Firestore rules enforce the claim, so only designated administrators can read submitted names, birthdates, and addresses.

Users can create accounts and privately message another registered user. This site does not implement staff verification, moderation, emergency response, request status updates, or account recovery beyond Firebase's built-in authentication features.

